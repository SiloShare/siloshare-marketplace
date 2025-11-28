import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

interface DocumentosNecessariosClienteProps {
  onContinue: () => void;
  onBack?: () => void;
}

export default function DocumentosNecessariosCliente({ onContinue, onBack }: DocumentosNecessariosClienteProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["essenciais"]);
  const [checkedDocs, setCheckedDocs] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleDoc = (docId: string) => {
    setCheckedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(d => d !== docId)
        : [...prev, docId]
    );
  };

  const documentos = {
    essenciais: {
      title: "📋 Documentos Essenciais (Obrigatórios)",
      icon: AlertCircle,
      color: "text-red-600",
      docs: [
        { id: "cpf-cnpj", label: "CPF ou CNPJ válido" },
        { id: "rg-cnh", label: "RG ou CNH (se pessoa física)" },
        { id: "comprovante", label: "Comprovante de Residência (até 90 dias)" },
        { id: "car", label: "CAR - Cadastro Ambiental Rural da propriedade" },
        { id: "itr", label: "ITR - Comprovante de pagamento ou isenção" },
      ]
    },
    propriedade: {
      title: "🏞️ Documentos da Propriedade Rural",
      icon: FileText,
      color: "text-green-600",
      docs: [
        { id: "matricula", label: "Matrícula do Imóvel Rural atualizada" },
        { id: "escritura", label: "Escritura ou Contrato de Arrendamento" },
        { id: "ccir", label: "CCIR - Certificado de Cadastro de Imóvel Rural (INCRA)" },
      ]
    },
    producao: {
      title: "🌾 Documentos de Produção",
      icon: CheckCircle2,
      color: "text-blue-600",
      docs: [
        { id: "nota-fiscal", label: "Nota Fiscal de Produtor (origem dos grãos)" },
        { id: "laudo", label: "Laudo de Classificação de Grãos (qualidade, umidade)" },
        { id: "comprovante-safra", label: "Comprovante de Safra (estimativa de produção)" },
      ]
    }
  };

  const totalDocs = Object.values(documentos).reduce((acc, section) => acc + section.docs.length, 0);
  const essenciaisDocs = documentos.essenciais.docs.length;
  const essenciaisChecked = documentos.essenciais.docs.filter(doc => checkedDocs.includes(doc.id)).length;
  const progressoEssenciais = (essenciaisChecked / essenciaisDocs) * 100;
  const canContinue = essenciaisChecked === essenciaisDocs;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-3">Documentos Necessários</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Para contratar armazenagem no SiloShare, você precisará dos seguintes documentos. 
          Prepare-os com antecedência para agilizar o processo.
        </p>
      </div>

      {/* Progresso dos Documentos Essenciais */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">
                Documentos Essenciais: {essenciaisChecked}/{essenciaisDocs}
              </span>
            </div>
            <span className="text-sm text-red-700 font-medium">
              {Math.round(progressoEssenciais)}% completo
            </span>
          </div>
          <div className="w-full bg-red-200 rounded-full h-3">
            <div 
              className="bg-red-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressoEssenciais}%` }}
            />
          </div>
          {!canContinue && (
            <p className="text-sm text-red-700 mt-2">
              ⚠️ Você precisa ter todos os documentos essenciais para continuar
            </p>
          )}
        </CardContent>
      </Card>

      {/* Seções de Documentos */}
      {Object.entries(documentos).map(([key, section]) => {
        const Icon = section.icon;
        const isExpanded = expandedSections.includes(key);
        const sectionChecked = section.docs.filter(doc => checkedDocs.includes(doc.id)).length;

        return (
          <Card key={key} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleSection(key)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`w-6 h-6 ${section.color}`} />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <span className="text-sm text-gray-500">
                    ({sectionChecked}/{section.docs.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-3 pt-0">
                {section.docs.map((doc) => (
                  <div 
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => toggleDoc(doc.id)}
                  >
                    <Checkbox
                      checked={checkedDocs.includes(doc.id)}
                      onCheckedChange={() => toggleDoc(doc.id)}
                    />
                    <label className="flex-1 cursor-pointer text-gray-700">
                      {doc.label}
                    </label>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Informações Importantes */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Informações Importantes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Todos os documentos essenciais são <strong>obrigatórios</strong> para fechar o contrato</li>
            <li>• Documentos de propriedade e produção podem ser solicitados pelo fornecedor</li>
            <li>• O contrato será assinado digitalmente via <strong>DocuSign</strong></li>
            <li>• Você receberá uma cópia do contrato assinado por e-mail</li>
            <li>• O processo de aprovação leva até 24 horas após envio dos documentos</li>
          </ul>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex items-center justify-between pt-6 border-t">
        {onBack ? (
          <Button onClick={onBack} variant="ghost" className="text-base">
            ← Voltar
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button 
          onClick={onContinue}
          disabled={!canContinue}
          className="bg-green-600 hover:bg-green-700 px-8 py-6 text-base"
        >
          {canContinue ? "Continuar para Contrato →" : "Marque todos os documentos essenciais"}
        </Button>
      </div>
    </div>
  );
}

