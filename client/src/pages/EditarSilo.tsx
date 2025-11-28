import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ProgressBar from "@/components/ProgressBar";
import { Warehouse, MapPin, Gauge, Wrench, Camera, FileText, DollarSign, CheckCircle, Upload, Building2, Package, Plus, Flame, Sparkles, Wind, Radio, Scale, FlaskConical } from "lucide-react";
import { Logo } from "@/components/Logo";
import { PhotoUploader, UploadedPhoto } from "@/components/PhotoUploader";
import { DocumentUploader, UploadedDocument, DocumentType } from "@/components/DocumentUploader";
import { Header } from "@/components/Header";

// Definições reutilizadas de CadastrarSilo_v2.tsx
const ETAPAS = [
  "Tipo de Silo",
  "Localização",
  "Capacidade",
  "Infraestrutura",
  "Fotos",
  "Preço e Descrição",
  "Documentos",
  "Revisão Final",
  "Confirmação"
];

const TIPOS_SILO = [
  { id: "metalico", nome: "Silo Metálico", descricao: "Estrutura metálica para grãos", Icon: Warehouse },
  { id: "graneleiro", nome: "Armazém Graneleiro", descricao: "Armazém convencional", Icon: Building2 },
  { id: "bolsa", nome: "Silo Bolsa", descricao: "Armazenagem temporária", Icon: Package },
  { id: "outro", nome: "Outro", descricao: "Outro tipo de estrutura", Icon: Plus }
];

const INFRAESTRUTURA_OPTIONS = [
  { id: "secagem", label: "Secagem Completa", Icon: Flame },
  { id: "limpeza", label: "Limpeza de Grãos", Icon: Sparkles },
  { id: "aeracao", label: "Aeração Controlada", Icon: Wind },
  { id: "monitoramento", label: "Monitoramento 24/7", Icon: Radio },
  { id: "balanca", label: "Balança Rodoviária", Icon: Scale },
  { id: "laboratorio", label: "Laboratório de Análise", Icon: FlaskConical }
];

const TIPOS_DOCUMENTOS: DocumentType[] = [
  {
    id: "matricula",
    label: "Matrícula do Imóvel",
    required: true,
    description: "Documento que comprova a propriedade do imóvel"
  },
  {
    id: "cnpj_cpf",
    label: "CNPJ ou CPF",
    required: true,
    description: "Documento de identificação do proprietário"
  },
  {
    id: "laudo_vistoria",
    label: "Laudo de Vistoria",
    required: true,
    description: "Laudo técnico de vistoria do silo"
  },
  {
    id: "certificado_conab",
    label: "Certificado CONAB",
    required: false,
    description: "Certificado de cadastro na CONAB (se aplicável)"
  },
  {
    id: "licenca_ambiental",
    label: "Licença Ambiental",
    required: true,
    description: "Licença ambiental de operação"
  },
  {
    id: "alvara_funcionamento",
    label: "Alvará de Funcionamento",
    required: true,
    description: "Alvará de funcionamento do estabelecimento"
  }
];

// Tipo de dados do formulário
interface SiloFormData {
  tipoSilo: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: string;
  longitude: string;
  capacidadeTotal: string;
  capacidadeDisponivel: string;
  unidade: string;
  infraestrutura: string[];
  fotos: string[];
  precoPorTonelada: string;
  precoPorMes: string;
  descricao: string;
  documentos: Record<string, string>;
}

const INITIAL_STATE: SiloFormData = {
  tipoSilo: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  latitude: "",
  longitude: "",
  capacidadeTotal: "",
  capacidadeDisponivel: "",
  unidade: "toneladas",
  infraestrutura: [],
  fotos: [],
  precoPorTonelada: "",
  precoPorMes: "",
  descricao: "",
  documentos: {},
};

