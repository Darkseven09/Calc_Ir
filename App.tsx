import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Period, ProposedRules, CalculationResult } from './types';
import { DEFAULT_PROPOSED_RULES } from './constants';
import { calculateProposedIR } from './services/taxCalculator';

// --- Helper Functions ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- SVG Icons (defined outside components to prevent re-creation) ---
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v1.172l-1.707 1.707a1 1 0 001.414 1.414L5 6.414V14a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414L7.828 4.172V3a1 1 0 00-1-1H5zM10 2a1 1 0 00-1 1v7.586l-1.293-1.293a1 1 0 00-1.414 1.414L8.172 13.5H3a1 1 0 100 2h5.172l-1.88 1.879a1 1 0 101.414 1.414L10 16.414V18a1 1 0 102 0v-1.586l1.293 1.293a1 1 0 101.414-1.414L12.828 13.5H18a1 1 0 100-2h-5.172l1.88-1.879a1 1 0 00-1.414-1.414L11 9.586V3a1 1 0 00-1-1h-1z" clipRule="evenodd" />
    </svg>
);

const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
);


// --- Presentation Components ---

interface SalaryInputProps {
  salaryStr: string;
  setSalaryStr: (value: string) => void;
  period: Period;
  setPeriod: (value: Period) => void;
}

