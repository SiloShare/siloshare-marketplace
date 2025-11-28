import { useState } from "react";
import { trpc } from "../lib/trpc";
import ReservasFilters, { FilterValues } from "@/components/ReservasFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import { X } from "lucide-react";

const MinhasReservas = () => {
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: reservations, isLoading, error, refetch } = trpc.reservas.myReservations.useQuery(filters);
  const cancelMutation = trpc.reservas.cancel.useMutation();
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);

  const handleCancelClick = (reservaId: number) => {
    setSelectedReservaId(reservaId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedReservaId) return;

    try {
      const result = await cancelMutation.mutateAsync({ reservaId: selectedReservaId });
      toast.success(result.message || "Reserva cancelada com sucesso!");
      refetch();
      setCancelDialogOpen(false);
      setSelectedReservaId(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar reserva");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando suas reservas...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-red-600">
              <p className="font-semibold">Erro ao carregar reservas</p>
              <p className="text-sm mt-2">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Minhas Reservas</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Acompanhe todas as suas reservas de armazenagem de grãos
          </p>
        </CardHeader>
        <CardContent>
          <ReservasFilters onFilterChange={setFilters} />
          {!reservations || reservations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Você ainda não possui reservas.</p>
              <p className="text-sm text-gray-400 mt-2">
                Navegue pelos silos disponíveis e faça sua primeira reserva!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Silo</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Data Fim</TableHead>
                    <TableHead className="text-right">Capacidade (ton)</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reserva) => (
                    <TableRow key={reserva.id}>
                      <TableCell className="font-medium">
                        <a 
                          href={`/reserva/${reserva.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {reserva.siloNome || `Silo #${reserva.siloId}`}
                        </a>
                      </TableCell>
                      <TableCell>
                        {format(new Date(reserva.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(reserva.dataFim), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        {reserva.capacidadeReservada.toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        R$ {reserva.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            reserva.status === 'confirmada' ? 'default' : 
                            reserva.status === 'pendente' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {reserva.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {reserva.status === 'pendente' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(reserva.id)}
                            disabled={cancelMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                        )}
                        {reserva.status === 'cancelada' && (
                          <span className="text-sm text-gray-400">Cancelada</span>
                        )}
                        {reserva.status === 'confirmada' && (
                          <span className="text-sm text-gray-400">Confirmada</span>
                        )}
                        {reserva.status === 'rejeitada' && (
                          <span className="text-sm text-gray-400">Rejeitada</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmação de cancelamento */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar esta reserva? A capacidade do silo será restaurada automaticamente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Não, manter reserva</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MinhasReservas;
