import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Mail, Smartphone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function Verificar() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [etapa, setEtapa] = useState<"email" | "celular">("email");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const enviarCodigoMutation = trpc.auth.enviarCodigoVerificacao.useMutation();
  const verificarCodigoMutation = trpc.auth.verificarCodigo.useMutation();

  useEffect(() => {
    if (!user) {
      setLocation("/");
      return;
    }

    // Verificar apenas e-mail
    if (!user.emailVerificado) {
      setEtapa("email");
      enviarCodigo("email");
    } else {
      // E-mail já verificado, redirecionar para painel
      setLocation("/painel-fornecedor");
    }
  }, [user]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const enviarCodigo = async (tipo: "email" | "celular") => {
    setEnviando(true);
    setErro("");
    
    try {
      await enviarCodigoMutation.mutateAsync({ tipo });
      setCooldown(60);
    } catch (error: any) {
      setErro(error.message || "Erro ao enviar código");
    } finally {
      setEnviando(false);
    }
  };

  const verificarCodigo = async () => {
    if (codigo.length !== 6) {
      setErro("O código deve ter 6 dígitos");
      return;
    }

    setVerificando(true);
    setErro("");
    
    try {
      const resultado = await verificarCodigoMutation.mutateAsync({
        tipo: etapa,
        codigo,
      });

      setSucesso(true);
      
      // Após verificar e-mail, redirecionar para painel
      setTimeout(() => {
        setLocation("/painel-fornecedor");
      }, 1500);
    } catch (error: any) {
      setErro(error.message || "Código inválido ou expirado");
    } finally {
      setVerificando(false);
    }
  };

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCodigo(valor);
    setErro("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && codigo.length === 6) {
      verificarCodigo();
    }
  };

  if (!user) return null;

  const destino = etapa === "email" ? user.email : user.telefone;
  const icone = etapa === "email" ? <Mail className="h-12 w-12" /> : <Smartphone className="h-12 w-12" />;
  const titulo = etapa === "email" ? "Verifique seu E-mail" : "Verifique seu Celular";
  const descricao = etapa === "email" 
    ? `Enviamos um código de 6 dígitos para ${destino}` 
    : `Enviamos um código de 6 dígitos via SMS para ${destino}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4 text-gray-700">
            {icone}
          </div>
          <CardTitle className="text-2xl">{titulo}</CardTitle>
          <CardDescription className="text-base mt-2">
            {descricao}
          </CardDescription>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              etapa === "email" ? "bg-black text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <Mail className="h-4 w-4" />
              <span>E-mail</span>
            </div>
            <div className="h-px w-8 bg-gray-300" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              etapa === "celular" ? "bg-black text-white" : "bg-gray-200 text-gray-600"
            }`}>
              <Smartphone className="h-4 w-4" />
              <span>Celular</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Digite o código de 6 dígitos
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={codigo}
              onChange={handleCodigoChange}
              onKeyPress={handleKeyPress}
              placeholder="000000"
              className="text-center text-2xl tracking-widest font-mono h-14"
              disabled={verificando || sucesso}
            />
          </div>

          {erro && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{erro}</p>
            </div>
          )}

          {sucesso && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                {etapa === "email" ? "E-mail verificado com sucesso!" : "Celular verificado com sucesso!"}
              </p>
            </div>
          )}

          <Button
            onClick={verificarCodigo}
            disabled={codigo.length !== 6 || verificando || sucesso}
            className="w-full bg-black hover:bg-gray-800 h-12 text-base"
          >
            {verificando ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Verificando...
              </>
            ) : sucesso ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Verificado!
              </>
            ) : (
              "Verificar Código"
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Não recebeu o código?
            </p>
            <Button
              variant="outline"
              onClick={() => enviarCodigo(etapa)}
              disabled={cooldown > 0 || enviando}
              className="w-full"
            >
              {enviando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : cooldown > 0 ? (
                `Reenviar em ${cooldown}s`
              ) : (
                "Reenviar Código"
              )}
            </Button>
          </div>

          <div className="pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              O código expira em 10 minutos
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

