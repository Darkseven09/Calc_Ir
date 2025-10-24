import type { ProposedRules } from './types';

export const DEFAULT_PROPOSED_RULES: ProposedRules = {
  exemptionLimit: 5000,
  discountTiers: [
    { limit: 6000, discount: 0.75, label: "ate R$ 6.000,00" },
    { limit: 7350, discount: 0.50, label: "de R$ 6.000,01 a R$ 7.350,00" },
  ],
  standardRangeStart: 7350,
  highIncomeMonthlyThreshold: 50000, // Aproximacao: R$ 600 mil/ano dividido por 12
  highIncomeMinimumRate: 0.275,
};
