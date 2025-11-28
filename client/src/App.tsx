import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CadastrarSilo from "./pages/CadastrarSilo_v2";
import BuscarArmazenagem from "./pages/BuscarArmazenagem";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";
import Dashboard from "./pages/Dashboard";
import MeusSilos from "./pages/MeusSilos";
import EditarSilo from "./pages/EditarSilo";
import DetalhesSilo from "./pages/DetalhesSilo";
import CheckoutSilo from "./pages/CheckoutSilo";
import PainelFornecedor from "./pages/PainelFornecedor";
import CadastrarTransportadora from "./pages/CadastrarTransportadora";
import Verificar from "./pages/Verificar";
import VerificarConta from "./pages/VerificarConta";
import AdminDashboard from "./pages/AdminDashboard";
import MinhasReservas from "./pages/MinhasReservas";
import ReservasRecebidas from "./pages/ReservasRecebidas";
import ReservaDetalhes from "./pages/ReservaDetalhes";
import DashboardProprietarioV2 from "./pages/DashboardProprietarioV2";
import Perfil from "./pages/Perfil";
import Mensagens from "./pages/Mensagens";
import Contrato from "./pages/Contrato";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/cadastro" component={Cadastro} />
      <Route path="/recuperar-senha" component={RecuperarSenha} />
      <Route path="/verificar" component={Verificar} />
      <Route path="/verificar-conta" component={VerificarConta} />
      <Route path="/cadastrar-silo" component={CadastrarSilo} />
      <Route path="/buscar-armazenagem" component={BuscarArmazenagem} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/meus-silos" component={MeusSilos} />
      <Route path="/editar-silo/:id" component={EditarSilo} />
      <Route path="/silo/:id" component={DetalhesSilo} />
      <Route path="/checkout/:id" component={CheckoutSilo} />
      <Route path="/painel-fornecedor" component={PainelFornecedor} />
      <Route path="/cadastrar-transportadora" component={CadastrarTransportadora} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/minhas-reservas" component={MinhasReservas} />
      <Route path="/reservas-recebidas" component={ReservasRecebidas} />
      <Route path="/reserva/:id" component={ReservaDetalhes} />
      <Route path="/dashboard-proprietario" component={DashboardProprietarioV2} />
      <Route path="/perfil" component={Perfil} />
      <Route path="/mensagens" component={Mensagens} />
      <Route path="/contrato/:reservaId" component={Contrato} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
