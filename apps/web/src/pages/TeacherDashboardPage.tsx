import { useEffect, useState } from "react";
import { formatRoundStatus } from "../lib/display";

type TeacherDashboardPageProps = {
  loading: boolean;
  onLogout: () => void;
  onOpenRound: (eventId: number) => Promise<void>;
  onLockRound: () => Promise<void>;
  onSettleRound: () => Promise<void>;
  onArchive: () => Promise<void>;
  onCleanupStorage: () => Promise<void>;
  onResetRoom: () => Promise<void>;
  onExport: () => Promise<void>;
  onOpenArchives: () => Promise<void>;
  onOpenRoundDetail: (roundNo: number) => Promise<void>;
  onOpenPrint: () => void;
  onOpenScreen: () => void;
  payload: {
    classroom: {
      code: string;
      name: string;
      teacherName: string;
      status: string;
    };
    round: {
      no: number;
      status: string;
      total?: number;
    };
    moduleConfig?: {
      opt?: {
        retirement?: boolean;
        tax?: boolean;
        legacy?: boolean;
        realestate?: boolean;
      };
    };
    currentEvent?: {
      eventId: number;
      title: string;
    } | null;
    submissionSummary?: {
      submitted: number;
      total: number;
    };
    eventOptions?: Array<{
      eventId: number;
      title: string;
      teachingPoints?: string[];
      transmissionPath?: string;
    }>;
    students?: Array<{
      id: string;
      displayName: string;
      roleId: string;
      baseSalary: number;
      submitted?: boolean;
    }>;
    ranking?: Array<{
      rank: number;
      displayName: string;
      roleId: string;
      finalScore: number;
      netWorth: number;
    }>;
    classProfile?: {
      avgScore: number;
      avgNetWorth: number;
      avgEmergencyMonths: number;
      avgDsr?: number;
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
      topRiskTags: Array<{ tag: string; hits: number }>;
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
    archives?: Array<{
      id: string;
      archivedAt: string;
    }>;
    roundHistory?: Array<{
      roundNo: number;
      eventTitle?: string;
      settledAt: string;
      avgScore?: number;
      submitted?: number;
      teachingSummary?: {
        topDrivers?: Array<{ label: string; total: number }>;
      };
    }>;
  } | null;
};

export function TeacherDashboardPage(props: TeacherDashboardPageProps) {
  const classroom = props.payload?.classroom;
  const round = props.payload?.round;
  const students = props.payload?.students ?? [];
  const eventOptions = props.payload?.eventOptions ?? [];
  const submissionSummary = props.payload?.submissionSummary;
  const ranking = props.payload?.ranking ?? [];
  const classProfile = props.payload?.classProfile;
  const currentRoundSummary = props.payload?.currentRoundSummary;
  const archives = props.payload?.archives ?? [];
  const roundHistory = props.payload?.roundHistory ?? [];
  const moduleOpt = props.payload?.moduleConfig?.opt;
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;
  const canOpenRound = round?.status === "draft";
  const canLockRound = round?.status === "open";
  const canSettleRound = round?.status === "locked";
  const canResetRoom = round?.status !== "open" && round?.status !== "locked";
  const canArchiveRoom = round?.status === "settled" || round?.status === "finished";
  const [selectedEventId, setSelectedEventId] = useState(eventOptions[0]?.eventId ?? 1);

  useEffect(() => {
    setSelectedEventId(props.payload?.currentEvent?.eventId ?? eventOptions[0]?.eventId ?? 1);
  }, [props.payload?.currentEvent?.eventId, eventOptions]);

  const selectedEvent = eventOptions.find((event) => event.eventId === selectedEventId) ?? eventOptions[0] ?? null;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">教师控制台</p>
          <h2>{classroom?.name ?? "未命名课堂"}</h2>
          <p>
            {classroom?.code ?? "--"} | 第 {round?.no ?? "--"} 回合 / 共 {round?.total ?? "--"} 回合 / 状态{" "}
            {formatRoundStatus(round?.status)}
          </p>
        </div>
        <div className="action-row">
          <label className="inline-field">
            <span>事件</span>
            <select
              value={selectedEventId}
              onChange={(event) => setSelectedEventId(Number(event.target.value))}
              disabled={props.loading || eventOptions.length === 0}
            >
              {eventOptions.map((event) => (
                <option key={event.eventId} value={event.eventId}>
                  #{event.eventId} {event.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={props.loading || eventOptions.length === 0 || !canOpenRound}
            onClick={() => props.onOpenRound(selectedEventId)}
          >
            开放所选事件
          </button>
          <button type="button" disabled={props.loading || !canLockRound} onClick={props.onLockRound}>
            锁定回合
          </button>
          <button type="button" disabled={props.loading || !canSettleRound} onClick={props.onSettleRound}>
            结算回合
          </button>
          <button type="button" disabled={props.loading || !canArchiveRoom} onClick={props.onArchive}>
            归档课堂
          </button>
          <button type="button" className="ghost-button" disabled={props.loading} onClick={props.onCleanupStorage}>
            清理存储
          </button>
          <button type="button" disabled={props.loading || !canResetRoom} onClick={props.onResetRoom}>
            重置课堂
          </button>
          <button type="button" disabled={props.loading} onClick={props.onExport}>
            导出 CSV
          </button>
          <button type="button" className="ghost-button" onClick={props.onOpenArchives}>
            归档记录
          </button>
          <button type="button" className="ghost-button" onClick={props.onOpenPrint}>
            打印视图
          </button>
          <button type="button" className="ghost-button" onClick={props.onOpenScreen}>
            大屏
          </button>
          <button type="button" className="ghost-button" onClick={props.onLogout}>
            退出登录
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>当前事件</h3>
        <p>已选事件编号：{selectedEvent?.eventId ?? "--"}</p>
        <p>当前开放事件：{props.payload?.currentEvent?.title ?? "当前还没有开放事件"}</p>
        {selectedEvent ? (
          <>
            <p>{selectedEvent.transmissionPath ?? "宏观传导路径预览暂未生成。"}</p>
            <div className="tag-row">
              {(selectedEvent.teachingPoints ?? []).map((point) => (
                <span key={point} className="info-tag">
                  {point}
                </span>
              ))}
            </div>
          </>
        ) : null}
        <div className="student-list">
          {eventOptions.map((event) => (
            <button
              key={event.eventId}
              type="button"
              className="student-row action-card"
              onClick={() => setSelectedEventId(event.eventId)}
              disabled={props.loading}
            >
              <strong>{event.title}</strong>
              <span>事件 #{event.eventId}</span>
            </button>
          ))}
        </div>
      </article>

      <article className="panel page-panel">
        <h3>提交进度</h3>
        <p>
          已提交：{submissionSummary?.submitted ?? 0} / {submissionSummary?.total ?? students.length}
        </p>
        <p>归档快照数：{archives.length}</p>
      </article>

      <article className="panel page-panel">
        <h3>班级画像</h3>
        <p>平均分：{classProfile?.avgScore ?? 0}</p>
        <p>平均净资产：{classProfile?.avgNetWorth ?? 0}</p>
        <p>平均应急金月数：{classProfile?.avgEmergencyMonths ?? 0}</p>
        <p>平均偿债率 DSR：{classProfile?.avgDsr ?? 0}</p>
        <p>
          准备状态：学习 {classProfile?.preparedness?.learningReady ?? 0} / 健康{" "}
          {classProfile?.preparedness?.healthReady ?? 0} / 设备 {classProfile?.preparedness?.deviceReady ?? 0} / 储备{" "}
          {classProfile?.preparedness?.reserveReady ?? 0} / 安全 {classProfile?.preparedness?.safetyReady ?? 0}
          {showTax ? ` / 税务 ${classProfile?.preparedness?.taxReady ?? 0}` : ""}
          {showRetirement ? ` / 退休 ${classProfile?.preparedness?.retirementReady ?? 0}` : ""}
          {showLegacy ? ` / 家庭支持 ${classProfile?.preparedness?.legacyReady ?? 0}` : ""} / 债务压力{" "}
          {classProfile?.preparedness?.debtStressed ?? 0}
        </p>
        <p>
          保障覆盖：健康 {classProfile?.insuranceCoverage?.healthCover ?? 0} / 意外{" "}
          {classProfile?.insuranceCoverage?.accidentCover ?? 0} / 网络安全{" "}
          {classProfile?.insuranceCoverage?.cyberCover ?? 0}
        </p>
        <p>已购车人数：{classProfile?.vehiclesOwned ?? 0}</p>
        {showRealEstate ? <p>已购房人数：{classProfile?.homesOwned ?? 0}</p> : null}
        {showRealEstate ? (
          <p>
            家庭阶段：订婚 {classProfile?.engagedStudents ?? 0} / 已婚 {classProfile?.marriedStudents ?? 0}
          </p>
        ) : null}
        {showRealEstate ? <p>固定成本锁定人数：{classProfile?.fixedCostLocked ?? 0}</p> : null}
      </article>

      <article className="panel page-panel">
        <h3>最近一轮教学总结</h3>
        {!currentRoundSummary ? (
          <p>当前还没有已结算回合总结。</p>
        ) : (
          <>
            <p>
              主要驱动：{" "}
              {(currentRoundSummary.topDrivers ?? [])
                .map((item) => `${item.label} ${item.total}`)
                .join(" / ") || "--"}
            </p>
            <p>
              骰子事件分布：{" "}
              {(currentRoundSummary.diceCategories ?? [])
                .map((item) => `${item.category} x${item.count}`)
                .join(" / ") || "--"}
            </p>
            <p>
              保护命中 {currentRoundSummary.protectionSummary?.protectedStudents ?? 0} | 债务压力{" "}
              {currentRoundSummary.protectionSummary?.stressedStudents ?? 0} | 高风险暴露{" "}
              {currentRoundSummary.protectionSummary?.highRiskStudents ?? 0}
            </p>
            <p>
              修正影响：保护性命中 {currentRoundSummary.protectionSummary?.supportiveHits ?? 0} / 放大性命中{" "}
              {currentRoundSummary.protectionSummary?.amplifiedHits ?? 0}
            </p>
            {showRealEstate ? (
              <>
                <p>
                  生命周期负担：车 {currentRoundSummary.lifecycleLoadSummary?.vehiclesOwned ?? 0} / 房{" "}
                  {currentRoundSummary.lifecycleLoadSummary?.homesOwned ?? 0} / 订婚{" "}
                  {currentRoundSummary.lifecycleLoadSummary?.engagedStudents ?? 0} / 已婚{" "}
                  {currentRoundSummary.lifecycleLoadSummary?.marriedStudents ?? 0} / 固定成本锁定{" "}
                  {currentRoundSummary.lifecycleLoadSummary?.fixedCostLocked ?? 0}
                </p>
                <p>生命周期教学提示：{currentRoundSummary.lifecycleCue ?? "--"}</p>
              </>
            ) : null}
            <p>教师提示：{currentRoundSummary.teacherCue ?? "--"}</p>
          </>
        )}
      </article>

      <article className="panel page-panel">
        <h3>排行榜前 5</h3>
        {ranking.length === 0 ? (
          <p>当前还没有排行榜数据。</p>
        ) : (
          <div className="student-list">
            {ranking.slice(0, 5).map((row) => (
              <div key={`${row.rank}-${row.displayName}`} className="student-row">
                <strong>
                  #{row.rank} {row.displayName}
                </strong>
                <span>
                  {row.roleId} | 分数 {row.finalScore} | 净资产 {row.netWorth}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>学生列表</h3>
        {students.length === 0 ? (
          <p>当前还没有学生加入。</p>
        ) : (
          <div className="student-list">
            {students.map((student) => (
              <div key={student.id} className="student-row">
                <strong>{student.displayName}</strong>
                <span>
                  {student.roleId} | {student.baseSalary} | {student.submitted ? "已提交" : "待提交"}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>最近回合</h3>
        {roundHistory.length === 0 ? (
          <p>当前还没有已结算回合。</p>
        ) : (
          <div className="student-list">
            {roundHistory
              .slice()
              .reverse()
              .slice(0, 5)
              .map((item) => (
                <div key={`${item.roundNo}-${item.settledAt}`} className="student-row">
                  <strong>
                    第 {item.roundNo} 回合 | {item.eventTitle ?? "宏观事件"}
                  </strong>
                  <span>
                    平均分 {item.avgScore ?? 0} | 提交人数 {item.submitted ?? 0} | {item.settledAt}
                  </span>
                  <span>
                    驱动项：{" "}
                    {(item.teachingSummary?.topDrivers ?? [])
                      .map((entry) => `${entry.label} ${entry.total}`)
                      .join(" / ") || "--"}
                  </span>
                  <button type="button" onClick={() => void props.onOpenRoundDetail(item.roundNo)} disabled={props.loading}>
                    打开详情
                  </button>
                </div>
              ))}
          </div>
        )}
      </article>
    </section>
  );
}
