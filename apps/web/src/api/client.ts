export type CreateRoomInput = {
  teacherName: string;
  roomName: string;
};

export type JoinRoomInput = {
  roomCode: string;
  displayName: string;
  roleId: string;
};

export type OpenRoundInput = {
  eventId: number;
};

export type SubmitDecisionInput = {
  idempotencyKey: string;
  consume: Array<{ id: string; amount: number }>;
  loan: {
    borrow: number;
    repay: number;
    allocateTo: string | null;
  };
  invest: Array<{ asset: string; action: "buy" | "sell"; amount: number }>;
  option?: {
    direction: "CALL" | "PUT";
    amount: number;
  } | null;
  gamble: {
    type: string;
    amount: number;
  } | null;
  riskAck: string[];
};

export type ScreenQuery = {
  roomCode: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, code?: string, message?: string) {
    super(message ?? code ?? `Request failed: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, init);
  if (!response.ok) {
    let code: string | undefined;
    let message: string | undefined;
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      code = payload.error;
      message = payload.message;
    } catch {
      code = undefined;
    }
    throw new ApiError(response.status, code, message);
  }
  return response.json() as Promise<T>;
}

async function requestText(path: string, init?: RequestInit): Promise<string> {
  const response = await fetch(path, init);
  if (!response.ok) {
    let code: string | undefined;
    let message: string | undefined;
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
      code = payload.error;
      message = payload.message;
    } catch {
      code = undefined;
    }
    throw new ApiError(response.status, code, message);
  }
  return response.text();
}

export const apiClient = {
  getBootstrap<T>() {
    return requestJson<T>("/api/bootstrap");
  },
  getMe<T>(token: string) {
    return requestJson<T>("/api/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  createRoom<T>(input: CreateRoomInput) {
    return requestJson<T>("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  joinRoom<T>(input: JoinRoomInput) {
    return requestJson<T>("/api/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
  },
  openRound<T>(token: string, input: OpenRoundInput) {
    return requestJson<T>("/api/teacher/open-round", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(input)
    });
  },
  lockRound<T>(token: string) {
    return requestJson<T>("/api/teacher/lock-round", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  settleRound<T>(token: string) {
    return requestJson<T>("/api/teacher/settle-round", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  archiveRoom<T>(token: string) {
    return requestJson<T>("/api/teacher/archive", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  resetRoom<T>(token: string) {
    return requestJson<T>("/api/teacher/reset-room", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  exportRoom(token: string) {
    return requestText("/api/teacher/export", {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getTeacherHistory<T>(token: string) {
    return requestJson<T>("/api/teacher/history", {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getTeacherRoundDetail<T>(token: string, roundNo: number) {
    return requestJson<T>(`/api/teacher/history/round?roundNo=${roundNo}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getStudentRoundDetail<T>(token: string, roundNo: number) {
    return requestJson<T>(`/api/student/history/round?roundNo=${roundNo}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getScreen<T>(query: ScreenQuery) {
    return requestJson<T>(`/api/screen?roomCode=${encodeURIComponent(query.roomCode)}`);
  },
  rollDice<T>(token: string) {
    return requestJson<T>("/api/student/dice", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  submitDecision<T>(token: string, input: SubmitDecisionInput) {
    return requestJson<T>("/api/student/decision", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(input)
    });
  }
};
