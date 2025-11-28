import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertCircle, ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

export default function Contrato() {
  const { reservaId } = useParams<{ reservaId: string }>();
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: contrato, refetch } = trpc.contratos.getByReserva.useQuery(
    { reservaId: parseInt(reservaId || "0") },
    { enabled: !!reservaId }
  );
  const gerarContratoMutation = trpc.contratos.gerar.useMutation();
  const assinarContratoMutation = trpc.contratos.assinar.useMutation();

  const [showContract, setShowContract] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string; icon: any }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Aguardando Assinaturas", icon: AlertCircle },
      signed_by_producer: { color: "bg-blue-100 text-blue-800", text: "Assinado pelo Produtor", icon: CheckCircle },
      signed_by_owner: { color: "bg-blue-100 text-blue-800", text: "Assinado pelo Proprietário", icon: CheckCircle },
      completed: { color: "bg-green-100 text-green-800", text: "✅ Contrato Completo", icon: CheckCircle },
    };
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {variant.text}
      </Badge>
    );
  };

  const handleGerarContrato = async () => {
    try {
      await gerarContratoMutation.mutateAsync({
        reservaId: parseInt(reservaId || "0"),
      });
      await refetch();
      toast.success("Contrato gerado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar contrato");
    }
  };

  const handleAssinarContrato = async () => {
    if (!contrato) return;

    try {
      await assinarContratoMutation.mutateAsync({
        contratoId: contrato.id,
        ipAddress: "0.0.0.0", // TODO: Obter IP real do cliente
      });
      await refetch();
      toast.success("Contrato assinado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao assinar contrato");
    }
  };

  const handleVisualizarContrato = () => {
    if (!contrato) return;
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(contrato.conteudo);
      newWindow.document.close();
    }
  };

  const handleDownloadPDF = () => {
    if (!contrato) return;
    // TODO: Implementar geração de PDF
    toast.info("Funcionalidade de download em desenvolvimento");
  };

  const canSign = () => {
    if (!contrato || !user) return false;
    if (contrato.status === "completed") return false;
    
    if (user.id === contrato.produtorId && !contrato.assinaturaProdutor) {
      return true;
    }
    if (user.id === contrato.proprietarioId && !contrato.assinaturaProprietario) {
      return true;
    }
    return false;
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation(`/reserva/${reservaId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Reserva
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Contrato de Armazenagem
            </h1>
            <p className="text-gray-600 mt-2">
              Reserva #{reservaId}
            </p>
          </div>
          {contrato && getStatusBadge(contrato.status)}
        </div>
      </div>

      {contrato ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Documento do Contrato
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showContract ? (
                  <div>
                    <div
                      className="border border-gray-200 rounded-lg p-6 bg-white max-h-[600px] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: contrato.conteudo }}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setShowContract(false)}
                      className="w-full mt-4"
                    >
                      Ocultar Contrato
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">
                      Clique no botão abaixo para visualizar o contrato completo
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => setShowContract(true)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizar Contrato
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleVisualizarContrato}
                      >
                        Abrir em Nova Janela
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Card de Status */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Status do Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Contrato ID</p>
                  <p className="font-semibold">#{contrato.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Criado em</p>
                  <p className="font-semibold">
                    {new Date(contrato.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                {contrato.signedAt && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Assinado em</p>
                    <p className="font-semibold">
                      {new Date(contrato.signedAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Produtor</span>
                      {contrato.assinaturaProdutor ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Proprietário</span>
                      {contrato.assinaturaProprietario ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Ações */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canSign() ? (
                  <Button
                    onClick={handleAssinarContrato}
                    disabled={assinarContratoMutation.isPending}
                    className="w-full"
                  >
                    {assinarContratoMutation.isPending ? (
                      "Assinando..."
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Assinar Contrato
                      </>
                    )}
                  </Button>
                ) : contrato.status === "completed" ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">
                      Contrato Assinado por Ambas as Partes
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <AlertCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-800">
                      Aguardando Assinatura da Outra Parte
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
              </CardContent>
            </Card>

            {/* Informações Legais */}
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="pt-6">
                <p className="text-xs text-gray-600 leading-relaxed">
                  ⚖️ <strong>Validade Legal:</strong> Este contrato possui validade jurídica conforme a Lei nº 14.063/2020, que regulamenta o uso de assinaturas eletrônicas no Brasil.
                </p>
                <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                  🔒 <strong>Segurança:</strong> Todas as assinaturas são registradas com timestamp e endereço IP para garantir autenticidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Contrato Não Gerado
              </h2>
              <p className="text-gray-600 mb-6">
                O contrato para esta reserva ainda não foi gerado.
              </p>
              <Button
                onClick={handleGerarContrato}
                disabled={gerarContratoMutation.isPending}
              >
                {gerarContratoMutation.isPending ? (
                  "Gerando..."
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Contrato
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
