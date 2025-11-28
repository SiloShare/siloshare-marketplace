import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SiloAvaliacoesProps {
  siloId: number;
}

export function SiloAvaliacoes({ siloId }: SiloAvaliacoesProps) {
  const { data: user } = trpc.auth.me.useQuery();
  const { data: avaliacoes, refetch } = trpc.avaliacoes.listBySilo.useQuery({ siloId });
  const { data: canReview } = trpc.avaliacoes.canReview.useQuery(
    { siloId },
    { enabled: !!user }
  );
  const createAvaliacaoMutation = trpc.avaliacoes.create.useMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [nota, setNota] = useState(0);
  const [hoverNota, setHoverNota] = useState(0);
  const [comentario, setComentario] = useState("");

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmitAvaliacao = async () => {
    if (nota === 0) {
      toast.error("Selecione uma nota de 1 a 5 estrelas");
      return;
    }

    if (!canReview?.reservaId) {
      toast.error("Você não pode avaliar este silo");
      return;
    }

    try {
      await createAvaliacaoMutation.mutateAsync({
        siloId,
        reservaId: canReview.reservaId,
        nota,
        comentario: comentario || undefined,
      });

      await refetch();
      setIsDialogOpen(false);
      setNota(0);
      setComentario("");
      toast.success("Avaliação enviada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar avaliação");
      console.error(error);
    }
  };

  const renderStars = (rating: number, interactive = false, size = "md") => {
    const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= (interactive ? (hoverNota || nota) : rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer transition-colors" : ""}`}
            onClick={interactive ? () => setNota(star) : undefined}
            onMouseEnter={interactive ? () => setHoverNota(star) : undefined}
            onMouseLeave={interactive ? () => setHoverNota(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const mediaAvaliacoes = avaliacoes && avaliacoes.length > 0
    ? avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length
    : 0;

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              Avaliações
            </CardTitle>
            {avaliacoes && avaliacoes.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {renderStars(Math.round(mediaAvaliacoes))}
                <span className="text-sm text-gray-600">
                  {mediaAvaliacoes.toFixed(1)} ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'})
                </span>
              </div>
            )}
          </div>
          {user && canReview?.canReview && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Avaliar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {avaliacoes && avaliacoes.length > 0 ? (
          <div className="space-y-4">
            {avaliacoes.map((avaliacao) => (
              <div key={avaliacao.id} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={avaliacao.userAvatarUrl || undefined} />
                    <AvatarFallback className="bg-green-600 text-white text-sm">
                      {getInitials(avaliacao.userName || "US")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">
                        {avaliacao.userName || "Usuário"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {avaliacao.createdAt && format(new Date(avaliacao.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    {renderStars(avaliacao.nota, false, "sm")}
                    {avaliacao.comentario && (
                      <p className="text-sm text-gray-600 mt-2">
                        {avaliacao.comentario}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhuma avaliação ainda</p>
            <p className="text-xs text-gray-400 mt-1">
              Seja o primeiro a avaliar este silo
            </p>
          </div>
        )}
      </CardContent>

      {/* Modal de Criar Avaliação */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Avaliar Silo</DialogTitle>
            <DialogDescription>
              Compartilhe sua experiência com outros produtores
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Nota
              </label>
              <div className="flex items-center gap-2">
                {renderStars(nota, true, "lg")}
                {nota > 0 && (
                  <span className="text-sm text-gray-600 ml-2">
                    {nota} {nota === 1 ? 'estrela' : 'estrelas'}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Comentário (opcional)
              </label>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Conte sobre sua experiência com este silo..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setNota(0);
                setComentario("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitAvaliacao}
              disabled={createAvaliacaoMutation.isPending}
            >
              {createAvaliacaoMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
