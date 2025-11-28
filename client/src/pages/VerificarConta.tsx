import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function VerificarConta() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  const [tipoPessoa, setTipoPessoa] = useState<"fisica" | "juridica">("juridica");
  const [etapa, setEtapa] = useState(1);

  const [documentos, setDocumentos] = useState({
    // Pessoa Jurídica
    cnpj: null as File | null,
    contratoSocial: null as File | null,
    comprovanteEndereco: null as File | null,
    certificadoUA: null as File | null,
    licencaAmbiental: null as File | null,
    alvaraFuncionamento: null as File | null,
    apoliceSeguro: null as File | null,
    
    // Pessoa Física
    cpf: null as File | null,
    rg: null as File | null,
    comprovanteResidencia: null as File | null,
    car: null as File | null,
    itr: null as File | null,
  });

  const handleFileChange = (campo: keyof typeof documentos, file: File | null) => {
    setDocumentos({ ...documentos, [campo]: file });
  };

  const handleSubmit = () => {
    // Validar documentos obrigatórios
    if (tipoPessoa === "juridica") {
      if (!documentos.cnpj || !documentos.contratoSocial || !documentos.certificadoUA) {
        toast.error("Por favor, envie todos os documentos obrigatórios");
        return;
      }
    } else {
      if (!documentos.cpf || !documentos.rg || !documentos.car) {
        toast.error("Por favor, envie todos os documentos obrigatórios");
        return;
      }
    }

    toast.success("Documentos enviados! Aguarde análise em até 48h");
    setLocation("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b bg-white sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <span className="text-3xl">🌾</span>
              <span className="text-2xl font-bold text-black">SiloShare</span>
            </div>
            <Button onClick={() => setLocation("/")} variant="outline">
              Voltar
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-8">Você precisa estar logado para acessar esta página.</p>
          <Button onClick={() => setLocation("/")} className="bg-black hover:bg-gray-800">
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-black">SiloShare</span>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar
          </Button>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Etapa {etapa} de 2</span>
            <span className="text-sm text-gray-600">{etapa === 1 ? "Tipo de Conta" : "Documentos"}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all"
              style={{ width: `${(etapa / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Etapa 1: Tipo de Pessoa */}
        {etapa === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Verificar Conta</CardTitle>
              <CardDescription>
                Para cadastrar silos, precisamos verificar sua identidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-4 block">
                  Qual tipo de conta você deseja criar?
                </Label>
                <RadioGroup value={tipoPessoa} onValueChange={(v) => setTipoPessoa(v as any)}>
                  <Card className={`cursor-pointer transition ${tipoPessoa === "juridica" ? "border-black border-2" : ""}`}>
                    <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                      <RadioGroupItem value="juridica" id="juridica" />
                      <div className="flex-1">
                        <Label htmlFor="juridica" className="text-lg font-semibold cursor-pointer">
                          Pessoa Jurídica (Empresa)
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Para empresas que possuem silos e desejam oferecer serviços de armazenagem
                        </p>
                      </div>
                      <div className="text-4xl">🏢</div>
                    </CardHeader>
                  </Card>

                  <Card className={`cursor-pointer transition ${tipoPessoa === "fisica" ? "border-black border-2" : ""}`}>
                    <CardHeader className="flex flex-row items-center space-y-0 gap-4">
                      <RadioGroupItem value="fisica" id="fisica" />
                      <div className="flex-1">
                        <Label htmlFor="fisica" className="text-lg font-semibold cursor-pointer">
                          Pessoa Física (Produtor Rural)
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Para produtores rurais que possuem silos próprios
                        </p>
                      </div>
                      <div className="text-4xl">👨‍🌾</div>
                    </CardHeader>
                  </Card>
                </RadioGroup>
              </div>

              <div className="pt-6">
                <Button onClick={() => setEtapa(2)} className="w-full bg-black hover:bg-gray-800">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Etapa 2: Upload de Documentos */}
        {etapa === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Enviar Documentos</CardTitle>
              <CardDescription>
                {tipoPessoa === "juridica"
                  ? "Documentos necessários para empresas"
                  : "Documentos necessários para produtores rurais"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tipoPessoa === "juridica" ? (
                <>
                  {/* Documentos Pessoa Jurídica */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Documentos da Empresa *</h3>

                    <div>
                      <Label htmlFor="cnpj">CNPJ (PDF ou Imagem) *</Label>
                      <Input
                        id="cnpj"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("cnpj", e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contratoSocial">Contrato Social (PDF) *</Label>
                      <Input
                        id="contratoSocial"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("contratoSocial", e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="comprovanteEndereco">Comprovante de Endereço (últimos 3 meses)</Label>
                      <Input
                        id="comprovanteEndereco"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("comprovanteEndereco", e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Documentos do Silo *</h3>

                    <div>
                      <Label htmlFor="certificadoUA">Certificado de Unidade Armazenadora (CONAB) *</Label>
                      <Input
                        id="certificadoUA"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("certificadoUA", e.target.files?.[0] || null)}
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        Obrigatório para silos que prestam serviços a terceiros
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="licencaAmbiental">Licença Ambiental</Label>
                      <Input
                        id="licencaAmbiental"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("licencaAmbiental", e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="alvaraFuncionamento">Alvará de Funcionamento</Label>
                      <Input
                        id="alvaraFuncionamento"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("alvaraFuncionamento", e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="apoliceSeguro">Apólice de Seguro do Armazém</Label>
                      <Input
                        id="apoliceSeguro"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("apoliceSeguro", e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Documentos Pessoa Física */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Documentos Pessoais *</h3>

                    <div>
                      <Label htmlFor="cpf">CPF (PDF ou Imagem) *</Label>
                      <Input
                        id="cpf"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("cpf", e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="rg">RG (PDF ou Imagem) *</Label>
                      <Input
                        id="rg"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("rg", e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="comprovanteResidencia">Comprovante de Residência (últimos 3 meses)</Label>
                      <Input
                        id="comprovanteResidencia"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange("comprovanteResidencia", e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-lg">Documentos da Propriedade *</h3>

                    <div>
                      <Label htmlFor="car">CAR - Cadastro Ambiental Rural *</Label>
                      <Input
                        id="car"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("car", e.target.files?.[0] || null)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="itr">ITR - Imposto Territorial Rural</Label>
                      <Input
                        id="itr"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange("itr", e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-6 space-y-3">
                <Button onClick={handleSubmit} className="w-full bg-black hover:bg-gray-800">
                  Enviar Documentos para Análise
                </Button>
                <Button onClick={() => setEtapa(1)} variant="outline" className="w-full">
                  Voltar
                </Button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Tempo de análise:</strong> 24-48 horas úteis<br />
                  <strong>Formatos aceitos:</strong> PDF, JPG, PNG<br />
                  <strong>Tamanho máximo:</strong> 10MB por arquivo
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

