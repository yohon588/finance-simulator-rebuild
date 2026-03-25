export type TeachingDashboardInput = {
  classroom?: {
    code: string;
    name: string;
    teacherName: string;
  } | null;
  round?: {
    no: number;
    status: string;
  } | null;
  classProfile?: {
    avgScore: number;
    avgNetWorth: number;
    avgEmergencyMonths: number;
    avgDsr?: number;
    vehiclesOwned?: number;
    homesOwned?: number;
    engagedStudents?: number;
    marriedStudents?: number;
    fixedCostLocked?: number;
    topRiskTags?: Array<{ tag: string; hits: number }>;
  } | null;
  currentRoundSummary?: {
    topDrivers?: Array<{ label: string; total: number }>;
    diceCategories?: Array<{ category: string; count: number }>;
    topRiskTags?: Array<{ tag: string; count: number }>;
    teacherCue?: string;
    protectionSummary?: {
      protectedStudents: number;
      stressedStudents: number;
      highRiskStudents: number;
      supportiveHits?: number;
      amplifiedHits?: number;
    };
    lifecycleLoadSummary?: {
      vehiclesOwned?: number;
      homesOwned?: number;
      engagedStudents?: number;
      marriedStudents?: number;
      fixedCostLocked?: number;
    };
    lifecycleCue?: string;
  } | null;
  submissionSummary?: {
    submitted: number;
    total: number;
  } | null;
  students?: Array<{
    id: string;
    displayName: string;
    roleId: string;
    submitted?: boolean;
  }>;
  ranking?: Array<{
    rank: number;
    displayName: string;
    roleId: string;
    finalScore: number;
    netWorth: number;
  }>;
};

export type TeachingSignals = {
  studentCount: number;
  submittedCount: number;
  avgScore: number;
  avgNetWorth: number;
  avgEmergencyMonths: number;
  avgDsr: number;
  vehiclesOwned: number;
  homesOwned: number;
  engagedCount: number;
  marriedCount: number;
  fixedCostLockedCount: number;
  supportiveHits: number;
  amplifiedHits: number;
  highRiskExposureCount: number;
  topDriverKeys: string[];
  topRiskTags: string[];
  topDiceCategories: string[];
  hasCashflowPressure: boolean;
  hasDebtPressure: boolean;
  hasEmergencyPressure: boolean;
  hasProtectionGap: boolean;
  hasFixedCostPressure: boolean;
  hasAllocationPressure: boolean;
};

function includesAny(source: string[], candidates: string[]) {
  return candidates.some((candidate) => source.includes(candidate));
}

function normalizeKeys(items: string[] | undefined) {
  return (items ?? []).map((item) => item.trim());
}

export function buildTeachingSignals(input: TeachingDashboardInput): TeachingSignals {
  const topDriverKeys = normalizeKeys(input.currentRoundSummary?.topDrivers?.map((item) => item.label));
  const topRiskTags = normalizeKeys(
    [
      ...(input.classProfile?.topRiskTags?.map((item) => item.tag) ?? []),
      ...(input.currentRoundSummary?.topRiskTags?.map((item) => item.tag) ?? [])
    ].filter(Boolean)
  );
  const topDiceCategories = normalizeKeys(input.currentRoundSummary?.diceCategories?.map((item) => item.category));

  const avgEmergencyMonths = Number(input.classProfile?.avgEmergencyMonths ?? 0);
  const avgDsr = Number(input.classProfile?.avgDsr ?? 0);
  const fixedCostLockedCount = Number(
    input.currentRoundSummary?.lifecycleLoadSummary?.fixedCostLocked ?? input.classProfile?.fixedCostLocked ?? 0
  );
  const vehiclesOwned = Number(
    input.currentRoundSummary?.lifecycleLoadSummary?.vehiclesOwned ?? input.classProfile?.vehiclesOwned ?? 0
  );
  const homesOwned = Number(input.currentRoundSummary?.lifecycleLoadSummary?.homesOwned ?? input.classProfile?.homesOwned ?? 0);
  const engagedCount = Number(
    input.currentRoundSummary?.lifecycleLoadSummary?.engagedStudents ?? input.classProfile?.engagedStudents ?? 0
  );
  const marriedCount = Number(
    input.currentRoundSummary?.lifecycleLoadSummary?.marriedStudents ?? input.classProfile?.marriedStudents ?? 0
  );
  const supportiveHits = Number(input.currentRoundSummary?.protectionSummary?.supportiveHits ?? 0);
  const amplifiedHits = Number(input.currentRoundSummary?.protectionSummary?.amplifiedHits ?? 0);
  const highRiskExposureCount = Number(input.currentRoundSummary?.protectionSummary?.highRiskStudents ?? 0);
  const studentCount = Number(input.submissionSummary?.total ?? input.students?.length ?? 0);
  const submittedCount = Number(input.submissionSummary?.submitted ?? input.students?.filter((item) => item.submitted).length ?? 0);

  const hasCashflowPressure =
    includesAny(topDriverKeys, ["基础生活费", "可选消费", "最低还款", "mandatoryLiving", "consume", "minDebtPay"]) ||
    includesAny(topRiskTags, ["家庭支出承压", "固定成本锁定", "Family Support Strain", "Fixed Cost Lock"]);

  const hasDebtPressure =
    avgDsr >= 0.18 ||
    includesAny(topRiskTags, ["高负债", "还款承压", "债务逾期", "High Debt", "Debt Service Pressure", "Delinquent Debt"]) ||
    includesAny(topDriverKeys, ["最低还款", "贷款利息", "minDebtPay", "loanInterest"]);

  const hasEmergencyPressure =
    avgEmergencyMonths < 1 ||
    includesAny(topRiskTags, ["应急金不足", "Low Emergency Fund"]);

  const hasProtectionGap =
    amplifiedHits > supportiveHits ||
    includesAny(topDiceCategories, ["健康与医疗", "安全与反诈", "health", "safety"]);

  const hasFixedCostPressure =
    fixedCostLockedCount > 0 ||
    vehiclesOwned > 0 ||
    homesOwned > 0 ||
    engagedCount > 0 ||
    marriedCount > 0 ||
    includesAny(topRiskTags, ["固定成本锁定", "家庭支出承压", "Fixed Cost Lock", "Family Support Strain"]);

  const hasAllocationPressure =
    highRiskExposureCount > 0 ||
    includesAny(topRiskTags, ["高风险暴露", "High Risk Exposure"]) ||
    includesAny(topDriverKeys, ["投资盈亏", "investmentPnl"]);

  return {
    studentCount,
    submittedCount,
    avgScore: Number(input.classProfile?.avgScore ?? 0),
    avgNetWorth: Number(input.classProfile?.avgNetWorth ?? 0),
    avgEmergencyMonths,
    avgDsr,
    vehiclesOwned,
    homesOwned,
    engagedCount,
    marriedCount,
    fixedCostLockedCount,
    supportiveHits,
    amplifiedHits,
    highRiskExposureCount,
    topDriverKeys,
    topRiskTags,
    topDiceCategories,
    hasCashflowPressure,
    hasDebtPressure,
    hasEmergencyPressure,
    hasProtectionGap,
    hasFixedCostPressure,
    hasAllocationPressure
  };
}
