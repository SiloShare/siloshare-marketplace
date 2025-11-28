import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Logo } from "../components/Logo";

export default function RecuperarSenha() {
  const [, setLocation] = useLocation();
  const [etapa, setEtapa] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");

  const forgotPasswordMutation = trpc.auth.forgotPassword.useMutation();
  const resetPasswordMutation = trpc.auth.resetPassword.useMutation();

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      const result = await forgotPasswordMutation.mutateAsync({ email });
      if (result.success) {
        setEtapa("codigo");
      }
    } catch (error: any) {
      setErro(error.message || "Erro ao enviar código");
    }
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      const result = await resetPasswordMutation.mutateAsync({
        email,
        codigo,
        novaSenha,
      });

      if (result.success) {
        alert("Senha redefinida com sucesso! Faça login com sua nova senha.");
        setLocation("/login");
      }
    } catch (error: any) {
      setErro(error.message || "Código inválido ou expirado");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold mb-2">Recuperar senha</h2>
          <p className="text-gray-600 mb-8">
            {etapa === "email"
              ? "Insira seu e-mail para receber o código de recuperação"
              : "Digite o código enviado para seu e-mail"}
          </p>

          {/* Mensagem de erro */}
          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          {/* Etapa 1: Solicitar código */}
          {etapa === "email" && (
            <form onSubmit={handleSolicitarCodigo} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={forgotPasswordMutation.isLoading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordMutation.isLoading ? "Enviando..." : "Enviar código"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  Voltar para o login
                </button>
              </div>
            </form>
          )}

          {/* Etapa 2: Redefinir senha */}
          {etapa === "codigo" && (
            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                ✅ Código enviado para <strong>{email}</strong>
              </div>

              <div>
                <label htmlFor="codigo" className="block text-sm font-medium mb-2">
                  Código de verificação
                </label>
                <input
                  id="codigo"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Digite o código de 6 dígitos enviado para seu e-mail
                </p>
              </div>

              <div>
                <label htmlFor="novaSenha" className="block text-sm font-medium mb-2">
                  Nova senha
                </label>
                <input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmarSenha" className="block text-sm font-medium mb-2">
                  Confirmar nova senha
                </label>
                <input
                  id="confirmarSenha"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Digite a senha novamente"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={resetPasswordMutation.isLoading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetPasswordMutation.isLoading ? "Redefinindo..." : "Redefinir senha"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    await forgotPasswordMutation.mutateAsync({ email });
                    alert("Novo código enviado!");
                  }}
                  className="text-sm text-gray-600 hover:text-black"
                  disabled={forgotPasswordMutation.isLoading}
                >
                  Reenviar código
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Lado direito - Imagem de fundo (apenas em telas grandes) */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070")',
        }}
      />
    </div>
  );
}

