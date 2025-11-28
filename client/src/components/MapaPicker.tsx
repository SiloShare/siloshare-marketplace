import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface MapaPickerProps {
  endereco: string;
  onEnderecoChange: (endereco: string) => void;
  onCoordenadas?: (lat: number, lng: number) => void;
}

export default function MapaPicker({ endereco, onEnderecoChange, onCoordenadas }: MapaPickerProps) {
  const [coords, setCoords] = useState({ lat: -15.6014, lng: -56.0979 }); // Cuiabá, MT
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Geocoding usando Nominatim (OpenStreetMap - gratuito)
  useEffect(() => {
    if (!endereco || endereco.length < 5) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&countrycodes=br&limit=1`,
          {
            headers: {
              'User-Agent': 'SiloShare/1.0'
            }
          }
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoords({ lat, lng: lon });
          onCoordenadas?.(lat, lon);
          setMostrarMapa(true);
        }
      } catch (error) {
        console.error("Erro ao buscar localização:", error);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [endereco]);

  const handleUsarLocalizacaoAtual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          onCoordenadas?.(lat, lng);
          setMostrarMapa(true);

          // Reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
              {
                headers: {
                  'User-Agent': 'SiloShare/1.0'
                }
              }
            );
            const data = await response.json();
            if (data && data.display_name) {
              onEnderecoChange(data.display_name);
            }
          } catch (error) {
            console.error("Erro ao buscar endereço:", error);
          }
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        }
      );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="endereco">Endereço completo</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="endereco"
            placeholder="Ex: Rua das Flores, 123, Cuiabá - MT"
            value={endereco}
            onChange={(e) => onEnderecoChange(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUsarLocalizacaoAtual}
            className="shrink-0"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Usar minha localização
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Digite o endereço completo ou use sua localização atual
        </p>
      </div>

      {mostrarMapa && (
        <div className="w-full h-64 sm:h-96 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.01},${coords.lat - 0.01},${coords.lng + 0.01},${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
          />
          <div className="text-center py-2 text-xs text-gray-500">
            <a
              href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=15/${coords.lat}/${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Ver mapa maior
            </a>
          </div>
        </div>
      )}

      {!mostrarMapa && endereco && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Digite um endereço válido para ver o mapa</p>
        </div>
      )}
    </div>
  );
}

