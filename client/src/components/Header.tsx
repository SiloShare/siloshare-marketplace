import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <a className="hover:opacity-80 transition-opacity">
            <Logo size="md" />
          </a>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/buscar-armazenagem">
            <a className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Buscar Silos
            </a>
          </Link>
          <Link href="/cadastrar-silo">
            <a className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Anunciar Silo
            </a>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name || "Usuário"} />
                    <AvatarFallback className="bg-green-600 text-white">
                      {getInitials(user?.name || "US")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/perfil")}>
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/mensagens")}>
                  Mensagens
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/dashboard-proprietario")}>
                  Dashboard Proprietário
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/meus-silos")}>
                  Meus Silos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/minhas-reservas")}>
                  Minhas Reservas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/reservas-recebidas")}>
                  Reservas Recebidas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <a className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Entrar
              </a>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
