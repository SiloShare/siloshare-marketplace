import { useLocation, Link } from "wouter";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { Search, MapPin, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1600")',
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Encontre o Silo Certo para Sua Safra
          </h1>
          <p className="text-xl text-white mb-8 font-light">
            Segurança e economia para seus grãos, a um clique de distância.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-full shadow-2xl p-2 flex items-center max-w-2xl mx-auto">
            <div className="flex-1 flex items-center px-6 py-3 border-r border-gray-200">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Cidade ou Região"
                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="flex-1 flex items-center px-6 py-3">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Capacidade (ton)"
                className="flex-1 outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
            <Link href="/buscar-armazenagem">
              <Button className="rounded-full bg-black hover:bg-gray-800 text-white px-8 py-6">
                <Search className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-b border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">97%</div>
              <div className="text-sm text-gray-600 font-light">Taxa de Satisfação</div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-4xl font-bold text-black mb-2">2.5M+</div>
              <div className="text-sm text-gray-600 font-light">Toneladas Armazenadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-black mb-2">R$ 45M</div>
              <div className="text-sm text-gray-600 font-light">Em Transações</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-black text-center mb-16">
          Como Funciona
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-10 h-10 text-black" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-black mb-3">1. Busque</h3>
            <p className="text-gray-600 font-light leading-relaxed">
              Encontre silos disponíveis próximos à sua propriedade com filtros avançados de capacidade, preço e infraestrutura.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Shield className="w-10 h-10 text-black" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-black mb-3">2. Reserve</h3>
            <p className="text-gray-600 font-light leading-relaxed">
              Faça sua reserva de forma segura com contrato digital e pagamento protegido pela plataforma.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-black" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold text-black mb-3">3. Armazene</h3>
            <p className="text-gray-600 font-light leading-relaxed">
              Monitore sua safra em tempo real e tenha acesso a relatórios completos de armazenamento.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Tem um silo disponível?
              </h2>
              <p className="text-gray-300 font-light text-lg mb-8 leading-relaxed">
                Cadastre seu silo na plataforma e conecte-se com produtores rurais de todo o país. Aumente sua receita e otimize sua capacidade ociosa.
              </p>
              <Link href="/cadastrar-silo">
                <Button className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-base font-medium rounded-lg">
                  Anunciar Meu Silo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">0%</div>
                <div className="text-sm text-gray-300 font-light">Comissão no 1º Mês</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">24h</div>
                <div className="text-sm text-gray-300 font-light">Aprovação Rápida</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-sm text-gray-300 font-light">Seguro e Protegido</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="text-3xl font-bold mb-2">∞</div>
                <div className="text-sm text-gray-300 font-light">Anúncios Ilimitados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="md" />
              </div>
              <p className="text-sm text-gray-600 font-light">
                Conectando produtores rurais a silos de armazenagem em todo o Brasil.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Plataforma</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/buscar-armazenagem">
                    <a className="text-sm text-gray-600 hover:text-black font-light">Buscar Silos</a>
                  </Link>
                </li>
                <li>
                  <Link href="/cadastrar-silo">
                    <a className="text-sm text-gray-600 hover:text-black font-light">Anunciar Silo</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://help.manus.im" className="text-sm text-gray-600 hover:text-black font-light">
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-black font-light">
                    Termos de Uso
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-black mb-4">Contato</h4>
              <p className="text-sm text-gray-600 font-light">contato@siloshare.com.br</p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500 font-light">
              © 2025 SiloShare. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

