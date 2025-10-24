export type Period = 'monthly' | 'annual';

export interface StandardBracket {
  limit: number;
  rate: number;
  deduction: number;
}

export interface DiscountTier {
  limit: number;
  discount: number;
  label: string;
}

export interface ProposedRules {
  exemptionLimit: number;
  discountTiers: DiscountTier[];
  standardRangeStart: number;
}

export interface CalculationResult {
  finalTax: number; // Proposed tax
  currentTax: number; // Tax under current rules
  netDifference: number; // The difference/gain
  monthlySalary: number;
  ruleApplied: 'exemption' | 'discount' | 'standard' | 'initial';
  details: {
    baseTax?: number;
    discountApplied?: number;
    aliquot?: number;
    deduction?: number;
  };
}
