import { useEffect, useMemo, useState } from "react";

import {
  apiClient,
  ApiError,
  type CreateRoomInput,
  type JoinRoomInput,
  type SubmitDecisionInput
} from "./api/client";
import { ShellLayout } from "./components/layout/ShellLayout";
import {
  formatDebtPool,
  formatDebtStatus,
  formatDiceCategory,
  formatDriverLabel,
  formatFamilyStage,
  formatRiskTag,
  formatRoleLabel,
  formatRoundStatus,
  localizeDiceCard,
  localizeMacroEvent
} from "./lib/display";
import { AuthPage } from "./pages/AuthPage";
import { ScreenPage } from "./pages/ScreenPage";
import { TeacherArchivesPage } from "./pages/TeacherArchivesPage";
import { StudentDebtsPage } from "./pages/StudentDebtsPage";
import { StudentDecisionPage } from "./pages/StudentDecisionPage";
import { StudentDashboardPage } from "./pages/StudentDashboardPage";
import { StudentLedgerPage } from "./pages/StudentLedgerPage";
import { StudentRoundDetailPage } from "./pages/StudentRoundDetailPage";
import { TeacherPrintPage } from "./pages/TeacherPrintPage";
import { TeacherRoundDetailPage } from "./pages/TeacherRoundDetailPage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";

type SessionRole = "student" | "teacher";
type StudentView = "dashboard" | "decision" | "ledger" | "debts" | "round";
type TeacherView = "dashboard" | "archives" | "print" | "screen" | "round";

type SessionState = {
  token: string;
  role: SessionRole;
};

type ModuleConfig = {
  core?: {
    budget?: boolean;
    debt?: boolean;
    invest?: boolean;
    macro?: boolean;
    behavior?: boolean;
    anti_fraud?: boolean;
    dice?: boolean;
  };
  opt?: {
    education?: boolean;
    retirement?: boolean;
    tax?: boolean;
    legacy?: boolean;
    realestate?: boolean;
  };
};

