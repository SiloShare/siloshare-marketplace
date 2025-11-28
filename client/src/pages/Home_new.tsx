import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const [, setLocation] = useLocation();
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const handleComecarAgora = () => {
    if (isAuthenticated) {
      setLocation("/buscar-armazenagem");
    } else {
      window.location.href = "/api/auth/login";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Clean */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <span className="text-3xl">🌾</span>
            <span className="text-2xl font-bold text-black">SiloShare</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#como-funciona" className="text-gray-700 hover:text-black transition font-medium">
              Como Funciona
            </a>
            <a href="#beneficios" className="text-gray-700 hover:text-black transition font-medium">
              Benefícios
            </a>
            <a href="#contato" className="text-gray-700 hover:text-black transition font-medium">
              Contato
            </a>
          </nav>
          <div className="flex gap-4">
            {isAuthenticated && (
              <Button onClick={() => setLocation("/meus-silos")} variant="outline">
                Meus Silos
              </Button>
            )}
            <Button onClick={handleComecarAgora} className="bg-black hover:bg-gray-800">
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Estilo Airbnb com tema agro */}
      <section className="relative h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/silo-hero.jpg)",
            filter: "grayscale(100%) brightness(0.7)",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Armazenagem de Grãos Simplificada
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Conecte produtores rurais a silos disponíveis. Transparente, seguro e eficiente.
            </p>
            <Button
              onClick={handleComecarAgora}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-6"
            >
              Buscar Armazenagem
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - Clean */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-gray-600">Silos Cadastrados</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">2M+</div>
              <div className="text-gray-600">Toneladas Armazenadas</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-gray-600">Satisfação dos Clientes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona - Cards Clean com Ícones Agro */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Três passos simples para encontrar o silo ideal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: "🔍",
                title: "Busque",
                description: "Encontre silos disponíveis na sua região com filtros personalizados",
              },
              {
                icon: "📋",
                title: "Compare",
                description: "Analise preços, capacidade e infraestrutura de cada opção",
              },
              {
                icon: "✅",
                title: "Reserve",
                description: "Feche o contrato de forma digital e segura",
              },
            ].map((step, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition">
                <CardHeader>
                  <div className="text-6xl mb-4">{step.icon}</div>
                  <CardTitle className="text-2xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios - Grid Clean */}
      <section id="beneficios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Por Que Escolher o SiloShare?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A plataforma que transforma a armazenagem de grãos no Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: "💰",
                title: "Economia",
                description: "Preços competitivos e transparentes",
              },
              {
                icon: "🛡️",
                title: "Segurança",
                description: "Contratos digitais e silos certificados",
              },
              {
                icon: "⚡",
                title: "Agilidade",
                description: "Reserve em minutos, não em dias",
              },
              {
                icon: "📊",
                title: "Transparência",
                description: "Acompanhe tudo em tempo real",
              },
            ].map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-md transition">
                <CardHeader>
                  <div className="text-5xl mb-3">{benefit.icon}</div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Preto e Branco Bold */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Junte-se a centenas de produtores e donos de silos que já confiam no SiloShare
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={handleComecarAgora}
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-lg px-12"
            >
              Buscar Armazenagem
            </Button>
            <Button
              onClick={() => setLocation("/cadastrar-silo")}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black text-lg px-12"
            >
              Cadastrar Meu Silo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Clean */}
      <footer className="border-t py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🌾</span>
                <span className="text-xl font-bold">SiloShare</span>
              </div>
              <p className="text-sm text-gray-600">
                Marketplace de armazenagem e transporte de grãos
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Plataforma</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition">
                    Buscar Silos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition">
                    Cadastrar Silo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition">
                    Como Funciona
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-black transition">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-black transition">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>© 2025 SiloShare. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

