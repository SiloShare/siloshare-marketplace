import { useState, useEffect } from "react";
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
import { Check, X } from "lucide-react";

const ReservasRecebidas = () => {
  const [filters, setFilters] = useState<FilterValues>({});
  const { data: reservations, isLoading, error, refetch } = trpc.reservas.receivedReservations.useQuery(filters);
  const { data: userSilos } = trpc.silos.list.useQuery();
  const approveMutation = trpc.reservas.approve.useMutation();
  const rejectMutation = trpc.reservas.reject.useMutation();
  
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState<number | null>(null);

  const handleApproveClick = (reservaId: number) => {
    setSelectedReservaId(reservaId);
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (reservaId: number) => {
    setSelectedReservaId(reservaId);
    setRejectDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedReservaId) return;

    try {
      const result = await approveMutation.mutateAsync({ reservaId: selectedReservaId });
      toast.success(result.message || "Reserva aprovada com sucesso!");
      refetch();
      setApproveDialogOpen(false);
      setSelectedReservaId(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao aprovar reserva");
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedReservaId) return;

    try {
      const result = await rejectMutation.mutateAsync({ reservaId: selectedReservaId });
      toast.success(result.message || "Reserva rejeitada com sucesso!");
      refetch();
      setRejectDialogOpen(false);
      setSelectedReservaId(null);
    } catch (error: any) {
      toast.error(error.message || "Erro ao rejeitar reserva");
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
                <p className="text-gray-600">Carregando reservas recebidas...</p>
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
          <CardTitle className="text-2xl font-bold">Reservas Recebidas</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Gerencie as reservas feitas nos seus silos
          </p>
        </CardHeader>
        <CardContent>
          <ReservasFilters 
            onFilterChange={setFilters} 
            showSiloFilter={true}
            silos={userSilos || []}
          />
          {!reservations || reservations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Você ainda não recebeu nenhuma reserva.</p>
              <p className="text-sm text-gray-400 mt-2">
                As reservas feitas nos seus silos aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Silo</TableHead>
                    <TableHead>Produtor</TableHead>
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
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {reserva.produtorNome || `Produtor #${reserva.produtorId}`}
                          </span>
                          {reserva.produtorEmail && (
                            <span className="text-xs text-gray-500">
                              {reserva.produtorEmail}
                            </span>
                          )}
                        </div>
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
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveClick(reserva.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectClick(reserva.id)}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                        {reserva.status === 'confirmada' && (
                          <span className="text-sm text-green-600 font-medium">Aprovada</span>
                        )}
                        {reserva.status === 'rejeitada' && (
                          <span className="text-sm text-red-600 font-medium">Rejeitada</span>
                        )}
                        {reserva.status === 'cancelada' && (
                          <span className="text-sm text-gray-400">Cancelada pelo cliente</span>
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

      {/* Modal de confirmação de aprovação */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar esta reserva? O cliente será notificado e a reserva será confirmada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Sim, aprovar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de confirmação de rejeição */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar esta reserva? A capacidade do silo será restaurada automaticamente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Sim, rejeitar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReservasRecebidas;
