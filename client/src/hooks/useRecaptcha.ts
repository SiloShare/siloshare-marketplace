import { useCallback } from "react";

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

/**
 * Hook para executar reCAPTCHA v3
 * @param action - Ação a ser executada (ex: 'login', 'register')
 * @returns Função para executar o reCAPTCHA
 */
export function useRecaptcha() {
  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn("⚠️ VITE_RECAPTCHA_SITE_KEY não configurado");
      return null;
    }

    try {
      // Aguardar carregamento do script do reCAPTCHA
      await waitForRecaptcha();

      // Executar reCAPTCHA
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      console.log(`✅ reCAPTCHA executado (${action})`);
      return token;
    } catch (error) {
      console.error("❌ Erro ao executar reCAPTCHA:", error);
      return null;
    }
  }, []);

  return { executeRecaptcha };
}

/**
 * Aguarda o carregamento do script do reCAPTCHA
 */
function waitForRecaptcha(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha && window.grecaptcha.execute) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 segundos (50 * 100ms)

    const interval = setInterval(() => {
      attempts++;

      if (window.grecaptcha && window.grecaptcha.execute) {
        clearInterval(interval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error("reCAPTCHA não carregou"));
      }
    }, 100);
  });
}

// Tipos do reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

