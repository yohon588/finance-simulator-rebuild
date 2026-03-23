export type ScoreBreakdown = {
  wealthScore: number;
  healthScore: number;
  lifeScore: number;
  finalScore: number;
};

export type HealthBreakdown = {
  debtRatio: number;
  dsr: number;
  emergencyMonths: number;
};

export function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

export function calcMandatoryLiving(costIndex: number, baseCost = 3600) {
  return roundCurrency(baseCost * costIndex);
}

export function calcMinDebtPay(principal: number) {
  return roundCurrency(principal * 0.06);
}

export function calcBorrowLimit(baseSalary: number, principal: number) {
  return Math.max(baseSalary * 5 - principal, 0);
}

export function calcDebtServiceRatio(totalMinDebtPay: number, income: number) {
  if (income <= 0) {
    return 1;
  }

  return roundCurrency(totalMinDebtPay / income);
}

export function calcEmergencyMonths(cash: number, mandatoryCost: number) {
  if (mandatoryCost <= 0) {
    return 0;
  }

  return Number((cash / mandatoryCost).toFixed(1));
}

export function calcDebtRatio(debt: number, netWorth: number) {
  if (debt <= 0 && netWorth <= 0) {
    return 0;
  }

  const denominator = Math.max(netWorth + debt, 1);
  return roundCurrency(debt / denominator);
}

export function calcHealthScore(input: HealthBreakdown) {
  const debtPenalty = input.debtRatio * 30;
  const dsrPenalty = input.dsr * 40;
  const reserveBonus = input.emergencyMonths * 8;
  return Math.max(0, roundCurrency((100 - debtPenalty - dsrPenalty + reserveBonus) / 2));
}

export function calcLifeScore(consumeTotal: number) {
  return Math.max(0, roundCurrency(Math.min(consumeTotal / 3000, 1) * 100));
}

export function calcWealthScore(netWorth: number, baseSalary: number) {
  return Math.max(0, roundCurrency((netWorth / Math.max(baseSalary, 1)) * 10));
}

export function calcScoreBreakdown(input: {
  netWorth: number;
  baseSalary: number;
  debtRatio: number;
  dsr: number;
  emergencyMonths: number;
  consumeTotal: number;
}): ScoreBreakdown {
  const wealthScore = calcWealthScore(input.netWorth, input.baseSalary);
  const healthScore = calcHealthScore({
    debtRatio: input.debtRatio,
    dsr: input.dsr,
    emergencyMonths: input.emergencyMonths
  });
  const lifeScore = calcLifeScore(input.consumeTotal);
  const finalScore = roundCurrency(wealthScore * 0.6 + healthScore * 0.3 + lifeScore * 0.1);

  return {
    wealthScore,
    healthScore,
    lifeScore,
    finalScore
  };
}
