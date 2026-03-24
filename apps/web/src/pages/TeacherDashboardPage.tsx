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

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN")}`;
}

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
            课堂码 {classroom?.code ?? "--"} | 教师 {classroom?.teacherName ?? "--"} | 第 {round?.no ?? "--"} /{" "}
            {round?.total ?? "--"} 回合 | {formatRoundStatus(round?.status)}
          </p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onOpenArchives}>
            查看归档
          </button>
          <button type="button" className="ghost-button" onClick={props.onOpenPrint}>
            打印成绩单
          </button>
          <button type="button" className="ghost-button" onClick={props.onOpenScreen}>
            打开大屏
          </button>
          <button type="button" className="ghost-button" onClick={props.onLogout}>
            退出课堂
          </button>
        </div>
      </article>

      <section className="dashboard-grid">
        <div className="dashboard-main">
          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">回合控制</p>
                <h3>先发布，再锁定，再结算</h3>
              </div>
              <span className="info-tag">{formatRoundStatus(round?.status)}</span>
            </div>
            <div className="teacher-control-grid">
              <label className="inline-field">
                <span>发布开始事件</span>
                <select
                  value={selectedEventId}
                  onChange={(event) => setSelectedEventId(Number(event.target.value))}
                  disabled={props.loading || eventOptions.length === 0}
                >
                  {eventOptions.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      事件 {event.eventId} / {event.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="action-row">
                <button
                  type="button"
                  disabled={props.loading || eventOptions.length === 0 || !canOpenRound}
                  onClick={() => props.onOpenRound(selectedEventId)}
                >
                  发布并开放
                </button>
                <button type="button" disabled={props.loading || !canLockRound} onClick={props.onLockRound}>
                  锁定回合
                </button>
                <button type="button" disabled={props.loading || !canSettleRound} onClick={props.onSettleRound}>
                  结算回合
                </button>
                <button type="button" className="ghost-button" disabled={props.loading || !canResetRoom} onClick={props.onResetRoom}>
                  重置课堂
                </button>
                <button type="button" className="ghost-button" disabled={props.loading || !canArchiveRoom} onClick={props.onArchive}>
                  归档并关闭
                </button>
                <button type="button" className="ghost-button" disabled={props.loading} onClick={props.onCleanupStorage}>
                  清理旧数据
                </button>
                <button type="button" className="ghost-button" disabled={props.loading} onClick={props.onExport}>
                  导出成绩 CSV
                </button>
              </div>
            </div>
            {selectedEvent ? (
              <div className="compact-panel top-gap">
                <strong>{selectedEvent.title}</strong>
                <p>{selectedEvent.transmissionPath ?? "本事件的市场与生活传导路径会显示在这里。"}</p>
                <div className="tag-row">
                  {(selectedEvent.teachingPoints ?? []).map((point) => (
                    <span key={point} className="info-tag">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">班级画像</p>
                <h3>老师讲解重点</h3>
              </div>
              <span className="info-tag">课堂复盘核心</span>
            </div>
            <div className="metric-grid dense">
              <article className="metric-card compact">
                <span>班级人数</span>
                <strong>{submissionSummary?.total ?? students.length}</strong>
              </article>
              <article className="metric-card compact">
                <span>已提交人数</span>
                <strong>{submissionSummary?.submitted ?? 0}</strong>
              </article>
              <article className="metric-card compact">
                <span>平均分</span>
                <strong>{Number(classProfile?.avgScore ?? 0).toFixed(1)}</strong>
              </article>
              <article className="metric-card compact">
                <span>平均净资产</span>
                <strong>{currency(classProfile?.avgNetWorth)}</strong>
              </article>
              <article className="metric-card compact">
                <span>平均应急金月数</span>
                <strong>{Number(classProfile?.avgEmergencyMonths ?? 0).toFixed(1)} 月</strong>
              </article>
              <article className="metric-card compact">
                <span>平均 DSR</span>
                <strong>{Number(classProfile?.avgDsr ?? 0).toFixed(1)}%</strong>
              </article>
              <article className="metric-card compact">
                <span>有车人数</span>
                <strong>{classProfile?.vehiclesOwned ?? 0}</strong>
              </article>
              {showRealEstate ? (
                <article className="metric-card compact">
                  <span>有房人数</span>
                  <strong>{classProfile?.homesOwned ?? 0}</strong>
                </article>
              ) : null}
              {showRealEstate ? (
                <article className="metric-card compact">
                  <span>固定成本锁定</span>
                  <strong>{classProfile?.fixedCostLocked ?? 0}</strong>
                </article>
              ) : null}
              {showRealEstate ? (
                <article className="metric-card compact">
                  <span>订婚 / 已婚</span>
                  <strong>
                    {classProfile?.engagedStudents ?? 0} / {classProfile?.marriedStudents ?? 0}
                  </strong>
                </article>
              ) : null}
            </div>
            <div className="three-col-grid top-gap">
              <div className="compact-panel">
                <strong>准备状态</strong>
                <p>学习 {classProfile?.preparedness?.learningReady ?? 0}</p>
                <p>健康 {classProfile?.preparedness?.healthReady ?? 0}</p>
                <p>设备 {classProfile?.preparedness?.deviceReady ?? 0}</p>
                <p>储备 {classProfile?.preparedness?.reserveReady ?? 0}</p>
                <p>安全 {classProfile?.preparedness?.safetyReady ?? 0}</p>
                {showTax ? <p>税务 {classProfile?.preparedness?.taxReady ?? 0}</p> : null}
                {showRetirement ? <p>退休 {classProfile?.preparedness?.retirementReady ?? 0}</p> : null}
                {showLegacy ? <p>家庭支持 {classProfile?.preparedness?.legacyReady ?? 0}</p> : null}
              </div>
              <div className="compact-panel">
                <strong>保障覆盖</strong>
                <p>健康保障 {classProfile?.insuranceCoverage?.healthCover ?? 0}</p>
                <p>意外保障 {classProfile?.insuranceCoverage?.accidentCover ?? 0}</p>
                <p>网络安全保障 {classProfile?.insuranceCoverage?.cyberCover ?? 0}</p>
              </div>
              <div className="compact-panel">
                <strong>风险原因 TOP3</strong>
                {(classProfile?.topRiskTags ?? []).length ? (
                  classProfile?.topRiskTags.map((tag) => <p key={tag.tag}>{tag.tag} / {tag.hits}</p>)
                ) : (
                  <p>暂无高频风险标签</p>
                )}
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">学生进度与风险标签</p>
                <h3>谁已提交，谁最需要被点名讲解</h3>
              </div>
            </div>
            {students.length === 0 ? (
              <p>当前还没有学生加入。</p>
            ) : (
              <div className="table-grid">
                <div className="table-grid-head">
                  <span>学生</span>
                  <span>角色</span>
                  <span>提交状态</span>
                </div>
                {students.map((student) => (
                  <div key={student.id} className="table-grid-row">
                    <span>{student.displayName}</span>
                    <span>{student.roleId}</span>
                    <span>{student.submitted ? "已提交" : "待提交"}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>

        <aside className="dashboard-side">
          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">教师讲解重点</p>
                <h3>{currentRoundSummary?.teacherCue ?? "本轮完成结算后，这里会生成教师讲解提示。"}</h3>
              </div>
            </div>
            <div className="student-list">
              <div className="student-row">
                <strong>主要驱动</strong>
                <span>
                  {(currentRoundSummary?.topDrivers ?? []).map((item) => `${item.label} ${item.total}`).join(" / ") || "等待结算"}
                </span>
              </div>
              <div className="student-row">
                <strong>骰子事件分布</strong>
                <span>
                  {(currentRoundSummary?.diceCategories ?? []).map((item) => `${item.category} x${item.count}`).join(" / ") || "等待结算"}
                </span>
              </div>
              <div className="student-row">
                <strong>保护命中 / 放大命中</strong>
                <span>
                  {currentRoundSummary?.protectionSummary?.supportiveHits ?? 0} /{" "}
                  {currentRoundSummary?.protectionSummary?.amplifiedHits ?? 0}
                </span>
              </div>
              {showRealEstate ? (
                <div className="student-row">
                  <strong>生命周期负担</strong>
                  <span>{currentRoundSummary?.lifecycleCue ?? "等待结算后生成"}</span>
                </div>
              ) : null}
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">课堂排行榜</p>
                <h3>前 5 名</h3>
              </div>
            </div>
            {ranking.length === 0 ? (
              <p>当前还没有排行榜数据。</p>
            ) : (
              <div className="student-list">
                {ranking.slice(0, 5).map((row) => (
                  <div key={`${row.rank}-${row.displayName}`} className="student-row">
                    <div>
                      <strong>#{row.rank} {row.displayName}</strong>
                      <div>{row.roleId}</div>
                    </div>
                    <span>分数 {Number(row.finalScore).toFixed(1)} / 净资产 {currency(row.netWorth)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">历史结算记录</p>
                <h3>适合课后复盘与成绩汇总</h3>
              </div>
              <span className="info-tag">归档后保留</span>
            </div>
            {roundHistory.length === 0 ? (
              <p>暂无历史结算。</p>
            ) : (
              <div className="student-list">
                {roundHistory
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((item) => (
                    <div key={`${item.roundNo}-${item.settledAt}`} className="student-row">
                      <div>
                        <strong>第 {item.roundNo} 回合</strong>
                        <div>{item.eventTitle ?? "宏观事件"}</div>
                      </div>
                      <button type="button" className="ghost-button" onClick={() => props.onOpenRoundDetail(item.roundNo)} disabled={props.loading}>
                        打开详情
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">历史课堂列表</p>
                <h3>归档后保留，不会被重置清空</h3>
              </div>
            </div>
            {!archives.length ? <p>暂无已归档课堂。</p> : <p>当前已有 {archives.length} 个归档快照，可在“查看归档”里详细复盘。</p>}
          </article>
        </aside>
      </section>
    </section>
  );
}
