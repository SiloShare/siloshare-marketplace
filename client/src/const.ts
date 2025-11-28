export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // If OAuth is not configured, return local login page
  if (!oauthPortalUrl || !appId) {
    return "/login";
  }
  
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
// SiloShare Constants
export const APP_DESCRIPTION = "O primeiro marketplace do Brasil que conecta donos de silos, produtores rurais e transportadoras";

// Estados do Brasil com foco no agronegócio
export const ESTADOS_BRASIL = [
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'TO', nome: 'Tocantins' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'PI', nome: 'Piauí' },
];

// Tipos de grãos mais comuns
export const TIPOS_GRAOS = [
  'Soja',
  'Milho',
  'Arroz',
  'Feijão',
  'Trigo',
  'Sorgo',
  'Algodão',
  'Café',
];

// Tipos de infraestrutura de silos
export const INFRAESTRUTURA_SILO = [
  { id: 'secagem', label: 'Secagem' },
  { id: 'limpeza', label: 'Limpeza' },
  { id: 'aeracao', label: 'Aeração' },
  { id: 'monitoramento', label: 'Monitoramento' },
];

// Tipos de veículos para transporte
export const TIPOS_VEICULOS = [
  'Carreta Graneleira',
  'Bitrem',
  'Rodotrem',
  'Truck',
  'Toco',
];

// Status de reserva
export const STATUS_RESERVA = {
  pendente: { label: 'Pendente', color: 'yellow' },
  confirmada: { label: 'Confirmada', color: 'blue' },
  em_andamento: { label: 'Em Andamento', color: 'purple' },
  concluida: { label: 'Concluída', color: 'green' },
  cancelada: { label: 'Cancelada', color: 'red' },
};

// Tipos de usuário
export const TIPOS_USUARIO = {
  produtor: { label: 'Produtor Rural', icon: '🌾' },
  dono_silo: { label: 'Dono de Silo', icon: '🏭' },
  transportadora: { label: 'Transportadora', icon: '🚛' },
};
