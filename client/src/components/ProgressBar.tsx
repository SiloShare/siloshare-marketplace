import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  return (
    <div className="w-full bg-white border-b sticky top-0 z-40 py-6">
      <div className="container mx-auto px-4">
        {/* Barra de Progresso Visual */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Etapa {currentStep} de {totalSteps}
            </span>
            <span className="text-sm font-medium text-black">
              {Math.round((currentStep / totalSteps) * 100)}% completo
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-black h-full transition-all duration-500 ease-out rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Indicadores de Etapas */}
        <div className="hidden md:flex items-center justify-between relative">
          {/* Linha de conexão */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div 
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>

          {/* Círculos das etapas */}
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isFuture = stepNumber > currentStep;

            return (
              <div key={stepNumber} className="flex flex-col items-center relative">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300 border-2
                    ${isCompleted ? 'bg-black border-black text-white' : ''}
                    ${isCurrent ? 'bg-white border-black text-black ring-4 ring-gray-100' : ''}
                    ${isFuture ? 'bg-white border-gray-300 text-gray-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-xs font-medium text-center max-w-[100px]
                    ${isCurrent ? 'text-black' : ''}
                    ${isCompleted ? 'text-gray-700' : ''}
                    ${isFuture ? 'text-gray-400' : ''}
                  `}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Versão Mobile - Apenas etapa atual */}
        <div className="md:hidden text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[currentStep - 1]}
          </h3>
        </div>
      </div>
    </div>
  );
}

