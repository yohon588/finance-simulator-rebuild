import { useEffect, useMemo, useState } from "react";

import {
  apiClient,
  ApiError,
  type CreateRoomInput,
  type JoinRoomInput,
  type SubmitDecisionInput
} from "./api/client";
import { ShellLayout } from "./components/layout/ShellLayout";
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
      ROOM_NOT_FOUND: "Classroom not found.",
      ROOM_CLOSED: "This classroom is already closed and no longer accepts new students.",
      ROOM_FULL: "This classroom has reached its student limit.",
      DISPLAY_NAME_TAKEN: "This display name is already taken in the classroom.",
      ROUND_NOT_OPEN: "This round is not open yet.",
      ROUND_NOT_LOCKED: "The teacher must lock the round before settling.",
      ROUND_ALREADY_ACTIVE: "A round is already active. Lock or settle it before opening another one.",
      ROUND_CLOSED: "The classroom has finished or been archived.",
      INVALID_ROOM_INPUT: "Please complete the teacher name and classroom name.",
      INVALID_JOIN_INPUT: "Please complete the room code, name, and role before joining.",
      INVALID_DECISION_INPUT: "The decision package is incomplete.",
      UNAUTHORIZED: "Your session is no longer valid. Please enter the classroom again."
    };

    return messages[code] ?? `${action} failed (${code || error.status}).`;
  }

  return `${action} failed.`;
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
          setPayload(nextPayload);
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
          setError("Session expired. Please join again.");
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
          setPayload(nextPayload);
        })
        .catch(() => {
          window.sessionStorage.removeItem(STORAGE_KEY);
          setSession(null);
          setPayload(null);
          setHistoryPayload(null);
          setRoundDetailPayload(null);
          setStudentRoundDetailPayload(null);
          setError("Session expired. Please join again.");
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
          setScreenPayload(nextScreen);
        })
        .catch(() => {
          setError("Failed to refresh screen.");
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
          setHistoryPayload(nextHistory);
        })
        .catch(() => {
          setError("Failed to refresh teacher history.");
        });
    }, 7000);

    return () => {
      window.clearInterval(timer);
    };
  }, [teacherView, session]);

  const subtitle = useMemo(() => {
    if (!session || !payload) {
      return "Auth, room creation, join flow, dice, open, lock, settle, debt view, and decision submit are wired into the rebuild shell.";
    }

    return `Class ${payload.classroom.code} | Round ${payload.round.no} | Status ${payload.round.status}`;
  }, [payload, session]);

  async function handleCreateRoom(input: CreateRoomInput) {
    setLoading(true);
    setError(null);
    try {
      const nextPayload = await apiClient.createRoom<ClassroomPayload>(input);
      const nextSession: SessionState = { token: nextPayload.token, role: "teacher" };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
      setSession(nextSession);
      setPayload(nextPayload);
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setTeacherView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("Create classroom", caughtError));
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
      setPayload(nextPayload);
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setStudentView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("Join classroom", caughtError));
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
      setPayload(nextPayload);
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
    } catch (caughtError) {
      setError(getApiErrorMessage("Archive classroom", caughtError));
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
      setPayload(nextPayload);
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setTeacherView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("Clean storage", caughtError));
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
      setPayload(nextPayload);
      setHistoryPayload(null);
      setRoundDetailPayload(null);
      setStudentRoundDetailPayload(null);
      setTeacherView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("Reset room", caughtError));
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
      setError(getApiErrorMessage("Export CSV", caughtError));
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
      setPayload(nextPayload);
    } catch (caughtError) {
      setError(getApiErrorMessage("Open round", caughtError));
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
      setPayload(nextPayload);
    } catch (caughtError) {
      setError(getApiErrorMessage("Lock round", caughtError));
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
      setPayload(nextPayload);
    } catch (caughtError) {
      setError(getApiErrorMessage("Settle round", caughtError));
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
      setPayload(nextPayload);
    } catch (caughtError) {
      setError(getApiErrorMessage("Roll dice", caughtError));
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
      setPayload(nextPayload);
      setStudentRoundDetailPayload(null);
      setStudentView("dashboard");
    } catch (caughtError) {
      setError(getApiErrorMessage("Submit decision", caughtError));
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
      setHistoryPayload(nextHistory);
      setTeacherView("archives");
    } catch (caughtError) {
      setError(getApiErrorMessage("Load teacher history", caughtError));
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
      setHistoryPayload(nextHistory);
    } catch (caughtError) {
      setError(getApiErrorMessage("Refresh teacher history", caughtError));
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
      setRoundDetailPayload(nextDetail);
      setTeacherView("round");
    } catch (caughtError) {
      setError(getApiErrorMessage("Load round detail", caughtError));
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
      setStudentRoundDetailPayload(nextDetail);
      setStudentView("round");
    } catch (caughtError) {
      setError(getApiErrorMessage("Load student round review", caughtError));
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
      setScreenPayload(nextScreen);
      setTeacherView("screen");
    } catch (caughtError) {
      setError(getApiErrorMessage("Open screen", caughtError));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefreshScreen() {
    const roomCode = payload?.classroom.code;
    if (!roomCode) return;
    try {
      const nextScreen = await apiClient.getScreen<ClassroomPayload>({ roomCode });
      setScreenPayload(nextScreen);
    } catch (caughtError) {
      setError(getApiErrorMessage("Refresh screen", caughtError));
    }
  }

  return (
    <ShellLayout title="Finance Simulator Rebuild" subtitle={subtitle}>
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
            View Ledger
          </button>
          <button type="button" className="ghost-button" onClick={() => setStudentView("dashboard")}>
            Back To Dashboard
          </button>
        </div>
      ) : null}
      {error ? <p className="app-error">{error}</p> : null}
    </ShellLayout>
  );
}
