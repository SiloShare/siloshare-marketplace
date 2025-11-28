import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Check, X, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminSilos() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [busca, setBusca] = useState("");

  const { data: silos, isLoading } = trpc.silos.listar.useQuery();

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => setLocation("/admin")} variant="ghost">
              ← Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gerenciar Silos</h1>
              <p className="text-sm text-gray-600">Total: {silos?.length || 0} silos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Busca */}
        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar silos por nome ou localização..."
              className="pl-10"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </Card>

        {/* Grid de Silos */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando silos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {silos?.map((silo) => (
              <Card key={silo.id} className="p-6 hover:shadow-lg transition">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{silo.nome}</h3>
                    <Badge className={silo.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {silo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{silo.cidade}, {silo.estado}</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">{silo.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                  <div>
                    <p className="text-xs text-gray-600">Capacidade</p>
                    <p className="font-semibold">{silo.capacidadeTotal} t</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Preço</p>
                    <p className="font-semibold">R$ {silo.precoTonMes}/t/mês</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  {silo.ativo ? (
                    <Button size="sm" variant="outline" className="text-red-600 border-red-600">
                      <X className="w-4 h-4 mr-1" />
                      Desativar
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="w-4 h-4 mr-1" />
                      Ativar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

