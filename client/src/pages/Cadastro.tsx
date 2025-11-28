import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { trpc } from "@/lib/trpc";
import { useRecaptcha } from "@/hooks/useRecaptcha";

export default function Cadastro() {
  const [, setLocation] = useLocation();
  const [etapa, setEtapa] = useState<"cadastro" | "verificacao">("cadastro");
  
  // Dados do cadastro
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  
  // Código de verificação
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [userId, setUserId] = useState("");
  
  const utils = trpc.useUtils();
  
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async (data) => {
      setUserId(data.user.id);
      setEtapa("verificacao");
      setErro("");
    },
    onError: (error) => {
      setErro(error.message || "Erro ao criar conta");
    },
  });
  
  const verifyMutation = trpc.auth.verificarCodigo.useMutation({
    onSuccess: async () => {
      // Invalidar cache do usuário
      await utils.auth.me.invalidate();
      
      // Pequeno delay para garantir que o cache foi invalidado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar se há URL de redirecionamento salva
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        console.log('[Cadastro] Redirecionando para:', redirectUrl);
        setLocation(redirectUrl);
      } else {
        // Redirecionar para dashboard
        console.log('[Cadastro] Redirecionando para dashboard');
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      setErro(error.message || "Código inválido");
    },
  });
  
  const resendMutation = trpc.auth.enviarCodigoVerificacao.useMutation({
    onSuccess: () => {
      setErro("");
      alert("Novo código enviado para seu e-mail!");
    },
    onError: (error) => {
      setErro(error.message || "Erro ao reenviar código");
    },
  });

  const { executeRecaptcha } = useRecaptcha();
  
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    
    // Validações
    if (!nome || !email || !senha) {
      setErro("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }
    
    // Executar reCAPTCHA
    const recaptchaToken = await executeRecaptcha("register");
    
    registerMutation.mutate({ 
      email, 
      senha, 
      name: nome,
      cpfCnpj: cpfCnpj || undefined,
      telefone: telefone || undefined,
      recaptchaToken: recaptchaToken || undefined,
    });
  };

  const handleVerificacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    
    if (codigo.length !== 6) {
      setErro("O código deve ter 6 dígitos");
      return;
    }
    
    verifyMutation.mutate({ 
      tipo: "email",
      codigo: codigo 
    });
  };
  
  const handleReenviar = () => {
    resendMutation.mutate({ tipo: "email" });
  };

  if (etapa === "verificacao") {
    return (
      <div className="min-h-screen bg-white flex">
        {/* Left Side - Verificação */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <Link href="/">
              <a className="mb-12 hover:opacity-80 transition-opacity inline-block">
                <Logo size="lg" />
              </a>
            </Link>

            <h1 className="text-3xl font-bold text-black mb-2">
              Verifique seu e-mail
            </h1>
            <p className="text-gray-600 font-light mb-8">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </p>

            {erro && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{erro}</p>
              </div>
            )}

            <form onSubmit={handleVerificacao} className="space-y-6">
              <div>
                <label className="text-sm font-medium text-black mb-2 block">
                  Código de Verificação
                </label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="h-12 border-gray-300 focus:border-black focus:ring-black text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                  required
                  disabled={verifyMutation.isPending}
                />
                <p className="text-xs text-gray-500 mt-2">
                  O código expira em 15 minutos
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Verificando..." : "Verificar E-mail"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-light">
                Não recebeu o código?{" "}
                <button
                  onClick={handleReenviar}
                  className="font-medium text-black hover:underline"
                  disabled={resendMutation.isPending}
                >
                  {resendMutation.isPending ? "Enviando..." : "Reenviar"}
                </button>
              </p>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Dica:</strong> Verifique sua caixa de spam se não encontrar o e-mail.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div
          className="hidden lg:block flex-1 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200")',
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/">
            <a className="mb-12 hover:opacity-80 transition-opacity inline-block">
              <Logo size="lg" />
            </a>
          </Link>

          <h1 className="text-3xl font-bold text-black mb-2">
            Criar conta
          </h1>
          <p className="text-gray-600 font-light mb-8">
            Cadastre-se para começar a usar o SiloShare
          </p>

          {erro && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          <form onSubmit={handleCadastro} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Nome Completo *
              </label>
              <Input
                type="text"
                placeholder="João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                required
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                E-mail *
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                required
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                CPF/CNPJ (opcional)
              </label>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Telefone (opcional)
              </label>
              <Input
                type="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                disabled={registerMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Senha *
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                required
                disabled={registerMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Confirmar Senha *
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                required
                disabled={registerMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-light">
              Já tem uma conta?{" "}
              <Link href="/login">
                <a className="font-medium text-black hover:underline">
                  Entrar
                </a>
              </Link>
            </p>
          </div>
          
          <div className="mt-6 text-xs text-gray-500 text-center">
            Ao criar uma conta, você concorda com nossos{" "}
            <a href="#" className="text-black hover:underline">Termos de Uso</a> e{" "}
            <a href="#" className="text-black hover:underline">Política de Privacidade</a>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div
        className="hidden lg:block flex-1 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200")',
        }}
      />
    </div>
  );
}

