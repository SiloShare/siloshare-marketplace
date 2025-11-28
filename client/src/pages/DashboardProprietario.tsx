import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Package, 
  Clock, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function DashboardProprietario() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.reservas.dashboard.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">Erro ao carregar estatísticas</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pendente: { variant: "secondary" as const, label: "Pendente" },
      confirmada: { variant: "default" as const, label: "Confirmada" },
      cancelada: { variant: "destructive" as const, label: "Cancelada" },
      rejeitada: { variant: "destructive" as const, label: "Rejeitada" },
    };

    const config = variants[status] || variants.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-10">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do seu negócio de armazenagem
        </p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total de Silos */}
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Silos
            </CardTitle>
            <Building2 className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalSilos}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Silos cadastrados
            </p>
          </CardContent>
        </Card>

        {/* Reservas Pendentes */}
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reservas Pendentes
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {stats.reservasPendentes}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Aguardando aprovação
            </p>
            {stats.reservasPendentes > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-3 w-full"
                onClick={() => setLocation('/reservas-recebidas')}
              >
                Ver pendentes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Taxa de Ocupação */}
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Ocupação
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.taxaOcupacao}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(stats.capacidadeTotal - stats.capacidadeDisponivel)} / {formatNumber(stats.capacidadeTotal)} ton
            </p>
          </CardContent>
        </Card>

        {/* Receita do Mês */}
        <Card className="border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita do Mês
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.receitaMesAtual)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total: {formatCurrency(stats.receitaTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distribuição de Reservas por Status */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Reservas por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium">Pendentes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {stats.reservasPorStatus.pendente}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalReservas > 0 ? (stats.reservasPorStatus.pendente / stats.totalReservas) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Confirmadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {stats.reservasPorStatus.confirmada}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalReservas > 0 ? (stats.reservasPorStatus.confirmada / stats.totalReservas) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">Canceladas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {stats.reservasPorStatus.cancelada}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalReservas > 0 ? (stats.reservasPorStatus.cancelada / stats.totalReservas) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium">Rejeitadas</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">
                    {stats.reservasPorStatus.rejeitada}
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gray-500 h-2 rounded-full" 
                      style={{ 
                        width: `${stats.totalReservas > 0 ? (stats.reservasPorStatus.rejeitada / stats.totalReservas) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Total de Reservas</span>
                <span className="font-bold text-lg">{stats.totalReservas}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ocupação dos Silos */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Ocupação dos Silos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.silos && stats.silos.length > 0 ? (
                stats.silos.slice(0, 5).map((silo) => {
                  const ocupacao = silo.capacidadeTotal > 0
                    ? ((silo.capacidadeTotal - (silo.capacidadeDisponivel || 0)) / silo.capacidadeTotal) * 100
                    : 0;

                  return (
                    <div key={silo.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[200px]">
                          {silo.nome || `Silo #${silo.id}`}
                        </span>
                        <span className="text-gray-500">
                          {Math.round(ocupacao)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            ocupacao >= 90 ? 'bg-red-600' :
                            ocupacao >= 70 ? 'bg-orange-500' :
                            'bg-green-600'
                          }`}
                          style={{ width: `${ocupacao}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Disponível: {formatNumber(silo.capacidadeDisponivel || 0)} ton
                        </span>
                        <span>
                          Total: {formatNumber(silo.capacidadeTotal || 0)} ton
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhum silo cadastrado ainda</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => setLocation('/cadastrar-silo')}
                  >
                    Cadastrar primeiro silo
                  </Button>
                </div>
              )}
            </div>

            {stats.silos && stats.silos.length > 5 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setLocation('/meus-silos')}
                >
                  Ver todos os silos ({stats.silos.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Últimas Reservas */}
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Últimas Reservas
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation('/reservas-recebidas')}
            >
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats.ultimasReservas && stats.ultimasReservas.length > 0 ? (
            <div className="space-y-3">
              {stats.ultimasReservas.map((reserva) => (
                <div 
                  key={reserva.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/reserva/${reserva.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium text-gray-900">
                        Reserva #{reserva.id}
                      </p>
                      {getStatusBadge(reserva.status || 'pendente')}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Capacidade: {formatNumber(reserva.capacidadeReservada)} toneladas</p>
                      <p>
                        Período: {format(new Date(reserva.dataInicio), 'dd/MM/yyyy', { locale: ptBR })} até {format(new Date(reserva.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-lg text-green-600">
                      {formatCurrency(reserva.valorTotal)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reserva.createdAt && format(new Date(reserva.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-1">Nenhuma reserva recebida ainda</p>
              <p className="text-sm text-gray-400">
                As reservas aparecerão aqui quando clientes reservarem seus silos
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
