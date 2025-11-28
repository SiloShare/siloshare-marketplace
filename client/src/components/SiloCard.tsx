import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Heart, Award, TrendingUp, Sparkles } from "lucide-react";

interface SiloCardProps {
  silo: {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
    precoTonMes: number;
    capacidadeTotal: number;
    secagem?: boolean;
    limpeza?: boolean;
    aeracao?: boolean;
    monitoramento?: boolean;
    balanca?: boolean;
    laboratorio?: boolean;
    certificadoConab?: boolean;
    status?: string;
    imagemUrl?: string;
    fotos?: string;
  };
  showBadges?: boolean;
  index?: number;
}

export default function SiloCard({ silo, showBadges = true, index = 0 }: SiloCardProps) {
  const [, setLocation] = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleCardClick = () => {
    setLocation(`/detalhes-silo/${silo.id}`);
  };

  // Determinar badge baseado em índice e propriedades
  const getBadge = () => {
    if (!showBadges) return null;

    if (silo.certificadoConab || index % 3 === 0) {
      return (
        <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10">
          <Award className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-gray-800">Certificado CONAB</span>
        </div>
      );
    }

    if (index % 4 === 0 && index !== 0) {
      return (
        <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs font-semibold">Mais Procurado</span>
        </div>
      );
    }

    if (silo.status === 'aprovado' && index % 5 === 0) {
      return (
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-10">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-semibold">Novo</span>
        </div>
      );
    }

    return null;
  };

  // Calcular avaliação fictícia baseada no ID
  const rating = (4.5 + (silo.id % 5) * 0.1).toFixed(1);
  const reviewCount = 50 + (silo.id % 100);

  return (
    <Card 
      className="group overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-0 shadow-md bg-white"
      onClick={handleCardClick}
    >
      {/* Imagem do Silo */}
      <div className="relative overflow-hidden">
        <div className="w-full h-72 bg-gray-200">
          <img 
            src={silo.fotos ? JSON.parse(silo.fotos)[0] : silo.imagemUrl || `/silo-image-${(silo.id % 6) + 1}.jpg`} 
            alt={silo.nome} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
        
        {/* Badge de Destaque */}
        {getBadge()}
        
        {/* Botão Favoritar - Estilo Airbnb */}
        <button 
          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110 z-10"
          onClick={handleFavorite}
          aria-label="Favoritar silo"
        >
          <Heart 
            className={`w-5 h-5 transition-all ${
              isFavorited 
                ? 'text-green-600 fill-green-600' 
                : 'text-gray-700 hover:text-green-600'
            }`} 
          />
        </button>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-5">
        {/* Título e Localização */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold mb-1.5 group-hover:underline line-clamp-1 text-gray-900">
            {silo.nome}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{silo.cidade}, {silo.estado}</span>
          </div>
        </div>

        {/* Avaliação */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm text-gray-900">{rating}</span>
            <span className="text-xs text-gray-500">({reviewCount} avaliações)</span>
          </div>
        </div>

        {/* Capacidade */}
        <div className="mb-3">
          <span className="text-sm text-gray-600">
            Capacidade: <span className="font-semibold text-gray-900">{silo.capacidadeTotal.toLocaleString('pt-BR')} ton</span>
          </span>
        </div>

        {/* Infraestrutura - Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {silo.secagem && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
              🔥 Secagem
            </Badge>
          )}
          {silo.limpeza && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
              ✨ Limpeza
            </Badge>
          )}
          {silo.aeracao && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
              💨 Aeração
            </Badge>
          )}
          {silo.monitoramento && (
            <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
              📡 24/7
            </Badge>
          )}
        </div>

        {/* Preço - Destaque */}
        <div className="flex items-baseline gap-1 pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold text-green-600">
            R$ {silo.precoTonMes}
          </span>
          <span className="text-sm text-gray-600">/ ton / mês</span>
        </div>
      </div>
    </Card>
  );
}

