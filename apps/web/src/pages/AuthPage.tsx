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
        <p className="eyebrow">学生端</p>
        <h2>加入课堂</h2>
        <label>
          课堂码
          <input value={roomCode} onChange={(event) => setRoomCode(event.target.value.toUpperCase())} />
        </label>
        <label>
          显示名称
          <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        </label>
        <label>
          角色
          <select value={roleId} onChange={(event) => setRoleId(event.target.value)}>
            <option value="R1">R1 基础岗</option>
            <option value="R2">R2 服务岗</option>
            <option value="R3">R3 销售岗</option>
            <option value="R4">R4 技术岗</option>
            <option value="R5">R5 运营岗</option>
            <option value="R6">R6 白领岗</option>
            <option value="R7">R7 高收入岗</option>
          </select>
        </label>
        <button
          type="button"
          disabled={props.loading}
          onClick={() => props.onJoinRoom({ roomCode, displayName, roleId })}
        >
          {props.loading ? "处理中..." : "加入课堂"}
        </button>
      </article>

      <article className="panel auth-panel">
        <p className="eyebrow">教师端</p>
        <h2>创建课堂</h2>
        <label>
          教师姓名
          <input value={teacherName} onChange={(event) => setTeacherName(event.target.value)} />
        </label>
        <label>
          课堂名称
          <input value={roomName} onChange={(event) => setRoomName(event.target.value)} />
        </label>
        <button
          type="button"
          disabled={props.loading}
          onClick={() => props.onCreateRoom({ teacherName, roomName })}
        >
          {props.loading ? "处理中..." : "创建课堂"}
        </button>
        {props.error ? <p className="form-error">{props.error}</p> : null}
      </article>
    </section>
  );
}