type ClassroomPayload = {
  token: string;
  classroom: {
    id: string;
    code: string;
    name: string;
    teacherName: string;
    status: string;
  };
  round: {
    id: string;
    no: number;
    status: string;
    eventId: number | null;
    costIndex: number;
    total?: number;
  };
  moduleConfig: ModuleConfig;
  currentEvent?: {
    eventId: number;
    title: string;
    teachingPoints?: string[];
    transmissionPath?: string;
  } | null;
  market?: Record<string, number>;
  budget?: {
    salary: number;
    mandatoryLiving: number;
    minDebtPay: number;
    borrowLimit: number;
    vehicleMandatory?: number;
    housingMandatory?: number;
    familyMandatory?: number;
  } | null;
  currentDecision?: {
    idempotencyKey: string;
    submittedAt: string;
  } | null;
  currentDice?: {
    roll: number;
    category: string;
    card?: {
      id?: string;
      title?: string;
      knowledgePoint?: string;
    };
    appliedEffect?: {
      cash?: number;
      modifiers?: string[];
    };
  } | null;
  latestLedger?: {
    roundNo: number;
    startWorth: number;
    endWorth: number;
    cashFlow: Record<string, number>;
    vehicleState?: {
      owned?: boolean;
      value?: number;
      monthlyPayment?: number;
      maintenance?: number;
    };
    houseState?: {
      owned?: boolean;
      value?: number;
      monthlyPayment?: number;
      maintenance?: number;
    };
    familyState?: {
      stage?: string;
      monthlySupport?: number;
    };
    assetPnl?: Record<
      string,
      {
        amount: number;
        returnPct: number;
        pnl: number;
      }
    >;
    debtChange?: {
      debtBefore: number;
      debtAfter: number;
      borrow: number;
      repay: number;
      bridgeShortfall?: number;
      bridgeTarget?: string;
      allocateTo?: string;
      paidByDebt?: Record<string, number>;
      items?: Array<{
        id: string;
        type?: string;
        creditor: string;
        principal: number;
        minPay: number;
        rateMonthly: number;
        status: string;
      }>;
    };
    diceEvent?: {
      cardId?: string | null;
      category?: string;
      title: string;
      knowledgePoint: string;
      teacherNote?: string;
      cashEffect: number;
      modifiers?: string[];
    } | null;
    gambleResult?: {
      type: string | null;
      amount: number;
      outcome: string;
      pnl: number;
    };
    debtState?: Array<{
      id: string;
      type?: string;
      creditor: string;
      principal: number;
      minPay: number;
      rateMonthly: number;
      status: string;
    }>;
    settlementSummary: string[];
    score: {
      finalScore: number;
      wealthScore?: number;
      healthScore?: number;
      lifeScore?: number;
      debtRatio: number;
      dsr: number;
      emergencyMonths: number;
      fixedCostRatio?: number;
    };
    riskTags: string[];
  } | null;
  debts?: Array<{
    id: string;
    type?: string;
    creditor: string;
    principal: number;
    minPay: number;
    rateMonthly: number;
    missedRounds?: number;
    status: string;
  }>;
  chartSeries?: Array<{
    roundNo: number;
    netWorth: number;
    A4: number;
    A5: number;
    A6: number;
    A7: number;
    A8: number;
  }>;
  eventOptions?: Array<{
    eventId: number;
    title: string;
  }>;
  submissionSummary?: {
    submitted: number;
    total: number;
  };
  ranking?: Array<{
    rank: number;
    displayName: string;
    roleId: string;
    finalScore: number;
    netWorth: number;
    riskTags?: string[];
  }>;
  classProfile?: {
    count?: number;
    avgNetWorth: number;
    avgDebtRatio?: number;
    avgDsr?: number;
    avgEmergencyMonths: number;
    avgScore: number;
    preparedness?: {
      learningReady: number;
      healthReady?: number;
      deviceReady?: number;
      reserveReady: number;
      safetyReady: number;
      taxReady?: number;
      retirementReady?: number;
      legacyReady?: number;
      debtStressed: number;
    };
    insuranceCoverage?: {
      healthCover?: number;
      accidentCover?: number;
      cyberCover?: number;
    };
    vehiclesOwned?: number;
    homesOwned?: number;
    engagedStudents?: number;
    marriedStudents?: number;
    fixedCostLocked?: number;
    topRiskTags?: Array<{ tag: string; hits: number }>;
  };
  currentRoundSummary?: {
    topDrivers?: Array<{ label: string; total: number }>;
    diceCategories?: Array<{ category: string; count: number }>;
    modifierThemes?: Array<{ theme: string; count: number }>;
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
    topRiskTags?: Array<{ tag: string; count: number }>;
  } | null;
  roundDetail?: {
    roundNo: number;
    eventTitle?: string;
    settledAt: string;
    avgScore?: number;
    submitted?: number;
    teachingSummary?: {
      topDrivers?: Array<{ label: string; total: number }>;
      diceCategories?: Array<{ category: string; count: number }>;
      topRiskTags?: Array<{ tag: string; count: number }>;
      teacherCue?: string;
    };
    students?: Array<{
      studentId: string;
      displayName: string;
      roleId: string;
      finalScore: number;
      netWorth?: number;
      preparedness?: {
        learningReady?: boolean;
        healthReady?: boolean;
        deviceReady?: boolean;
        reserveReady?: boolean;
        safetyReady?: boolean;
        taxReady?: boolean;
        retirementReady?: boolean;
        legacyReady?: boolean;
        debtStressed?: boolean;
      };
      insuranceFlags?: {
        healthCover?: boolean;
        accidentCover?: boolean;
        cyberCover?: boolean;
      };
      family?: {
        stage?: string;
        monthlySupport?: number;
      };
      riskTags: string[];
      diceEvent?: {
        title?: string;
        category?: string;
        knowledgePoint?: string;
        teacherNote?: string;
        cashEffect?: number;
        modifiers?: string[];
      } | null;
      debtChange?: {
        debtBefore: number;
        debtAfter: number;
        bridgeShortfall?: number;
        bridgeTarget?: string | null;
        paidByDebt?: Record<string, number>;
        items?: Array<{
          id: string;
          type?: string;
          principal: number;
          status: string;
        }>;
      } | null;
      topDrivers?: Array<{ label: string; value: number }>;
      cashFlow?: Record<string, number> | null;
      score?: {
        finalScore?: number;
        wealthScore?: number;
        healthScore?: number;
        lifeScore?: number;
      } | null;
      assetPnl?: Record<
        string,
        {
          amount: number;
          returnPct: number;
          pnl: number;
        }
      >;
      settlementSummary?: string[];
    }>;
  };
  studentRoundDetail?: {
    roundNo: number;
    eventTitle?: string;
    settledAt: string;
    topDrivers?: Array<{ label: string; value: number }>;
    preparedness?: {
      learningReady?: boolean;
      healthReady?: boolean;
      deviceReady?: boolean;
      reserveReady?: boolean;
      safetyReady?: boolean;
      taxReady?: boolean;
      retirementReady?: boolean;
      legacyReady?: boolean;
      debtStressed?: boolean;
    };
    insuranceFlags?: {
      healthCover?: boolean;
      accidentCover?: boolean;
      cyberCover?: boolean;
    };
    family?: {
      stage?: string;
      monthlySupport?: number;
    };
    riskTags?: string[];
    ledger?: {
      roundNo?: number;
      startWorth: number;
      endWorth: number;
      cashFlow: Record<string, number>;
      assetPnl?: Record<
        string,
        {
          amount: number;
          returnPct: number;
          pnl: number;
        }
      >;
      debtChange?: {
        debtBefore: number;
        debtAfter: number;
        bridgeShortfall?: number;
        bridgeTarget?: string | null;
        items?: Array<{
          id: string;
          type?: string;
          creditor: string;
          principal: number;
          minPay: number;
          rateMonthly: number;
          status: string;
        }>;
        paidByDebt?: Record<string, number>;
      } | null;
      diceEvent?: {
        title: string;
        knowledgePoint: string;
        teacherNote?: string;
        cashEffect: number;
        modifiers?: string[];
      } | null;
      score?: {
        finalScore?: number;
        wealthScore?: number;
        healthScore?: number;
        lifeScore?: number;
        debtRatio?: number;
        dsr?: number;
        emergencyMonths?: number;
        fixedCostRatio?: number;
      };
      settlementSummary?: string[];
      familyState?: {
        stage?: string;
        monthlySupport?: number;
      };
    } | null;
  };
  archives?: Array<{
    id: string;
    archivedAt: string;
    classroom: {
      code: string;
      name: string;
    };
    round: {
      no: number;
      status: string;
    };
    ranking?: Array<{
      rank: number;
      displayName: string;
      finalScore: number;
    }>;
    classProfile?: {
      avgScore: number;
      avgNetWorth: number;
    };
    teachingSummary?: {
      topDrivers?: Array<{ label: string; total: number }>;
      topRiskTags?: Array<{ tag: string; count: number }>;
    };
  }>;
  roundHistory?: Array<{
    roundNo: number;
    eventId?: number;
    eventTitle?: string;
    settledAt: string;
    avgScore?: number;
    submitted?: number;
    classProfile?: {
      avgEmergencyMonths?: number;
      avgDsr?: number;
    };
    teachingSummary?: {
      topDrivers?: Array<{ label: string; total: number }>;
      diceCategories?: Array<{ category: string; count: number }>;
      modifierThemes?: Array<{ theme: string; count: number }>;
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
      topRiskTags?: Array<{ tag: string; count: number }>;
    };
    rankingTop3?: Array<{
      rank: number;
      displayName: string;
      finalScore: number;
    }>;
  }>;
  exportVersion?: string;
  user: {
    id: string;
    role: SessionRole;
    displayName: string;
  };
  student?: {
    id: string;
    displayName: string;
    roleId: string;
    baseSalary: number;
    cash: number;
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
    prepFlags?: {
      learningReady: boolean;
      healthReady?: boolean;
      deviceReady?: boolean;
      reserveReady: boolean;
      safetyReady: boolean;
      taxReady?: boolean;
      retirementReady?: boolean;
      legacyReady?: boolean;
      debtStressed: boolean;
    };
    insuranceFlags?: {
      healthCover?: boolean;
      accidentCover?: boolean;
      cyberCover?: boolean;
    };
    metrics: {
      netWorth: number;
      debtRatio: number;
      dsr: number;
      emergencyMonths: number;
      finalScore?: number;
    };
    riskTags: string[];
  };
  students?: Array<{
    id: string;
    displayName: string;
    roleId: string;
    baseSalary: number;
    submitted?: boolean;
  }>;
};

