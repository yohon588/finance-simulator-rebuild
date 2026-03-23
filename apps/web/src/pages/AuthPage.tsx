import { useState } from "react";

import type { CreateRoomInput, JoinRoomInput } from "../api/client";

type AuthPageProps = {
  loading: boolean;
  error: string | null;
  onCreateRoom: (input: CreateRoomInput) => Promise<void>;
  onJoinRoom: (input: JoinRoomInput) => Promise<void>;
};

export function AuthPage(props: AuthPageProps) {
  const [roomCode, setRoomCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleId, setRoleId] = useState("R2");
  const [teacherName, setTeacherName] = useState("");
  const [roomName, setRoomName] = useState("");

  return (
    <section className="auth-grid">
      <article className="panel auth-panel">
        <p className="eyebrow">Student</p>
        <h2>Join Classroom</h2>
        <label>
          Room Code
          <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} />
        </label>
        <label>
          Display Name
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <label>
          Role
          <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            <option value="R1">R1 Basic</option>
            <option value="R2">R2 Service</option>
            <option value="R3">R3 Sales</option>
            <option value="R4">R4 Tech</option>
            <option value="R5">R5 Ops</option>
            <option value="R6">R6 White Collar</option>
            <option value="R7">R7 High Income</option>
          </select>
        </label>
        <button
          type="button"
          disabled={props.loading}
          onClick={() => props.onJoinRoom({ roomCode, displayName, roleId })}
        >
          {props.loading ? "Working..." : "Join"}
        </button>
      </article>

      <article className="panel auth-panel">
        <p className="eyebrow">Teacher</p>
        <h2>Create Classroom</h2>
        <label>
          Teacher Name
          <input value={teacherName} onChange={(event) => setTeacherName(event.target.value)} />
        </label>
        <label>
          Classroom Name
          <input value={roomName} onChange={(event) => setRoomName(event.target.value)} />
        </label>
        <button
          type="button"
          disabled={props.loading}
          onClick={() => props.onCreateRoom({ teacherName, roomName })}
        >
          {props.loading ? "Working..." : "Create"}
        </button>
        {props.error ? <p className="form-error">{props.error}</p> : null}
      </article>
    </section>
  );
}
