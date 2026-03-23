import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(currentDir, "../db/schema.sql");

export async function createPostgresRepository(connectionString) {
  const { Client } = await import("pg");

  const client = new Client({
    connectionString
  });

  await client.connect();

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await client.query(schemaSql);

  await client.query(`
    create table if not exists classroom_runtime_snapshots (
      classroom_id uuid primary key references classrooms(id) on delete cascade,
      payload_json jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);

  await client.query(`
    create table if not exists auth_sessions (
      token varchar(120) primary key,
      role varchar(24) not null,
      user_id uuid not null,
      classroom_id uuid not null references classrooms(id) on delete cascade,
      payload_json jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  async function syncNormalizedStudentTables(room) {
    await client.query("delete from student_assets where user_id in (select id from users where classroom_id = $1)", [room.id]);
    await client.query("delete from student_debts where user_id in (select id from users where classroom_id = $1)", [room.id]);
    await client.query("delete from student_states where user_id in (select id from users where classroom_id = $1)", [room.id]);
    await client.query("delete from users where classroom_id = $1", [room.id]);

    const teacherUserId = room.teacherUserId ?? `00000000-0000-4000-8000-${room.id.replace(/-/g, "").slice(-12)}`;
    room.teacherUserId = teacherUserId;

    await client.query(
      `insert into users (id, classroom_id, role, display_name)
       values ($1, $2, 'teacher', $3)`,
      [teacherUserId, room.id, room.teacherName]
    );

    for (const student of room.students ?? []) {
      await client.query(
        `insert into users (id, classroom_id, role, display_name, role_id, base_salary)
         values ($1, $2, 'student', $3, $4, $5)`,
        [student.id, room.id, student.displayName, student.roleId, student.baseSalary]
      );

      await client.query(
        `insert into student_states (
           user_id, cash, lq, boosts, arrears, late_count, defaults_count, start_worth, insurance_flags, module_flags
         )
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)`,
        [
          student.id,
          student.cash ?? 0,
          student.lq ?? 0,
          student.boosts ?? 0,
          student.arrears ?? 0,
          student.lateCount ?? 0,
          student.defaultsCount ?? 0,
          student.startWorth ?? student.metrics?.netWorth ?? 0,
          JSON.stringify(student.insuranceFlags ?? {}),
          JSON.stringify({
            prepFlags: student.prepFlags ?? {},
            family: student.family ?? {},
            vehicle: student.vehicle ?? {},
            house: student.house ?? {}
          })
        ]
      );

      for (const [assetId, amount] of Object.entries(student.assets ?? {})) {
        await client.query(
          `insert into student_assets (user_id, asset_id, amount)
           values ($1, $2, $3)`,
          [student.id, assetId, amount]
        );
      }

      for (const debt of student.debts ?? []) {
        await client.query(
          `insert into student_debts (id, user_id, debt_type, creditor, principal, rate_monthly, min_pay, missed_rounds, status)
           values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            debt.id,
            student.id,
            debt.type ?? "CONSUMER",
            debt.creditor,
            debt.principal ?? 0,
            debt.rateMonthly ?? 0,
            debt.minPay ?? 0,
            debt.missedRounds ?? 0,
            debt.status ?? "ACTIVE"
          ]
        );
      }
    }
  }

  async function syncRoundRuntimeTables(room) {
    const round = room.round ?? null;
    if (!round) {
      return;
    }

    const currentRoundHistoryEntry = (room.round.history ?? []).find((item) => item.roundNo === round.no) ?? null;
    const roundMeta = {
      eventTitle: currentRoundHistoryEntry?.eventTitle ?? null,
      settledAt: currentRoundHistoryEntry?.settledAt ?? round.settledAt ?? null,
      avgScore: currentRoundHistoryEntry?.avgScore ?? null,
      submitted: currentRoundHistoryEntry?.submitted ?? Object.keys(round.decisions ?? {}).length,
      classProfile: currentRoundHistoryEntry?.classProfile ?? null,
      teachingSummary: currentRoundHistoryEntry?.teachingSummary ?? null,
      rankingTop3: currentRoundHistoryEntry?.rankingTop3 ?? null
    };

    await client.query(
      `insert into room_seasons (id, classroom_id, round_no, status, event_id, cost_index, random_seed, module_flags, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, now())
       on conflict (id)
       do update set
         round_no = excluded.round_no,
         status = excluded.status,
         event_id = excluded.event_id,
         cost_index = excluded.cost_index,
         random_seed = excluded.random_seed,
         module_flags = excluded.module_flags,
         updated_at = now()`,
      [
        round.id,
        room.id,
        round.no ?? 1,
        round.status ?? "draft",
        round.eventId,
        round.costIndex ?? 1,
        round.id,
        JSON.stringify(roundMeta)
      ]
    );

    await client.query("delete from round_decisions where season_id = $1", [round.id]);
    await client.query("delete from round_random_events where season_id = $1", [round.id]);
    await client.query("delete from round_ledgers where season_id = $1", [round.id]);

    for (const [userId, decision] of Object.entries(round.decisions ?? {})) {
      await client.query(
        `insert into round_decisions (season_id, user_id, idempotency_key, payload_json, submitted_at)
         values ($1, $2, $3, $4::jsonb, $5)`,
        [
          round.id,
          userId,
          decision.idempotencyKey ?? `${round.id}-${userId}`,
          JSON.stringify(decision),
          decision.submittedAt ?? new Date().toISOString()
        ]
      );
    }

    for (const [userId, dice] of Object.entries(round.dice ?? {})) {
      await client.query(
        `insert into round_random_events (
           season_id, user_id, dice_roll, category, card_id, base_effect_json, applied_effect_json, knowledge_point, teacher_note
         )
         values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9)`,
        [
          round.id,
          userId,
          dice.roll ?? 0,
          dice.category ?? "unknown",
          dice.card?.id ?? `${round.id}-${userId}-dice`,
          JSON.stringify(dice.card?.baseEffect ?? {}),
          JSON.stringify(dice.appliedEffect ?? {}),
          dice.card?.knowledgePoint ?? "",
          dice.card?.teacherNote ?? null
        ]
      );
    }

    for (const student of room.students ?? []) {
      if (!student.latestLedger || student.latestLedger.roundNo !== round.no) {
        continue;
      }

      await client.query(
        `insert into round_ledgers (season_id, user_id, payload_json, replay_hash)
         values ($1, $2, $3::jsonb, $4)`,
        [
          round.id,
          student.id,
          JSON.stringify(student.latestLedger),
          `${round.id}:${student.id}:${student.latestLedger.roundNo}`
        ]
      );
    }
  }

  async function syncArchiveTables(room) {
    await client.query("delete from room_archives where classroom_id = $1", [room.id]);

    for (const archive of room.archives ?? []) {
      await client.query(
        `insert into room_archives (id, classroom_id, export_version, payload_json, archived_at)
         values ($1, $2, $3, $4::jsonb, $5)`,
        [
          archive.id,
          room.id,
          "v1",
          JSON.stringify(archive),
          archive.archivedAt ?? new Date().toISOString()
        ]
      );
    }
  }

  async function queryRoomById(roomId) {
    const result = await client.query(
      `select snapshots.payload_json as payload
       from classrooms
       join classroom_runtime_snapshots as snapshots
         on snapshots.classroom_id = classrooms.id
       where classrooms.id = $1`,
      [roomId]
    );

    return result.rows[0]?.payload ?? null;
  }

  async function queryRoomMetaById(roomId) {
    const result = await client.query(
      `select id, code, name, teacher_name as "teacherName", status
       from classrooms
       where id = $1`,
      [roomId]
    );

    return result.rows[0] ?? null;
  }

  async function queryRoomMetaByCode(roomCode) {
    const result = await client.query(
      `select id, code, name, teacher_name as "teacherName", status
       from classrooms
       where code = $1
       limit 1`,
      [roomCode]
    );

    return result.rows[0] ?? null;
  }

  async function querySeasonByRoundNo(roomId, roundNo) {
    const result = await client.query(
      `select id, classroom_id, round_no, status, event_id, module_flags, updated_at
       from room_seasons
       where classroom_id = $1 and round_no = $2
       order by updated_at desc
       limit 1`,
      [roomId, roundNo]
    );

    return result.rows[0] ?? null;
  }

  async function queryRoundLedgers(roomId, roundNo) {
    const season = await querySeasonByRoundNo(roomId, roundNo);
    if (!season) {
      return null;
    }

    const classroom = await queryRoomMetaById(roomId);
    const result = await client.query(
      `select
         users.id as "studentId",
         users.display_name as "displayName",
         users.role_id as "roleId",
         student_states.insurance_flags as "insuranceFlags",
         student_states.module_flags as "moduleFlags",
         round_ledgers.payload_json as ledger
       from round_ledgers
       join users on users.id = round_ledgers.user_id
       left join student_states on student_states.user_id = users.id
       where round_ledgers.season_id = $1
       order by (round_ledgers.payload_json->'score'->>'finalScore')::numeric desc nulls last`,
      [season.id]
    );

    return {
      classroom,
      round: {
        id: season.id,
        roundNo: season.round_no,
        status: season.status,
        eventId: season.event_id,
        settledAt: season.module_flags?.settledAt ?? season.updated_at?.toISOString?.() ?? null,
        eventTitle: season.module_flags?.eventTitle ?? null,
        teachingSummary: season.module_flags?.teachingSummary ?? null,
        classProfile: season.module_flags?.classProfile ?? null,
        submitted: season.module_flags?.submitted ?? null,
        avgScore: season.module_flags?.avgScore ?? null,
        rankingTop3: season.module_flags?.rankingTop3 ?? null
      },
      students: result.rows.map((row) => ({
        studentId: row.studentId,
        displayName: row.displayName,
        roleId: row.roleId,
        insuranceFlags: row.insuranceFlags ?? {},
        moduleFlags: row.moduleFlags ?? {},
        ledger: row.ledger
      }))
    };
  }

  async function queryStudentRoundLedger(roomId, userId, roundNo) {
    const season = await querySeasonByRoundNo(roomId, roundNo);
    if (!season) {
      return null;
    }

    const classroom = await queryRoomMetaById(roomId);
    const result = await client.query(
      `select
         users.id as "studentId",
         users.display_name as "displayName",
         users.role_id as "roleId",
         student_states.insurance_flags as "insuranceFlags",
         student_states.module_flags as "moduleFlags",
         round_ledgers.payload_json as ledger
       from round_ledgers
       join users on users.id = round_ledgers.user_id
       left join student_states on student_states.user_id = users.id
       where round_ledgers.season_id = $1 and round_ledgers.user_id = $2
       limit 1`,
      [season.id, userId]
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      classroom,
      round: {
        id: season.id,
        roundNo: season.round_no,
        status: season.status,
        eventId: season.event_id,
        settledAt: season.module_flags?.settledAt ?? season.updated_at?.toISOString?.() ?? null,
        eventTitle: season.module_flags?.eventTitle ?? null,
        teachingSummary: season.module_flags?.teachingSummary ?? null,
        classProfile: season.module_flags?.classProfile ?? null,
        submitted: season.module_flags?.submitted ?? null,
        avgScore: season.module_flags?.avgScore ?? null,
        rankingTop3: season.module_flags?.rankingTop3 ?? null
      },
      student: {
        studentId: row.studentId,
        displayName: row.displayName,
        roleId: row.roleId,
        insuranceFlags: row.insuranceFlags ?? {},
        moduleFlags: row.moduleFlags ?? {},
        ledger: row.ledger
      }
    };
  }

  async function queryTeacherHistoryBundle(roomId) {
    const classroom = await queryRoomMetaById(roomId);
    const roundRows = await client.query(
      `select round_no, event_id, updated_at, module_flags
       from room_seasons
       where classroom_id = $1
       order by round_no desc`,
      [roomId]
    );
    const archiveRows = await client.query(
      `select payload_json as payload
       from room_archives
       where classroom_id = $1
       order by archived_at desc`,
      [roomId]
    );
    const runtime = await queryRoomById(roomId);
    const roundHistory = roundRows.rows
      .map((row) => ({
        roundNo: row.round_no,
        eventId: row.event_id,
        eventTitle: row.module_flags?.eventTitle ?? null,
        settledAt: row.module_flags?.settledAt ?? row.updated_at?.toISOString?.() ?? null,
        rankingTop3: row.module_flags?.rankingTop3 ?? null,
        avgScore: row.module_flags?.avgScore ?? null,
        submitted: row.module_flags?.submitted ?? null,
        classProfile: row.module_flags?.classProfile ?? null,
        teachingSummary: row.module_flags?.teachingSummary ?? null
      }))
      .filter((item) => item.eventTitle || item.settledAt || item.teachingSummary);

    return {
      classroom,
      roundHistory: roundHistory.length > 0 ? roundHistory : runtime?.round?.history ?? [],
      archives: archiveRows.rows.map((row) => row.payload)
    };
  }

  async function queryScreenBundle(roomCode) {
    const classroom = await queryRoomMetaByCode(roomCode);
    if (!classroom) {
      return null;
    }

    const runtime = await queryRoomById(classroom.id);
    if (!runtime) {
      return null;
    }

    const latestSeasonResult = await client.query(
      `select round_no, status, event_id, module_flags, updated_at
       from room_seasons
       where classroom_id = $1
       order by round_no desc, updated_at desc
       limit 1`,
      [classroom.id]
    );
    const latestSeason = latestSeasonResult.rows[0] ?? null;

    return {
      classroom,
      round: {
        no: latestSeason?.round_no ?? runtime.round?.no ?? 1,
        status: latestSeason?.status ?? runtime.round?.status ?? "draft"
      },
      currentEvent:
        latestSeason?.module_flags?.eventTitle || runtime.round?.eventId
          ? {
              title: latestSeason?.module_flags?.eventTitle ?? null
            }
          : null,
      currentRoundSummary:
        latestSeason?.module_flags?.teachingSummary ?? runtime.round?.history?.at?.(-1)?.teachingSummary ?? null
    };
  }

  return {
    async saveRoom(room) {
      await client.query(
        `insert into classrooms (id, code, name, teacher_name, status)
         values ($1, $2, $3, $4, $5)
         on conflict (id)
         do update set
           code = excluded.code,
           name = excluded.name,
           teacher_name = excluded.teacher_name,
           status = excluded.status`,
        [room.id, room.code, room.name, room.teacherName, room.round?.status ?? room.status ?? "draft"]
      );
      await client.query(
        `insert into classroom_runtime_snapshots (classroom_id, payload_json, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (classroom_id)
         do update set
           payload_json = excluded.payload_json,
           updated_at = now()`,
        [room.id, JSON.stringify(room)]
      );
      await syncNormalizedStudentTables(room);
      await syncRoundRuntimeTables(room);
      await syncArchiveTables(room);
      return room;
    },
    async getRoom(roomId) {
      return queryRoomById(roomId);
    },
    async findRoomByCode(roomCode) {
      const result = await client.query(
        `select snapshots.payload_json as payload
         from classrooms
         join classroom_runtime_snapshots as snapshots
           on snapshots.classroom_id = classrooms.id
         where code = $1`,
        [roomCode]
      );
      return result.rows[0]?.payload ?? null;
    },
    async listRooms() {
      const result = await client.query(
        `select id, code, name, teacher_name as "teacherName", status
         from classrooms
         order by created_at desc`
      );
      return result.rows;
    },
    async saveSession(session) {
      await client.query(
        `insert into auth_sessions (token, role, user_id, classroom_id, payload_json, updated_at)
         values ($1, $2, $3, $4, $5::jsonb, now())
         on conflict (token)
         do update set
           role = excluded.role,
           user_id = excluded.user_id,
           classroom_id = excluded.classroom_id,
           payload_json = excluded.payload_json,
           updated_at = now()`,
        [session.token, session.role, session.userId, session.roomId, JSON.stringify(session)]
      );
      return session;
    },
    async getSession(token) {
      const result = await client.query(
        `select payload_json as payload
         from auth_sessions
         where token = $1`,
        [token]
      );
      return result.rows[0]?.payload ?? null;
    },
    async serialize() {
      const roomRows = await client.query(
        `select payload_json as payload
         from classroom_runtime_snapshots
         order by updated_at desc`
      );
      const sessionRows = await client.query(
        `select payload_json as payload
         from auth_sessions
         order by updated_at desc`
      );
      return {
        rooms: roomRows.rows.map((row) => row.payload),
        sessions: sessionRows.rows.map((row) => row.payload)
      };
    },
    async getRoundLedgerBundle(roomId, roundNo) {
      return queryRoundLedgers(roomId, roundNo);
    },
    async getStudentRoundBundle(roomId, userId, roundNo) {
      return queryStudentRoundLedger(roomId, userId, roundNo);
    },
    async getTeacherHistoryBundle(roomId) {
      return queryTeacherHistoryBundle(roomId);
    },
    async getScreenBundle(roomCode) {
      return queryScreenBundle(roomCode);
    },
    async close() {
      await client.end();
    }
  };
}
