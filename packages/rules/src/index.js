export function roundCurrency(value) {
  return Number(value.toFixed(2));
}

export function calcMandatoryLiving(costIndex, baseCost = 3600) {
  return roundCurrency(baseCost * costIndex);
}

export function calcMinDebtPay(principal) {
  return roundCurrency(principal * 0.06);
}

export function calcBorrowLimit(baseSalary, principal) {
  return Math.max(baseSalary * 5 - principal, 0);
}

export function calcDebtServiceRatio(totalMinDebtPay, income) {
  if (income <= 0) {
    return 1;
  }

  return roundCurrency(totalMinDebtPay / income);
}

export function calcEmergencyMonths(cash, mandatoryCost) {
  if (mandatoryCost <= 0) {
    return 0;
  }

  return Number((cash / mandatoryCost).toFixed(1));
}

export function calcDebtRatio(debt, netWorth) {
  if (debt <= 0 && netWorth <= 0) {
    return 0;
  }

  const denominator = Math.max(netWorth + debt, 1);
  return roundCurrency(debt / denominator);
}

export function calcHealthScore(input) {
  const debtPenalty = input.debtRatio * 30;
  const dsrPenalty = input.dsr * 40;
  const reserveBonus = input.emergencyMonths * 8;
  return Math.max(0, roundCurrency((100 - debtPenalty - dsrPenalty + reserveBonus) / 2));
}

export function calcLifeScore(consumeTotal) {
  return Math.max(0, roundCurrency(Math.min(consumeTotal / 3000, 1) * 100));
}

export function calcWealthScore(netWorth, baseSalary) {
  return Math.max(0, roundCurrency((netWorth / Math.max(baseSalary, 1)) * 10));
}

export function calcScoreBreakdown(input) {
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
