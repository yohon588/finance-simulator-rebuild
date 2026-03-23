const baseUrl = process.env.BASE_URL ?? "http://localhost:3100";

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    throw new Error(`${path} -> ${response.status} ${typeof payload === "object" ? JSON.stringify(payload) : payload}`);
  }

  return payload;
}

async function main() {
  const teacher = await requestJson("/api/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teacherName: "Smoke Teacher",
      roomName: "Smoke Classroom"
    })
  });
  const teacherHeaders = { Authorization: `Bearer ${teacher.token}`, "Content-Type": "application/json" };

  await requestJson("/api/teacher/open-round", {
    method: "POST",
    headers: teacherHeaders,
    body: JSON.stringify({ eventId: 24 })
  });

  const student = await requestJson("/api/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      roomCode: teacher.classroom.code,
      displayName: "Smoke Student",
      roleId: "R4"
    })
  });
  const studentHeaders = { Authorization: `Bearer ${student.token}`, "Content-Type": "application/json" };

  await requestJson("/api/student/dice", {
    method: "POST",
    headers: studentHeaders
  });

  await requestJson("/api/student/decision", {
    method: "POST",
    headers: studentHeaders,
    body: JSON.stringify({
      idempotencyKey: "smoke-decision-1",
      consume: [
        { id: "C3", amount: 3000 },
        { id: "R1", amount: 800 },
        { id: "Q1", amount: 700 }
      ],
      loan: {
        borrow: 1000,
        repay: 0,
        allocateTo: "D-consumer"
      },
      invest: [
        { asset: "A5", action: "buy", amount: 1200 },
        { asset: "A8", action: "buy", amount: 300 }
      ],
      gamble: {
        type: "SPORTS",
        amount: 100
      },
      riskAck: ["A8", "A9"]
    })
  });

  await requestJson("/api/teacher/lock-round", {
    method: "POST",
    headers: { Authorization: `Bearer ${teacher.token}` }
  });

  const settled = await requestJson("/api/teacher/settle-round", {
    method: "POST",
    headers: { Authorization: `Bearer ${teacher.token}` }
  });

  const history = await requestJson("/api/teacher/history", {
    headers: { Authorization: `Bearer ${teacher.token}` }
  });

  const detail = await requestJson("/api/teacher/history/round?roundNo=1", {
    headers: { Authorization: `Bearer ${teacher.token}` }
  });

  const review = await requestJson("/api/student/history/round?roundNo=1", {
    headers: { Authorization: `Bearer ${student.token}` }
  });

  const screen = await requestJson(`/api/screen?roomCode=${encodeURIComponent(teacher.classroom.code)}`);

  console.log(
    JSON.stringify(
      {
        roomCode: teacher.classroom.code,
        nextRound: settled.round.no,
        nextStatus: settled.round.status,
        historyCount: history.roundHistory.length,
        teacherDetailStudents: detail.roundDetail.students.length,
        studentReviewRound: review.studentRoundDetail.roundNo,
        screenLeader: screen.ranking?.[0]?.displayName ?? null
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
