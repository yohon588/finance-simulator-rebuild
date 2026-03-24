import { formatFamilyStage } from "../lib/display";

type TeacherRoundDetailPageProps = {
  loading?: boolean;
  onBack: () => void;
  payload: {
    classroom?: {
      code: string;
      name: string;
    };
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
          debtRatio?: number;
          dsr?: number;
          emergencyMonths?: number;
          fixedCostRatio?: number;
        } | null;
        settlementSummary?: string[];
      }>;
    };
  } | null;
};

export function TeacherRoundDetailPage(props: TeacherRoundDetailPageProps) {
  const detail = props.payload?.roundDetail;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">教师回合详情</p>
          <h2>
            {props.payload?.classroom?.name ?? "课堂"} | 第 {detail?.roundNo ?? "--"} 回合
          </h2>
          <p>{detail?.eventTitle ?? "宏观事件"} | {detail?.settledAt ?? "--"}</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack} disabled={props.loading}>
            返回
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>回合摘要</h3>
        {!detail ? (
          <p>当前没有加载到回合详情。</p>
        ) : (
          <>
            <p>平均分：{detail.avgScore ?? 0}</p>
            <p>提交人数：{detail.submitted ?? 0}</p>
            <p>
              主要驱动：{(detail.teachingSummary?.topDrivers ?? [])
                .map((item) => `${item.label} ${item.total}`)
                .join(" / ") || "--"}
            </p>
            <p>
              骰子分布：{(detail.teachingSummary?.diceCategories ?? [])
                .map((item) => `${item.category} x${item.count}`)
                .join(" / ") || "--"}
            </p>
            <p>
              风险焦点：{(detail.teachingSummary?.topRiskTags ?? [])
                .map((item) => `${item.tag}(${item.count})`)
                .join(" / ") || "--"}
            </p>
            <p>教师提示：{detail.teachingSummary?.teacherCue ?? "--"}</p>
          </>
        )}
      </article>

      <article className="panel page-panel">
        <h3>学生快照</h3>
        {!detail?.students || detail.students.length === 0 ? (
          <p>当前回合还没有学生详情。</p>
        ) : (
          <div className="student-list">
            {detail.students.map((student) => (
              <div key={student.studentId} className="archive-card">
                <strong>
                  {student.displayName} | {student.roleId} | 分数 {student.finalScore} | 净资产 {student.netWorth ?? 0}
                </strong>
                <span>
                  骰子事件：{student.diceEvent?.title ?? "--"}（{student.diceEvent?.category ?? "--"}）
                </span>
                <span>
                  骰子现金影响：{student.diceEvent?.cashEffect ?? 0} | {(student.diceEvent?.modifiers ?? []).join(" / ") || "无修正因素"}
                </span>
                {student.diceEvent?.knowledgePoint ? <span>知识点：{student.diceEvent.knowledgePoint}</span> : null}
                {student.diceEvent?.teacherNote ? <span>教师提示：{student.diceEvent.teacherNote}</span> : null}
                <span>
                  准备状态：学习 {student.preparedness?.learningReady ? 1 : 0} / 健康 {student.preparedness?.healthReady ? 1 : 0} /
                  设备 {student.preparedness?.deviceReady ? 1 : 0} / 储备 {student.preparedness?.reserveReady ? 1 : 0} / 安全{" "}
                  {student.preparedness?.safetyReady ? 1 : 0} / 债务压力 {student.preparedness?.debtStressed ? 1 : 0}
                </span>
                <span>
                  保障：健康 {student.insuranceFlags?.healthCover ? 1 : 0} / 意外 {student.insuranceFlags?.accidentCover ? 1 : 0} /
                  网络安全 {student.insuranceFlags?.cyberCover ? 1 : 0} | 家庭阶段 {formatFamilyStage(student.family?.stage)} / 支持{" "}
                  {student.family?.monthlySupport ?? 0}
                </span>
                <span>
                  指标：负债率 {student.score?.debtRatio ?? 0} / 偿债率 {student.score?.dsr ?? 0} / 应急金{" "}
                  {student.score?.emergencyMonths ?? 0} / 固定成本占比 {student.score?.fixedCostRatio ?? 0}
                </span>
                <span>
                  主要驱动：{(student.topDrivers ?? []).map((item) => `${item.label} ${item.value}`).join(" / ") || "--"}
                </span>
                <span>
                  债务：{student.debtChange?.debtBefore ?? 0} 到 {student.debtChange?.debtAfter ?? 0} | 缺口债{" "}
                  {student.debtChange?.bridgeShortfall ?? 0} 进入 {student.debtChange?.bridgeTarget ?? "--"}
                </span>
                <span>
                  债务状态：{(student.debtChange?.items ?? [])
                    .map((item) => `${item.type ?? item.id}:${item.status}/${item.principal}`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  债务分配：{Object.entries(student.debtChange?.paidByDebt ?? {})
                    .map(([debtId, paid]) => `${debtId}:${paid}`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  现金流：{Object.entries(student.cashFlow ?? {})
                    .slice(0, 6)
                    .map(([key, value]) => `${key}:${value}`)
                    .join(" / ") || "--"}
                </span>
                <span>风险标签：{student.riskTags.join(" / ") || "--"}</span>
                <span>{student.settlementSummary?.[0] ?? "暂无结算摘要。"}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
