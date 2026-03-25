import {
  formatCashFlowLabel,
  formatDiceCategory,
  formatDriverLabel,
  formatFamilyStage,
  formatRiskTag,
  formatRoleLabel
} from "../lib/display";

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

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function percent(value?: number) {
  return `${(Number(value ?? 0) * 100).toFixed(1)}%`;
}

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
        <h3>教师讲解重点</h3>
        {!detail ? (
          <p>当前没有加载到回合详情。</p>
        ) : (
          <div className="student-list">
            <div className="student-row">
              <strong>班级均分</strong>
              <span>{Number(detail.avgScore ?? 0).toFixed(1)}</span>
            </div>
            <div className="student-row">
              <strong>已提交人数</strong>
              <span>{detail.submitted ?? 0}</span>
            </div>
            <div className="student-row">
              <strong>主要驱动</strong>
              <span>
                {(detail.teachingSummary?.topDrivers ?? [])
                  .map((item) => `${formatDriverLabel(item.label)} ${currency(item.total)}`)
                  .join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>骰子事件分布</strong>
              <span>
                {(detail.teachingSummary?.diceCategories ?? [])
                  .map((item) => `${formatDiceCategory(item.category)} x${item.count}`)
                  .join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>风险焦点</strong>
              <span>
                {(detail.teachingSummary?.topRiskTags ?? [])
                  .map((item) => `${formatRiskTag(item.tag)}(${item.count})`)
                  .join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>课堂提示</strong>
              <span>{detail.teachingSummary?.teacherCue ?? "--"}</span>
            </div>
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>学生进度与风险标签</h3>
        {!detail?.students?.length ? (
          <p>当前回合还没有学生详情。</p>
        ) : (
          <div className="student-list">
            {detail.students.map((student) => (
              <div key={student.studentId} className="archive-card">
                <strong>
                  {student.displayName} | {formatRoleLabel(student.roleId)} | 分数 {Number(student.finalScore ?? 0).toFixed(1)} | 净资产 {currency(student.netWorth)}
                </strong>
                <span>风险标签：{student.riskTags.map((tag) => formatRiskTag(tag)).join(" / ") || "当前风险可控"}</span>
                <span>
                  主要驱动：
                  {(student.topDrivers ?? []).map((item) => `${formatDriverLabel(item.label)} ${currency(item.value)}`).join(" / ") || "--"}
                </span>
                <span>
                  准备状态：学习 {student.preparedness?.learningReady ? 1 : 0} / 健康 {student.preparedness?.healthReady ? 1 : 0} / 设备{" "}
                  {student.preparedness?.deviceReady ? 1 : 0} / 储备 {student.preparedness?.reserveReady ? 1 : 0} / 安全{" "}
                  {student.preparedness?.safetyReady ? 1 : 0} / 债务压力 {student.preparedness?.debtStressed ? 1 : 0}
                </span>
                <span>
                  保障覆盖：健康 {student.insuranceFlags?.healthCover ? 1 : 0} / 意外 {student.insuranceFlags?.accidentCover ? 1 : 0} / 网络安全{" "}
                  {student.insuranceFlags?.cyberCover ? 1 : 0}
                </span>
                <span>
                  家庭阶段：{formatFamilyStage(student.family?.stage)} / 家庭支持 {currency(student.family?.monthlySupport)}
                </span>
                <span>
                  核心指标：负债率 {percent(student.score?.debtRatio)} / 偿债率 {percent(student.score?.dsr)} / 应急金{" "}
                  {Number(student.score?.emergencyMonths ?? 0).toFixed(1)} 月 / 固定成本占比 {percent(student.score?.fixedCostRatio)}
                </span>
                <span>骰子事件：{student.diceEvent?.title ?? "--"} / {formatDiceCategory(student.diceEvent?.category)}</span>
                <span>骰子提示：{student.diceEvent?.teacherNote ?? "--"}</span>
                <span>
                  债务变化：{currency(student.debtChange?.debtBefore)}
                  {" -> "}
                  {currency(student.debtChange?.debtAfter)} / 缺口债务 {currency(student.debtChange?.bridgeShortfall)}
                </span>
                <span>
                  现金流摘要：
                  {Object.entries(student.cashFlow ?? {})
                    .slice(0, 6)
                    .map(([key, value]) => `${formatCashFlowLabel(key)}:${currency(value)}`)
                    .join(" / ") || "--"}
                </span>
                <span>{student.settlementSummary?.[0] ?? "暂无结算摘要。"}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
