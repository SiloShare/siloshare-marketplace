import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CadastrarSilo() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cidade: "",
    estado: "",
    endereco: "",
    lat: "",
    lng: "",
    capacidadeTotal: "",
    capacidadeDisponivel: "",
    precoTonelada: "",
    tiposGraos: [] as string[],
    infraSecagem: false,
    infraLimpeza: false,
    infraAeracao: false,
    infraMonitoramento: false,
  });

  const createSilo = trpc.silos.create.useMutation({
    onSuccess: () => {
      toast.success("Silo cadastrado com sucesso!");
      setLocation("/meus-silos");
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar silo: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.cidade || !formData.estado) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    createSilo.mutate({
      nome: formData.nome,
      descricao: formData.descricao,
      cidade: formData.cidade,
      estado: formData.estado,
      endereco: formData.endereco,
      lat: formData.lat || "-15.7801",
      lng: formData.lng || "-47.9292",
      capacidadeTotal: parseInt(formData.capacidadeTotal) || 0,
      capacidadeDisponivel: parseInt(formData.capacidadeDisponivel) || 0,
      precoTonelada: formData.precoTonelada || "0",
      tiposGraos: JSON.stringify(formData.tiposGraos),
      infraSecagem: formData.infraSecagem,
      infraLimpeza: formData.infraLimpeza,
      infraAeracao: formData.infraAeracao,
      infraMonitoramento: formData.infraMonitoramento,
    });
  };

  const toggleGrao = (grao: string) => {
    setFormData((prev) => ({
      ...prev,
      tiposGraos: prev.tiposGraos.includes(grao)
        ? prev.tiposGraos.filter((g) => g !== grao)
        : [...prev.tiposGraos, grao],
    }));
  };

  const graosDisponiveis = ["Soja", "Milho", "Trigo", "Arroz", "Feijão", "Café"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-green-700">SiloShare</span>
          </div>
          <Button onClick={() => setLocation("/")} variant="outline">
            Voltar
          </Button>
        </div>
      </header>

      {/* Formulário */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Cadastrar Silo</CardTitle>
            <CardDescription>
              Preencha as informações do seu silo para disponibilizar no marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div>
                  <Label htmlFor="nome">Nome do Silo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Silo Central Sorriso"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva seu silo..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Localização</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      placeholder="Ex: Sorriso"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado *</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      placeholder="Ex: MT"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro"
                  />
                </div>
              </div>

              {/* Capacidade */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Capacidade</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacidadeTotal">Capacidade Total (toneladas)</Label>
                    <Input
                      id="capacidadeTotal"
                      type="number"
                      value={formData.capacidadeTotal}
                      onChange={(e) => setFormData({ ...formData, capacidadeTotal: e.target.value })}
                      placeholder="Ex: 5000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="capacidadeDisponivel">Capacidade Disponível (toneladas)</Label>
                    <Input
                      id="capacidadeDisponivel"
                      type="number"
                      value={formData.capacidadeDisponivel}
                      onChange={(e) => setFormData({ ...formData, capacidadeDisponivel: e.target.value })}
                      placeholder="Ex: 3000"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="precoTonelada">Preço por Tonelada/Mês (R$)</Label>
                  <Input
                    id="precoTonelada"
                    type="number"
                    step="0.01"
                    value={formData.precoTonelada}
                    onChange={(e) => setFormData({ ...formData, precoTonelada: e.target.value })}
                    placeholder="Ex: 25.00"
                  />
                </div>
              </div>

              {/* Tipos de Grãos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipos de Grãos Aceitos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {graosDisponiveis.map((grao) => (
                    <div key={grao} className="flex items-center space-x-2">
                      <Checkbox
                        id={grao}
                        checked={formData.tiposGraos.includes(grao)}
                        onCheckedChange={() => toggleGrao(grao)}
                      />
                      <Label htmlFor={grao} className="cursor-pointer">
                        {grao}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Infraestrutura */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Infraestrutura Disponível</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraSecagem"
                      checked={formData.infraSecagem}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, infraSecagem: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraSecagem" className="cursor-pointer">
                      Secagem
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraLimpeza"
                      checked={formData.infraLimpeza}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, infraLimpeza: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraLimpeza" className="cursor-pointer">
                      Limpeza
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraAeracao"
                      checked={formData.infraAeracao}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, infraAeracao: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraAeracao" className="cursor-pointer">
                      Aeração
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="infraMonitoramento"
                      checked={formData.infraMonitoramento}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, infraMonitoramento: checked as boolean })
                      }
                    />
                    <Label htmlFor="infraMonitoramento" className="cursor-pointer">
                      Monitoramento
                    </Label>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-700 hover:bg-green-800"
                  disabled={createSilo.isPending}
                >
                  {createSilo.isPending ? "Cadastrando..." : "Cadastrar Silo"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

