export type DecisionDraft = {
  submissionKey: string;
  travel: boolean;
  course: boolean;
  healthCover: boolean;
  accidentCover: boolean;
  cyberCover: boolean;
  toolMaintenance: boolean;
  reserveTopUp: boolean;
  safetySetup: boolean;
  taxReserve: boolean;
  retirementPlan: boolean;
  legacyReserve: boolean;
  buyVehicle: boolean;
  buyHouse: boolean;
  engagementPrep: boolean;
  weddingPlan: boolean;
  borrow: string;
  repay: string;
  debtTarget: string;
  bondBuy: string;
  fundBuy: string;
  stockBuy: string;
  cryptoBuy: string;
  optionBuy: string;
  optionDir: "CALL" | "PUT";
  gambleType: string;
  gambleAmount: string;
  riskCrypto: boolean;
  riskOption: boolean;
  riskGamble: boolean;
};

export type DecisionBudget = {
  salary: number;
  mandatoryLiving: number;
  minDebtPay: number;
  borrowLimit: number;
  vehicleMandatory?: number;
  housingMandatory?: number;
  familyMandatory?: number;
};

export type DecisionStudentSnapshot = {
  cash: number;
  baseSalary: number;
  assets?: Record<string, number>;
  vehicle?: {
    owned?: boolean;
    value?: number;
    monthlyPayment?: number;
    maintenance?: number;
  };
  house?: {
    owned?: boolean;
    value?: number;
    monthlyPayment?: number;
    maintenance?: number;
  };
  family?: {
    stage?: string;
    monthlySupport?: number;
  };
  metrics: {
    netWorth: number;
    debtRatio: number;
    dsr: number;
    emergencyMonths: number;
    finalScore?: number;
  };
};

export type DecisionPreview = {
  availableCash: number;
  plannedConsume: number;
  plannedLifecycleSetup: number;
  plannedInvest: number;
  plannedRisk: number;
  plannedFixedCost: number;
  explicitBorrow: number;
  autoBridgeBorrow: number;
  totalBorrow: number;
  projectedCash: number;
  projectedNetWorth: number;
  projectedEmergencyMonths: number;
  projectedLifeScore: number;
  projectedBudget: {
    vehicleMandatory: number;
    housingMandatory: number;
    familyMandatory: number;
  };
  projectedVehicle: {
    owned: boolean;
    value: number;
    monthlyPayment: number;
    maintenance: number;
  };
  projectedHouse: {
    owned: boolean;
    value: number;
    monthlyPayment: number;
    maintenance: number;
  };
  projectedFamily: {
    stage: string;
    monthlySupport: number;
  };
  assetDistribution: Array<{
    key: string;
    label: string;
    value: number;
    share: number;
  }>;
  categoryDistribution: Array<{
    key: string;
    label: string;
    value: number;
    share: number;
  }>;
  lifeScoreBreakdown: Array<{
    key: string;
    label: string;
    amount: number;
    scoreGain: number;
  }>;
};

const vehicleConfig = {
  purchasePrice: 120000,
  downPayment: 24000,
  monthlyPayment: 2200,
  maintenance: 600,
  depreciationRate: 0.02
};

const houseConfig = {
  purchasePrice: 300000,
  downPayment: 60000,
  monthlyPayment: 1900,
  maintenance: 300,
  appreciationRate: 0.01
};

const familyConfig = {
  engagementCost: 6000,
  weddingCost: 18000,
  monthlySupport: 900
};

const consumeCatalog = [
  { key: "travel", label: "旅行与休闲", amount: 2000, scoreGain: 66.7 },
  { key: "course", label: "课程学习", amount: 3000, scoreGain: 100 },
  { key: "healthCover", label: "健康保障", amount: 500, scoreGain: 16.7 },
  { key: "accidentCover", label: "意外保障", amount: 200, scoreGain: 6.7 },
  { key: "cyberCover", label: "网络安全保障", amount: 150, scoreGain: 5 },
  { key: "toolMaintenance", label: "设备维护", amount: 400, scoreGain: 13.3 },
  { key: "reserveTopUp", label: "应急金补充", amount: 800, scoreGain: 26.7 },
  { key: "safetySetup", label: "安全防护", amount: 300, scoreGain: 10 },
  { key: "taxReserve", label: "税务准备", amount: 400, scoreGain: 13.3 },
  { key: "retirementPlan", label: "养老准备", amount: 700, scoreGain: 23.3 },
  { key: "legacyReserve", label: "家庭支持准备", amount: 500, scoreGain: 16.7 },
  { key: "engagementPrep", label: "订婚准备", amount: familyConfig.engagementCost, scoreGain: 100 },
  { key: "weddingPlan", label: "婚礼计划", amount: familyConfig.weddingCost, scoreGain: 100 }
] as const;

