import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Package,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useLocation } from "wouter";
import { ReceitaChart } from "@/components/ReceitaChart";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PeriodFilter = "current_month" | "last_3_months" | "last_6_months" | "last_year" | "all_time";

export default function DashboardProprietarioV2() {
  const [, setLocation] = useLocation();
  const [period, setPeriod] = useState<PeriodFilter>("current_month");
  const [selectedSiloId, setSelectedSiloId] = useState<number | undefined>(undefined);
  
  const { data: stats, isLoading, refetch } = trpc.reservas.dashboard.useQuery({ 
    period,
    siloId: selectedSiloId 
  });

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
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  // Dados para gráfico de pizza (status das reservas)
  const pieData = [
    { name: "Pendentes", value: stats.statusDistribution.pendente || 0, color: "#eab308" },
    { name: "Confirmadas", value: stats.statusDistribution.confirmada || 0, color: "#22c55e" },
    { name: "Canceladas", value: stats.statusDistribution.cancelada || 0, color: "#6b7280" },
    { name: "Rejeitadas", value: stats.statusDistribution.rejeitada || 0, color: "#ef4444" },
  ].filter(item => item.value > 0);

  // Dados de receita mensal (do backend)
  const revenueData = stats.receitaMensal || [];

  // Dados para gráfico de ocupação por silo
  const ocupacaoData = stats.silosOcupacao?.map((silo: any) => ({
    nome: silo.nome?.substring(0, 15) + (silo.nome?.length > 15 ? "..." : ""),
    ocupacao: ((silo.capacidadeTotal - silo.capacidadeDisponivel) / silo.capacidadeTotal * 100).toFixed(1),
  })) || [];

  const exportReservasMutation = trpc.relatorios.exportarReservas.useQuery(
    { format: "csv" },
    { enabled: false }
  );

  const handleExportReport = async () => {
    try {
      const result = await exportReservasMutation.refetch();
      if (result.data) {
        // Criar blob e fazer download
        const blob = new Blob([result.data.content], { type: result.data.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Erro ao exportar relatório:", error);
      alert("Erro ao exportar relatório. Tente novamente.");
    }
  };

  const getPeriodLabel = (period: PeriodFilter) => {
    const labels: Record<PeriodFilter, string> = {
      current_month: "Mês Atual",
      last_3_months: "Últimos 3 Meses",
      last_6_months: "Últimos 6 Meses",
      last_year: "Último Ano",
      all_time: "Todo o Período",
    };
    return labels[period];
  };

  return (
    <div className="container mx-auto py-10">
      {/* Cabeçalho com Filtros */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Visão geral do seu negócio de armazenagem
            </p>
          </div>
          <div className="flex gap-3">
            <Select 
              value={selectedSiloId?.toString() || "all"} 
              onValueChange={(value) => setSelectedSiloId(value === "all" ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-[200px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Todos os Silos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Silos</SelectItem>
                {stats?.silos?.map((silo: any) => (
                  <SelectItem key={silo.id} value={silo.id.toString()}>
                    {silo.nome || `Silo #${silo.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Mês Atual</SelectItem>
                <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
                <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
                <SelectItem value="last_year">Último Ano</SelectItem>
                <SelectItem value="all_time">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      {/* Alertas Inteligentes */}
      {stats.alerts && stats.alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {stats.alerts.map((alert: any, index: number) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === "warning"
                  ? "bg-orange-50 border-orange-200"
                  : alert.type === "success"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {alert.type === "warning" && (
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                )}
                {alert.type === "success" && (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                )}
                {alert.type === "info" && (
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${
                      alert.type === "warning"
                        ? "text-orange-900"
                        : alert.type === "success"
                        ? "text-green-900"
                        : "text-blue-900"
                    }`}
                  >
                    {alert.title}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      alert.type === "warning"
                        ? "text-orange-700"
                        : alert.type === "success"
                        ? "text-green-700"
                        : "text-blue-700"
                    }`}
                  >
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total de Silos */}
        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
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
            <p className="text-xs text-gray-500 mt-1">Silos cadastrados</p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-green-600"
              onClick={() => setLocation("/meus-silos")}
            >
              Ver todos →
            </Button>
          </CardContent>
        </Card>

        {/* Reservas Pendentes */}
        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
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
            <p className="text-xs text-gray-500 mt-1">Aguardando aprovação</p>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-orange-600"
              onClick={() => setLocation("/reservas-recebidas")}
            >
              Revisar →
            </Button>
          </CardContent>
        </Card>

        {/* Taxa de Ocupação */}
        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Ocupação
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.taxaOcupacao.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(stats.capacidadeTotal - stats.capacidadeDisponivel)} de{" "}
              {formatNumber(stats.capacidadeTotal)} ton
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.taxaOcupacao}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Receita do Mês */}
        <Card className="border-gray-200 hover:shadow-lg transition-shadow">
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
            {stats.periodComparison?.receita && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${
                stats.periodComparison.receita.isPositive ? "text-green-600" : "text-red-600"
              }`}>
                {stats.periodComparison.receita.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {stats.periodComparison.receita.isPositive ? "+" : ""}
                  {stats.periodComparison.receita.change}% vs período anterior
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Receita Mensal */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReceitaChart data={revenueData} formatCurrency={formatCurrency} />
          </CardContent>
        </Card>

        {/* Gráfico de Status das Reservas */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Distribuição de Reservas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Ocupação por Silo */}
      {ocupacaoData.length > 0 && (
        <Card className="border-gray-200 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Ocupação por Silo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ocupacaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="nome" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  formatter={(value: number) => `${value}%`}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="ocupacao" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Últimas Reservas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Reservas */}
        <Card className="border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Últimas Reservas
              </span>
              <Button
                variant="link"
                className="text-green-600"
                onClick={() => setLocation("/reservas-recebidas")}
              >
                Ver todas →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.ultimasReservas && stats.ultimasReservas.length > 0 ? (
              <div className="space-y-4">
                {stats.ultimasReservas.slice(0, 5).map((reserva: any) => (
                  <div
                    key={reserva.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/reserva/${reserva.id}`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {reserva.siloNome || `Silo #${reserva.siloId}`}
                        </p>
                        <Badge
                          className={
                            reserva.status === "pendente"
                              ? "bg-yellow-100 text-yellow-800"
                              : reserva.status === "confirmada"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {reserva.status === "pendente" && "Pendente"}
                          {reserva.status === "confirmada" && "Confirmada"}
                          {reserva.status === "cancelada" && "Cancelada"}
                          {reserva.status === "rejeitada" && "Rejeitada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatNumber(reserva.capacidadeReservada)} ton •{" "}
                        {formatCurrency(reserva.valorTotal)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(reserva.createdAt), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {reserva.status === "pendente" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600">
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600">
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhuma reserva encontrada
              </p>
            )}
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-green-600" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
                onClick={() => setLocation("/cadastrar-silo")}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Cadastrar Novo Silo
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setLocation("/reservas-recebidas")}
            >
              <Package className="h-4 w-4 mr-2" />
              Ver Todas as Reservas
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setLocation("/meus-silos")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Gerenciar Silos
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleExportReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
