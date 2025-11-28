import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";

interface ReservasFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  showSiloFilter?: boolean;
  silos?: Array<{ id: number; nome: string }>;
}

export interface FilterValues {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  siloId?: number;
  busca?: string;
}

export default function ReservasFilters({ 
  onFilterChange, 
  showSiloFilter = false,
  silos = []
}: ReservasFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="space-y-4 mb-6">
      {/* Barra de busca e botão de filtros */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por silo, produtor ou e-mail..."
            value={filters.busca || ''}
            onChange={(e) => handleFilterChange('busca', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
              {Object.values(filters).filter(v => v !== undefined && v !== '').length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro de Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Silo (apenas para proprietários) */}
              {showSiloFilter && silos.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="silo">Silo</Label>
                  <Select
                    value={filters.siloId?.toString() || ''}
                    onValueChange={(value) => handleFilterChange('siloId', value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger id="silo">
                      <SelectValue placeholder="Todos os silos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {silos.map((silo) => (
                        <SelectItem key={silo.id} value={silo.id.toString()}>
                          {silo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtro de Data Início */}
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data Início (a partir de)</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={filters.dataInicio || ''}
                  onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                />
              </div>

              {/* Filtro de Data Fim */}
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Fim (até)</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={filters.dataFim || ''}
                  onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
