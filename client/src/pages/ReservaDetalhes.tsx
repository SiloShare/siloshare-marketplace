import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Calendar, Package, DollarSign, User, Building2, Phone, Mail, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ReservaDetalhes() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const reservaId = parseInt(id || "0");

  const { data, isLoading, error } = trpc.reservas.getReservaDetails.useQuery(
    { reservaId },
    { enabled: !!reservaId }
  );

  const { data: historico, isLoading: isLoadingHistorico } = trpc.reservas.getReservaHistorico.useQuery(
    { reservaId },
    { enabled: !!reservaId }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando detalhes da reserva...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-semibold mb-2">Erro ao carregar reserva</p>
              <p className="text-sm">{error?.message || "Reserva não encontrada"}</p>
              <Button onClick={() => setLocation(-1)} className="mt-4">
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { reserva, silo, produtor, proprietario, userRole } = data;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      pendente: { color: "bg-yellow-100 text-yellow-800", text: "Pendente" },
      confirmada: { color: "bg-green-100 text-green-800", text: "Confirmada" },
      cancelada: { color: "bg-gray-100 text-gray-800", text: "Cancelada" },
      rejeitada: { color: "bg-red-100 text-red-800", text: "Rejeitada" },
    };
    const variant = variants[status] || variants.pendente;
    return <Badge className={variant.color}>{variant.text}</Badge>;
  };

  const getPagamentoStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; text: string }> = {
      pendente: { color: "bg-yellow-100 text-yellow-800", text: "Pendente" },
      pago: { color: "bg-green-100 text-green-800", text: "Pago" },
      cancelado: { color: "bg-gray-100 text-gray-800", text: "Cancelado" },
    };
    const variant = variants[status] || variants.pendente;
    return <Badge className={variant.color}>{variant.text}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const calcularDuracao = () => {
    const inicio = new Date(reserva.dataInicio);
    const fim = new Date(reserva.dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const meses = Math.floor(diffDays / 30);
    const dias = diffDays % 30;
    return meses > 0 ? `${meses} ${meses === 1 ? 'mês' : 'meses'}${dias > 0 ? ` e ${dias} ${dias === 1 ? 'dia' : 'dias'}` : ''}` : `${dias} ${dias === 1 ? 'dia' : 'dias'}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reserva #{reserva.id}
            </h1>
            <p className="text-gray-600 mt-1">
              Criada em {formatDate(reserva.createdAt)}
            </p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(reserva.status)}
            {getPagamentoStatusBadge(reserva.pagamentoStatus)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações do Silo */}
          {silo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Informações do Silo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {silo.nome}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{silo.endereco}, {silo.cidade} - {silo.estado}</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Capacidade Total</p>
                    <p className="text-lg font-semibold">
                      {silo.capacidadeTotal?.toLocaleString("pt-BR")} ton
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Grão</p>
                    <p className="text-lg font-semibold capitalize">
                      {silo.tipoGrao || "Não especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preço Mensal</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(silo.precoMensal || 0)}/ton
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disponível</p>
                    <p className="text-lg font-semibold">
                      {silo.capacidadeDisponivel?.toLocaleString("pt-BR")} ton
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detalhes da Reserva */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Detalhes da Reserva
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Capacidade Reservada</p>
                    <p className="text-lg font-semibold">
                      {reserva.capacidadeReservada.toLocaleString("pt-BR")} toneladas
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(reserva.valorTotal)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Data de Início</p>
                    <p className="text-lg font-semibold">
                      {formatDate(reserva.dataInicio)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Data de Término</p>
                    <p className="text-lg font-semibold">
                      {formatDate(reserva.dataFim)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Duração</p>
                <p className="text-lg font-semibold">{calcularDuracao()}</p>
              </div>

              {reserva.contratoUrl && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Contrato</p>
                    <Button variant="outline" size="sm" asChild>
                      <a href={reserva.contratoUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizar Contrato
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Informações do Cliente (para proprietário) */}
          {userRole === "proprietario" && produtor && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold">{produtor.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${produtor.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {produtor.email}
                  </a>
                </div>
                {produtor.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${produtor.telefone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {produtor.telefone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações do Proprietário (para cliente) */}
          {userRole === "produtor" && proprietario && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-600" />
                  Proprietário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold">{proprietario.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${proprietario.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {proprietario.email}
                  </a>
                </div>
                {proprietario.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${proprietario.telefone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {proprietario.telefone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Histórico de Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Histórico de Ações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistorico ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Carregando histórico...</p>
                </div>
              ) : !historico || historico.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma ação registrada ainda.
                </p>
              ) : (
                <div className="space-y-4">
                  {historico.map((item, index) => {
                    const getAcaoIcon = (acao: string) => {
                      switch (acao) {
                        case 'criada':
                          return <AlertCircle className="h-5 w-5 text-blue-600" />;
                        case 'aprovada':
                          return <CheckCircle className="h-5 w-5 text-green-600" />;
                        case 'rejeitada':
                        case 'cancelada':
                          return <XCircle className="h-5 w-5 text-red-600" />;
                        default:
                          return <Clock className="h-5 w-5 text-gray-600" />;
                      }
                    };

                    const getAcaoText = (acao: string) => {
                      switch (acao) {
                        case 'criada':
                          return 'Reserva Criada';
                        case 'aprovada':
                          return 'Reserva Aprovada';
                        case 'rejeitada':
                          return 'Reserva Rejeitada';
                        case 'cancelada':
                          return 'Reserva Cancelada';
                        default:
                          return acao;
                      }
                    };

                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex-shrink-0">
                            {getAcaoIcon(item.acao)}
                          </div>
                          {index < historico.length - 1 && (
                            <div className="w-px h-full bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900">
                              {getAcaoText(item.acao)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Por: {item.userName}
                          </p>
                          {item.detalhes && (
                            <p className="text-sm text-gray-500 italic">
                              {item.detalhes}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {userRole === "produtor" && reserva.status === "pendente" && (
                <Button variant="destructive" className="w-full">
                  Cancelar Reserva
                </Button>
              )}
              {userRole === "proprietario" && reserva.status === "pendente" && (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Aprovar Reserva
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Rejeitar Reserva
                  </Button>
                </>
              )}
              {reserva.status === "confirmada" && (
                <Button variant="outline" className="w-full">
                  Gerar Contrato
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