const STORAGE_KEY = "finance-rebuild-session";

function readStoredSession(): SessionState | null {
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionState;
  } catch {
    return null;
  }
}

function getApiErrorMessage(action: string, error: unknown): string {
  if (error instanceof ApiError) {
    const code = error.code ?? "";
    const messages: Record<string, string> = {
      ROOM_NOT_FOUND: "未找到课堂。",
      ROOM_CLOSED: "该课堂已关闭，不能再加入新学生。",
      ROOM_FULL: "该课堂人数已达上限。",
      DISPLAY_NAME_TAKEN: "该显示名称已被本课堂其他学生使用。",
      ROUND_NOT_OPEN: "本回合还未开放。",
      ROUND_NOT_LOCKED: "教师需要先锁定回合，才能结算。",
      ROUND_ALREADY_ACTIVE: "当前已有进行中的回合，请先锁定或结算。",
      ROUND_CLOSED: "该课堂已完成或已归档。",
      INVALID_ROOM_INPUT: "请填写教师姓名和课堂名称。",
      INVALID_JOIN_INPUT: "请填写课堂码、名称和角色。",
      INVALID_DECISION_INPUT: "决策内容不完整。",
      UNAUTHORIZED: "当前会话已失效，请重新进入课堂。"
    };

    return messages[code] ?? `${action}失败（${code || error.status}）。`;
  }

  return `${action}失败。`;
}

