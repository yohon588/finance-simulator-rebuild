import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createInMemoryRepository } from "./repository.js";
import {
  calcBorrowLimit,
  calcDebtRatio,
  calcDebtServiceRatio,
  calcEmergencyMonths,
  calcMandatoryLiving,
  calcMinDebtPay,
  calcScoreBreakdown,
  roundCurrency
} from "../../../../packages/rules/src/index.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const macroEventsPath = path.resolve(currentDir, "../../../../data/macro-events.v1.json");
const diceEventsPath = path.resolve(currentDir, "../../../../data/dice-events.v1.json");
const macroEvents = JSON.parse(fs.readFileSync(macroEventsPath, "utf8"));
const diceEvents = JSON.parse(fs.readFileSync(diceEventsPath, "utf8"));

const roleConfig = {
  R1: { salary: 4500, cash: 2000 },
  R2: { salary: 5500, cash: 3000 },
  R3: { salary: 6500, cash: 2000 },
  R4: { salary: 8500, cash: 5000 },
  R5: { salary: 10000, cash: 8000 },
  R6: { salary: 12000, cash: 10000 },
  R7: { salary: 15000, cash: 15000 }
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

const diceCategoryByRoll = {
  1: "health",
  2: "housing",
  3: "consumption",
  4: "income",
  5: "social",
  6: "safety"
};

const trackedAssets = ["A1", "A4", "A5", "A6", "A7", "A8"];
const tradableAssets = ["A4", "A5", "A6", "A7", "A8"];
const debtCatalog = {
  "D-consumer": { type: "CONSUMER", creditor: "Consumer Credit", rateMonthly: 0.01 },
  "D-device": { type: "DEVICE", creditor: "Device Installment", rateMonthly: 0.012 },
  "D-bridge": { type: "BRIDGE", creditor: "Emergency Bridge", rateMonthly: 0.015 },
  "D-medical": { type: "MEDICAL", creditor: "Medical Relief Plan", rateMonthly: 0.008 },
  "D-social": { type: "SOCIAL", creditor: "Family And Social Advance", rateMonthly: 0.011 }
};
const gambleCatalog = {
  LOTTERY: { winRate: 0.01, winMultiple: 10 },
  SPORTS: { winRate: 0.1, winMultiple: 2 },
  CASINO: { winRate: 0.05, winMultiple: 3 },
  SCAM: { winRate: 0.3, winMultiple: 0.2 }
};
const maxStudentsPerRoom = 60;
const optionalConsumeModuleMap = {
  X1: "tax",
  Q1: "retirement",
  L1: "legacy",
  H1: "realestate"
};

function createPrepFlags() {
  return {
    learningReady: false,
    healthReady: false,
    deviceReady: false,
    reserveReady: false,
    safetyReady: false,
    taxReady: false,
    retirementReady: false,
    legacyReady: false,
    debtStressed: false
  };
}

function createInsuranceFlags() {
  return {
    healthCover: false,
    accidentCover: false,
    cyberCover: false
  };
}

function createFamilyState() {
  return {
    stage: "single",
    monthlySupport: 0
  };
}

function createDebt(debtId, principal = 0) {
  const config = debtCatalog[debtId] ?? debtCatalog["D-consumer"];
  return {
    id: debtId,
    type: config.type,
    creditor: config.creditor,
    principal,
    rateMonthly: config.rateMonthly,
    minPay: calcMinDebtPay(principal),
    missedRounds: 0,
    status: principal > 0 ? "ACTIVE" : "CLEAR"
  };
}

function ensureStudentStructures(student) {
  if (!student.assets) {
    student.assets = Object.fromEntries(trackedAssets.map((assetId) => [assetId, 0]));
  }

  if (!student.debts || student.debts.length === 0) {
    student.debts = [createDebt("D-consumer", student.debtPrincipal ?? 0)];
  }

  const consumerDebt = student.debts.find((debt) => debt.id === "D-consumer");
  if (!consumerDebt) {
    student.debts.unshift(createDebt("D-consumer", student.debtPrincipal ?? 0));
  }

  if (!student.prepFlags) {
    student.prepFlags = createPrepFlags();
  }
  if (!student.insuranceFlags) {
    student.insuranceFlags = createInsuranceFlags();
  }
  if (!student.family) {
    student.family = createFamilyState();
  }

  return student;
}

function getOrCreateDebt(student, debtId) {
  ensureStudentStructures(student);
  let debt = student.debts.find((item) => item.id === debtId);
  if (!debt) {
    debt = createDebt(debtId, 0);
    student.debts.push(debt);
  }
  return debt;
}

function getConsumerDebt(student) {
  ensureStudentStructures(student);
  return student.debts.find((debt) => debt.id === "D-consumer") ?? createDebt("D-consumer", 0);
}

function syncLegacyDebt(student) {
  ensureStudentStructures(student);
  student.debts.forEach((debt) => {
    debt.minPay = calcMinDebtPay(debt.principal);
    debt.status = debt.principal > 0 ? "ACTIVE" : "CLEAR";
  });
  student.debtPrincipal = roundCurrency(student.debts.reduce((sum, debt) => sum + debt.principal, 0));
  return student;
}

function cloneAssets(student) {
  ensureStudentStructures(student);
  return { ...student.assets };
}

function createRound(roundNo = 1) {
  return {
    id: crypto.randomUUID(),
    no: roundNo,
    status: "draft",
    teachingTopic: null,
    eventId: null,
    costIndex: 1,
    decisions: {},
    dice: {},
    lockedAt: null,
    settledAt: null,
    history: []
  };
}

function createNextRound(previousRound) {
  const nextRound = createRound((previousRound?.no ?? 0) + 1);
  nextRound.costIndex = previousRound?.costIndex ?? 1;
  nextRound.history = [...(previousRound?.history ?? [])];
  return nextRound;
}

function buildStudentChartSeries(student) {
  const history = student?.history ?? [];
  return history.map((ledger, index) => ({
    roundNo: ledger?.roundNo ?? index + 1,
    netWorth: roundCurrency(ledger?.endWorth ?? 0),
    A4: Number(ledger?.assetPnl?.A4?.returnPct ?? 0),
    A5: Number(ledger?.assetPnl?.A5?.returnPct ?? 0),
    A6: Number(ledger?.assetPnl?.A6?.returnPct ?? 0),
    A7: Number(ledger?.assetPnl?.A7?.returnPct ?? 0),
    A8: Number(ledger?.assetPnl?.A8?.returnPct ?? 0)
  }));
}

function getEventById(eventId) {
  return macroEvents.find((event) => event.eventId === eventId) ?? null;
}

function isOptionalModuleEnabled(moduleConfig, key) {
  return moduleConfig?.opt?.[key] !== false;
}

function sanitizeDecisionPayload(payload, moduleConfig) {
  return {
    ...payload,
    consume: (payload.consume ?? []).filter((item) => {
      const moduleKey = optionalConsumeModuleMap[item.id];
      return moduleKey ? isOptionalModuleEnabled(moduleConfig, moduleKey) : true;
    })
  };
}

function buildMarket(eventId) {
  const presets = {
    innovation_boom: { A1: 0.25, A4: -0.5, A5: 6, A6: 12, A7: 25, A8: 115 },
    housing_cost_shock: { A1: 0.25, A4: 2.5, A5: -5, A6: -10, A7: -15, A8: -100 },
    rate_relief: { A1: 0.15, A4: 3.2, A5: 4.8, A6: 7.5, A7: 10, A8: 70 },
    layoff_stress: { A1: 0.3, A4: 1.8, A5: -4, A6: -8, A7: -12, A8: -85 },
    export_rebound: { A1: 0.2, A4: -0.8, A5: 5.5, A6: 11, A7: 18, A8: 105 },
    consumer_slowdown: { A1: 0.25, A4: 1.2, A5: -2.5, A6: -6, A7: -10, A8: -65 },
    crypto_mania: { A1: 0.15, A4: -1.5, A5: 7, A6: 13, A7: 35, A8: 125 },
    essential_inflation: { A1: 0.12, A4: -1.2, A5: 2, A6: 4, A7: 6, A8: 35 },
    healthcare_relief: { A1: 0.2, A4: 1.5, A5: 1.8, A6: 2.2, A7: -2, A8: 17 },
    tax_tightening: { A1: 0.18, A4: 0.8, A5: -1.5, A6: -3.5, A7: -6, A8: -40 },
    innovation_correction: { A1: 0.2, A4: 2.1, A5: -6.2, A6: -12.5, A7: -18, A8: -100 },
    skill_upgrade: { A1: 0.18, A4: 0.6, A5: 3.5, A6: 5.5, A7: 4, A8: 50 },
    tourism_boom: { A1: 0.18, A4: 0.1, A5: 2.8, A6: 3.8, A7: 1, A8: 33 },
    fraud_crackdown: { A1: 0.2, A4: 1.4, A5: -0.8, A6: -1.6, A7: -14, A8: -21 },
    upskill_grants: { A1: 0.16, A4: 0.5, A5: 2.4, A6: 3.2, A7: 0, A8: 27 },
    energy_shock: { A1: 0.3, A4: 2.2, A5: -3.2, A6: -5.2, A7: -7.5, A8: -57 },
    remote_work_boost: { A1: 0.16, A4: 0.3, A5: 2.2, A6: 3.6, A7: 1.8, A8: 31 },
    credit_tightening: { A1: 0.26, A4: 1.6, A5: -2.8, A6: -4.6, A7: -8.5, A8: -51 },
    insurance_awareness: { A1: 0.2, A4: 1.1, A5: 0.8, A6: 1.2, A7: -3.5, A8: 7 },
    creator_education_up: { A1: 0.14, A4: 0.4, A5: 2.9, A6: 4.8, A7: 5.2, A8: 43 },
    currency_pressure: { A1: 0.28, A4: 1.9, A5: -2.4, A6: -3.8, A7: -6.8, A8: -43 },
    transport_relief: { A1: 0.16, A4: 0.7, A5: 1.5, A6: 2.1, A7: 0.5, A8: 16 },
    consumption_temptation: { A1: 0.12, A4: 0.2, A5: 1.1, A6: 1.7, A7: 2.2, A8: 12 },
    retirement_focus: { A1: 0.18, A4: 1.3, A5: 0.9, A6: 1.4, A7: -1.4, A8: 9 }
  };
  const event = getEventById(eventId);

  return presets[event?.marketProfile] ?? { A1: 0.2, A4: 0.5, A5: 1, A6: 2, A7: 0, A8: 0 };
}

function buildBudget(student, room) {
  ensureStudentStructures(student);
  syncLegacyDebt(student);
  const mandatoryLiving = calcMandatoryLiving(room.round.costIndex);
  const vehicleMandatory = student.vehicle?.owned ? vehicleConfig.monthlyPayment + vehicleConfig.maintenance : 0;
  const housingMandatory = student.house?.owned ? houseConfig.monthlyPayment + houseConfig.maintenance : 0;
  const familyMandatory = student.family?.stage === "married" ? student.family.monthlySupport ?? familyConfig.monthlySupport : 0;
  const minDebtPay = roundCurrency(
    student.debts.reduce((sum, debt) => sum + debt.minPay, 0) + vehicleMandatory + housingMandatory + familyMandatory
  );

  return {
    salary: student.baseSalary,
    mandatoryLiving,
    minDebtPay,
    borrowLimit: calcBorrowLimit(student.baseSalary, student.debtPrincipal),
    vehicleMandatory,
    housingMandatory,
    familyMandatory,
    emergencyTarget: 3,
    resilientTarget: 6
  };
}

function buildStudentState(displayName, roleId) {
  const role = roleConfig[roleId] ?? roleConfig.R1;

  return {
    id: crypto.randomUUID(),
    displayName,
    roleId,
    baseSalary: role.salary,
    cash: role.cash,
    assets: Object.fromEntries(trackedAssets.map((assetId) => [assetId, 0])),
    debts: [createDebt("D-consumer", 0)],
    debtPrincipal: 0,
    metrics: {
      netWorth: role.cash,
      debtRatio: 0,
      dsr: 0,
      emergencyMonths: calcEmergencyMonths(role.cash, 3600),
      finalScore: roundCurrency((role.cash / Math.max(role.salary, 1)) * 10)
    },
    riskTags: role.cash < 3600 ? ["Emergency Buffer Low"] : [],
    prepFlags: createPrepFlags(),
    insuranceFlags: createInsuranceFlags(),
    vehicle: {
      owned: false,
      value: 0,
      monthlyPayment: 0,
      maintenance: 0
    },
    house: {
      owned: false,
      value: 0,
      monthlyPayment: 0,
      maintenance: 0
    },
    family: createFamilyState(),
    latestLedger: null,
    history: []
  };
}

function createSession(role, userId, roomId) {
  return {
    token: `sess_${crypto.randomUUID()}`,
    role,
    userId,
    roomId
  };
}

function normalizeRoomCode(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");
}

function pickDiceCard(roll, student, room) {
  const category = diceCategoryByRoll[roll];
  const cards = diceEvents.filter((event) => event.category === category);
  if (cards.length === 0) {
    return null;
  }
  const seed = student.displayName.length + room.round.no + (student.baseSalary ?? 0);
  const index = seed % cards.length;
  return cards[index] ?? cards[0] ?? null;
}

function buildDiceResult(student, room) {
  const existing = room.round.dice[student.id];
  if (existing) {
    return existing;
  }

  const roll = ((student.displayName.length + room.round.no) % 6) + 1;
  const card = pickDiceCard(roll, student, room);
  let cashEffect = card?.baseEffect?.cash ?? 0;
  let incomeEffect = card?.baseEffect?.income ?? 0;
  const tags = [];
  const modifiers = [];
  const latestHistory = student.history ?? [];
  const learnedRecently = latestHistory.slice(-2).some((entry) =>
    entry.cashFlow?.consume ? Math.abs(entry.cashFlow.consume) >= 3000 : false
  );
  const emergencyBuffer = student.metrics?.emergencyMonths ?? 0;
  const riskExposure =
    (student.assets?.A5 ?? 0) + (student.assets?.A6 ?? 0) + (student.assets?.A7 ?? 0) + (student.assets?.A8 ?? 0);
  const prepFlags = student.prepFlags ?? createPrepFlags();
  const insuranceFlags = student.insuranceFlags ?? createInsuranceFlags();

  if (card?.id === "D1-01" && student.metrics.emergencyMonths < 1) {
    tags.push("Emergency Buffer Low");
    modifiers.push("Low emergency buffer leaves little protection against medical costs.");
  }
  if (card?.id === "D2-04") {
    cashEffect = student.baseSalary < 6000 ? -600 : student.baseSalary > 10000 ? -1200 : -1000;
    modifiers.push("Family support scales with salary band.");
  }
  if (card?.id === "D4-03") {
    cashEffect = learnedRecently ? 1200 : 800;
    modifiers.push(
      learnedRecently
        ? "Recent learning investment improved the payoff from the opportunity."
        : "Without recent learning investment, the reward stayed modest."
    );
  }
  if (card?.id === "D4-06") {
    incomeEffect = 0.05;
    tags.push("Human Capital Bonus");
    modifiers.push("Practical experience added a short-term salary multiplier.");
  }
  if (card?.category === "health" && insuranceFlags.healthCover) {
    cashEffect = roundCurrency(cashEffect * 0.45);
    modifiers.push("Active health cover absorbed a larger share of the medical shock.");
  } else if (card?.id === "D1-04" && insuranceFlags.accidentCover) {
    cashEffect = roundCurrency(cashEffect * 0.4);
    modifiers.push("Accident cover sharply reduced the injury-related out-of-pocket cost.");
  } else if (card?.category === "health" && prepFlags.healthReady) {
    cashEffect = roundCurrency(cashEffect * 0.55);
    modifiers.push("Health protection reduced the medical out-of-pocket burden.");
  } else if (card?.category === "health" && (learnedRecently || prepFlags.learningReady || prepFlags.reserveReady)) {
    cashEffect = roundCurrency(cashEffect * 0.85);
    modifiers.push("Recent preparation softened the health-cost shock.");
  }
  if (card?.id === "D1-06" && prepFlags.legacyReady) {
    cashEffect = roundCurrency(cashEffect * 0.75);
    modifiers.push("Family care planning reserve softened the emergency transfer to relatives.");
  }
  if (card?.category === "safety" && insuranceFlags.cyberCover) {
    cashEffect = roundCurrency(cashEffect + 450);
    modifiers.push("Cyber protection and account safeguards clawed back part of the fraud loss.");
  } else if (card?.category === "safety" && prepFlags.safetyReady) {
    cashEffect = roundCurrency(cashEffect + 300);
    modifiers.push("Recent safety confirmation reduced the loss from the safety event.");
  } else if (card?.category === "safety" && riskExposure > student.baseSalary * 0.5) {
    cashEffect = roundCurrency(cashEffect - 300);
    tags.push("Speculation Vulnerability");
    modifiers.push("High-risk exposure made the student more vulnerable to fraud or security loss.");
  }
  if (card?.category === "housing" && (emergencyBuffer >= 2 || prepFlags.reserveReady)) {
    cashEffect = roundCurrency(cashEffect * 0.7);
    modifiers.push("Emergency savings absorbed part of the household shock.");
  }
  if (card?.category === "housing" && student.house?.owned) {
    cashEffect = roundCurrency(cashEffect * 0.6);
    modifiers.push("Owning a home reduced rent-style housing shocks, although maintenance pressure remains.");
  }
  if (card?.category === "income" && prepFlags.learningReady) {
    incomeEffect = roundCurrency(incomeEffect + 0.03);
    modifiers.push("Recent learning investment improved the payoff from the income opportunity.");
  }
  if (card?.category === "income" && prepFlags.taxReady) {
    cashEffect = roundCurrency(cashEffect + 150);
    modifiers.push("Tax preparation preserved more of the income opportunity after admin and withholding friction.");
  }
  if (card?.category === "income" && prepFlags.retirementReady) {
    modifiers.push("Retirement planning kept long-term priorities visible even while short-term income changed.");
  }
  if (card?.category === "income" && (emergencyBuffer < 1 || prepFlags.debtStressed)) {
    incomeEffect = roundCurrency(incomeEffect - 0.02);
    modifiers.push("Weak cash buffer reduced the ability to capture the income opportunity.");
  }
  if (card?.category === "social" && prepFlags.debtStressed) {
    cashEffect = roundCurrency(cashEffect * 1.2);
    modifiers.push("Debt stress made the same social spending hit the budget harder.");
  }
  if (card?.category === "social" && prepFlags.retirementReady) {
    cashEffect = roundCurrency(cashEffect * 0.95);
    modifiers.push("Long-term saving discipline reduced status-driven overspending pressure.");
  }
  if ((card?.category === "social" || card?.id === "D2-04") && prepFlags.legacyReady) {
    cashEffect = roundCurrency(cashEffect * 0.8);
    modifiers.push("Family support reserve reduced the immediate pressure from social and care obligations.");
  }
  if (card?.category === "social" && student.family?.stage === "engaged") {
    cashEffect = roundCurrency(cashEffect * 1.15);
    modifiers.push("Active marriage preparation made social and relationship spending more expensive.");
  }
  if (card?.category === "social" && student.family?.stage === "married") {
    cashEffect = roundCurrency(cashEffect * 0.9);
    modifiers.push("A stable family plan reduced the shock from social spending and support requests.");
  }
  if (card?.category === "consumption" && prepFlags.deviceReady) {
    cashEffect = roundCurrency(cashEffect * 0.65);
    modifiers.push("Device maintenance preparation reduced the cost of the equipment shock.");
  }
  if (card?.id === "D3-04" && student.vehicle?.owned) {
    cashEffect = roundCurrency(cashEffect - 200);
    modifiers.push("Owning a vehicle increased exposure to transport fines and related friction costs.");
  }
  if (card?.category === "housing" && student.vehicle?.owned && !student.house?.owned) {
    cashEffect = roundCurrency(cashEffect * 1.1);
    modifiers.push("Vehicle ownership plus renting tightened the housing shock because fixed costs were already high.");
  }

  const result = {
    roll,
    category: card?.category ?? "unknown",
    card,
    appliedEffect: {
      cash: cashEffect,
      income: incomeEffect,
      debt: card?.baseEffect?.debt ?? 0,
      debtType: mapDiceDebtType(card),
      tags,
      modifiers
    }
  };

  room.round.dice[student.id] = result;
  return result;
}

function deriveRiskTags(student, metrics, marketExposure, debtState = [], context = {}) {
  const riskTags = [];

  if (metrics.debtRatio > 0.5) {
    riskTags.push("High Debt");
  }
  if (metrics.emergencyMonths < 1) {
    riskTags.push("Emergency Buffer Low");
  }
  if (metrics.dsr > 0.5) {
    riskTags.push("Debt Service Pressure");
  }
  if (marketExposure > student.baseSalary * 0.5) {
    riskTags.push("High Risk Exposure");
  }
  if (debtState.some((debt) => debt.status === "DELINQUENT")) {
    riskTags.push("Delinquent Debt");
  }
  if (debtState.some((debt) => debt.status === "DEFAULT")) {
    riskTags.push("Debt Default Risk");
  }
  if ((context.fixedCostRatio ?? 0) > 0.6) {
    riskTags.push("Fixed Cost Lock");
  }
  if ((context.familyStage ?? "single") === "married" && metrics.emergencyMonths < 1) {
    riskTags.push("Family Support Strain");
  }
  if ((context.ownsHouse ?? false) && metrics.dsr > 0.6) {
    riskTags.push("Property Cash Lock");
  }

  return riskTags;
}

function getLedgerForRound(student, roundNo) {
  const historyLedger = (student.history ?? []).find((entry) => entry.roundNo === roundNo);
  if (historyLedger) {
    return historyLedger;
  }
  if ((student.latestLedger?.roundNo ?? null) === roundNo) {
    return student.latestLedger;
  }
  return null;
}

function buildTopDrivers(ledger) {
  return [
    { label: "Living Cost", value: Math.abs(ledger?.cashFlow?.mandatoryLiving ?? 0) },
    {
      label: "Debt Service",
      value: Math.abs((ledger?.cashFlow?.minDebtPay ?? 0) + (ledger?.cashFlow?.loanInterest ?? 0))
    },
    { label: "Optional Spend", value: Math.abs(ledger?.cashFlow?.consume ?? 0) },
    { label: "Investment PnL", value: Math.abs(ledger?.cashFlow?.investmentPnl ?? 0) },
    { label: "Personal Events", value: Math.abs(ledger?.cashFlow?.dice ?? 0) }
  ]
    .sort((left, right) => right.value - left.value)
    .slice(0, 3);
}

function buildStudentRoundSnapshot(student, ledger) {
  return {
    studentId: student.id,
    displayName: student.displayName,
    roleId: student.roleId,
    finalScore: ledger.score?.finalScore ?? student.metrics?.finalScore ?? 0,
    netWorth: ledger.endWorth ?? student.metrics?.netWorth ?? 0,
    preparedness: ledger.prepSnapshot ?? student.prepFlags ?? createPrepFlags(),
    insuranceFlags: ledger.insuranceSnapshot ?? student.insuranceFlags ?? createInsuranceFlags(),
    family: ledger.familySnapshot ?? student.family ?? createFamilyState(),
    riskTags: ledger.riskTags ?? student.riskTags ?? [],
    diceEvent: ledger.diceEvent ?? null,
    debtChange: ledger.debtChange
      ? {
          debtBefore: ledger.debtChange.debtBefore,
          debtAfter: ledger.debtChange.debtAfter,
          bridgeShortfall: ledger.debtChange.bridgeShortfall ?? 0,
          bridgeTarget: ledger.debtChange.bridgeTarget ?? null,
          paidByDebt: ledger.debtChange.paidByDebt ?? {},
          items: ledger.debtChange.items ?? []
        }
      : null,
    topDrivers: buildTopDrivers(ledger),
    cashFlow: ledger.cashFlow ?? null,
    score: ledger.score ?? null,
    assetPnl: ledger.assetPnl ?? {},
    settlementSummary: ledger.settlementSummary ?? []
  };
}

function buildDiceKnowledge(diceResult) {
  if (!diceResult) {
    return null;
  }

  return {
    cardId: diceResult.card?.id ?? null,
    category: diceResult.category ?? "unknown",
    debtType: diceResult.appliedEffect?.debtType ?? null,
    title: diceResult.card?.title ?? "Dice Event",
    knowledgePoint: diceResult.card?.knowledgePoint ?? "",
    teacherNote: diceResult.card?.teacherNote ?? "",
    cashEffect: diceResult.appliedEffect?.cash ?? 0,
    modifiers: diceResult.appliedEffect?.modifiers ?? []
  };
}

function mapDiceDebtType(card) {
  if (!card?.id) {
    return "D-bridge";
  }
  if (card.category === "health") {
    return "D-medical";
  }
  if (card.category === "social" || card.id === "D2-04" || card.id === "D5-05") {
    return "D-social";
  }
  if (card.id === "D3-01" || card.id === "D3-02" || card.category === "consumption") {
    return "D-device";
  }
  return "D-bridge";
}

function computeOptionReturnPct(stockReturnPct, direction) {
  const stockReturn = stockReturnPct / 100;
  const raw = direction === "PUT" ? -10 * stockReturn - 0.05 : 10 * stockReturn - 0.05;
  return roundCurrency(Math.max(-1, Math.min(2, raw)) * 100);
}

function settleGamble(gamble, student, room) {
  if (!gamble || gamble.amount <= 0) {
    return {
      type: null,
      amount: 0,
      outcome: "NONE",
      pnl: 0
    };
  }

  const config = gambleCatalog[gamble.type] ?? gambleCatalog.LOTTERY;
  const seed = ((student.displayName.length * 37 + room.round.no * 17 + gamble.amount) % 1000) / 1000;
  const win = seed < config.winRate;
  const pnl = win ? roundCurrency(gamble.amount * config.winMultiple) : roundCurrency(-gamble.amount);

  return {
    type: gamble.type,
    amount: gamble.amount,
    outcome: win ? "WIN" : "LOSS",
    pnl
  };
}

function buildLedger(student, decision, room) {
  ensureStudentStructures(student);
  const event = getEventById(room.round.eventId);
  const market = buildMarket(room.round.eventId);
  const budget = buildBudget(student, room);
  syncLegacyDebt(student);
  const diceResult = room.round.dice[student.id] ?? null;
  const diceCash = diceResult?.appliedEffect?.cash ?? 0;
  const diceIncomeBoost = diceResult?.appliedEffect?.income ?? 0;
  const shortfallDebtType = diceResult?.appliedEffect?.debtType ?? "D-bridge";
  const consumeTotal = (decision.consume ?? []).reduce((sum, item) => sum + item.amount, 0);
  const borrow = decision.loan?.borrow ?? 0;
  const repay = decision.loan?.repay ?? 0;
  const allocateTo = decision.loan?.allocateTo ?? "D-consumer";
  const optionDirection = decision.option?.direction ?? "CALL";
  const buyVehicle = (decision.consume ?? []).some((item) => item.id === "C5");
  const buyHouse = (decision.consume ?? []).some((item) => item.id === "H1");
  const buyEngagement = (decision.consume ?? []).some((item) => item.id === "M1");
  const buyWedding = (decision.consume ?? []).some((item) => item.id === "W1");
  const nextAssets = cloneAssets(student);
  const tradeTotals = {};
  const assetPnl = {};
  const nextVehicle = student.vehicle
    ? { ...student.vehicle }
    : { owned: false, value: 0, monthlyPayment: 0, maintenance: 0 };
  const nextHouse = student.house
    ? { ...student.house }
    : { owned: false, value: 0, monthlyPayment: 0, maintenance: 0 };
  const nextFamily = student.family
    ? { ...student.family }
    : { stage: "single", monthlySupport: 0 };

  tradableAssets.forEach((assetId) => {
    const trade = (decision.invest ?? [])
      .filter((item) => item.asset === assetId)
      .reduce((sum, item) => sum + (item.action === "buy" ? item.amount : -item.amount), 0);

    tradeTotals[assetId] = trade;
    nextAssets[assetId] = Math.max(0, roundCurrency((nextAssets[assetId] ?? 0) + trade));
    const returnPct =
      assetId === "A8"
        ? computeOptionReturnPct(market.A6 ?? 0, optionDirection)
        : (market[assetId] ?? 0);
    assetPnl[assetId] = {
      amount: nextAssets[assetId],
      returnPct,
      pnl: roundCurrency(nextAssets[assetId] * (returnPct / 100))
    };
  });

  const gambleResult = settleGamble(decision.gamble, student, room);
  const totalInvestOutflow = tradableAssets.reduce((sum, assetId) => sum + Math.max(tradeTotals[assetId], 0), 0);
  const totalInvestInflow = tradableAssets.reduce((sum, assetId) => sum + Math.abs(Math.min(tradeTotals[assetId], 0)), 0);
  const debtBefore = student.debts.map((debt) => ({ ...debt }));
  const totalDebtBefore = roundCurrency(debtBefore.reduce((sum, debt) => sum + debt.principal, 0));
  const loanInterest = roundCurrency(debtBefore.reduce((sum, debt) => sum + debt.principal * debt.rateMonthly, 0));
  const fees = roundCurrency((totalInvestOutflow + totalInvestInflow) * 0.001);
  const salary = roundCurrency(student.baseSalary * (1 + diceIncomeBoost));
  const startWorth = student.metrics.netWorth;
  let vehicleDownPayment = 0;
  let vehicleCarryCost = 0;
  if (buyVehicle && !nextVehicle.owned) {
    nextVehicle.owned = true;
    nextVehicle.value = vehicleConfig.purchasePrice;
    nextVehicle.monthlyPayment = vehicleConfig.monthlyPayment;
    nextVehicle.maintenance = vehicleConfig.maintenance;
    vehicleDownPayment = vehicleConfig.downPayment;
    vehicleCarryCost = vehicleConfig.monthlyPayment + vehicleConfig.maintenance;
  } else if (nextVehicle.owned) {
    nextVehicle.value = roundCurrency(nextVehicle.value * (1 - vehicleConfig.depreciationRate));
    vehicleCarryCost = nextVehicle.monthlyPayment + nextVehicle.maintenance;
  }
  let houseDownPayment = 0;
  let houseCarryCost = 0;
  if (buyHouse && !nextHouse.owned) {
    nextHouse.owned = true;
    nextHouse.value = houseConfig.purchasePrice;
    nextHouse.monthlyPayment = houseConfig.monthlyPayment;
    nextHouse.maintenance = houseConfig.maintenance;
    houseDownPayment = houseConfig.downPayment;
    houseCarryCost = houseConfig.monthlyPayment + houseConfig.maintenance;
  } else if (nextHouse.owned) {
    nextHouse.value = roundCurrency(nextHouse.value * (1 + houseConfig.appreciationRate));
    houseCarryCost = nextHouse.monthlyPayment + nextHouse.maintenance;
  }
  let familySetupCost = 0;
  let familyCarryCost = 0;
  if (buyEngagement && nextFamily.stage === "single") {
    nextFamily.stage = "engaged";
    familySetupCost += familyConfig.engagementCost;
  }
  if (buyWedding && nextFamily.stage !== "married") {
    if (nextFamily.stage === "single") {
      familySetupCost += familyConfig.engagementCost;
    }
    familySetupCost += familyConfig.weddingCost;
    nextFamily.stage = "married";
    nextFamily.monthlySupport = familyConfig.monthlySupport;
  }
  if (nextFamily.stage === "married") {
    familyCarryCost = nextFamily.monthlySupport;
  }
  const endCashRaw = Number(
    (
      student.cash +
      salary -
      budget.mandatoryLiving -
      budget.minDebtPay -
      consumeTotal -
      vehicleDownPayment -
      houseDownPayment -
      familySetupCost -
      totalInvestOutflow +
      totalInvestInflow -
      fees -
      loanInterest +
      borrow -
      repay +
      -familyCarryCost +
      tradableAssets.reduce((sum, assetId) => sum + assetPnl[assetId].pnl, 0) +
      gambleResult.pnl +
      diceCash
    ).toFixed(2)
  );
  const bridgeShortfall = endCashRaw < 0 ? roundCurrency(Math.abs(endCashRaw)) : 0;
  const endInvested = roundCurrency(
    trackedAssets.reduce((sum, assetId) => {
      if (assetPnl[assetId]) {
        return sum + assetPnl[assetId].amount + assetPnl[assetId].pnl;
      }
      return sum + (nextAssets[assetId] ?? 0);
    }, 0)
  );
  const debtState = debtBefore.map((debt) => ({ ...debt }));
  const borrowDebt = getOrCreateDebt({ debts: debtState, assets: nextAssets, debtPrincipal: totalDebtBefore }, allocateTo);
  borrowDebt.principal = roundCurrency(borrowDebt.principal + borrow);
  borrowDebt.minPay = calcMinDebtPay(borrowDebt.principal);

  let remainingRepay = repay;
  const paidByDebt = new Map();
  const repayTargets =
    allocateTo && allocateTo !== "AUTO"
      ? [
          ...debtState.filter((debt) => debt.id === allocateTo),
          ...debtState.filter((debt) => debt.id !== allocateTo).sort((left, right) => right.rateMonthly - left.rateMonthly)
        ]
      : [...debtState].sort((left, right) => right.rateMonthly - left.rateMonthly);

  repayTargets.forEach((debt) => {
    if (remainingRepay <= 0) {
      return;
    }
    const applied = Math.min(debt.principal, remainingRepay);
    debt.principal = roundCurrency(debt.principal - applied);
    remainingRepay = roundCurrency(remainingRepay - applied);
    paidByDebt.set(debt.id, roundCurrency((paidByDebt.get(debt.id) ?? 0) + applied));
  });

  debtState.forEach((debt, index) => {
    const before = debtBefore.find((item) => item.id === debt.id) ?? debt;
    const paid = paidByDebt.get(debt.id) ?? 0;
    const requiredThisRound = Math.min(before.principal ?? 0, before.minPay ?? 0);

    if ((before.principal ?? 0) > 0) {
      if (paid + 0.001 < requiredThisRound) {
        debt.missedRounds = (before.missedRounds ?? 0) + 1;
      } else {
        debt.missedRounds = 0;
      }
    } else {
      debt.missedRounds = before.missedRounds ?? 0;
    }

    debt.minPay = calcMinDebtPay(debt.principal);
    if (debt.principal <= 0) {
      debt.status = "CLEAR";
      debt.missedRounds = 0;
    } else if ((debt.missedRounds ?? 0) >= 3) {
      debt.status = "DEFAULT";
    } else if ((debt.missedRounds ?? 0) > 0) {
      debt.status = "DELINQUENT";
    } else {
      debt.status = "ACTIVE";
    }

    debtState[index] = debt;
  });
  if (bridgeShortfall > 0) {
    const bridgeDebt = getOrCreateDebt(
      { debts: debtState, assets: nextAssets, debtPrincipal: totalDebtBefore },
      shortfallDebtType
    );
    bridgeDebt.principal = roundCurrency(bridgeDebt.principal + bridgeShortfall);
    bridgeDebt.minPay = calcMinDebtPay(bridgeDebt.principal);
    if (bridgeDebt.status === "CLEAR") {
      bridgeDebt.status = "ACTIVE";
    }
  }
  const nextDebtPrincipal = roundCurrency(debtState.reduce((sum, debt) => sum + debt.principal, 0));
  const endCash = Math.max(0, endCashRaw);
  const endWorth = roundCurrency(
    Math.max(endCash, 0) + Math.max(endInvested, 0) + (nextVehicle.value ?? 0) + (nextHouse.value ?? 0) - nextDebtPrincipal
  );
  const dsr = calcDebtServiceRatio(budget.minDebtPay + repay, salary);
  const debtRatio = calcDebtRatio(nextDebtPrincipal, endWorth);
  const emergencyMonths = calcEmergencyMonths(endCash, budget.mandatoryLiving);
  const marketExposure =
    (nextAssets.A5 ?? 0) + (nextAssets.A6 ?? 0) + (nextAssets.A7 ?? 0) + (nextAssets.A8 ?? 0) + gambleResult.amount;
  const fixedCostRatio = roundCurrency(
    (budget.mandatoryLiving + budget.minDebtPay + vehicleCarryCost + houseCarryCost + familyCarryCost) / Math.max(salary, 1)
  );
  const riskTags = deriveRiskTags(student, { debtRatio, dsr, emergencyMonths }, marketExposure, debtState, {
    fixedCostRatio,
    familyStage: nextFamily.stage,
    ownsHouse: nextHouse.owned
  });
  const scoreBreakdown = calcScoreBreakdown({
    netWorth: endWorth,
    baseSalary: student.baseSalary,
    debtRatio,
    dsr,
    emergencyMonths,
    consumeTotal
  });

  return {
    roundNo: room.round.no,
    startWorth,
    endWorth,
    cashFlow: {
      salary,
      mandatoryLiving: -budget.mandatoryLiving,
      minDebtPay: -budget.minDebtPay,
      consume: -consumeTotal,
      vehicleDownPayment: -vehicleDownPayment,
      vehicleCarryCost: -vehicleCarryCost,
      houseDownPayment: -houseDownPayment,
      houseCarryCost: -houseCarryCost,
      familySetupCost: -familySetupCost,
      familyCarryCost: -familyCarryCost,
      loanInterest: -loanInterest,
      fees: -fees,
      investmentPnl: roundCurrency(tradableAssets.reduce((sum, assetId) => sum + assetPnl[assetId].pnl, 0)),
      gamblePnl: gambleResult.pnl,
      borrow,
      repay: -repay,
      dice: diceCash,
      bridgeDebt: -bridgeShortfall
    },
    assetPnl,
    assetState: nextAssets,
    vehicleState: nextVehicle,
    houseState: nextHouse,
    familyState: nextFamily,
    gambleResult,
    debtChange: {
      debtBefore: totalDebtBefore,
      debtAfter: nextDebtPrincipal,
      borrow,
      repay,
      bridgeShortfall,
      bridgeTarget: shortfallDebtType,
      allocateTo,
      items: debtState,
      paidByDebt: Object.fromEntries(debtState.map((debt) => [debt.id, paidByDebt.get(debt.id) ?? 0]))
    },
    diceEvent: buildDiceKnowledge(diceResult),
    settlementSummary: [
      event ? `${event.title} shaped this round.` : "No macro event was applied.",
      `Budget pressure came from living cost ${budget.mandatoryLiving} and debt pay ${budget.minDebtPay}.`,
      `Fixed cost ratio ended at ${fixedCostRatio}.`,
      nextVehicle.owned
        ? `Vehicle cash lock this round was down payment ${vehicleDownPayment} and carrying cost ${vehicleCarryCost}.`
        : "No vehicle carrying cost applied this round.",
      nextHouse.owned
        ? `Housing cash lock this round was down payment ${houseDownPayment} and carrying cost ${houseCarryCost}.`
        : "No housing carrying cost applied this round.",
      nextFamily.stage === "married"
        ? `Family lifecycle cash cost was setup ${familySetupCost} and monthly support ${familyCarryCost}.`
        : nextFamily.stage === "engaged"
          ? `Family lifecycle cash cost was engagement setup ${familySetupCost}; no monthly family support yet.`
          : "No family lifecycle cash cost applied this round.",
      diceResult ? `Personal event: ${diceResult.card?.title ?? "Dice Event"}.` : "No personal event was rolled.",
      bridgeShortfall > 0
        ? `Cash ended below zero, so ${debtCatalog[shortfallDebtType]?.creditor ?? shortfallDebtType} increased by ${bridgeShortfall}.`
        : "Cash stayed above zero, so no emergency bridge debt was triggered.",
      gambleResult.type
        ? `Gamble outcome: ${gambleResult.type} ended with ${gambleResult.outcome} and pnl ${gambleResult.pnl}.`
        : "No gambling position was taken this round.",
      debtState.some((debt) => debt.status === "DEFAULT")
        ? "At least one debt reached DEFAULT because minimum payment was missed repeatedly."
        : debtState.some((debt) => debt.status === "DELINQUENT")
          ? "A debt became DELINQUENT because this round payment did not cover the minimum requirement."
          : "All active debts met the current minimum payment threshold."
    ],
    score: {
      finalScore: scoreBreakdown.finalScore,
      wealthScore: scoreBreakdown.wealthScore,
      healthScore: scoreBreakdown.healthScore,
      lifeScore: scoreBreakdown.lifeScore,
      debtRatio,
      dsr,
      emergencyMonths,
      fixedCostRatio
    },
    riskTags,
    debtState
  };
}

function buildRanking(students) {
  return students
    .map((student) => {
      ensureStudentStructures(student);
      syncLegacyDebt(student);
      return {
      studentId: student.id,
      displayName: student.displayName,
      roleId: student.roleId,
      netWorth: student.metrics.netWorth,
      debtRatio: student.metrics.debtRatio,
      dsr: student.metrics.dsr,
      emergencyMonths: student.metrics.emergencyMonths,
      finalScore: student.metrics.finalScore ?? 0,
      riskTags: student.riskTags
      };
    })
    .sort((left, right) => right.finalScore - left.finalScore || right.netWorth - left.netWorth)
    .map((row, index) => ({ rank: index + 1, ...row }));
}

function buildClassProfile(students) {
  const count = students.length;
  if (count === 0) {
    return {
      count: 0,
      avgNetWorth: 0,
      avgDebtRatio: 0,
      avgDsr: 0,
      avgEmergencyMonths: 0,
      avgScore: 0,
      preparedness: {
        learningReady: 0,
        healthReady: 0,
        deviceReady: 0,
        reserveReady: 0,
        safetyReady: 0,
        taxReady: 0,
        retirementReady: 0,
        legacyReady: 0,
        debtStressed: 0
      },
      insuranceCoverage: {
        healthCover: 0,
        accidentCover: 0,
        cyberCover: 0
      },
      vehiclesOwned: 0,
      homesOwned: 0,
      engagedStudents: 0,
      marriedStudents: 0,
      fixedCostLocked: 0,
      topRiskTags: []
    };
  }

  const totals = students.reduce(
    (accumulator, student) => {
      accumulator.netWorth += student.metrics.netWorth;
      accumulator.debtRatio += student.metrics.debtRatio;
      accumulator.dsr += student.metrics.dsr;
      accumulator.emergencyMonths += student.metrics.emergencyMonths;
      accumulator.finalScore += student.metrics.finalScore ?? 0;
      const prepFlags = student.prepFlags ?? createPrepFlags();
      accumulator.preparedness.learningReady += prepFlags.learningReady ? 1 : 0;
      accumulator.preparedness.healthReady += prepFlags.healthReady ? 1 : 0;
      accumulator.preparedness.deviceReady += prepFlags.deviceReady ? 1 : 0;
      accumulator.preparedness.reserveReady += prepFlags.reserveReady ? 1 : 0;
      accumulator.preparedness.safetyReady += prepFlags.safetyReady ? 1 : 0;
      accumulator.preparedness.taxReady += prepFlags.taxReady ? 1 : 0;
      accumulator.preparedness.retirementReady += prepFlags.retirementReady ? 1 : 0;
      accumulator.preparedness.legacyReady += prepFlags.legacyReady ? 1 : 0;
      accumulator.preparedness.debtStressed += prepFlags.debtStressed ? 1 : 0;
      const insuranceFlags = student.insuranceFlags ?? createInsuranceFlags();
      accumulator.insuranceCoverage.healthCover += insuranceFlags.healthCover ? 1 : 0;
      accumulator.insuranceCoverage.accidentCover += insuranceFlags.accidentCover ? 1 : 0;
      accumulator.insuranceCoverage.cyberCover += insuranceFlags.cyberCover ? 1 : 0;
      accumulator.vehiclesOwned += student.vehicle?.owned ? 1 : 0;
      accumulator.homesOwned += student.house?.owned ? 1 : 0;
      accumulator.engagedStudents += student.family?.stage === "engaged" ? 1 : 0;
      accumulator.marriedStudents += student.family?.stage === "married" ? 1 : 0;
      accumulator.fixedCostLocked += student.riskTags?.includes("Fixed Cost Lock") ? 1 : 0;
      student.riskTags.forEach((tag) => {
        accumulator.tags.set(tag, (accumulator.tags.get(tag) ?? 0) + 1);
      });
      return accumulator;
    },
    {
      netWorth: 0,
      debtRatio: 0,
      dsr: 0,
      emergencyMonths: 0,
      finalScore: 0,
      preparedness: {
        learningReady: 0,
        healthReady: 0,
        deviceReady: 0,
        reserveReady: 0,
        safetyReady: 0,
        taxReady: 0,
        retirementReady: 0,
        legacyReady: 0,
        debtStressed: 0
      },
      insuranceCoverage: {
        healthCover: 0,
        accidentCover: 0,
        cyberCover: 0
      },
      vehiclesOwned: 0,
      homesOwned: 0,
      engagedStudents: 0,
      marriedStudents: 0,
      fixedCostLocked: 0,
      tags: new Map()
    }
  );

  return {
    count,
    avgNetWorth: Number((totals.netWorth / count).toFixed(1)),
    avgDebtRatio: Number((totals.debtRatio / count).toFixed(2)),
    avgDsr: Number((totals.dsr / count).toFixed(2)),
    avgEmergencyMonths: Number((totals.emergencyMonths / count).toFixed(1)),
    avgScore: Number((totals.finalScore / count).toFixed(1)),
    preparedness: totals.preparedness,
    insuranceCoverage: totals.insuranceCoverage,
    vehiclesOwned: totals.vehiclesOwned,
    homesOwned: totals.homesOwned,
    engagedStudents: totals.engagedStudents,
    marriedStudents: totals.marriedStudents,
    fixedCostLocked: totals.fixedCostLocked,
    topRiskTags: Array.from(totals.tags.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 3)
      .map(([tag, hits]) => ({ tag, hits }))
  };
}

function buildTeachingSummary(students) {
  const driverMap = new Map([
    ["mandatoryLiving", { label: "Living Cost", total: 0 }],
    ["minDebtPay", { label: "Debt Service", total: 0 }],
    ["consume", { label: "Optional Spend", total: 0 }],
    ["investmentPnl", { label: "Investment PnL", total: 0 }],
    ["dice", { label: "Personal Events", total: 0 }],
    ["gamblePnl", { label: "High-Risk Outcome", total: 0 }]
  ]);
  const diceCategories = new Map();
  const modifierThemes = new Map();
  const riskTags = new Map();

  let protectedStudents = 0;
  let stressedStudents = 0;
  let highRiskStudents = 0;
  let supportiveHits = 0;
  let amplifiedHits = 0;
  let vehiclesOwned = 0;
  let homesOwned = 0;
  let engagedStudents = 0;
  let marriedStudents = 0;
  let fixedCostLocked = 0;

  students.forEach((student) => {
    const ledger = student.latestLedger;
    if (!ledger) {
      return;
    }

    Object.entries(ledger.cashFlow ?? {}).forEach(([key, value]) => {
      const bucket = driverMap.get(key);
      if (bucket) {
        bucket.total += Math.abs(value ?? 0);
      }
    });

    const diceCategory = ledger.diceEvent?.category;
    if (diceCategory) {
      diceCategories.set(diceCategory, (diceCategories.get(diceCategory) ?? 0) + 1);
    }

    const modifiers = ledger.diceEvent?.modifiers ?? [];
    if (modifiers.length > 0) {
      protectedStudents += 1;
    }
    modifiers.forEach((modifier) => {
      const normalized = modifier.toLowerCase();
      let theme = "Other";
      if (
        normalized.includes("reduced") ||
        normalized.includes("softened") ||
        normalized.includes("improved") ||
        normalized.includes("absorbed")
      ) {
        supportiveHits += 1;
      }
      if (
        normalized.includes("vulnerable") ||
        normalized.includes("harder") ||
        normalized.includes("reduced the ability") ||
        normalized.includes("little protection")
      ) {
        amplifiedHits += 1;
      }
      if (normalized.includes("learning")) {
        theme = "Learning";
      } else if (normalized.includes("safety")) {
        theme = "Safety";
      } else if (normalized.includes("emergency") || normalized.includes("buffer")) {
        theme = "Reserve";
      } else if (normalized.includes("debt")) {
        theme = "Debt Stress";
      }
      modifierThemes.set(theme, (modifierThemes.get(theme) ?? 0) + 1);
    });

    if ((student.prepFlags?.debtStressed ?? false) || ledger.riskTags?.includes("Debt Service Pressure")) {
      stressedStudents += 1;
    }
    if (ledger.riskTags?.includes("High Risk Exposure")) {
      highRiskStudents += 1;
    }
    if (student.vehicle?.owned) {
      vehiclesOwned += 1;
    }
    if (student.house?.owned) {
      homesOwned += 1;
    }
    if (student.family?.stage === "engaged") {
      engagedStudents += 1;
    }
    if (student.family?.stage === "married") {
      marriedStudents += 1;
    }
    if (ledger.riskTags?.includes("Fixed Cost Lock")) {
      fixedCostLocked += 1;
    }
    (ledger.riskTags ?? []).forEach((tag) => {
      riskTags.set(tag, (riskTags.get(tag) ?? 0) + 1);
    });
  });

  const topDrivers = Array.from(driverMap.values())
    .sort((left, right) => right.total - left.total)
    .slice(0, 3)
    .map((item) => ({ label: item.label, total: roundCurrency(item.total) }));
  const topRiskTags = Array.from(riskTags.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([tag, count]) => ({ tag, count }));
  const dominantDriver = topDrivers[0]?.label ?? "Budget Pressure";
  const dominantRisk = topRiskTags[0]?.tag ?? "No dominant risk";
  let lifecycleCue = "Lifecycle load stayed light; the round was driven more by decisions and shocks than by fixed commitments.";
  if (fixedCostLocked > 0) {
    lifecycleCue = "Fixed commitments started to dominate outcomes; compare students with similar income but very different locked costs.";
  } else if (homesOwned > 0 || vehiclesOwned > 0) {
    lifecycleCue = "Asset ownership is beginning to reshape cashflow; emphasize how carrying costs change resilience before returns appear.";
  } else if (engagedStudents > 0 || marriedStudents > 0) {
    lifecycleCue = "Family lifecycle choices are now visible; discuss how relationship milestones turn into recurring cash obligations.";
  }
  const teacherCue =
    supportiveHits >= amplifiedHits
      ? `Lead with ${dominantDriver}; preparedness softened more shocks than it amplified, but watch ${dominantRisk}.`
      : `Lead with ${dominantDriver}; stress amplifiers outweighed protection this round, especially around ${dominantRisk}.`;

  return {
    topDrivers,
    diceCategories: Array.from(diceCategories.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([category, count]) => ({ category, count })),
    modifierThemes: Array.from(modifierThemes.entries())
      .sort((left, right) => right[1] - left[1])
      .map(([theme, count]) => ({ theme, count })),
    protectionSummary: {
      protectedStudents,
      stressedStudents,
      highRiskStudents,
      supportiveHits,
      amplifiedHits
    },
    lifecycleLoadSummary: {
      vehiclesOwned,
      homesOwned,
      engagedStudents,
      marriedStudents,
      fixedCostLocked
    },
    lifecycleCue,
    topRiskTags,
    teacherCue
  };
}

function buildArchiveSnapshot(room) {
  return {
    id: crypto.randomUUID(),
    archivedAt: new Date().toISOString(),
    classroom: {
      id: room.id,
      code: room.code,
      name: room.name,
      teacherName: room.teacherName
    },
    round: {
      no: room.round.no,
      status: room.round.status,
      eventId: room.round.eventId
    },
    ranking: buildRanking(room.students),
    classProfile: buildClassProfile(room.students),
    teachingSummary: buildTeachingSummary(room.students),
    roundHistory: room.round.history
  };
}

function buildExportCsv(room) {
  const headers = [
    "rank",
    "display_name",
    "role_id",
    "net_worth",
    "final_score",
    "debt_ratio",
    "dsr",
    "fixed_cost_ratio",
    "emergency_months",
    "vehicle_owned",
    "house_owned",
    "learning_ready",
    "health_ready",
    "device_ready",
    "reserve_ready",
    "safety_ready",
    "tax_ready",
    "retirement_ready",
    "legacy_ready",
    "debt_stressed",
    "insured_health",
    "insured_accident",
    "insured_cyber",
    "family_stage",
    "risk_tags"
  ];
  const lines = buildRanking(room.students)
    .map((row) => ({
      row,
      student: room.students.find((student) => student.id === row.studentId)
    }))
    .map(({ row, student }) =>
    [
      row.rank,
      row.displayName,
      row.roleId,
      row.netWorth,
      row.finalScore,
      row.debtRatio,
      row.dsr,
      student?.latestLedger?.score?.fixedCostRatio ?? 0,
      row.emergencyMonths,
      student?.vehicle?.owned ? 1 : 0,
      student?.house?.owned ? 1 : 0,
      student?.prepFlags?.learningReady ? 1 : 0,
      student?.prepFlags?.healthReady ? 1 : 0,
      student?.prepFlags?.deviceReady ? 1 : 0,
      student?.prepFlags?.reserveReady ? 1 : 0,
      student?.prepFlags?.safetyReady ? 1 : 0,
      student?.prepFlags?.taxReady ? 1 : 0,
      student?.prepFlags?.retirementReady ? 1 : 0,
      student?.prepFlags?.legacyReady ? 1 : 0,
      student?.prepFlags?.debtStressed ? 1 : 0,
      student?.insuranceFlags?.healthCover ? 1 : 0,
      student?.insuranceFlags?.accidentCover ? 1 : 0,
      student?.insuranceFlags?.cyberCover ? 1 : 0,
      student?.family?.stage ?? "single",
      row.riskTags.join("|")
    ].join(",")
    );

  return [headers.join(","), ...lines].join("\n");
}

function buildTeacherPayload(room, session, moduleConfig) {
  const submittedCount = room.students.filter((student) => room.round.decisions[student.id]).length;

  return {
    token: session.token,
    user: {
      id: session.userId,
      role: "teacher",
      displayName: room.teacherName
    },
    classroom: {
      id: room.id,
      code: room.code,
      name: room.name,
      teacherName: room.teacherName,
      status: room.round.status
    },
    round: {
      ...room.round
    },
    moduleConfig,
    currentEvent: room.round.eventId ? getEventById(room.round.eventId) : null,
    eventOptions: macroEvents,
    submissionSummary: {
      submitted: submittedCount,
      total: room.students.length
    },
    students: room.students.map((student) => ({
      ...ensureStudentStructures(student),
      ...student,
      submitted: Boolean(room.round.decisions[student.id])
    })),
    ranking: buildRanking(room.students),
    classProfile: buildClassProfile(room.students),
    currentRoundSummary: room.round.history.at(-1)?.teachingSummary ?? null,
    archives: room.archives,
    roundHistory: room.round.history,
    exportVersion: "v1"
  };
}

function buildStudentPayload(room, session, moduleConfig) {
  const student = room.students.find((item) => item.id === session.userId);
  if (student) {
    ensureStudentStructures(student);
    syncLegacyDebt(student);
  }
  const currentEvent = room.round.eventId ? getEventById(room.round.eventId) : null;

  return {
    token: session.token,
    user: {
      id: session.userId,
      role: "student",
      displayName: student?.displayName ?? "Unknown"
    },
    classroom: {
      id: room.id,
      code: room.code,
      name: room.name,
      teacherName: room.teacherName,
      status: room.round.status
    },
    round: {
      ...room.round
    },
    moduleConfig,
    currentEvent,
    market: buildMarket(room.round.eventId),
    budget: student ? buildBudget(student, room) : null,
    currentDecision: student ? room.round.decisions[student.id] ?? null : null,
    currentDice: student ? room.round.dice[student.id] ?? null : null,
    latestLedger: student?.latestLedger ?? null,
    debts: student ? student.debts : [],
    chartSeries: student ? buildStudentChartSeries(student) : [],
    student,
    ranking: buildRanking(room.students).slice(0, 10),
    roundHistory: room.round.history ?? []
  };
}

function derivePrepFlags(student, decision, ledger) {
  const consumeIds = new Set((decision.consume ?? []).map((item) => item.id));
  return {
    learningReady: consumeIds.has("C3") || (student.prepFlags?.learningReady ?? false),
    healthReady: consumeIds.has("I1") || (student.prepFlags?.healthReady ?? false),
    deviceReady: consumeIds.has("T1") || (student.prepFlags?.deviceReady ?? false),
    reserveReady:
      consumeIds.has("R1") || (student.prepFlags?.reserveReady ?? false) || (ledger.score?.emergencyMonths ?? 0) >= 2,
    safetyReady:
      consumeIds.has("S1") ||
      (student.prepFlags?.safetyReady ?? false) ||
      (decision.riskAck ?? []).includes("A8") ||
      (decision.riskAck ?? []).includes("A9"),
    taxReady: consumeIds.has("X1") || (student.prepFlags?.taxReady ?? false),
    retirementReady: consumeIds.has("Q1") || (student.prepFlags?.retirementReady ?? false),
    legacyReady: consumeIds.has("L1") || (student.prepFlags?.legacyReady ?? false),
    debtStressed: ledger.debtState?.some((debt) => debt.status === "DELINQUENT" || debt.status === "DEFAULT") ?? false
  };
}

function deriveInsuranceFlags(student, decision) {
  const consumeIds = new Set((decision.consume ?? []).map((item) => item.id));
  return {
    healthCover: consumeIds.has("I1") || (student.insuranceFlags?.healthCover ?? false),
    accidentCover: consumeIds.has("P1") || (student.insuranceFlags?.accidentCover ?? false),
    cyberCover: consumeIds.has("P2") || (student.insuranceFlags?.cyberCover ?? false)
  };
}

function buildScreenPayload(room) {
  return {
    classroom: {
      code: room.code,
      name: room.name,
      teacherName: room.teacherName
    },
    round: {
      no: room.round.no,
      status: room.round.status,
      eventId: room.round.eventId
    },
    currentEvent: room.round.eventId ? getEventById(room.round.eventId) : null,
    ranking: buildRanking(room.students),
    classProfile: buildClassProfile(room.students),
    currentRoundSummary: room.round.history.at(-1)?.teachingSummary ?? null
  };
}

export function createMemoryStore(moduleConfig, options = {}) {
  const repository = options.repository ?? createInMemoryRepository();

  async function createRoom({ teacherName, roomName, roomCode }) {
    const requestedRoomCode = normalizeRoomCode(roomCode);
    if (requestedRoomCode) {
      const existingRoom = await repository.findRoomByCode(requestedRoomCode);
      if (existingRoom) {
        return { error: "ROOM_CODE_TAKEN" };
      }
    }

    const teacherUserId = crypto.randomUUID();
    const room = {
      id: crypto.randomUUID(),
      code: requestedRoomCode || `FIN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      name: roomName,
      teacherName,
      teacherUserId,
      round: createRound(),
      students: [],
      archives: []
    };

    const session = createSession("teacher", teacherUserId, room.id);
    await repository.saveRoom(room, { syncStudents: true, syncRound: true, syncArchives: true });
    await repository.saveSession(session);

    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function joinRoom({ roomCode, displayName, roleId }) {
    const room = await repository.findRoomByCode(normalizeRoomCode(roomCode));
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }
    if (room.round.status === "archived") {
      return { error: "ROOM_CLOSED" };
    }
    const normalizedDisplayName = String(displayName ?? "").trim().toLowerCase();
    const existingStudent = (room.students ?? []).find(
      (student) => student.displayName.trim().toLowerCase() === normalizedDisplayName
    );
    if (existingStudent) {
      return { error: "DISPLAY_NAME_TAKEN" };
    }
    if ((room.students?.length ?? 0) >= maxStudentsPerRoom) {
      return { error: "ROOM_FULL" };
    }

    const student = buildStudentState(displayName, roleId);
    room.students.push(student);
    await repository.saveRoom(room, { syncStudents: true, syncRound: false, syncArchives: false });

    const session = createSession("student", student.id, room.id);
    await repository.saveSession(session);

    return buildStudentPayload(room, session, moduleConfig);
  }

  async function rejoinStudent({ roomCode, displayName }) {
    const room = await repository.findRoomByCode(normalizeRoomCode(roomCode));
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }
    if (room.round.status === "archived") {
      return { error: "ROOM_CLOSED" };
    }

    const student = (room.students ?? []).find(
      (item) => item.displayName.trim().toLowerCase() === String(displayName ?? "").trim().toLowerCase()
    );
    if (!student) {
      return { error: "STUDENT_NOT_FOUND" };
    }

    const session = createSession("student", student.id, room.id);
    await repository.saveSession(session);

    return buildStudentPayload(room, session, moduleConfig);
  }

  async function rejoinTeacher({ roomCode, teacherName }) {
    const room = await repository.findRoomByCode(normalizeRoomCode(roomCode));
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }
    if (room.round.status === "archived") {
      return { error: "ROOM_CLOSED" };
    }
    if (!teacherName || room.teacherName.trim().toLowerCase() !== teacherName.trim().toLowerCase()) {
      return { error: "TEACHER_NAME_MISMATCH" };
    }

    if (!room.teacherUserId) {
      room.teacherUserId = crypto.randomUUID();
      await repository.saveRoom(room, { syncStudents: true, syncRound: false, syncArchives: false });
    }

    const session = createSession("teacher", room.teacherUserId, room.id);
    await repository.saveSession(session);

    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function openRound(token, eventId) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }
    if (room.round.status === "open" || room.round.status === "locked") {
      return { error: "ROUND_ALREADY_ACTIVE" };
    }
    if (room.round.status === "archived") {
      return { error: "ROUND_CLOSED" };
    }

    room.round.status = "open";
    room.round.eventId = eventId;
    room.round.decisions = {};
    room.round.dice = {};
    room.round.lockedAt = null;
    room.round.settledAt = null;
    await repository.saveRoom(room, { syncStudents: false, syncRound: true, syncArchives: false });

    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function setTeachingTopic(token, teachingTopic) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    room.round.teachingTopic = teachingTopic ?? null;
    await repository.saveRoom(room, { syncStudents: false, syncRound: true, syncArchives: false });
    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function lockRound(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }
    if (room.round.status !== "open") {
      return { error: "ROUND_NOT_OPEN" };
    }

    room.round.status = "locked";
    room.round.lockedAt = new Date().toISOString();
    await repository.saveRoom(room, { syncStudents: false, syncRound: true, syncArchives: false });
    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function settleRound(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }
    if (room.round.status !== "locked") {
      return { error: "ROUND_NOT_LOCKED" };
    }

    room.students = room.students.map((student) => {
      ensureStudentStructures(student);
      const decision =
        room.round.decisions[student.id] ?? {
          idempotencyKey: `auto-${room.round.id}`,
          consume: [],
          loan: { borrow: 0, repay: 0, allocateTo: null },
          invest: [],
          gamble: null,
          riskAck: [],
          submittedAt: null
        };

        const ledger = buildLedger(student, decision, room);
        const nextPrepFlags = derivePrepFlags(student, decision, ledger);
        const nextInsuranceFlags = deriveInsuranceFlags(student, decision);
        const nextFamily = ledger.familyState ?? student.family ?? createFamilyState();
        ledger.prepSnapshot = nextPrepFlags;
        ledger.insuranceSnapshot = nextInsuranceFlags;
        ledger.familySnapshot = nextFamily;
        const netCash = student.cash + Object.values(ledger.cashFlow ?? {}).reduce((sum, value) => sum + (value ?? 0), 0);

      return {
        ...student,
        cash: Math.max(0, Number(netCash.toFixed(2))),
        assets: ledger.assetState,
        vehicle: ledger.vehicleState,
        house: ledger.houseState,
          debts: ledger.debtState.map((debt) => ({ ...debt })),
          debtPrincipal: ledger.debtChange.debtAfter,
          prepFlags: nextPrepFlags,
          insuranceFlags: nextInsuranceFlags,
          family: nextFamily,
          metrics: {
          netWorth: ledger.endWorth,
          debtRatio: ledger.score.debtRatio,
          dsr: ledger.score.dsr,
          emergencyMonths: ledger.score.emergencyMonths,
          finalScore: ledger.score.finalScore
        },
        riskTags: ledger.riskTags,
        latestLedger: ledger,
        history: [...student.history, ledger]
      };
    });

    room.round.status = "settled";
    room.round.settledAt = new Date().toISOString();
    const ranking = buildRanking(room.students);
    const classProfile = buildClassProfile(room.students);
    const teachingSummary = buildTeachingSummary(room.students);
    room.round.history.push({
      roundNo: room.round.no,
      eventId: room.round.eventId,
      eventTitle: getEventById(room.round.eventId)?.title ?? "No Macro Event",
      settledAt: room.round.settledAt,
      rankingTop3: ranking.slice(0, 3),
      avgScore: classProfile.avgScore,
      submitted: Object.keys(room.round.decisions ?? {}).length,
      classProfile,
      teachingSummary
    });
    await repository.saveRoom(room, { syncStudents: true, syncRound: true, syncArchives: false });

    room.round = createNextRound(room.round);
    await repository.saveRoom(room, { syncStudents: false, syncRound: true, syncArchives: false });
    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function rollDice(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "student") {
      return { error: "UNAUTHORIZED" };
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    if (room.round.status !== "open") {
      return { error: "ROUND_NOT_OPEN" };
    }

    const student = room.students.find((item) => item.id === session.userId);
    if (!student) {
      return { error: "STUDENT_NOT_FOUND" };
    }

    buildDiceResult(student, room);
    await repository.saveRoom(room, { syncStudents: false, syncRound: true, syncArchives: false });
    return buildStudentPayload(room, session, moduleConfig);
  }

  async function submitDecision(token, payload) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "student") {
      return { error: "UNAUTHORIZED" };
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    if (room.round.status !== "open") {
      return { error: "ROUND_NOT_OPEN" };
    }

    const sanitizedPayload = sanitizeDecisionPayload(payload, moduleConfig);
    const existingDecision = room.round.decisions[session.userId];
    if (existingDecision?.idempotencyKey && existingDecision.idempotencyKey === sanitizedPayload.idempotencyKey) {
      return buildStudentPayload(room, session, moduleConfig);
    }

    room.round.decisions[session.userId] = {
      roundId: room.round.id,
      idempotencyKey: sanitizedPayload.idempotencyKey,
      consume: sanitizedPayload.consume ?? [],
      loan: sanitizedPayload.loan ?? { borrow: 0, repay: 0, allocateTo: null },
      invest: sanitizedPayload.invest ?? [],
      gamble: sanitizedPayload.gamble ?? null,
      riskAck: sanitizedPayload.riskAck ?? [],
      submittedAt: new Date().toISOString()
    };
    await repository.saveRoom(room, { syncStudents: false, syncRound: true, syncArchives: false });

    return buildStudentPayload(room, session, moduleConfig);
  }

  async function archiveRoom(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }
    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    const archive = buildArchiveSnapshot(room);
    room.archives = [archive, ...room.archives];
    room.round.status = "archived";
    await repository.saveRoom(room, { syncStudents: false, syncRound: true, syncArchives: true });
    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function cleanupStorage(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }
    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    const originalArchiveCount = room.archives?.length ?? 0;
    const originalHistoryCount = room.round.history?.length ?? 0;
    const preservedRoundEntry = (room.round.history ?? []).slice(-1)[0] ?? null;
    const preservedRoundNo = preservedRoundEntry?.roundNo ?? null;
    let removedStudentLedgers = 0;

    room.archives = [];
    room.round.history = preservedRoundEntry ? [preservedRoundEntry] : [];
    room.students = (room.students ?? []).map((student) => {
      const originalCount = student.history?.length ?? 0;
      const nextHistory = preservedRoundNo
        ? (student.history ?? []).filter((entry) => entry.roundNo === preservedRoundNo).slice(-1)
        : [];
      removedStudentLedgers += Math.max(0, originalCount - nextHistory.length);

      return {
        ...student,
        history: nextHistory,
        latestLedger: nextHistory[0] ?? student.latestLedger ?? null
      };
    });

    await repository.saveRoom(room, { syncStudents: true, syncRound: true, syncArchives: true });
    if (typeof repository.cleanupRoomStorage === "function") {
      await repository.cleanupRoomStorage(room.id, room.round.no);
    }

    return {
      ...(buildTeacherPayload(room, session, moduleConfig)),
      cleanupSummary: {
        removedArchives: originalArchiveCount,
        removedRoundHistory: Math.max(0, originalHistoryCount - room.round.history.length),
        removedStudentLedgers
      }
    };
  }

  async function resetRoom(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }
    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    room.round = createRound(1);
    room.students = (room.students ?? []).map((student) => {
      const role = roleConfig[student.roleId] ?? roleConfig.R1;
      return {
        ...student,
        cash: role.cash,
        assets: Object.fromEntries(trackedAssets.map((assetId) => [assetId, 0])),
        debts: [createDebt("D-consumer", 0)],
        debtPrincipal: 0,
        metrics: {
          netWorth: role.cash,
          debtRatio: 0,
          dsr: 0,
          emergencyMonths: calcEmergencyMonths(role.cash, 3600),
          finalScore: roundCurrency((role.cash / Math.max(role.salary, 1)) * 10)
        },
        riskTags: role.cash < 3600 ? ["Emergency Buffer Low"] : [],
        prepFlags: createPrepFlags(),
        insuranceFlags: createInsuranceFlags(),
        vehicle: {
          owned: false,
          value: 0,
          monthlyPayment: 0,
          maintenance: 0
        },
        house: {
          owned: false,
          value: 0,
          monthlyPayment: 0,
          maintenance: 0
        },
        family: createFamilyState(),
        latestLedger: null,
        history: []
      };
    });

    await repository.saveRoom(room, { syncStudents: true, syncRound: true, syncArchives: false });
    return buildTeacherPayload(room, session, moduleConfig);
  }

  async function exportRoom(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }
    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    return {
      fileName: `${room.code.toLowerCase()}-ranking.csv`,
      content: buildExportCsv(room)
    };
  }

  async function getTeacherHistory(token) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }
    if (typeof repository.getTeacherHistoryBundle === "function") {
      const bundle = await repository.getTeacherHistoryBundle(session.roomId);
      if (bundle?.classroom) {
        return bundle;
      }
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    return {
      classroom: {
        id: room.id,
        code: room.code,
        name: room.name
      },
      roundHistory: room.round.history ?? [],
      archives: room.archives ?? []
    };
  }

  async function getTeacherRoundDetail(token, roundNo) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "teacher") {
      return { error: "UNAUTHORIZED" };
    }
    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    let roundEntry = (room.round.history ?? []).find((item) => item.roundNo === roundNo) ?? null;

    let studentLedgers;
    let repositoryRound = null;
    if (typeof repository.getRoundLedgerBundle === "function") {
      const bundle = await repository.getRoundLedgerBundle(room.id, roundNo);
      if (bundle?.students?.length) {
        repositoryRound = bundle.round ?? null;
        studentLedgers = bundle.students
          .map((item) =>
            buildStudentRoundSnapshot(
              {
                id: item.studentId,
                displayName: item.displayName,
                roleId: item.roleId,
                prepFlags: item.ledger?.prepSnapshot ?? item.moduleFlags?.prepFlags ?? createPrepFlags(),
                insuranceFlags: item.ledger?.insuranceSnapshot ?? item.insuranceFlags ?? createInsuranceFlags(),
                family: item.ledger?.familySnapshot ?? item.moduleFlags?.family ?? createFamilyState(),
                riskTags: item.ledger?.riskTags ?? [],
                metrics: {}
              },
              item.ledger
            )
          )
          .sort((left, right) => right.finalScore - left.finalScore)
          .slice(0, 5);
      }
    }

    if (!roundEntry && repositoryRound) {
      roundEntry = {
        roundNo,
        eventId: repositoryRound.eventId,
        eventTitle: repositoryRound.eventTitle ?? "No Macro Event",
        settledAt: repositoryRound.settledAt,
        rankingTop3: repositoryRound.rankingTop3 ?? [],
        avgScore: repositoryRound.avgScore ?? 0,
        submitted: repositoryRound.submitted ?? 0,
        classProfile: repositoryRound.classProfile ?? null,
        teachingSummary: repositoryRound.teachingSummary ?? null
      };
    }

    if (!roundEntry) {
      return { error: "ROUND_NOT_FOUND" };
    }

    if (!studentLedgers) {
      studentLedgers = room.students
        .map((student) => {
          const ledger = getLedgerForRound(student, roundNo);
          if (!ledger) {
            return null;
          }
          return buildStudentRoundSnapshot(student, ledger);
        })
        .filter(Boolean)
        .sort((left, right) => right.finalScore - left.finalScore)
        .slice(0, 5);
    }

    return {
      classroom: {
        id: room.id,
        code: room.code,
        name: room.name
      },
      roundDetail: {
        ...roundEntry,
        event: getEventById(roundEntry.eventId) ?? null,
        students: studentLedgers
      }
    };
  }

  async function getStudentRoundDetail(token, roundNo) {
    const session = await repository.getSession(token);
    if (!session || session.role !== "student") {
      return { error: "UNAUTHORIZED" };
    }
    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return { error: "ROOM_NOT_FOUND" };
    }

    const student = room.students.find((item) => item.id === session.userId);
    if (!student) {
      return { error: "STUDENT_NOT_FOUND" };
    }

    let roundEntry = (room.round.history ?? []).find((item) => item.roundNo === roundNo) ?? null;
    let ledger = null;
    let preparedness = student.prepFlags ?? createPrepFlags();
    let bundleStudent = null;
    let repositoryRound = null;
    if (typeof repository.getStudentRoundBundle === "function") {
      const bundle = await repository.getStudentRoundBundle(room.id, student.id, roundNo);
      if (bundle?.student?.ledger) {
        repositoryRound = bundle.round ?? null;
        bundleStudent = bundle.student;
        ledger = bundle.student.ledger;
        preparedness = bundle.student.ledger.prepSnapshot ?? bundle.student.moduleFlags?.prepFlags ?? preparedness;
      }
    }
    if (!ledger) {
      ledger = getLedgerForRound(student, roundNo);
      preparedness = ledger?.prepSnapshot ?? preparedness;
    }

    if (!roundEntry && repositoryRound) {
      roundEntry = {
        roundNo,
        eventId: repositoryRound.eventId,
        eventTitle: repositoryRound.eventTitle ?? "No Macro Event",
        settledAt: repositoryRound.settledAt,
        rankingTop3: repositoryRound.rankingTop3 ?? [],
        avgScore: repositoryRound.avgScore ?? 0,
        submitted: repositoryRound.submitted ?? 0,
        classProfile: repositoryRound.classProfile ?? null,
        teachingSummary: repositoryRound.teachingSummary ?? null
      };
    }

    if (!roundEntry || !ledger) {
      return { error: "ROUND_NOT_FOUND" };
    }

    return {
      classroom: {
        id: room.id,
        code: room.code,
        name: room.name
      },
      student: {
        id: student.id,
        displayName: student.displayName,
        roleId: student.roleId
      },
      studentRoundDetail: {
        roundNo,
        eventTitle: roundEntry.eventTitle,
        settledAt: roundEntry.settledAt,
        event: getEventById(roundEntry.eventId) ?? null,
        topDrivers: buildTopDrivers(ledger),
        preparedness,
        insuranceFlags:
          ledger.insuranceSnapshot ??
          bundleStudent?.insuranceFlags ??
          student.insuranceFlags ??
          createInsuranceFlags(),
        family:
          ledger.familySnapshot ??
          bundleStudent?.moduleFlags?.family ??
          student.family ??
          createFamilyState(),
        riskTags: ledger.riskTags ?? student.riskTags ?? [],
        ledger
      }
    };
  }

  async function getScreenByRoomCode(roomCode) {
    if (typeof repository.getScreenBundle === "function") {
      const bundle = await repository.getScreenBundle(roomCode);
      if (bundle?.classroom) {
        const runtimeRoom = await repository.findRoomByCode(roomCode);
        if (!runtimeRoom) {
          return null;
        }

        return {
          classroom: {
            code: bundle.classroom.code,
            name: bundle.classroom.name,
            teacherName: bundle.classroom.teacherName
          },
          round: {
            ...bundle.round
          },
          moduleConfig,
          currentEvent: bundle.currentEvent ?? (runtimeRoom.round?.eventId ? getEventById(runtimeRoom.round.eventId) : null),
          ranking: buildRanking(runtimeRoom.students),
          classProfile: buildClassProfile(runtimeRoom.students),
          currentRoundSummary: bundle.currentRoundSummary ?? runtimeRoom.round.history.at(-1)?.teachingSummary ?? null
        };
      }
    }

    const room = await repository.findRoomByCode(roomCode);
    if (!room) {
      return null;
    }

    return buildScreenPayload(room);
  }

  async function getPayloadByToken(token) {
    if (!token) {
      return null;
    }

    const session = await repository.getSession(token);
    if (!session) {
      return null;
    }

    const room = await repository.getRoom(session.roomId);
    if (!room) {
      return null;
    }

    return session.role === "teacher"
      ? buildTeacherPayload(room, session, moduleConfig)
      : buildStudentPayload(room, session, moduleConfig);
  }

  async function getBootstrapState() {
    const rooms = await repository.listRooms();
    const firstRoom = rooms[0];
    if (!firstRoom) {
      return {
        classroom: null,
        round: null,
        moduleConfig
      };
    }

    return {
      classroom: {
        id: firstRoom.id,
        code: firstRoom.code,
        name: firstRoom.name,
        teacherName: firstRoom.teacherName,
        status: firstRoom.round.status
      },
      round: firstRoom.round,
      roundMeta: {
        total: null,
        manualEnd: true
      },
      moduleConfig
    };
  }

  return {
    createRoom,
    joinRoom,
    rejoinStudent,
    rejoinTeacher,
    setTeachingTopic,
    openRound,
    lockRound,
    settleRound,
    rollDice,
    submitDecision,
    archiveRoom,
    cleanupStorage,
    resetRoom,
    exportRoom,
    getTeacherHistory,
    getTeacherRoundDetail,
    getStudentRoundDetail,
    getScreenByRoomCode,
    getPayloadByToken,
    getBootstrapState
  };
}
