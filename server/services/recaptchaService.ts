import axios from "axios";

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/**
 * Verifica token do reCAPTCHA v3
 * @param token - Token gerado pelo reCAPTCHA no frontend
 * @param action - Ação esperada (ex: 'login', 'register')
 * @returns Score de 0.0 (bot) a 1.0 (humano)
 */
export async function verifyRecaptcha(
  token: string,
  action: string
): Promise<{ success: boolean; score: number; error?: string }> {
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn("⚠️ RECAPTCHA_SECRET_KEY não configurado");
    return { success: true, score: 1.0 }; // Permitir em desenvolvimento
  }

  try {
    const response = await axios.post(RECAPTCHA_VERIFY_URL, null, {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      },
    });

    const data = response.data;

    if (!data.success) {
      console.error("❌ reCAPTCHA falhou:", data["error-codes"]);
      return { success: false, score: 0, error: "Verificação falhou" };
    }

    // Verificar se a ação corresponde
    if (data.action !== action) {
      console.error(`❌ Ação incorreta: esperado "${action}", recebido "${data.action}"`);
      return { success: false, score: 0, error: "Ação inválida" };
    }

    const score = data.score || 0;
    console.log(`✅ reCAPTCHA verificado - Score: ${score} (${action})`);

    // Score mínimo: 0.5 (Google recomenda 0.5 como threshold)
    if (score < 0.5) {
      console.warn(`⚠️ Score baixo (${score}) - Possível bot`);
      return { success: false, score, error: "Score muito baixo" };
    }

    return { success: true, score };
  } catch (error) {
    console.error("❌ Erro ao verificar reCAPTCHA:", error);
    return { success: false, score: 0, error: "Erro na verificação" };
  }
}