function localizePayload(nextPayload: ClassroomPayload): ClassroomPayload {
  const localizeRoundHistory = nextPayload.roundHistory?.map((item) => ({
    ...item,
    eventTitle:
      localizeMacroEvent({
        eventId: item.eventId,
        title: item.eventTitle
      })?.title ?? item.eventTitle,
    teachingSummary: item.teachingSummary
      ? {
          ...item.teachingSummary,
          topDrivers: item.teachingSummary.topDrivers?.map((entry) => ({
            ...entry,
            label: formatDriverLabel(entry.label)
          })),
          diceCategories: item.teachingSummary.diceCategories?.map((entry) => ({
            ...entry,
            category: formatDiceCategory(entry.category)
          })),
          topRiskTags: item.teachingSummary.topRiskTags?.map((entry) => ({
            ...entry,
            tag: formatRiskTag(entry.tag)
          }))
        }
      : item.teachingSummary
  }));

  return {
    ...nextPayload,
    classroom: {
      ...nextPayload.classroom,
      status: formatRoundStatus(nextPayload.classroom.status)
    },
    round: {
      ...nextPayload.round,
      status: formatRoundStatus(nextPayload.round.status)
    },
    currentEvent: nextPayload.currentEvent
      ? {
          ...nextPayload.currentEvent,
          ...localizeMacroEvent(nextPayload.currentEvent)
        }
      : nextPayload.currentEvent,
    currentDice: nextPayload.currentDice
      ? {
          ...nextPayload.currentDice,
          category: formatDiceCategory(nextPayload.currentDice.category),
          card: nextPayload.currentDice.card
            ? {
                ...nextPayload.currentDice.card,
                ...localizeDiceCard({
                  id: (nextPayload.currentDice.card as { id?: string }).id,
                  title: nextPayload.currentDice.card.title,
                  knowledgePoint: nextPayload.currentDice.card.knowledgePoint
                })
              }
            : undefined
        }
      : nextPayload.currentDice,
    latestLedger: nextPayload.latestLedger
      ? {
          ...nextPayload.latestLedger,
          riskTags: nextPayload.latestLedger.riskTags.map((tag) => formatRiskTag(tag)),
          settlementSummary: nextPayload.latestLedger.settlementSummary.map((item) => formatDriverLabel(item)),
          familyState: nextPayload.latestLedger.familyState
            ? {
                ...nextPayload.latestLedger.familyState,
                stage: formatFamilyStage(nextPayload.latestLedger.familyState.stage)
              }
            : nextPayload.latestLedger.familyState,
          debtChange: nextPayload.latestLedger.debtChange
            ? {
                ...nextPayload.latestLedger.debtChange,
                allocateTo: formatDebtPool(nextPayload.latestLedger.debtChange.allocateTo),
                bridgeTarget: formatDebtPool(nextPayload.latestLedger.debtChange.bridgeTarget),
                items: nextPayload.latestLedger.debtChange.items?.map((item) => ({
                  ...item,
                  type: formatDebtPool(item.type),
                  creditor: formatDebtPool(item.creditor),
                  status: formatDebtStatus(item.status)
                }))
              }
            : nextPayload.latestLedger.debtChange,
          diceEvent: nextPayload.latestLedger.diceEvent
            ? {
                ...nextPayload.latestLedger.diceEvent,
                ...localizeDiceCard({
                  id: nextPayload.latestLedger.diceEvent.cardId ?? undefined,
                  title: nextPayload.latestLedger.diceEvent.title,
                  knowledgePoint: nextPayload.latestLedger.diceEvent.knowledgePoint,
                  teacherNote: nextPayload.latestLedger.diceEvent.teacherNote
                })
              }
            : nextPayload.latestLedger.diceEvent
        }
      : nextPayload.latestLedger,
    eventOptions: nextPayload.eventOptions?.map((event) => ({
      ...event,
      ...localizeMacroEvent(event)
    })),
    ranking: nextPayload.ranking?.map((item) => ({
      ...item,
      roleId: formatRoleLabel(item.roleId)
    })),
    classProfile: nextPayload.classProfile
      ? {
          ...nextPayload.classProfile,
          topRiskTags: nextPayload.classProfile.topRiskTags?.map((item) => ({
            ...item,
            tag: formatRiskTag(item.tag)
          }))
        }
      : nextPayload.classProfile,
    roundDetail: nextPayload.roundDetail
      ? {
          ...nextPayload.roundDetail,
          eventTitle:
            localizeMacroEvent({
              title: nextPayload.roundDetail.eventTitle
            })?.title ?? nextPayload.roundDetail.eventTitle,
          teachingSummary: nextPayload.roundDetail.teachingSummary
            ? {
                ...nextPayload.roundDetail.teachingSummary,
                topDrivers: nextPayload.roundDetail.teachingSummary.topDrivers?.map((entry) => ({
                  ...entry,
                  label: formatDriverLabel(entry.label)
                })),
                diceCategories: nextPayload.roundDetail.teachingSummary.diceCategories?.map((entry) => ({
                  ...entry,
                  category: formatDiceCategory(entry.category)
                })),
                topRiskTags: nextPayload.roundDetail.teachingSummary.topRiskTags?.map((entry) => ({
                  ...entry,
                  tag: formatRiskTag(entry.tag)
                }))
              }
            : nextPayload.roundDetail.teachingSummary,
          students: nextPayload.roundDetail.students?.map((student) => ({
            ...student,
            roleId: formatRoleLabel(student.roleId),
            riskTags: student.riskTags.map((tag) => formatRiskTag(tag)),
            family: student.family
              ? {
                  ...student.family,
                  stage: formatFamilyStage(student.family.stage)
                }
              : student.family,
            diceEvent: student.diceEvent
              ? {
                  ...student.diceEvent,
                  category: formatDiceCategory(student.diceEvent.category),
                  ...localizeDiceCard({
                    title: student.diceEvent.title,
                    knowledgePoint: student.diceEvent.knowledgePoint,
                    teacherNote: student.diceEvent.teacherNote
                  })
                }
              : student.diceEvent,
            debtChange: student.debtChange
              ? {
                  ...student.debtChange,
                  bridgeTarget: formatDebtPool(student.debtChange.bridgeTarget ?? undefined),
                  items: student.debtChange.items?.map((item) => ({
                    ...item,
                    type: formatDebtPool(item.type),
                    status: formatDebtStatus(item.status)
                  }))
                }
              : student.debtChange,
            topDrivers: student.topDrivers?.map((item) => ({
              ...item,
              label: formatDriverLabel(item.label)
            }))
          }))
        }
      : nextPayload.roundDetail,
    studentRoundDetail: nextPayload.studentRoundDetail
      ? {
          ...nextPayload.studentRoundDetail,
          eventTitle:
            localizeMacroEvent({
              title: nextPayload.studentRoundDetail.eventTitle
            })?.title ?? nextPayload.studentRoundDetail.eventTitle,
          family: nextPayload.studentRoundDetail.family
            ? {
                ...nextPayload.studentRoundDetail.family,
                stage: formatFamilyStage(nextPayload.studentRoundDetail.family.stage)
              }
            : nextPayload.studentRoundDetail.family,
          riskTags: nextPayload.studentRoundDetail.riskTags?.map((tag) => formatRiskTag(tag)),
          topDrivers: nextPayload.studentRoundDetail.topDrivers?.map((item) => ({
            ...item,
            label: formatDriverLabel(item.label)
          })),
          ledger: nextPayload.studentRoundDetail.ledger
            ? {
                ...nextPayload.studentRoundDetail.ledger,
                settlementSummary: nextPayload.studentRoundDetail.ledger.settlementSummary?.map((item) =>
                  formatDriverLabel(item)
                ),
                familyState: nextPayload.studentRoundDetail.ledger.familyState
                  ? {
                      ...nextPayload.studentRoundDetail.ledger.familyState,
                      stage: formatFamilyStage(nextPayload.studentRoundDetail.ledger.familyState.stage)
                    }
                  : nextPayload.studentRoundDetail.ledger.familyState,
                debtChange: nextPayload.studentRoundDetail.ledger.debtChange
                  ? {
                      ...nextPayload.studentRoundDetail.ledger.debtChange,
                      bridgeTarget: formatDebtPool(nextPayload.studentRoundDetail.ledger.debtChange.bridgeTarget ?? undefined),
                      items: nextPayload.studentRoundDetail.ledger.debtChange.items?.map((item) => ({
                        ...item,
                        type: formatDebtPool(item.type),
                        creditor: formatDebtPool(item.creditor),
                        status: formatDebtStatus(item.status)
                      }))
                    }
                  : nextPayload.studentRoundDetail.ledger.debtChange,
                diceEvent: nextPayload.studentRoundDetail.ledger.diceEvent
                  ? {
                      ...nextPayload.studentRoundDetail.ledger.diceEvent,
                      ...localizeDiceCard({
                        title: nextPayload.studentRoundDetail.ledger.diceEvent.title,
                        knowledgePoint: nextPayload.studentRoundDetail.ledger.diceEvent.knowledgePoint,
                        teacherNote: nextPayload.studentRoundDetail.ledger.diceEvent.teacherNote
                      })
                    }
                  : nextPayload.studentRoundDetail.ledger.diceEvent
              }
            : nextPayload.studentRoundDetail.ledger
        }
      : nextPayload.studentRoundDetail,
    archives: nextPayload.archives?.map((archive) => ({
      ...archive,
      round: {
        ...archive.round,
        status: formatRoundStatus(archive.round.status)
      }
    })),
    roundHistory: localizeRoundHistory,
    currentRoundSummary: nextPayload.currentRoundSummary
      ? {
          ...nextPayload.currentRoundSummary,
          topDrivers: nextPayload.currentRoundSummary.topDrivers?.map((item) => ({
            ...item,
            label: formatDriverLabel(item.label)
          })),
          diceCategories: nextPayload.currentRoundSummary.diceCategories?.map((item) => ({
            ...item,
            category: formatDiceCategory(item.category)
          })),
          topRiskTags: nextPayload.currentRoundSummary.topRiskTags?.map((item) => ({
            ...item,
            tag: formatRiskTag(item.tag)
          }))
        }
      : nextPayload.currentRoundSummary,
    student: nextPayload.student
      ? {
          ...nextPayload.student,
          roleId: formatRoleLabel(nextPayload.student.roleId),
          riskTags: nextPayload.student.riskTags.map((tag) => formatRiskTag(tag)),
          family: nextPayload.student.family
            ? {
                ...nextPayload.student.family,
                stage: formatFamilyStage(nextPayload.student.family.stage)
              }
            : nextPayload.student.family
        }
      : nextPayload.student,
    students: nextPayload.students?.map((student) => ({
      ...student,
      roleId: formatRoleLabel(student.roleId)
    }))
  };
}