const SalaryInput: React.FC<SalaryInputProps> = ({ salaryStr, setSalaryStr, period, setPeriod }) => {
  return (
    <div className="bg-gray-medium/50 p-6 rounded-xl shadow-lg">
      <label htmlFor="salary" className="block text-sm font-medium text-gray-light mb-2">Seu salário bruto</label>
      <div className="flex flex-col sm:flex-row items-stretch gap-4">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-light sm:text-sm">R$</span>
          </div>
          <input
            type="text"
            name="salary"
            id="salary"
            className="block w-full rounded-md border-0 py-3 pl-10 pr-4 bg-gray-dark text-white ring-1 ring-inset ring-gray-medium focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-lg transition"
            placeholder="0,00"
            value={salaryStr}
            onChange={(e) => setSalaryStr(e.target.value)}
            inputMode="decimal"
          />
        </div>
        <div className="flex-shrink-0 grid grid-cols-2 gap-0 p-1 bg-gray-dark rounded-lg">
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${period === 'monthly' ? 'bg-brand-primary text-white' : 'text-gray-light hover:bg-gray-medium'}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPeriod('annual')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${period === 'annual' ? 'bg-brand-primary text-white' : 'text-gray-light hover:bg-gray-medium'}`}
          >
            Anual
          </button>
        </div>
      </div>
    </div>
  );
};


interface ResultsDisplayProps {
  result: CalculationResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const { finalTax, currentTax, netDifference, ruleApplied, details, monthlySalary } = result;
  const currentNetSalary = monthlySalary - currentTax;
  const proposedNetSalary = monthlySalary - finalTax;

  const resultCardContent = useMemo(() => {
    switch (ruleApplied) {
      case 'exemption':
        return {
          title: "Isento de Imposto de Renda",
          Icon: CheckCircleIcon,
          bgColor: "bg-green-500/10",
          textColor: "text-green-400",
          description: "Pela nova proposta, salários até R$ 5.000,00 são isentos."
        };
      case 'discount':
        return {
          title: "Faixa com Desconto",
          Icon: SparklesIcon,
          bgColor: "bg-cyan-500/10",
          textColor: "text-cyan-400",
          description: `Seu salário se enquadra na faixa com ${details.discountApplied! * 100}% de desconto sobre o IR devido.`
        };
      case 'standard':
        return {
          title: "Cálculo Padrão",
          Icon: DocumentTextIcon,
          bgColor: "bg-amber-500/10",
          textColor: "text-amber-400",
          description: "Para sua faixa salarial, não há mudanças. O cálculo segue a tabela padrão do IR."
        };
      case 'initial':
      default:
        return {
          title: "Aguardando valor",
          Icon: InfoIcon,
          bgColor: "bg-gray-500/10",
          textColor: "text-gray-400",
          description: "Insira seu salário para simular o cálculo."
        };
    }
  }, [ruleApplied, details.discountApplied]);

  const initialContent = (
    <div className="mt-8 text-center">
      <p className="text-gray-light text-lg">Aumento no seu salário líquido mensal</p>
      <p className="text-5xl md:text-6xl font-bold text-white my-2 tracking-tight">-</p>
      <div className={`mt-4 p-4 rounded-lg flex items-center justify-center gap-3 text-sm ${resultCardContent.bgColor} ${resultCardContent.textColor}`}>
        <resultCardContent.Icon className="w-6 h-6 flex-shrink-0" />
        <p>{resultCardContent.description}</p>
      </div>
    </div>
  );

  if (ruleApplied === 'initial') {
    return initialContent;
  }

  return (
    <div className="mt-8 text-center">
      <p className="text-gray-light text-lg">Aumento no seu salário líquido mensal</p>
      <p className={`text-5xl md:text-6xl font-bold my-2 tracking-tight transition-colors duration-300 ${netDifference > 0 ? 'text-green-400' : 'text-white'}`}>
        {formatCurrency(netDifference)}
      </p>

      <div className={`mt-4 p-4 rounded-lg flex items-center justify-center gap-3 text-sm ${resultCardContent.bgColor} ${resultCardContent.textColor}`}>
        <resultCardContent.Icon className="w-6 h-6 flex-shrink-0" />
        <p>{resultCardContent.description}</p>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
        <div className="bg-gray-medium/30 p-4 rounded-lg">
          <h4 className="font-semibold text-white mb-3 text-center">Cenário Atual</h4>
          <div className="space-y-1">
             <div className="flex justify-between text-gray-light"><span>Salário Bruto:</span> <span className="font-mono text-white">{formatCurrency(monthlySalary)}</span></div>
             <div className="flex justify-between text-gray-light"><span>Imposto (IR):</span> <span className="font-mono text-red-400">-{formatCurrency(currentTax)}</span></div>
             <div className="flex justify-between border-t border-gray-medium/50 pt-2 mt-2 font-bold text-base"><span>Salário Líquido:</span> <span className="font-mono text-white">{formatCurrency(currentNetSalary)}</span></div>
          </div>
        </div>

        <div className="bg-brand-primary/20 p-4 rounded-lg border border-brand-primary/50">
           <h4 className="font-semibold text-brand-light mb-3 text-center">Nova Proposta</h4>
           <div className="space-y-1">
             <div className="flex justify-between text-gray-light"><span>Salário Bruto:</span> <span className="font-mono text-white">{formatCurrency(monthlySalary)}</span></div>
             <div className="flex justify-between text-gray-light"><span>Imposto (IR):</span> <span className="font-mono text-red-400">-{formatCurrency(finalTax)}</span></div>
             <div className="flex justify-between border-t border-brand-primary/50 pt-2 mt-2 font-bold text-base"><span>Salário Líquido:</span> <span className="font-mono text-green-400">{formatCurrency(proposedNetSalary)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};


interface RuleInfoCardProps {
  rules: ProposedRules;
}

const RuleInfoCard: React.FC<RuleInfoCardProps> = ({ rules }) => {
  return (
    <div className="mt-8 p-6 bg-gray-medium/30 rounded-xl border border-gray-medium/50">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <InfoIcon className="w-5 h-5 text-brand-light" />
        Regras da Proposta Utilizadas
      </h3>
      <ul className="mt-4 space-y-3 text-gray-light text-sm">
        <li className="flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <span><strong>Isenção:</strong> Salários de até {formatCurrency(rules.exemptionLimit)}</span>
        </li>
        {rules.discountTiers.map(tier => (
          <li key={tier.limit} className="flex items-start gap-3">
            <SparklesIcon className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <span><strong>Desconto de {tier.discount * 100}%:</strong> Para salários {tier.label}</span>
          </li>
        ))}
        <li className="flex items-start gap-3">
          <DocumentTextIcon className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <span><strong>Sem Mudança:</strong> Salários acima de {formatCurrency(rules.standardRangeStart)} seguem a tabela padrão.</span>
        </li>
      </ul>
      <p className="text-xs text-gray-400 mt-4 text-center">Estes valores são para fins de simulação, baseados em uma proposta. A lei final pode ter parâmetros diferentes.</p>
    </div>
  );
};


// --- Main App Component ---
export default function App() {
  const [salaryStr, setSalaryStr] = useState('');
  const [period, setPeriod] = useState<Period>('monthly');
  const [rules] = useState<ProposedRules>(DEFAULT_PROPOSED_RULES);
  const [result, setResult] = useState<CalculationResult>({
    finalTax: 0,
    currentTax: 0,
    netDifference: 0,
    monthlySalary: 0,
    ruleApplied: 'initial',
    details: {}
  });

  const handleSetSalary = useCallback((value: string) => {
    // Allow only numbers and comma for decimal
    const sanitizedValue = value.replace(/[^0-9,]/g, '');
    setSalaryStr(sanitizedValue);
  }, []);

  useEffect(() => {
    const salary = parseFloat(salaryStr.replace(/\./g, '').replace(',', '.'));
    const monthlySalary = period === 'annual' ? salary / 12 : salary;
    
    const calculationResult = calculateProposedIR(monthlySalary, rules);
    setResult(calculationResult);
  }, [salaryStr, period, rules]);

  return (
    <div className="min-h-screen bg-gray-dark flex flex-col items-center justify-center p-4 font-sans">
       <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Calculadora de IR</h1>
          <p className="text-lg text-brand-light">Simule o impacto da nova proposta</p>
        </header>

        <main className="bg-gray-medium p-4 sm:p-8 rounded-2xl shadow-2xl border border-brand-primary/20">
          <SalaryInput
            salaryStr={salaryStr}
            setSalaryStr={handleSetSalary}
            period={period}
            setPeriod={setPeriod}
          />
          <ResultsDisplay result={result} />
        </main>

        <aside>
          <RuleInfoCard rules={rules} />
        </aside>
       </div>
    </div>
  );
}
