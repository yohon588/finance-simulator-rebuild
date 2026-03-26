import { createMemoryStore } from "../services/memory-store.js";
import { getBearerToken, readJsonBody } from "../services/request.js";
import { sendJson, sendText } from "../services/response.js";

const VALID_TEACHING_TOPICS = new Set([
  "income_vs_cash",
  "budget_boundary",
  "fixed_cost_pressure",
  "emergency_buffer",
  "insurance_protection",
  "risk_resilience",
  "debt_ratio_dsr",
  "minimum_payment_trap",
  "good_vs_bad_debt",
  "impulse_spending",
  "quality_vs_growth_spending",
  "car_home_cashflow",
  "family_lifecycle_cost",
  "asset_allocation",
  "financial_freedom"
]);

export function createRouter(context) {
  const store = createMemoryStore(context.moduleConfig, { repository: context.repository });

  return async function router(request, response) {
    if (request.url === "/health") {
      sendJson(response, 200, { ok: true, modules: context.moduleConfig });
      return;
    }

    if (request.method === "GET" && request.url === "/api/bootstrap") {
      sendJson(response, 200, await store.getBootstrapState());
      return;
    }

    if (request.method === "GET" && request.url === "/api/reference/module-config") {
      sendJson(response, 200, context.moduleConfig);
      return;
    }

    if (request.method === "GET" && request.url.startsWith("/api/screen")) {
      const currentUrl = new URL(request.url, "http://localhost");
      const roomCode = currentUrl.searchParams.get("roomCode");
      if (!roomCode) {
        sendJson(response, 400, { error: "ROOM_CODE_REQUIRED" });
        return;
      }
      const payload = await store.getScreenByRoomCode(roomCode);
      if (!payload) {
        sendJson(response, 404, { error: "ROOM_NOT_FOUND" });
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/rooms") {
      const body = await readJsonBody(request);
      if (!body.teacherName || !body.roomName) {
        sendJson(response, 400, { error: "INVALID_ROOM_INPUT" });
        return;
      }
      const payload = await store.createRoom(body);
      if (payload.error === "ROOM_CODE_TAKEN") {
        sendJson(response, 409, payload);
        return;
      }
      sendJson(response, 201, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/join") {
      const body = await readJsonBody(request);
      if (!body.roomCode || !body.displayName || !body.roleId) {
        sendJson(response, 400, { error: "INVALID_JOIN_INPUT" });
        return;
      }
      const payload = await store.joinRoom(body);
      if (payload.error === "ROOM_CLOSED" || payload.error === "ROOM_FULL" || payload.error === "DISPLAY_NAME_TAKEN") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/rejoin") {
      const body = await readJsonBody(request);
      if (!body.roomCode || !body.teacherName) {
        sendJson(response, 400, { error: "INVALID_TEACHER_REJOIN_INPUT" });
        return;
      }
      const payload = await store.rejoinTeacher(body);
      if (payload.error === "ROOM_CLOSED" || payload.error === "TEACHER_NAME_MISMATCH") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/student/rejoin") {
      const body = await readJsonBody(request);
      if (!body.roomCode || !body.displayName) {
        sendJson(response, 400, { error: "INVALID_STUDENT_REJOIN_INPUT" });
        return;
      }
      const payload = await store.rejoinStudent(body);
      if (payload.error === "ROOM_CLOSED") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && request.url === "/api/me") {
      const token = getBearerToken(request);
      const payload = await store.getPayloadByToken(token);
      if (!payload) {
        sendJson(response, 401, { error: "UNAUTHORIZED" });
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/open-round") {
      const token = getBearerToken(request);
      const body = await readJsonBody(request);
      if (typeof body.eventId !== "number") {
        sendJson(response, 400, { error: "INVALID_EVENT_ID" });
        return;
      }
      const payload = await store.openRound(token, body.eventId);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error === "ROUND_ALREADY_ACTIVE" || payload.error === "ROUND_CLOSED") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/teaching-topic") {
      const token = getBearerToken(request);
      const body = await readJsonBody(request);
      if (body.teachingTopic !== null && typeof body.teachingTopic !== "string") {
        sendJson(response, 400, { error: "INVALID_TEACHING_TOPIC" });
        return;
      }
      if (typeof body.teachingTopic === "string" && !VALID_TEACHING_TOPICS.has(body.teachingTopic)) {
        sendJson(response, 400, { error: "INVALID_TEACHING_TOPIC" });
        return;
      }
      const payload = await store.setTeachingTopic(token, body.teachingTopic ?? null);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/lock-round") {
      const token = getBearerToken(request);
      const payload = await store.lockRound(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error === "ROUND_NOT_OPEN") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/settle-round") {
      const token = getBearerToken(request);
      const payload = await store.settleRound(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error === "ROUND_NOT_LOCKED") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/archive") {
      const token = getBearerToken(request);
      const payload = await store.archiveRoom(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/cleanup-storage") {
      const token = getBearerToken(request);
      const payload = await store.cleanupStorage(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/teacher/reset-room") {
      const token = getBearerToken(request);
      const payload = await store.resetRoom(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && request.url === "/api/teacher/export") {
      const token = getBearerToken(request);
      const payload = await store.exportRoom(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendText(response, 200, payload.content, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${payload.fileName}"`
      });
      return;
    }

    if (request.method === "GET" && request.url === "/api/teacher/history") {
      const token = getBearerToken(request);
      const payload = await store.getTeacherHistory(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && request.url.startsWith("/api/teacher/history/round")) {
      const token = getBearerToken(request);
      const currentUrl = new URL(request.url, "http://localhost");
      const roundNo = Number(currentUrl.searchParams.get("roundNo"));
      if (!Number.isFinite(roundNo)) {
        sendJson(response, 400, { error: "ROUND_NO_REQUIRED" });
        return;
      }
      const payload = await store.getTeacherRoundDetail(token, roundNo);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "GET" && request.url.startsWith("/api/student/history/round")) {
      const token = getBearerToken(request);
      const currentUrl = new URL(request.url, "http://localhost");
      const roundNo = Number(currentUrl.searchParams.get("roundNo"));
      if (!Number.isFinite(roundNo)) {
        sendJson(response, 400, { error: "ROUND_NO_REQUIRED" });
        return;
      }
      const payload = await store.getStudentRoundDetail(token, roundNo);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/student/dice") {
      const token = getBearerToken(request);
      const payload = await store.rollDice(token);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error === "ROUND_NOT_OPEN") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    if (request.method === "POST" && request.url === "/api/student/decision") {
      const token = getBearerToken(request);
      const body = await readJsonBody(request);
      if (!body.idempotencyKey) {
        sendJson(response, 400, { error: "INVALID_DECISION_INPUT" });
        return;
      }
      const payload = await store.submitDecision(token, body);
      if (payload.error === "UNAUTHORIZED") {
        sendJson(response, 401, payload);
        return;
      }
      if (payload.error === "ROUND_NOT_OPEN") {
        sendJson(response, 409, payload);
        return;
      }
      if (payload.error) {
        sendJson(response, 404, payload);
        return;
      }
      sendJson(response, 200, payload);
      return;
    }

    sendJson(response, 404, { error: "NOT_IMPLEMENTED", path: request.url });
  };
}
