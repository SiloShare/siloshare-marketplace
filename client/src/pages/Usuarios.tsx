import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Download, UserCheck, UserX, Eye } from "lucide-react";

export default function AdminUsuarios() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");

  if (!isAuthenticated || user?.role !== "admin") {
    setLocation("/");
    return null;
  }

  const usuarios = [
    {
      id: 1,
      nome: "João Silva",
      email: "joao@email.com",
      tipo: "produtor",
      verificado: true,
      cadastro: "15/01/2025",
      transacoes: 12,
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria@email.com",
      tipo: "dono_silo",
      verificado: true,
      cadastro: "20/01/2025",
      transacoes: 45,
    },
    {
      id: 3,
      nome: "Carlos Oliveira",
      email: "carlos@email.com",
      tipo: "transportadora",
      verificado: false,
      cadastro: "25/01/2025",
      transacoes: 8,
    },
  ];

  const getTipoBadge = (tipo: string) => {
    const badges = {
      produtor: { label: "Produtor", color: "bg-blue-100 text-blue-800" },
      dono_silo: { label: "Dono de Silo", color: "bg-green-100 text-green-800" },
      transportadora: { label: "Transportadora", color: "bg-orange-100 text-orange-800" },
    };
    return badges[tipo as keyof typeof badges] || badges.produtor;
  };

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
              <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
              <p className="text-sm text-gray-600">Total: {usuarios.length} usuários</p>
            </div>
          </div>
          <Button className="bg-black hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Filtros */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-10"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filtro === "todos" ? "default" : "outline"}
                onClick={() => setFiltro("todos")}
              >
                Todos
              </Button>
              <Button
                variant={filtro === "produtor" ? "default" : "outline"}
                onClick={() => setFiltro("produtor")}
              >
                Produtores
              </Button>
              <Button
                variant={filtro === "dono_silo" ? "default" : "outline"}
                onClick={() => setFiltro("dono_silo")}
              >
                Donos de Silo
              </Button>
              <Button
                variant={filtro === "transportadora" ? "default" : "outline"}
                onClick={() => setFiltro("transportadora")}
              >
                Transportadoras
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabela de Usuários */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Usuário</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cadastro</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transações</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {usuarios.map((usuario) => {
                  const tipoBadge = getTipoBadge(usuario.tipo);
                  return (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{usuario.nome}</p>
                          <p className="text-sm text-gray-600">{usuario.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={tipoBadge.color}>{tipoBadge.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {usuario.verificado ? (
                          <Badge className="bg-green-100 text-green-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <UserX className="w-3 h-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{usuario.cadastro}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{usuario.transacoes}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          {!usuario.verificado && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Verificar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

