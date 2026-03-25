import { useEffect, useMemo, useState } from "react";

import { buildDecisionPreview, readDecisionDraft } from "../lib/decision-preview";
import {
  formatAssetLabel,
  formatDiceCategory,
  formatDriverLabel,
  formatFamilyStage,
  formatRiskTag,
  formatRoleLabel,
  formatRoundStatus
} from "../lib/display";

type StudentDashboardPageProps = {
  loading: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onGoDecision: () => void;
  onGoDebts: () => void;
  onOpenRoundDetail: (roundNo: number) => Promise<void>;
  onRollDice: () => Promise<void>;
  payload: {
    classroom: {
      code: string;
      name: string;
    };
    round: {
      id: string;
      no: number;
      status: string;
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
      title: string;
      teachingPoints?: string[];
      transmissionPath?: string;
    } | null;
    market?: Record<string, number>;
    budget?: {
      salary: number;
      mandatoryLiving: number;
      minDebtPay: number;
      borrowLimit: number;
      vehicleMandatory?: number;
      housingMandatory?: number;
      familyMandatory?: number;
    } | null;
    currentDecision?: {
      idempotencyKey: string;
      submittedAt: string;
    } | null;
    currentDice?: {
      roll: number;
      category: string;
      card?: {
        title?: string;
        knowledgePoint?: string;
      };
      appliedEffect?: {
        cash?: number;
        modifiers?: string[];
      };
    } | null;
    latestLedger?: {
      roundNo: number;
      score?: {
        finalScore?: number;
        wealthScore?: number;
        healthScore?: number;
        lifeScore?: number;
      };
    } | null;
    student: {
      displayName: string;
      roleId: string;
      baseSalary: number;
      cash: number;
      assets?: Record<string, number>;
      vehicle?: {
        owned?: boolean;
        value?: number;
        monthlyPayment?: number;
        maintenance?: number;
      };
      house?: {
        owned?: boolean;
        value?: number;
        monthlyPayment?: number;
        maintenance?: number;
      };
      family?: {
        stage?: string;
        monthlySupport?: number;
      };
      insuranceFlags?: {
        healthCover?: boolean;
        accidentCover?: boolean;
        cyberCover?: boolean;
      };
      prepFlags?: {
        learningReady: boolean;
        healthReady?: boolean;
        deviceReady?: boolean;
        reserveReady: boolean;
        safetyReady: boolean;
        taxReady?: boolean;
        retirementReady?: boolean;
        legacyReady?: boolean;
        debtStressed: boolean;
      };
      metrics: {
        netWorth: number;
        debtRatio: number;
        dsr: number;
        emergencyMonths: number;
        finalScore?: number;
      };
      riskTags: string[];
    };
    chartSeries?: Array<{
      roundNo: number;
      netWorth: number;
      A4: number;
      A5: number;
      A6: number;
      A7: number;
      A8: number;
    }>;
    roundHistory?: Array<{
      roundNo: number;
      eventTitle?: string;
      settledAt: string;
      avgScore?: number;
    }>;
  };
};

type PieSlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

const piePalette = ["#157347", "#0d6efd", "#ff8a00", "#8f3fd1", "#d63384", "#17a2b8", "#6c757d", "#795548"];

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function percent(value?: number) {
  return `${(Number(value ?? 0) * 100).toFixed(1)}%`;
}

function clampScore(value: number) {
  return Math.max(0, Number(value.toFixed(1)));
}

function calcWealthScore(netWorth: number, baseSalary: number) {
  return clampScore((netWorth / Math.max(baseSalary, 1)) * 10);
}

function calcHealthScore(debtRatio: number, dsr: number, emergencyMonths: number) {
  return clampScore((100 - debtRatio * 30 - dsr * 40 + emergencyMonths * 8) / 2);
}

function calcLifeScore(consumeTotal: number) {
  return clampScore(Math.min(consumeTotal / 3000, 1) * 100);
}