function toNumber(value: string | number | undefined) {
  const nextValue = Number(value ?? 0);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function calcEmergencyMonths(cash: number, mandatoryCost: number) {
  if (mandatoryCost <= 0) {
    return 0;
  }

  return Number((cash / mandatoryCost).toFixed(1));
}

function getStorageKey(roundId: string) {
  return `finance-rebuild-decision-${roundId}`;
}

export function readDecisionDraft(roundId: string): DecisionDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storageKey = getStorageKey(roundId);
    const raw = window.localStorage.getItem(storageKey) ?? window.sessionStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }

    window.localStorage.setItem(storageKey, raw);
    window.sessionStorage.removeItem(storageKey);
    return JSON.parse(raw) as DecisionDraft;
  } catch {
    window.localStorage.removeItem(getStorageKey(roundId));
    window.sessionStorage.removeItem(getStorageKey(roundId));
    return null;
  }
}

export function writeDecisionDraft(roundId: string, draft: DecisionDraft) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(draft);
  window.localStorage.setItem(getStorageKey(roundId), serialized);
  window.sessionStorage.removeItem(getStorageKey(roundId));
}

export function clearDecisionDraft(roundId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getStorageKey(roundId));
  window.sessionStorage.removeItem(getStorageKey(roundId));
}