export default function EditarSilo() {
  const { id } = useParams();
  const siloId = parseInt(id || "0");
  const [, setLocation] = useLocation();
  const { data: user, isLoading: loadingAuth } = trpc.auth.me.useQuery();
  const isAuthenticated = !!user;
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [salvandoAutomatico, setSalvandoAutomatico] = useState(false);
  const [dados, setDados] = useState<SiloFormData>(INITIAL_STATE);

  // 1. Busca dos dados do Silo
  const { data: siloData, isLoading: loadingSilo } = trpc.silos.getById.useQuery(
    { id: siloId },
    { enabled: siloId > 0 }
  );

  // 2. Mutação de Atualização
  const updateSiloMutation = trpc.silos.update.useMutation({
    onSuccess: () => {
      toast.success("Silo atualizado com sucesso!");
      setEtapaAtual(9); // Ir para tela de confirmação
    },
    onError: (error) => {
      toast.error("Erro ao atualizar silo: " + error.message);
    },
  });

  // 3. Pré-preenchimento do formulário
  useEffect(() => {
    if (siloData) {
      // Garantir que os campos de capacidade sejam strings, mesmo que sejam números no banco
      const capacidadeTotalStr = siloData.capacidadeTotal != null ? siloData.capacidadeTotal.toString() : "";
      const capacidadeDisponivelStr = siloData.capacidadeDisponivel != null ? siloData.capacidadeDisponivel.toString() : "";

      setDados({
        tipoSilo: siloData.tipoSilo || "",
        endereco: siloData.endereco || "",
        cidade: siloData.cidade || "",
        estado: siloData.estado || "",
        cep: siloData.cep || "",
        latitude: siloData.lat || "",
        longitude: siloData.lng || "",
        capacidadeTotal: capacidadeTotalStr,
        capacidadeDisponivel: capacidadeDisponivelStr,
        unidade: "toneladas", // Assumindo toneladas
        infraestrutura: siloData.infraestrutura ? JSON.parse(siloData.infraestrutura) : [],
        fotos: siloData.fotos ? JSON.parse(siloData.fotos) : [],
        precoPorTonelada: siloData.precoTonelada || "",
        precoPorMes: siloData.precoPorMes || "",
        descricao: siloData.descricao || "",
        documentos: siloData.documentos ? JSON.parse(siloData.documentos) : {},
      });
    }
  }, [siloData]);

  // Redirecionamento para login
  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      setLocation(`/login?redirect=/editar-silo/${siloId}`);
    }
  }, [loadingAuth, isAuthenticated, setLocation, siloId]);

  // Funções de manipulação de estado (reutilizadas)
  const handleChange = useCallback((campo: keyof SiloFormData, valor: any) => {
    setDados(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const toggleInfraestrutura = useCallback((id: string) => {
    setDados(prev => {
      const novaInfra = prev.infraestrutura.includes(id)
        ? prev.infraestrutura.filter(i => i !== id)
        : [...prev.infraestrutura, id];
      return { ...prev, infraestrutura: novaInfra };
    });
  }, []);

  const validarEtapa = () => {
    switch (etapaAtual) {
      case 1:
        if (!dados.tipoSilo) {
          toast.error("Selecione o tipo de silo");
          return false;
        }
        break;
      case 2:
        if (!dados.endereco || !dados.cidade || !dados.estado) {
          toast.error("Preencha todos os campos de localização");
          return false;
        }
        break;
      case 3:
        if (!dados.capacidadeTotal || !dados.capacidadeDisponivel) {
          toast.error("Preencha a capacidade do silo");
          return false;
        }
        break;
      case 6:
        if (!dados.precoPorTonelada && !dados.precoPorMes) {
          toast.error("Informe pelo menos um tipo de preço");
          return false;
        }
        break;
    }
    return true;
  };

  const proximaEtapa = () => {
    if (!validarEtapa()) return;
    
    if (etapaAtual < 9) {
      setEtapaAtual(etapaAtual + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const etapaAnterior = () => {
    if (etapaAtual > 1) {
      setEtapaAtual(etapaAtual - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const finalizarEdicao = () => {
    if (!siloData) {
      toast.error("Dados do silo não carregados.");
      return;
    }

      // Preparar dados para a mutação de update
    const updateData = {
      id: siloData.id,
      nome: siloData.nome, // Nome não é editável neste fluxo
      descricao: dados.descricao,
      capacidadeDisponivel: parseInt(dados.capacidadeDisponivel || "0"), // Garantir que é um número
      precoTonelada: dados.precoPorTonelada,
      precoPorMes: dados.precoPorMes,
      // Outros campos que podem ser atualizados
      tipoSilo: dados.tipoSilo,
      endereco: dados.endereco,
      cidade: dados.cidade,
      estado: dados.estado,
      cep: dados.cep,
      lat: dados.latitude,
      lng: dados.longitude,
      infraestrutura: JSON.stringify(dados.infraestrutura),
      fotos: JSON.stringify(dados.fotos),
      documentos: JSON.stringify(dados.documentos),
    };

    updateSiloMutation.mutate(updateData);
  };

  // Renderização de carregamento e erro
  if (loadingAuth || loadingSilo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Carregando dados do silo...</p>
      </div>
    );
  }

  if (siloId === 0) {
    return (
      <div className="min-h-screen bg-white text-center py-20">
        <Header />
        <h1 className="text-3xl font-bold mb-4">Erro de Rota</h1>
        <p className="text-gray-600">O ID do silo não foi fornecido na URL. Certifique-se de acessar a rota correta (ex: /editar-silo/1).</p>
        <Button onClick={() => setLocation("/meus-silos")} className="mt-6">Voltar para Meus Silos</Button>
      </div>
    );
  }

  if (!siloData) {
    return (
      <div className="min-h-screen bg-white text-center py-20">
        <Header />
        <h1 className="text-3xl font-bold mb-4">Silo Não Encontrado</h1>
        <p className="text-gray-600">O silo com ID {siloId} não existe ou você não tem permissão para editá-lo.</p>
        <Button onClick={() => setLocation("/meus-silos")} className="mt-6">Voltar para Meus Silos</Button>
      </div>
    );
  }

  // Renderização do formulário (reutilizando a estrutura de CadastrarSilo_v2.tsx)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Progress Bar */}
      <ProgressBar 
        currentStep={etapaAtual} 
        totalSteps={9} 
        steps={ETAPAS}
      />

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Editar Silo: {siloData.nome}</h1>

          {/* Etapa 1: Tipo de Silo */}
          {etapaAtual === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Que tipo de silo você oferece?</h2>
                <p className="text-gray-600">Escolha a opção que melhor descreve</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TIPOS_SILO.map((tipo) => (
                  <div
                    key={tipo.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      dados.tipoSilo === tipo.id
                        ? "border-black bg-gray-100"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => handleChange("tipoSilo", tipo.id)}
                  >
                    <tipo.Icon className="w-8 h-8 mb-2 text-black" />
                    <h3 className="font-semibold">{tipo.nome}</h3>
                    <p className="text-sm text-gray-600">{tipo.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Etapa 2: Localização */}
          {etapaAtual === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Onde seu silo está localizado?</h2>
                <p className="text-gray-600">Preencha o endereço completo</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={dados.endereco}
                    onChange={(e) => handleChange("endereco", e.target.value)}
                    placeholder="Ex: Rodovia BR-163, Km 750"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={dados.cidade}
                      onChange={(e) => handleChange("cidade", e.target.value)}
                      placeholder="Ex: Primavera do Leste"
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">Estado (UF)</Label>
                    <Input
                      id="estado"
                      value={dados.estado}
                      onChange={(e) => handleChange("estado", e.target.value)}
                      placeholder="Ex: MT"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={dados.cep}
                    onChange={(e) => handleChange("cep", e.target.value)}
                    placeholder="Ex: 78850-000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      value={dados.latitude}
                      onChange={(e) => handleChange("latitude", e.target.value)}
                      placeholder="Ex: -15.59"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      value={dados.longitude}
                      onChange={(e) => handleChange("longitude", e.target.value)}
                      placeholder="Ex: -56.09"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Etapa 3: Capacidade */}
          {etapaAtual === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Qual a capacidade do seu silo?</h2>
                <p className="text-gray-600">Informe a capacidade total e a que está disponível para locação</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="capacidadeTotal">Capacidade Total (toneladas)</Label>
                  <Input
                    id="capacidadeTotal"
                    type="number"
                    value={dados.capacidadeTotal}
                    onChange={(e) => handleChange("capacidadeTotal", e.target.value)}
                    placeholder="Ex: 10000"
                  />
                </div>
                <div>
                  <Label htmlFor="capacidadeDisponivel">Capacidade Disponível (toneladas)</Label>
                  <Input
                    id="capacidadeDisponivel"
                    type="number"
                    value={dados.capacidadeDisponivel}
                    onChange={(e) => handleChange("capacidadeDisponivel", e.target.value)}
                    placeholder="Ex: 6500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4: Infraestrutura */}
          {etapaAtual === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Infraestrutura e Serviços</h2>
                <p className="text-gray-600">Selecione os serviços e infraestrutura que seu silo oferece</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {INFRAESTRUTURA_OPTIONS.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      dados.infraestrutura.includes(item.id)
                        ? "border-black bg-gray-100"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    onClick={() => toggleInfraestrutura(item.id)}
                  >
                    <item.Icon className="w-6 h-6 mb-2 text-black" />
                    <h3 className="font-semibold">{item.label}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Etapa 5: Fotos */}
          {etapaAtual === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Fotos do Silo</h2>
                <p className="text-gray-600">Adicione fotos de alta qualidade do seu silo (mínimo 3)</p>
              </div>

              <PhotoUploader
                initialPhotos={dados.fotos.map(url => ({ url, fileName: url.split('/').pop() || 'foto' }))}
                onPhotosChange={(photos: UploadedPhoto[]) => handleChange("fotos", photos.map(p => p.url))}
              />
            </div>
          )}

          {/* Etapa 6: Preço e Descrição */}
          {etapaAtual === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Preço e Detalhes</h2>
                <p className="text-gray-600">Defina o preço e escreva uma descrição atraente</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="precoPorTonelada">Preço por Tonelada/Mês (R$)</Label>
                    <Input
                      id="precoPorTonelada"
                      type="number"
                      value={dados.precoPorTonelada}
                      onChange={(e) => handleChange("precoPorTonelada", e.target.value)}
                      placeholder="Ex: 25.00"
                    />
                  </div>

                  <div>
                    <Label htmlFor="precoPorMes">Preço Fixo Mensal (R$)</Label>
                    <Input
                      id="precoPorMes"
                      type="number"
                      value={dados.precoPorMes}
                      onChange={(e) => handleChange("precoPorMes", e.target.value)}
                      placeholder="Ex: 50000.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição do Silo</Label>
                  <Textarea
                    id="descricao"
                    value={dados.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    placeholder="Descreva as características, localização, acesso, etc."
                    rows={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 7: Documentos */}
          {etapaAtual === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Documentos Necessários</h2>
                <p className="text-gray-600">Faça upload dos documentos obrigatórios</p>
              </div>

              <DocumentUploader
                documentTypes={TIPOS_DOCUMENTOS}
                onDocumentsChange={(documents: UploadedDocument[]) => {
                  const docsMap: Record<string, string> = {};
                  documents.forEach(doc => {
                    docsMap[doc.type] = doc.url;
                  });
                  handleChange("documentos", docsMap);
                }}
                initialDocuments={Object.entries(dados.documentos || {}).map(([type, url]) => ({
                  type,
                  url: url as string,
                  fileName: `${type}.pdf`,
                  uploadedAt: new Date(),
                }))}
              />
            </div>
          )}

          {/* Etapa 8: Revisão Final */}
          {etapaAtual === 8 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Revise seu anúncio</h2>
                <p className="text-gray-600">Confira se está tudo certo antes de enviar</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Tipo de Silo</h3>
                  <p className="text-gray-700">{TIPOS_SILO.find(t => t.id === dados.tipoSilo)?.nome}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Localização</h3>
                  <p className="text-gray-700">{dados.endereco}, {dados.cidade} - {dados.estado}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Capacidade</h3>
                  <p className="text-gray-700">Total: {dados.capacidadeTotal} ton | Disponível: {dados.capacidadeDisponivel} ton</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Infraestrutura</h3>
                  <p className="text-gray-700">{dados.infraestrutura.length} serviços selecionados</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Preço</h3>
                  <p className="text-gray-700">
                    {dados.precoPorTonelada && `R$ ${dados.precoPorTonelada}/ton/mês`}
                    {dados.precoPorMes && ` | R$ ${dados.precoPorMes}/mês`}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Seu anúncio entrará em análise pela nossa equipe. Você receberá uma resposta por e-mail em até 48 horas.
                </p>
              </div>
            </div>
          )}

          {/* Etapa 9: Confirmação */}
          {etapaAtual === 9 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-2">Edição Concluída!</h2>
                <p className="text-gray-600">
                  Seu silo foi atualizado com sucesso.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg text-left max-w-md mx-auto">
                <h3 className="font-semibold mb-3">Próximos Passos:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ As alterações entrarão em vigor imediatamente.</li>
                  <li>✓ Você pode verificar o status no seu painel.</li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => setLocation("/meus-silos")} variant="outline">
                  Voltar para Meus Silos
                </Button>
                <Button onClick={() => setLocation("/dashboard")} className="bg-black hover:bg-gray-800">
                  Ir para Meu Painel
                </Button>
              </div>
            </div>
          )}

          {/* Botões de Navegação */}
          {etapaAtual < 9 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={etapaAnterior}
                variant="outline"
                disabled={etapaAtual === 1 || updateSiloMutation.isPending}
              >
                Voltar
              </Button>

              {etapaAtual < 8 ? (
                <Button onClick={proximaEtapa} className="bg-black hover:bg-gray-800" disabled={updateSiloMutation.isPending}>
                  Continuar
                </Button>
              ) : (
                <Button onClick={finalizarEdicao} className="bg-green-600 hover:bg-green-700" disabled={updateSiloMutation.isPending}>
                  Salvar Alterações
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