export function App() {
  const [session, setSession] = useState<SessionState | null>(() => readStoredSession());
  const [payload, setPayload] = useState<ClassroomPayload | null>(null);
  const [historyPayload, setHistoryPayload] = useState<ClassroomPayload | null>(null);
  const [roundDetailPayload, setRoundDetailPayload] = useState<ClassroomPayload | null>(null);
  const [studentRoundDetailPayload, setStudentRoundDetailPayload] = useState<ClassroomPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentView, setStudentView] = useState<StudentView>("dashboard");
  const [teacherView, setTeacherView] = useState<TeacherView>("dashboard");
  const [screenPayload, setScreenPayload] = useState<ClassroomPayload | null>(null);

  useEffect(() => {
    if (!session) {
      setPayload(null);
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    apiClient
      .getMe<ClassroomPayload>(session.token)
      .then((nextPayload) => {
        if (!cancelled) {
          setPayload(localizePayload(nextPayload));
        }
      })
      .catch(() => {
        if (!cancelled) {
          window.sessionStorage.removeItem(STORAGE_KEY);
          setSession(null);
          setPayload(null);
          setHistoryPayload(null);
          setRoundDetailPayload(null);
          setStudentRoundDetailPayload(null);
          setError("会话已过期，请重新进入课堂。");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setInterval(() => {
      apiClient
        .getMe<ClassroomPayload>(session.token)
        .then((nextPayload) => {
          setPayload(localizePayload(nextPayload));
        })
        .catch(() => {
          window.sessionStorage.removeItem(STORAGE_KEY);
          setSession(null);
          setPayload(null);
          setHistoryPayload(null);
          setRoundDetailPayload(null);
          setStudentRoundDetailPayload(null);
          setError("会话已过期，请重新进入课堂。");
        });
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [session]);

  useEffect(() => {
    if (teacherView !== "screen" || !payload?.classroom.code) {
      return;
    }

    const timer = window.setInterval(() => {
      apiClient
        .getScreen<ClassroomPayload>({ roomCode: payload.classroom.code })
        .then((nextScreen) => {
          setScreenPayload(localizePayload(nextScreen));
        })
        .catch(() => {
          setError("刷新大屏失败。");
        });
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [teacherView, payload?.classroom.code]);

  useEffect(() => {
    if (teacherView !== "archives" || !session || session.role !== "teacher") {
      return;
    }

    const timer = window.setInterval(() => {
      apiClient
        .getTeacherHistory<ClassroomPayload>(session.token)
        .then((nextHistory) => {
          setHistoryPayload(localizePayload(nextHistory));
        })
        .catch(() => {
          setError("刷新教师历史记录失败。");
        });
    }, 7000);

    return () => {
      window.clearInterval(timer);
    };
  }, [teacherView, session]);

  const subtitle = useMemo(() => {
    if (!session || !payload) {
      return "支持教师建房、学生入房、掷骰子、开回合、锁定、结算、债务查看和决策提交流程。";
    }

    return `课堂 ${payload.classroom.code} | 第 ${payload.round.no} 回合 | 状态 ${payload.round.status}`;
  }, [payload, session]);

  async function handleCreateRoom(input: CreateRoomInput) {
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.createRoom<ClassroomPayload>(input);
      const nextSession: SessionState = { token: nextPayload.token, role: "teacher" };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setPayload(localizePayload(nextPayload));
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setTeacherView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("创建课堂", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinRoom(input: JoinRoomInput) {
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.joinRoom<ClassroomPayload>(input);
      const nextSession: SessionState = { token: nextPayload.token, role: "student" };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setPayload(localizePayload(nextPayload));
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setStudentView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("加入课堂", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleArchiveRoom() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.archiveRoom<ClassroomPayload>(session.token);
      setPayload(localizePayload(nextPayload));
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
    } catch (caughtError) {
      setError(getApiErrorMessage("归档课堂", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleCleanupStorage() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.cleanupStorage<ClassroomPayload>(session.token);
      setPayload(localizePayload(nextPayload));
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setTeacherView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("清理存储", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetRoom() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.resetRoom<ClassroomPayload>(session.token);
      setPayload(localizePayload(nextPayload));
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setTeacherView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("重置课堂", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleExportRoom() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const csv = await apiClient.exportRoom(session.token);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download = `${payload?.classroom.code?.toLowerCase() ?? "classroom"}-ranking.csv`;
      link.click();
      URL.revokeObjectURL(href);
    } catch (caughtError) {
      setError(getApiErrorMessage("导出 CSV", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenRound(eventId: number) {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.openRound<ClassroomPayload>(session.token, { eventId });
      setPayload(localizePayload(nextPayload));
    } catch (caughtError) {
      setError(getApiErrorMessage("开放回合", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleLockRound() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.lockRound<ClassroomPayload>(session.token);
      setPayload(localizePayload(nextPayload));
    } catch (caughtError) {
      setError(getApiErrorMessage("锁定回合", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleSettleRound() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.settleRound<ClassroomPayload>(session.token);
      setPayload(localizePayload(nextPayload));
    } catch (caughtError) {
      setError(getApiErrorMessage("结算回合", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleRollDice() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.rollDice<ClassroomPayload>(session.token);
      setPayload(localizePayload(nextPayload));
    } catch (caughtError) {
      setError(getApiErrorMessage("掷骰子", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDecision(input: SubmitDecisionInput) {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.submitDecision<ClassroomPayload>(session.token, input);
      setPayload(localizePayload(nextPayload));
      setStudentRoundDetailPayload(null);
      setStudentView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("提交决策", caughtError));
    } finally {
      setLoading(false);
    }
  }

  function handleRefresh() {
    setSession((current) => (current ? { ...current } : current));
  }

  function handleLogout() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setPayload(null);
    setHistoryPayload(null);
    setRoundDetailPayload(null);
    setStudentRoundDetailPayload(null);
    setError(null);
    setStudentView("dashboard");
    setTeacherView("dashboard");
    setScreenPayload(null);
  }

  async function handleOpenArchives() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextHistory = await apiClient.getTeacherHistory<ClassroomPayload>(session.token);
      setHistoryPayload(localizePayload(nextHistory));
      setTeacherView("archives");
    } catch (caughtError) {
      setError(getApiErrorMessage("加载教师历史", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshArchives() {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextHistory = await apiClient.getTeacherHistory<ClassroomPayload>(session.token);
      setHistoryPayload(localizePayload(nextHistory));
    } catch (caughtError) {
      setError(getApiErrorMessage("刷新教师历史", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenRoundDetail(roundNo: number) {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const nextDetail = await apiClient.getTeacherRoundDetail<ClassroomPayload>(session.token, roundNo);
      setRoundDetailPayload(localizePayload(nextDetail));
      setTeacherView("round");
    } catch (caughtError) {
      setError(getApiErrorMessage("加载回合详情", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenStudentRoundDetail(roundNo: number) {
    if (!session || session.role !== "student") return;
    setLoading(true);
    setError(null);
    try {
      const nextDetail = await apiClient.getStudentRoundDetail<ClassroomPayload>(session.token, roundNo);
      setStudentRoundDetailPayload(localizePayload(nextDetail));
      setStudentView("round");
    } catch (caughtError) {
      setError(getApiErrorMessage("加载学生回合复盘", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenScreen() {
    const roomCode = payload?.classroom.code;
    if (!roomCode) return;
    setLoading(true);
    setError(null);
    try {
      const nextScreen = await apiClient.getScreen<ClassroomPayload>({ roomCode });
      setScreenPayload(localizePayload(nextScreen));
      setTeacherView("screen");
    } catch (caughtError) {
      setError(getApiErrorMessage("打开大屏", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshScreen() {
    const roomCode = payload?.classroom.code;
    if (!roomCode) return;
    try {
      const nextScreen = await apiClient.getScreen<ClassroomPayload>({ roomCode });
      setScreenPayload(localizePayload(nextScreen));
    } catch (caughtError) {
      setError(getApiErrorMessage("刷新大屏", caughtError));
    }
  }

  return (
    <ShellLayout title="个人理财教学模拟器" subtitle={subtitle}>
      {!session ? (
        <AuthPage
          loading={loading}
          error={error}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      ) : session.role === "student" && payload?.student ? (
        studentView === "dashboard" ? (
          <StudentDashboardPage
            payload={payload as Parameters<typeof StudentDashboardPage>[0]["payload"]}
            loading={loading}
            onRefresh={handleRefresh}
            onLogout={handleLogout}
            onGoDecision={() => setStudentView("decision")}
            onGoDebts={() => setStudentView("debts")}
            onOpenRoundDetail={handleOpenStudentRoundDetail}
            onRollDice={handleRollDice}
          />
        ) : studentView === "decision" ? (
          <StudentDecisionPage
            loading={loading}
            currentRoundId={payload.round.id}
            moduleConfig={payload.moduleConfig}
            onBack={() => setStudentView("dashboard")}
            onSubmitDecision={handleSubmitDecision}
          />
        ) : studentView === "debts" ? (
          <StudentDebtsPage payload={payload} onBack={() => setStudentView("dashboard")} />
        ) : studentView === "round" ? (
          <StudentRoundDetailPage
            payload={studentRoundDetailPayload as Parameters<typeof StudentRoundDetailPage>[0]["payload"]}
            loading={loading}
            onBack={() => setStudentView("dashboard")}
          />
        ) : (
          <StudentLedgerPage
            payload={payload as Parameters<typeof StudentLedgerPage>[0]["payload"]}
            onBack={() => setStudentView("dashboard")}
          />
        )
      ) : teacherView === "archives" ? (
        <TeacherArchivesPage
          payload={historyPayload}
          loading={loading}
          onRefresh={handleRefreshArchives}
          onOpenRoundDetail={handleOpenRoundDetail}
          onBack={() => setTeacherView("dashboard")}
        />
      ) : teacherView === "round" ? (
        <TeacherRoundDetailPage payload={roundDetailPayload} loading={loading} onBack={() => setTeacherView("archives")} />
      ) : teacherView === "print" ? (
        <TeacherPrintPage
          payload={payload as Parameters<typeof TeacherPrintPage>[0]["payload"]}
          onBack={() => setTeacherView("dashboard")}
        />
      ) : teacherView === "screen" ? (
        <ScreenPage
          payload={screenPayload as Parameters<typeof ScreenPage>[0]["payload"]}
          loading={loading}
          onBack={() => setTeacherView("dashboard")}
          onRefresh={handleRefreshScreen}
        />
      ) : (
        <TeacherDashboardPage
          payload={payload as Parameters<typeof TeacherDashboardPage>[0]["payload"]}
          loading={loading}
          onLogout={handleLogout}
          onOpenRound={handleOpenRound}
          onLockRound={handleLockRound}
          onSettleRound={handleSettleRound}
          onArchive={handleArchiveRoom}
          onCleanupStorage={handleCleanupStorage}
          onResetRoom={handleResetRoom}
          onExport={handleExportRoom}
          onOpenArchives={handleOpenArchives}
          onOpenRoundDetail={handleOpenRoundDetail}
          onOpenPrint={() => setTeacherView("print")}
          onOpenScreen={handleOpenScreen}
        />
      )}
      {session?.role === "student" && payload?.latestLedger ? (
        <div className="action-row top-gap">
            <button type="button" onClick={() => setStudentView("ledger")}>
            查看账单
          </button>
          <button type="button" className="ghost-button" onClick={() => setStudentView("dashboard")}>
            返回首页
          </button>
        </div>
      ) : null}
      {error ? <p className="app-error">{error}</p> : null}
    </ShellLayout>
  );
}
