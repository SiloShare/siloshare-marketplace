export function TawkToChat() {
  useEffect(() => {
    // Tawk.to Live Chat
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    
    document.body.appendChild(script);

    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);

  return null;
}

/*
INSTRUÇÕES PARA CONFIGURAR TAWK.TO:

1. Acesse https://www.tawk.to/
2. Crie uma conta gratuita
3. Adicione seu site
4. Copie o código de instalação
5. Substitua YOUR_PROPERTY_ID e YOUR_WIDGET_ID acima
6. O chat aparecerá automaticamente no canto inferior direito

PERSONALIZAÇÃO:
- Cor do widget: verde (#10b981) para combinar com o tema agro
- Mensagem de boas-vindas: "Olá! Como podemos ajudar com sua armazenagem de grãos?"
- Horário de atendimento: Seg-Sex 8h-18h
*/