function buildPiePath(startAngle: number, endAngle: number, radius = 76, center = 90) {
  const start = polarToCartesian(center, center, radius, endAngle);
  const end = polarToCartesian(center, center, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [`M ${center} ${center}`, `L ${start.x} ${start.y}`, `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, "Z"].join(" ");
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function buildLinePoints(values: number[], width = 420, height = 180) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function AssetPieChart({ slices, title }: { slices: PieSlice[]; title: string }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let start = 0;

  return (
    <article className="panel page-panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">资金分布</p>
          <h3>{title}</h3>
        </div>
        <span className="info-tag">总额 {currency(total)}</span>
      </div>
      <div className="asset-chart-wrap">
        <svg viewBox="0 0 180 180" className="asset-pie" aria-label="资金分布图">
          {slices.length ? (
            slices.map((slice) => {
              const angle = (slice.value / total) * 360;
              const path = buildPiePath(start, start + angle);
              start += angle;
              return <path key={slice.key} d={path} fill={slice.color} stroke="#fff" strokeWidth="2" />;
            })
          ) : (
            <circle cx="90" cy="90" r="72" fill="#eef3f8" />
          )}
          <circle cx="90" cy="90" r="32" fill="#fff" />
          <text x="90" y="87" textAnchor="middle" className="pie-center-number">
            {slices.length}
          </text>
          <text x="90" y="104" textAnchor="middle" className="pie-center-label">
            类别
          </text>
        </svg>
        <div className="chart-legend">
          {slices.map((slice) => (
            <div key={slice.key} className="legend-row">
              <span className="legend-dot" style={{ backgroundColor: slice.color }} />
              <span>{slice.label}</span>
              <strong>{currency(slice.value)}</strong>
            </div>
          ))}
          {!slices.length ? <p className="muted-text">当前还没有可展示的资金分布。</p> : null}
        </div>
      </div>
    </article>
  );
}

export function StudentDashboardPage(props: StudentDashboardPageProps) {
  const { payload } = props;
  const latestRoundNo = payload.latestLedger?.roundNo ?? payload.roundHistory?.[payload.roundHistory.length - 1]?.roundNo;
  const [isRolling, setIsRolling] = useState(false);
  const [rollingFace, setRollingFace] = useState(1);
  const [selectedTrend, setSelectedTrend] = useState<"netWorth" | "A5" | "A6" | "A7" | "A8">("netWorth");

  useEffect(() => {
    if (!isRolling) return undefined;
    const timer = window.setInterval(() => setRollingFace((face) => (face % 6) + 1), 100);
    return () => window.clearInterval(timer);
  }, [isRolling]);

  const draftPreview = useMemo(() => {
    const draft = readDecisionDraft(payload.round.id);
    if (!draft || !payload.budget) {
      return null;
    }

    return buildDecisionPreview({
      draft,
      budget: payload.budget,
      student: payload.student
    });
  }, [payload.round.id, payload.budget, payload.student]);

  const settledScore = payload.latestLedger?.score;
  const displayNetWorth = draftPreview?.projectedNetWorth ?? payload.student.metrics.netWorth;
  const displayCash = draftPreview?.projectedCash ?? payload.student.cash;
  const displayEmergencyMonths = draftPreview?.projectedEmergencyMonths ?? payload.student.metrics.emergencyMonths;
  const displayVehicle = draftPreview?.projectedVehicle ?? payload.student.vehicle;
  const displayHouse = draftPreview?.projectedHouse ?? payload.student.house;
  const displayFamily = draftPreview?.projectedFamily ?? payload.student.family;
  const displayBudget = draftPreview
    ? {
        ...payload.budget,
        vehicleMandatory: draftPreview.projectedBudget.vehicleMandatory,
        housingMandatory: draftPreview.projectedBudget.housingMandatory,
        familyMandatory: draftPreview.projectedBudget.familyMandatory
      }
    : payload.budget;

  const totalNecessarySpend =
    (displayBudget?.mandatoryLiving ?? 0) +
    (displayBudget?.minDebtPay ?? 0) +
    (displayBudget?.vehicleMandatory ?? 0) +
    (displayBudget?.housingMandatory ?? 0) +
    (displayBudget?.familyMandatory ?? 0);
  const freedomRatio = totalNecessarySpend > 0 ? Math.max(0, (displayCash / totalNecessarySpend) * 100) : 0;
  const displayWealthScore = draftPreview
    ? calcWealthScore(displayNetWorth, payload.student.baseSalary)
    : Number(settledScore?.wealthScore ?? calcWealthScore(displayNetWorth, payload.student.baseSalary));
  const displayHealthScore = draftPreview
    ? calcHealthScore(payload.student.metrics.debtRatio, payload.student.metrics.dsr, displayEmergencyMonths)
    : Number(
        settledScore?.healthScore ??
          calcHealthScore(payload.student.metrics.debtRatio, payload.student.metrics.dsr, displayEmergencyMonths)
      );
  const displayLifeScore = draftPreview
    ? Number(draftPreview.projectedLifeScore ?? 0)
    : Number(settledScore?.lifeScore ?? 0);
  const displayFinalScore = draftPreview
    ? clampScore(displayWealthScore * 0.6 + displayHealthScore * 0.3 + displayLifeScore * 0.1)
    : Number(settledScore?.finalScore ?? payload.student.metrics.finalScore ?? 0);
  const freedomSummary =
    totalNecessarySpend > 0
      ? `当前按可动用现金 ÷ 每轮必要支出计算，约可覆盖 ${freedomRatio.toFixed(1)}% 的固定开销。`
      : "当前没有识别到必要支出，财富自由度暂按 0 处理。";

  const pieSlices = useMemo<PieSlice[]>(() => {
    const entries = draftPreview?.assetDistribution?.length
      ? draftPreview.assetDistribution.map((item, index) => ({
          key: item.key,
          label: item.label,
          value: item.value,
          color: piePalette[index % piePalette.length]
        }))
      : [
          { key: "cash", label: "现金", value: displayCash ?? 0, color: piePalette[0] },
          { key: "A1", label: formatAssetLabel("A1"), value: payload.student.assets?.A1 ?? 0, color: piePalette[1] },
          { key: "A4", label: formatAssetLabel("A4"), value: payload.student.assets?.A4 ?? 0, color: piePalette[2] },
          { key: "A5", label: formatAssetLabel("A5"), value: payload.student.assets?.A5 ?? 0, color: piePalette[3] },
          { key: "A6", label: formatAssetLabel("A6"), value: payload.student.assets?.A6 ?? 0, color: piePalette[4] },
          { key: "A7", label: formatAssetLabel("A7"), value: payload.student.assets?.A7 ?? 0, color: piePalette[5] },
          { key: "A8", label: formatAssetLabel("A8"), value: payload.student.assets?.A8 ?? 0, color: piePalette[6] },
          { key: "vehicle", label: "车辆", value: displayVehicle?.value ?? 0, color: piePalette[7] },
          { key: "house", label: "房产", value: displayHouse?.value ?? 0, color: "#8d6e63" }
        ].filter((item) => item.value > 0);

    return entries.filter((item) => item.value > 0);
  }, [draftPreview, displayCash, displayVehicle, displayHouse, payload.student.assets]);

  const chartSeries = payload.chartSeries ?? [];
  const trendLabels = chartSeries.map((item) => `第${item.roundNo}轮`);
  const trendMap: Record<"netWorth" | "A5" | "A6" | "A7" | "A8", { title: string; suffix: string; values: number[] }> = {
    netWorth: { title: "净资产变化", suffix: "元", values: chartSeries.map((item) => item.netWorth) },
    A5: { title: `${formatAssetLabel("A5")}收益率`, suffix: "%", values: chartSeries.map((item) => item.A5) },
    A6: { title: `${formatAssetLabel("A6")}收益率`, suffix: "%", values: chartSeries.map((item) => item.A6) },
    A7: { title: `${formatAssetLabel("A7")}收益率`, suffix: "%", values: chartSeries.map((item) => item.A7) },
    A8: { title: `${formatAssetLabel("A8")}收益率`, suffix: "%", values: chartSeries.map((item) => item.A8) }
  };

  async function handleRollDice() {
    if (props.loading || isRolling) return;
    setIsRolling(true);
    const startedAt = Date.now();
    try {
      await props.onRollDice();
    } finally {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 900 - elapsed);
      window.setTimeout(() => setIsRolling(false), wait);
    }
  }

  const currentTrend = trendMap[selectedTrend];
  const trendPoints = currentTrend.values;
  const polyline = buildLinePoints(trendPoints);
  const minTrend = trendPoints.length ? Math.min(...trendPoints) : 0;
  const maxTrend = trendPoints.length ? Math.max(...trendPoints) : 0;
  const latestTrend = trendPoints.at(-1) ?? 0;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">学生课堂面板</p>
          <h2>{payload.student.displayName}</h2>
          <p>
            {payload.classroom.name} | 课堂码 {payload.classroom.code} | 角色 {formatRoleLabel(payload.student.roleId)}
          </p>
        </div>
        <div className="action-row">
          <button type="button" onClick={props.onRefresh} disabled={props.loading}>
            刷新数据
          </button>
          <button type="button" onClick={props.onGoDecision} disabled={props.loading}>
            进入资金配置
          </button>
          <button type="button" onClick={props.onGoDebts} disabled={props.loading}>
            查看债务
          </button>
          <button type="button" className="ghost-button" onClick={() => latestRoundNo && props.onOpenRoundDetail(latestRoundNo)} disabled={props.loading || !latestRoundNo}>
            查看复盘
          </button>
          <button type="button" onClick={handleRollDice} disabled={props.loading || isRolling}>
            {isRolling ? "掷骰子中..." : "掷个人骰子"}
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
                <p className="eyebrow">课堂状态</p>
                <h3>第 {payload.round.no} 回合</h3>
              </div>
              <div className="tag-row">
                {draftPreview ? <span className="info-tag">首页已同步草稿预览</span> : null}
                <span className="info-tag">{formatRoundStatus(payload.round.status)}</span>
              </div>
            </div>
            <div className="metric-grid dense">
              <article className="metric-card compact">
                <span>净资产</span>
                <strong>{currency(displayNetWorth)}</strong>
              </article>
              <article className="metric-card compact">
                <span>负债率</span>
                <strong>{percent(payload.student.metrics.debtRatio)}</strong>
              </article>
              <article className="metric-card compact">
                <span>偿债率 DSR</span>
                <strong>{percent(payload.student.metrics.dsr)}</strong>
              </article>
              <article className="metric-card compact">
                <span>应急金月数</span>
                <strong>{displayEmergencyMonths.toFixed(1)} 月</strong>
              </article>
              <article className="metric-card compact">
                <span>综合得分</span>
                  <strong>{displayFinalScore.toFixed(1)}</strong>
              </article>
              <article className="metric-card compact">
                <span>财富自由度</span>
                <strong>{freedomRatio.toFixed(1)}%</strong>
              </article>
              <article className="metric-card compact">
                <span>当前现金</span>
                <strong>{currency(displayCash)}</strong>
              </article>
              <article className="metric-card compact">
                <span>本轮工资入账</span>
                <strong>{currency(payload.budget?.salary ?? payload.student.baseSalary)}</strong>
              </article>
              <article className="metric-card compact">
                <span>必要生活费</span>
                <strong>{currency(displayBudget?.mandatoryLiving)}</strong>
              </article>
              <article className="metric-card compact">
                <span>最低还款</span>
                <strong>{currency(displayBudget?.minDebtPay)}</strong>
              </article>
              <article className="metric-card compact">
                <span>车辆固定支出</span>
                <strong>{currency(displayBudget?.vehicleMandatory)}</strong>
              </article>
              <article className="metric-card compact">
                <span>房产固定支出</span>
                <strong>{currency(displayBudget?.housingMandatory)}</strong>
              </article>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">分数说明</p>
                <h3>综合分数怎么来的</h3>
              </div>
              <span className="info-tag">
                {draftPreview ? "当前显示草稿预估分" : "当前显示已结算得分"}
              </span>
            </div>
            <div className="metric-grid dense">
              <article className="metric-card compact">
                <span>财富分 60%</span>
                <strong>{displayWealthScore.toFixed(1)}</strong>
                <p>公式：净资产 ÷ 月工资 × 10</p>
              </article>
              <article className="metric-card compact">
                <span>财务健康分 30%</span>
                <strong>{displayHealthScore.toFixed(1)}</strong>
                <p>由负债率、DSR、应急金月数共同决定</p>
              </article>
              <article className="metric-card compact">
                <span>生活品质分 10%</span>
                <strong>{displayLifeScore.toFixed(1)}</strong>
                <p>{draftPreview ? "按本轮草稿里的生活投入预估" : "进入配置页后会随生活消费预览变化"}</p>
              </article>
              <article className="metric-card compact">
                <span>综合分预估</span>
                <strong>{displayFinalScore.toFixed(1)}</strong>
                <p>公式：财富分×0.6 + 财务健康分×0.3 + 生活品质分×0.1</p>
              </article>
              <article className="metric-card compact">
                <span>财富自由度</span>
                <strong>{freedomRatio.toFixed(1)}%</strong>
                <p>{freedomSummary}</p>
              </article>
              <article className="metric-card compact">
                <span>必要支出底线</span>
                <strong>{currency(totalNecessarySpend)}</strong>
                <p>包含生活费、最低还款、房车和家庭固定支出</p>
              </article>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">回合事件</p>
                <h3>{payload.currentEvent?.title ?? "等待教师开放本轮事件"}</h3>
              </div>
              <button type="button" className="ghost-button" onClick={props.onGoDecision} disabled={props.loading}>
                先看事件，再做配置
              </button>
            </div>
            <p>{payload.currentEvent?.transmissionPath ?? "教师开放回合后，这里会显示事件如何影响现金流、资产和风险。"}</p>
            <div className="tag-row">
              {(payload.currentEvent?.teachingPoints ?? []).map((point) => (
                <span key={point} className="info-tag">
                  {point}
                </span>
              ))}
            </div>
            <div className="market-grid top-gap">
              {payload.market ? (
                Object.entries(payload.market).map(([asset, value]) => (
                  <div key={asset} className="market-item">
                    <span>{formatAssetLabel(asset)}</span>
                    <strong className={value >= 0 ? "positive" : "negative"}>{Number(value).toFixed(2)}%</strong>
                  </div>
                ))
              ) : (
                <p className="muted-text">教师发布事件后，这里会出现本轮市场变化。</p>
              )}
            </div>
          </article>

          <AssetPieChart slices={pieSlices} title={draftPreview ? "草稿预览下的资金分布" : "当前账户资金分布"} />

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">资产变化</p>
                <h3>把资产收益统一放在一起看</h3>
              </div>
              <div className="tag-row">
                {(["netWorth", "A5", "A6", "A7", "A8"] as const).map((key) => (
                  <button key={key} type="button" className={selectedTrend === key ? "mini-tab active" : "mini-tab"} onClick={() => setSelectedTrend(key)}>
                    {key === "netWorth" ? "净资产" : formatAssetLabel(key)}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-card">
              <div className="section-head">
                <div>
                  <p className="eyebrow">趋势</p>
                  <h3>{currentTrend.title}</h3>
                </div>
                <span className="info-tag">最新 {latestTrend.toFixed(selectedTrend === "netWorth" ? 0 : 2)}{currentTrend.suffix}</span>
              </div>
              {trendPoints.length ? (
                <>
                  <svg viewBox="0 0 420 220" className="trend-chart" aria-label={currentTrend.title}>
                    <line x1="0" y1="180" x2="420" y2="180" className="chart-axis" />
                    <line x1="0" y1="0" x2="0" y2="180" className="chart-axis" />
                    <polyline points={polyline} fill="none" stroke="#1366d6" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                  <div className="trend-meta">
                    <span>最低 {minTrend.toFixed(selectedTrend === "netWorth" ? 0 : 2)}{currentTrend.suffix}</span>
                    <span>最高 {maxTrend.toFixed(selectedTrend === "netWorth" ? 0 : 2)}{currentTrend.suffix}</span>
                  </div>
                  <div className="trend-labels">
                    {trendLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </>
              ) : (
                <p className="muted-text">完成至少一轮结算后，这里会显示资产变化趋势。</p>
              )}
            </div>
          </article>
        </div>

        <div className="dashboard-side">
          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">本轮操作</p>
                <h3>{payload.currentDecision ? "已提交，可继续查看" : "还未提交"}</h3>
              </div>
              <span className="info-tag">{payload.currentDecision ? "已提交" : "待提交"}</span>
            </div>
            <div className="metric-grid dense">
              <article className="metric-card compact">
                <span>可支配金额</span>
                <strong>{currency(draftPreview?.availableCash ?? 0)}</strong>
              </article>
              <article className="metric-card compact">
                <span>生活消费</span>
                <strong>{currency(draftPreview?.plannedConsume ?? 0)}</strong>
              </article>
              <article className="metric-card compact">
                <span>金融资产</span>
                <strong>{currency(draftPreview?.plannedInvest ?? 0)}</strong>
              </article>
              <article className="metric-card compact">
                <span>新增借款</span>
                <strong>{currency(draftPreview?.totalBorrow ?? 0)}</strong>
              </article>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">个人骰子</p>
                <h3>{payload.currentDice?.card?.title ?? "还没掷出个人事件"}</h3>
              </div>
            </div>
            <div className="dice-stage">
              <button type="button" className={isRolling ? "dice-face rolling" : "dice-face"} onClick={handleRollDice} disabled={props.loading || isRolling}>
                {isRolling ? rollingFace : payload.currentDice?.roll ?? "?"}
              </button>
              <div className="dice-copy">
                <p>{payload.currentDice?.card?.knowledgePoint ?? "教师开放回合后，你可以掷出个人生活事件。"}</p>
                {payload.currentDice?.appliedEffect?.cash ? (
                  <p className={payload.currentDice.appliedEffect.cash >= 0 ? "positive" : "negative"}>
                    现金影响 {currency(payload.currentDice.appliedEffect.cash)}
                  </p>
                ) : null}
                <div className="tag-row">
                  {(payload.currentDice?.appliedEffect?.modifiers ?? []).map((modifier) => (
                    <span key={modifier} className="info-tag">
                      {modifier}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">固定成本</p>
                <h3>买车买房和家庭阶段都会锁住现金流</h3>
              </div>
            </div>
            <div className="three-col-grid">
              <div className="compact-panel">
                <strong>车辆</strong>
                <p>{displayVehicle?.owned ? "已持有" : "未持有"}</p>
                <p>估值 {currency(displayVehicle?.value)}</p>
                <p>月供 {currency(displayVehicle?.monthlyPayment)} / 维护 {currency(displayVehicle?.maintenance)}</p>
              </div>
              <div className="compact-panel">
                <strong>房产</strong>
                <p>{displayHouse?.owned ? "已持有" : "未持有"}</p>
                <p>估值 {currency(displayHouse?.value)}</p>
                <p>月供 {currency(displayHouse?.monthlyPayment)} / 维护 {currency(displayHouse?.maintenance)}</p>
              </div>
              <div className="compact-panel">
                <strong>家庭阶段</strong>
                <p>{formatFamilyStage(displayFamily?.stage)}</p>
                <p>每轮家庭支持 {currency(displayFamily?.monthlySupport)}</p>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">最近回合</p>
                <h3>适合课后复盘与分数回看</h3>
              </div>
            </div>
            <div className="student-list">
              {(payload.roundHistory ?? []).slice(-4).reverse().map((round) => (
                <button key={round.roundNo} type="button" className="action-card" onClick={() => props.onOpenRoundDetail(round.roundNo)}>
                  <strong>第 {round.roundNo} 回合</strong>
                  <p>{round.eventTitle ?? "未命名事件"}</p>
                  <small>班级均分 {Number(round.avgScore ?? 0).toFixed(1)}</small>
                </button>
              ))}
              {!(payload.roundHistory ?? []).length ? <p className="muted-text">还没有结算历史。</p> : null}
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
