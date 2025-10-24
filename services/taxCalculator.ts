import type { StandardBracket, ProposedRules, CalculationResult } from '../types';

// Tabela Progressiva Mensal IRRF - Vigência a partir de Fev/2024
const STANDARD_BRACKETS: StandardBracket[] = [
    { limit: 2259.20, rate: 0, deduction: 0 },
    { limit: 2826.65, rate: 0.075, deduction: 169.44 },
    { limit: 3751.05, rate: 0.15, deduction: 381.44 },
    { limit: 4664.68, rate: 0.225, deduction: 662.77 },
    { limit: Infinity, rate: 0.275, deduction: 896.00 },
];

function calculateStandardIR(monthlySalary: number): { tax: number; bracket: StandardBracket } {
    if (monthlySalary <= 0) return { tax: 0, bracket: STANDARD_BRACKETS[0] };

    const bracket = STANDARD_BRACKETS.find(b => monthlySalary <= b.limit) ?? STANDARD_BRACKETS[STANDARD_BRACKETS.length - 1];
    
    const tax = monthlySalary * bracket.rate - bracket.deduction;
    return { tax: Math.max(0, tax), bracket };
}

export function calculateProposedIR(monthlySalary: number, rules: ProposedRules): CalculationResult {
    if (isNaN(monthlySalary) || monthlySalary <= 0) {
         return {
            finalTax: 0,
            currentTax: 0,
            netDifference: 0,
            monthlySalary: 0,
            ruleApplied: 'initial',
            details: {}
        };
    }

    const { tax: currentTax, bracket } = calculateStandardIR(monthlySalary);
    
    if (monthlySalary <= rules.exemptionLimit) {
        const finalTax = 0;
        return {
            finalTax,
            currentTax,
            netDifference: currentTax - finalTax,
            monthlySalary,
            ruleApplied: 'exemption',
            details: {
                baseTax: currentTax,
                aliquot: bracket.rate,
                deduction: bracket.deduction,
            }
        };
    }
    
    if (monthlySalary > rules.exemptionLimit && monthlySalary <= rules.standardRangeStart) {
        const tier = rules.discountTiers.find(t => monthlySalary <= t.limit);
        if (tier) {
            const finalTax = currentTax * (1 - tier.discount);
            return {
                finalTax,
                currentTax,
                netDifference: currentTax - finalTax,
                monthlySalary,
                ruleApplied: 'discount',
                details: {
                    baseTax: currentTax,
                    discountApplied: tier.discount,
                    aliquot: bracket.rate,
                    deduction: bracket.deduction,
                }
            };
        }
    }
    
    // Standard calculation, finalTax is the same as currentTax
    return {
        finalTax: currentTax,
        currentTax,
        netDifference: 0, // No change
        monthlySalary,
        ruleApplied: 'standard',
        details: {
            baseTax: currentTax,
            aliquot: bracket.rate,
            deduction: bracket.deduction,
        }
    };
}
