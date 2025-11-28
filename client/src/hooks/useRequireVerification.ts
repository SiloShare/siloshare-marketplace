import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

/**
 * Hook que redireciona usuários não verificados para a página de verificação
 * Usado em rotas que exigem verificação completa (email + celular)
 */
export function useRequireVerification() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      // Não está logado, redireciona para login
      setLocation("/login");
      return;
    }

    // Verifica se o usuário completou a verificação
    const verificacaoCompleta = user.emailVerificado && user.celularVerificado;

    if (!verificacaoCompleta) {
      // Redireciona para página de verificação
      setLocation("/verificar");
    }
  }, [user, setLocation]);

  return {
    isVerified: user?.emailVerificado && user?.celularVerificado,
    user,
  };
}

