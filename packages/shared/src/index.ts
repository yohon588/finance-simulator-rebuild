export type UserRole = "student" | "teacher" | "screen";

export type RoundStatus = "draft" | "open" | "locked" | "settled" | "archived";

export type ModuleFlags = {
  core: {
    budget: boolean;
    debt: boolean;
    invest: boolean;
    macro: boolean;
    behavior: boolean;
    anti_fraud: boolean;
    dice: boolean;
  };
  opt: {
    education: boolean;
    retirement: boolean;
    tax: boolean;
    legacy: boolean;
    realestate: boolean;
  };
};

export type RouteCard = {
  path: string;
  label: string;
  role: string;
  description: string;
};

export type Classroom = {
  id: string;
  code: string;
  name: string;
  teacherName: string;
  status: RoundStatus;
};

export type RoundSummary = {
  id: string;
  no: number;
  status: RoundStatus;
  eventId: number | null;
  costIndex: number;
};

export type StudentMetrics = {
  netWorth: number;
  debtRatio: number;
  dsr: number;
  emergencyMonths: number;
  finalScore?: number;
};

export type StudentState = {
  id: string;
  displayName: string;
  roleId: string;
  baseSalary: number;
  cash: number;
  metrics: StudentMetrics;
  riskTags: string[];
};

export type DecisionPack = {
  roundId: string;
  idempotencyKey: string;
  consume: Array<{ id: string; amount: number }>;
  loan: {
    borrow: number;
    repay: number;
    allocateTo: string | null;
  };
  invest: Array<{ asset: string; action: "buy" | "sell"; amount: number }>;
  gamble?: {
    type: string;
    amount: number;
  };
  riskAck: string[];
};

export const routeCards: RouteCard[] = [
  { path: "/", label: "Auth", role: "student/teacher", description: "Join classroom or create a room." },
  { path: "/student", label: "Student Dashboard", role: "student", description: "Round status, budget summary, dice event and risk tags." },
  { path: "/student/decision", label: "Student Decision", role: "student", description: "Consumption, debt, investing and risk confirmation." },
  { path: "/student/debts", label: "Student Debts", role: "student", description: "Debt detail, rates, min pay and delinquency state." },
  { path: "/student/ledger", label: "Student Ledger", role: "student", description: "Cashflow, asset change, dice event and score breakdown." },
  { path: "/teacher", label: "Teacher Console", role: "teacher", description: "Publish events, lock/settle, inspect class and export." },
  { path: "/teacher/archives", label: "Teacher Archives", role: "teacher", description: "Review archived classrooms and snapshots." },
  { path: "/teacher/print", label: "Teacher Print", role: "teacher", description: "Printable class report and rankings." },
  { path: "/screen", label: "Ranking Screen", role: "teacher/screen", description: "Projected leaderboard and round log." }
];
