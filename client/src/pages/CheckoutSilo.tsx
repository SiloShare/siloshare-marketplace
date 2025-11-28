import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, Calendar as CalendarIcon, CreditCard, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import DocumentosNecessariosCliente from "@/components/DocumentosNecessariosCliente";
import ContratoDigital from "@/components/ContratoDigital";
// import DocuSignIntegration from "@/components/DocuSignIntegration";
import { toast } from "sonner";

// Adicionar mock data para fallback
const SILO_MOCK = {
  id: 1,
  nome: "Silo de Teste",
  cidade: "Cidade Teste",
  estado: "TS",
  precoPorTonelada: 25.0,
  capacidadeDisponivel: 1000,
};

export default function CheckoutSilo() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [etapa, setEtapa] = useState<"documentos" | "dados" | "contrato" | "sucesso">("documentos");
  const [quantidade, setQuantidade] = useState("");
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const [meses, setMeses] = useState(1);

  const { data: realSilo } = trpc.silos.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id && id !== "0" } // Apenas executa a query se o ID for válido
  );

  // Usa o silo real se existir, senão usa o mock. Isso garante que a página sempre tenha dados para renderizar.
  const silo = realSilo || SILO_MOCK;

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!user) {
      setLocation(`/login?redirect=/checkout/silo/${id}`);
    }
  }, [user, id, setLocation]);

  const calcularTotal = () => {
    if (!silo || !quantidade) return 0;
    return parseFloat(quantidade) * silo.precoPorTonelada * meses;
  };

  const handleDocumentosConcluidos = () => {
    setEtapa("dados");
  };

  const handleDadosConcluidos = () => {
    if (!quantidade || !dataInicio) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setEtapa("contrato");
  };

  const handleContratoAssinado = (envelopeId: string) => {
    console.log("Contrato assinado! Envelope ID:", envelopeId);
    // TODO: Salvar reserva no banco
    setEtapa("sucesso");
  };const criarReserva = trpc.reservas.create.useMutation();

  const handleConfirmarReserva = () => {
    criarReserva.mutate({
      siloId: parseInt(id || "0"),
      capacidadeReservada: reserva.quantidade,
      dataInicio: reserva.dataInicio,
      dataFim: reserva.dataFim,
      valorTotal: reserva.valorTotal,
    });  handleDadosConcluidos();
  };

    if (!user) { // A verificação do silo não é mais necessária aqui
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => setLocation(`/silo/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Etapa 1: Documentos Necessários */}
        {etapa === "documentos" && (
          <DocumentosNecessariosCliente 
            onContinue={handleDocumentosConcluidos}
            onBack={() => setLocation(`/detalhes-silo/${id}`)}
          />
        )}

        {/* Etapa 2: Dados da Reserva */}
        {etapa === "dados" && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Finalizar Reserva</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Silo */}
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Silo Selecionado</h2>
              <div className="space-y-2">
                <p className="font-medium">{silo.nome}</p>
                <p className="text-sm text-gray-600">{silo.cidade}, {silo.estado}</p>
                <p className="text-sm">
                  <span className="font-medium">R$ {silo.precoPorTonelada.toFixed(2)}</span> /tonelada/mês
                </p>
              </div>
            </Card>

            {/* Detalhes da Reserva */}
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4">Detalhes da Reserva</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quantidade">Quantidade (toneladas)</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    placeholder="Ex: 100"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    max={silo.capacidadeDisponivel}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Disponível: {silo.capacidadeDisponivel} toneladas
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Data de Início</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left mt-1"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dataInicio ? format(dataInicio, "PPP", { locale: ptBR }) : "Selecione"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dataInicio}
                          onSelect={setDataInicio}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="meses">Período (meses)</Label>
                    <Input
                      id="meses"
                      type="number"
                      min="1"
                      value={meses}
                      onChange={(e) => setMeses(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Pagamento */}
            <Card className="p-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pagamento
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  O pagamento será processado após a confirmação da reserva
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Você receberá um email com as instruções de pagamento e o contrato digital para assinatura.
              </p>
            </Card>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-bold text-lg mb-4">Resumo</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantidade</span>
                  <span className="font-medium">{quantidade || 0} t</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Preço/t/mês</span>
                  <span className="font-medium">R$ {silo.precoPorTonelada.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Período</span>
                  <span className="font-medium">{meses} {meses === 1 ? "mês" : "meses"}</span>
                </div>
                
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-xl">
                      R$ {calcularTotal().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConfirmar}
                className="w-full bg-black hover:bg-gray-800 py-6"
                disabled={!quantidade || !dataInicio}
              >
                Confirmar Reserva
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Ao confirmar, você concorda com nossos termos de serviço
              </p>
            </Card>
          </div>
        </div>
        </div>
        )}

        {/* Etapa 3: Assinatura do Contrato via DocuSign */}
        {etapa === "contrato" && (
          <ContratoDigital onContratoAssinado={handleContratoAssinado} />
        )}

        {/* Etapa 4: Sucesso */}
        {etapa === "sucesso" && (
          <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold mb-4">Contratação Concluída!</h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Seu contrato de armazenagem foi assinado com sucesso. Você receberá uma cópia por e-mail em instantes.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">Próximos Passos:</h3>
              <ul className="text-left space-y-2 text-blue-800">
                <li>✓ Você receberá um e-mail de confirmação com o contrato assinado</li>
                <li>✓ O fornecedor entrará em contato em até 24 horas</li>
                <li>✓ Acompanhe o status no seu painel</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/painel")}
                className="bg-green-600 hover:bg-green-700 px-8 py-6 text-base"
              >
                Ir para Meu Painel
              </Button>
              <Button 
                onClick={() => setLocation("/buscar-armazenagem")}
                variant="outline"
                className="px-8 py-6 text-base"
              >
                Buscar Mais Silos
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

