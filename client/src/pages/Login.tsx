import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { trpc } from "@/lib/trpc";
import { useRecaptcha } from "@/hooks/useRecaptcha";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  
  const utils = trpc.useUtils();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      // Invalidar cache do usuário para forçar reload
      await utils.auth.me.invalidate();
      
      // Pequeno delay para garantir que o cache foi invalidado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar se há URL de redirecionamento salva
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        console.log('[Login] Redirecionando para:', redirectUrl);
        setLocation(redirectUrl);
      } else {
        // Login bem-sucedido, redirecionar para dashboard
        console.log('[Login] Redirecionando para dashboard');
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      setErro(error.message || "Erro ao fazer login");
    },
  });

  const { executeRecaptcha } = useRecaptcha();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    
    if (!email || !senha) {
      setErro("Por favor, preencha todos os campos");
      return;
    }
    
    // Executar reCAPTCHA
    const recaptchaToken = await executeRecaptcha("login");
    
    loginMutation.mutate({ email, senha, recaptchaToken: recaptchaToken || undefined });
  };

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
            Bem-vindo de volta
          </h1>
          <p className="text-gray-600 font-light mb-8">
            Entre na sua conta para continuar
          </p>

          {erro && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{erro}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                E-mail
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                required
                disabled={loginMutation.isPending}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="h-12 border-gray-300 focus:border-black focus:ring-black"
                required
                disabled={loginMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                  disabled={loginMutation.isPending}
                />
                <span className="text-sm text-gray-600 font-light">
                  Lembrar de mim
                </span>
              </label>
              <Link href="/recuperar-senha">
                <a className="text-sm font-medium text-black hover:underline">
                  Esqueceu a senha?
                </a>
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium rounded-lg"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 font-light">
              Não tem uma conta?{" "}
              <Link href="/cadastro">
                <a className="font-medium text-black hover:underline">
                  Cadastre-se
                </a>
              </Link>
            </p>
          </div>
          
          {/* Credenciais de teste */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">💡 Credenciais de teste:</p>
            <p className="text-xs text-gray-600 font-mono">admin@siloshare.com</p>
            <p className="text-xs text-gray-600 font-mono">admin123</p>
            <p className="text-xs text-gray-500 mt-2">Ou use qualquer email/senha para criar uma nova conta</p>
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

