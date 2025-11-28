import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}

export default function SignupModal({ open, onClose, redirectTo }: SignupModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
  
  // Estado do formulário de login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  
  // Estado do formulário de cadastro
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroSenha, setCadastroSenha] = useState("");
  const [cadastroTipo, setCadastroTipo] = useState<"pf" | "pj">("pf");
  const [cadastroCpfCnpj, setCadastroCpfCnpj] = useState("");

  // Função para formatar CPF
  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
  };

  // Função para formatar CNPJ
  const formatarCNPJ = (valor: string) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 14);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
    if (numeros.length <= 8) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
    if (numeros.length <= 12) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
  };

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const formatado = cadastroTipo === "pf" ? formatarCPF(valor) : formatarCNPJ(valor);
    setCadastroCpfCnpj(formatado);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirecionar para OAuth do Manus
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;
    const redirect = redirectTo || window.location.pathname;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(JSON.stringify({ redirect }));

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    window.location.href = url.toString();
  };

  const handleCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirecionar para OAuth do Manus (signup)
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;
    const redirect = redirectTo || window.location.pathname;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(JSON.stringify({ redirect }));

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signUp");

    window.location.href = url.toString();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border-2 border-black p-0 gap-0">
        {/* Header minimalista */}
        <DialogHeader className="border-b-2 border-black p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-black flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                Bem-vindo ao SiloShare
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {activeTab === "signup" 
                  ? "Crie sua conta para continuar" 
                  : "Entre para acessar sua conta"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Conteúdo */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1">
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Criar conta
              </TabsTrigger>
              <TabsTrigger 
                value="login"
                className="data-[state=active]:bg-black data-[state=active]:text-white"
              >
                Entrar
              </TabsTrigger>
            </TabsList>

            {/* Aba de Cadastro */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleCadastro} className="space-y-4">
                <div>
                  <Label htmlFor="cadastro-nome" className="text-sm font-medium">
                    Nome completo
                  </Label>
                  <Input
                    id="cadastro-nome"
                    type="text"
                    placeholder="João Silva"
                    value={cadastroNome}
                    onChange={(e) => setCadastroNome(e.target.value)}
                    required
                    className="mt-1.5 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>

                <div>
                  <Label htmlFor="cadastro-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="cadastro-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={cadastroEmail}
                    onChange={(e) => setCadastroEmail(e.target.value)}
                    required
                    className="mt-1.5 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>

                <div>
                  <Label htmlFor="cadastro-senha" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="cadastro-senha"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={cadastroSenha}
                    onChange={(e) => setCadastroSenha(e.target.value)}
                    required
                    minLength={8}
                    className="mt-1.5 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>

                {/* Tipo de cadastro */}
                <div>
                  <Label className="text-sm font-medium">Tipo de cadastro</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setCadastroTipo("pf")}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        cadastroTipo === "pf"
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400 bg-white text-black"
                      }`}
                    >
                      Pessoa Física
                    </button>
                    <button
                      type="button"
                      onClick={() => setCadastroTipo("pj")}
                      className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        cadastroTipo === "pj"
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400 bg-white text-black"
                      }`}
                    >
                      Pessoa Jurídica
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cadastro-cpf-cnpj" className="text-sm font-medium">
                    {cadastroTipo === "pf" ? "CPF" : "CNPJ"}
                  </Label>
                  <Input
                    id="cadastro-cpf-cnpj"
                    type="text"
                    placeholder={cadastroTipo === "pf" ? "000.000.000-00" : "00.000.000/0000-00"}
                    value={cadastroCpfCnpj}
                    onChange={handleCpfCnpjChange}
                    required
                    className="mt-1.5 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800 text-white h-11 font-medium"
                >
                  Criar Conta Gratuita
                </Button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  Ao criar uma conta, você concorda com nossos{" "}
                  <a href="#" className="underline hover:text-black">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="underline hover:text-black">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </form>
            </TabsContent>

            {/* Aba de Login */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="mt-1.5 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>

                <div>
                  <Label htmlFor="login-senha" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Input
                    id="login-senha"
                    type="password"
                    placeholder="••••••••"
                    value={loginSenha}
                    onChange={(e) => setLoginSenha(e.target.value)}
                    required
                    className="mt-1.5 border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:text-black underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800 text-white h-11 font-medium"
                >
                  Entrar
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

