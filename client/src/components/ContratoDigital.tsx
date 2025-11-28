import { Button } from "@/components/ui/button";

export default function ContratoDigital({ onContratoAssinado }) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Revisão do Contrato</h1>
      <div className="bg-white p-8 rounded-lg border">
        <h2 className="font-bold text-xl mb-4">Contrato de Armazenagem de Grãos</h2>
        <div className="prose max-w-none h-96 overflow-y-auto border p-4 rounded-md">
          <p>Este Contrato de Armazenagem de Grãos ("Contrato") é celebrado entre o **Contratante** (você) e o **Fornecedor** do silo selecionado, doravante denominadas "Partes".</p>
          <p><strong>1. Objeto:</strong> O Fornecedor concorda em armazenar a quantidade de grãos especificada pelo Contratante, nas instalações do silo selecionado, pelo período acordado.</p>
          <p><strong>2. Preço e Pagamento:</strong> O Contratante pagará ao Fornecedor o valor estipulado, calculado com base na quantidade de grãos e no período de armazenagem. O pagamento será processado através da plataforma SiloShare.</p>
          <p><strong>3. Responsabilidades do Fornecedor:</strong> Manter a integridade e a qualidade dos grãos armazenados, garantir a segurança das instalações e fornecer acesso ao Contratante para inspeção, mediante agendamento prévio.</p>
          <p><strong>4. Responsabilidades do Contratante:</strong> Fornecer informações precisas sobre os grãos a serem armazenados, efetuar os pagamentos em dia e retirar os grãos ao final do período contratado.</p>
          <p><strong>5. Rescisão:</strong> Qualquer uma das Partes poderá rescindir este Contrato mediante notificação por escrito com 30 dias de antecedência. Penalidades poderão ser aplicadas em caso de rescisão antecipada.</p>
          <p>Ao clicar em "Assinar Contrato", você declara que leu, compreendeu e concorda com todos os termos e condições aqui estabelecidos.</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => onContratoAssinado("envelope-id-teste")} className="bg-green-600 hover:bg-green-700">
            Assinar Contrato
          </Button>
        </div>
      </div>
    </div>
  );
}