export function buildDecisionPreview({
  draft,
  budget,
  student
}: {
  draft: DecisionDraft;
  budget: DecisionBudget;
  student: DecisionStudentSnapshot;
}): DecisionPreview {
  const consumeRows = consumeCatalog
    .filter((item) => Boolean(draft[item.key]))
    .map((item) => ({
      key: item.key,
      label: item.label,
      amount: item.amount,
      scoreGain: item.scoreGain
    }));

  const investRows = [
    { key: "A4", label: "债券基金", amount: toNumber(draft.bondBuy) },
    { key: "A5", label: "股票基金", amount: toNumber(draft.fundBuy) },
    { key: "A6", label: "股票", amount: toNumber(draft.stockBuy) },
    { key: "A7", label: "虚拟币", amount: toNumber(draft.cryptoBuy) },
    { key: "A8", label: "期权", amount: toNumber(draft.optionBuy) }
  ];

  const riskAmount = toNumber(draft.gambleAmount);
  const explicitBorrow = toNumber(draft.borrow);
  const repayAmount = Math.max(0, toNumber(draft.repay));
  const selectedConsume = roundCurrency(
    consumeRows.reduce((sum, item) => sum + item.amount, 0) +
      (draft.buyVehicle ? vehicleConfig.downPayment : 0) +
      (draft.buyHouse ? houseConfig.downPayment : 0)
  );
  const currentFamilyStage = student.family?.stage ?? "single";
  const plannedLifecycleSetup = roundCurrency(
    (draft.engagementPrep && currentFamilyStage === "single" ? familyConfig.engagementCost : 0) +
      (draft.weddingPlan && currentFamilyStage !== "married"
        ? familyConfig.weddingCost + (currentFamilyStage === "single" ? familyConfig.engagementCost : 0)
        : 0)
  );
  const plannedConsume = roundCurrency(selectedConsume + plannedLifecycleSetup);
  const plannedInvest = roundCurrency(investRows.reduce((sum, item) => sum + item.amount, 0));
  const plannedRisk = roundCurrency(riskAmount);
  const availableCash = roundCurrency(student.cash + budget.salary - budget.mandatoryLiving - budget.minDebtPay);
  const plannedOutflow = roundCurrency(plannedConsume + plannedInvest + plannedRisk + repayAmount);
  const autoBridgeBorrow = Math.max(0, roundCurrency(plannedOutflow - availableCash - explicitBorrow));
  const totalBorrow = roundCurrency(explicitBorrow + autoBridgeBorrow);
  const projectedCash = Math.max(0, roundCurrency(availableCash + explicitBorrow - plannedOutflow));

  const projectedVehicle =
    draft.buyVehicle || student.vehicle?.owned
      ? {
          owned: true,
          value: draft.buyVehicle
            ? vehicleConfig.purchasePrice
            : roundCurrency((student.vehicle?.value ?? 0) * (1 - vehicleConfig.depreciationRate)),
          monthlyPayment: vehicleConfig.monthlyPayment,
          maintenance: vehicleConfig.maintenance
        }
      : {
          owned: false,
          value: 0,
          monthlyPayment: 0,
          maintenance: 0
        };

  const projectedHouse =
    draft.buyHouse || student.house?.owned
      ? {
          owned: true,
          value: draft.buyHouse
            ? houseConfig.purchasePrice
            : roundCurrency((student.house?.value ?? 0) * (1 + houseConfig.appreciationRate)),
          monthlyPayment: houseConfig.monthlyPayment,
          maintenance: houseConfig.maintenance
        }
      : {
          owned: false,
          value: 0,
          monthlyPayment: 0,
          maintenance: 0
        };

  const projectedFamily = draft.weddingPlan
    ? {
        stage: "married",
        monthlySupport: familyConfig.monthlySupport
      }
    : draft.engagementPrep
      ? {
          stage: "engaged",
          monthlySupport: 0
        }
      : {
          stage: student.family?.stage ?? "single",
          monthlySupport: student.family?.monthlySupport ?? 0
        };

  const currentAssets = student.assets ?? {};
  const currentAssetTotal =
    student.cash +
    Object.values(currentAssets).reduce((sum, value) => sum + (value ?? 0), 0) +
    (student.vehicle?.value ?? 0) +
    (student.house?.value ?? 0);
  const impliedDebt = Math.max(0, roundCurrency(currentAssetTotal - student.metrics.netWorth));
  const projectedDebtAfterRepay = Math.max(0, roundCurrency(impliedDebt - repayAmount));

  const projectedAssets = {
    A1: currentAssets.A1 ?? 0,
    A4: roundCurrency((currentAssets.A4 ?? 0) + toNumber(draft.bondBuy)),
    A5: roundCurrency((currentAssets.A5 ?? 0) + toNumber(draft.fundBuy)),
    A6: roundCurrency((currentAssets.A6 ?? 0) + toNumber(draft.stockBuy)),
    A7: roundCurrency((currentAssets.A7 ?? 0) + toNumber(draft.cryptoBuy)),
    A8: roundCurrency((currentAssets.A8 ?? 0) + toNumber(draft.optionBuy))
  };

  const projectedNetWorth = roundCurrency(
    projectedCash +
      Object.values(projectedAssets).reduce((sum, value) => sum + value, 0) +
      projectedVehicle.value +
      projectedHouse.value -
      projectedDebtAfterRepay -
      totalBorrow
  );

  const projectedBudget = {
    vehicleMandatory: projectedVehicle.owned ? projectedVehicle.monthlyPayment + projectedVehicle.maintenance : 0,
    housingMandatory: projectedHouse.owned ? projectedHouse.monthlyPayment + projectedHouse.maintenance : 0,
    familyMandatory: projectedFamily.stage === "married" ? projectedFamily.monthlySupport : 0
  };

  const denominator = Math.max(availableCash, 1);
  const categoryDistribution = [
    {
      key: "consume",
      label: "生活消费",
      value: plannedConsume,
      share: Number(((plannedConsume / denominator) * 100).toFixed(1))
    },
    {
      key: "invest",
      label: "金融资产",
      value: plannedInvest,
      share: Number(((plannedInvest / denominator) * 100).toFixed(1))
    },
    {
      key: "risk",
      label: "高风险资金",
      value: plannedRisk,
      share: Number(((plannedRisk / denominator) * 100).toFixed(1))
    },
    {
      key: "borrow",
      label: "新增借款",
      value: totalBorrow,
      share: Number(((totalBorrow / denominator) * 100).toFixed(1))
    }
  ].filter((item) => item.value > 0);

  const assetDistribution = [
    { key: "cash", label: "现金", value: projectedCash },
    { key: "A4", label: "债券基金", value: projectedAssets.A4 },
    { key: "A5", label: "股票基金", value: projectedAssets.A5 },
    { key: "A6", label: "股票", value: projectedAssets.A6 },
    { key: "A7", label: "虚拟币", value: projectedAssets.A7 },
    { key: "A8", label: "期权", value: projectedAssets.A8 },
    { key: "vehicle", label: "车辆", value: projectedVehicle.value },
    { key: "house", label: "房产", value: projectedHouse.value }
  ]
    .filter((item) => item.value > 0)
    .map((item, _, list) => ({
      ...item,
      share: Number(((item.value / Math.max(list.reduce((sum, entry) => sum + entry.value, 0), 1)) * 100).toFixed(1))
    }));

  const lifeScoreBreakdown = consumeRows.map((item) => ({
    ...item,
    scoreGain: Number(item.scoreGain.toFixed(1))
  }));

  const plannedFixedCost = roundCurrency(
    projectedBudget.vehicleMandatory + projectedBudget.housingMandatory + projectedBudget.familyMandatory
  );

  return {
    availableCash,
    plannedConsume,
    plannedLifecycleSetup,
    plannedInvest,
    plannedRisk,
    plannedFixedCost,
    explicitBorrow,
    autoBridgeBorrow,
    totalBorrow,
    projectedCash,
    projectedNetWorth,
    projectedEmergencyMonths: calcEmergencyMonths(
      projectedCash,
      budget.mandatoryLiving + projectedBudget.vehicleMandatory + projectedBudget.housingMandatory + projectedBudget.familyMandatory
    ),
    projectedLifeScore: Number(
      Math.min(
        100,
        lifeScoreBreakdown.reduce((sum, item) => sum + item.scoreGain, 0)
      ).toFixed(1)
    ),
    projectedBudget,
    projectedVehicle,
    projectedHouse,
    projectedFamily,
    assetDistribution,
    categoryDistribution,
    lifeScoreBreakdown
  };
}
