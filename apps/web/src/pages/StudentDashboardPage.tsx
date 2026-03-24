import { useEffect, useMemo, useState } from "react";

import { formatFamilyStage, formatRoundStatus } from "../lib/display";

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

const piePalette = ["#157347", "#0d6efd", "#ff8a00", "#8f3fd1", "#d63384", "#17a2b8", "#6c757d"];

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function percent(value?: number) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

function buildPiePath(startAngle: number, endAngle: number, radius = 76, center = 90) {
  const start = polarToCartesian(center, center, radius, endAngle);
  const end = polarToCartesian(center, center, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z"
  ].join(" ");
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

function AssetPieChart({ slices }: { slices: PieSlice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let start = 0;

  return (
    <div className="chart-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">资产结构</p>
          <h3>一眼看清当前资金分布</h3>
        </div>
        <span className="info-tag">总资产 {currency(total)}</span>
      </div>
      <div className="asset-chart-wrap">
        <svg viewBox="0 0 180 180" className="asset-pie" aria-label="资产饼图">
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
            类资产
          </text>
        </svg>
        <div className="chart-legend">
          {slices.length ? (
            slices.map((slice) => (
              <div key={slice.key} className="legend-row">
                <span className="legend-dot" style={{ backgroundColor: slice.color }} />
                <span>{slice.label}</span>
                <strong>{currency(slice.value)}</strong>
              </div>
            ))
          ) : (
            <p className="muted-text">当前还没有可展示的资产配置。</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AssetTrendChart({
  points,
  labels,
  title,
  suffix,
  color
}: {
  points: number[];
  labels: string[];
  title: string;
  suffix: string;
  color: string;
}) {
  const polyline = buildLinePoints(points);
  const min = points.length ? Math.min(...points) : 0;
  const max = points.length ? Math.max(...points) : 0;
  const latest = points.at(-1) ?? 0;

  return (
    <div className="chart-card">
      <div className="section-head">
        <div>
          <p className="eyebrow">资产变化</p>
          <h3>{title}</h3>
        </div>
        <span className="info-tag">
          最新 {latest.toFixed(title.includes("收益率") ? 1 : 0)}
          {suffix}
        </span>
      </div>
      {points.length ? (
        <>
          <svg viewBox="0 0 420 220" className="trend-chart" aria-label={title}>
            <line x1="0" y1="180" x2="420" y2="180" className="chart-axis" />
            <line x1="0" y1="0" x2="0" y2="180" className="chart-axis" />
            <polyline points={polyline} fill="none" stroke={color} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <div className="trend-meta">
            <span>最低 {min.toFixed(title.includes("收益率") ? 1 : 0)}{suffix}</span>
            <span>最高 {max.toFixed(title.includes("收益率") ? 1 : 0)}{suffix}</span>
          </div>
          <div className="trend-labels">
            {labels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </>
      ) : (
        <p className="muted-text">完成至少一次结算后，这里会显示资产变化折线。</p>
      )}
    </div>
  );
}

export function StudentDashboardPage(props: StudentDashboardPageProps) {
  const { payload } = props;
  const metrics = payload.student.metrics;
  const moduleOpt = payload.moduleConfig?.opt;
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;
  const prepFlags = payload.student.prepFlags;
  const insuranceFlags = payload.student.insuranceFlags;
  const latestRoundNo = payload.latestLedger?.roundNo ?? payload.roundHistory?.[payload.roundHistory.length - 1]?.roundNo;
  const [isRolling, setIsRolling] = useState(false);
  const [rollingFace, setRollingFace] = useState(1);
  const [selectedTrend, setSelectedTrend] = useState<"netWorth" | "A5" | "A6" | "A7" | "A8">("netWorth");

  useEffect(() => {
    if (!isRolling) return undefined;
    const timer = window.setInterval(() => {
      setRollingFace((face) => (face % 6) + 1);
    }, 100);
    return () => window.clearInterval(timer);
  }, [isRolling]);

  const handleRollDice = async () => {
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
  };

  const pieSlices = useMemo<PieSlice[]>(() => {
    const entries: PieSlice[] = [
      { key: "cash", label: "现金", value: payload.student.cash ?? 0, color: piePalette[0] },
      { key: "A1", label: "银行存款", value: payload.student.assets?.A1 ?? 0, color: piePalette[1] },
      { key: "A4", label: "债券基金", value: payload.student.assets?.A4 ?? 0, color: piePalette[2] },
      { key: "A5", label: "股票基金", value: payload.student.assets?.A5 ?? 0, color: piePalette[3] },
      { key: "A6", label: "股票", value: payload.student.assets?.A6 ?? 0, color: piePalette[4] },
      { key: "A7", label: "虚拟币", value: payload.student.assets?.A7 ?? 0, color: piePalette[5] },
      { key: "A8", label: "期权", value: payload.student.assets?.A8 ?? 0, color: piePalette[6] }
    ];
    if (showRealEstate) {
      entries.push({ key: "house", label: "房产", value: payload.student.house?.value ?? 0, color: "#795548" });
    }
    if (payload.student.vehicle?.owned) {
      entries.push({ key: "vehicle", label: "车辆", value: payload.student.vehicle?.value ?? 0, color: "#607d8b" });
    }
    return entries.filter((item) => item.value > 0);
  }, [payload.student, showRealEstate]);

  const chartSeries = payload.chartSeries ?? [];
  const trendLabels = chartSeries.map((item) => `第${item.roundNo}轮`);
  const trendMap: Record<"netWorth" | "A5" | "A6" | "A7" | "A8", { title: string; suffix: string; color: string; values: number[] }> =
    {
      netWorth: {
        title: "净资产变化",
        suffix: "元",
        color: "#1366d6",
        values: chartSeries.map((item) => item.netWorth)
      },
      A5: {
        title: "股票基金收益率变化",
        suffix: "%",
        color: "#8f3fd1",
        values: chartSeries.map((item) => item.A5)
      },
      A6: {
        title: "股票收益率变化",
        suffix: "%",
        color: "#157347",
        values: chartSeries.map((item) => item.A6)
      },
      A7: {
        title: "虚拟币收益率变化",
        suffix: "%",
        color: "#d63384",
        values: chartSeries.map((item) => item.A7)
      },
      A8: {
        title: "期权收益率变化",
        suffix: "%",
        color: "#ff8a00",
        values: chartSeries.map((item) => item.A8)
      }
    };
  const currentTrend = trendMap[selectedTrend];

  const assetRows = [
    ["现金", payload.student.cash, "应急金与流动性"],
    ["A1 银行存款", payload.student.assets?.A1 ?? 0, "低波动现金管理"],
    ["A4 债券基金", payload.student.assets?.A4 ?? 0, "偏防守型资产"],
    ["A5 股票基金", payload.student.assets?.A5 ?? 0, "分散持有成长资产"],
    ["A6 股票", payload.student.assets?.A6 ?? 0, "个股波动更高"],
    ["A7 虚拟币", payload.student.assets?.A7 ?? 0, "高波动高风险"],
    ["A8 期权", payload.student.assets?.A8 ?? 0, "方向性高风险资产"],
    ...(showRealEstate ? [["房产估值", payload.student.house?.value ?? 0, "低流动性资产"]] : []),
    ...(payload.student.vehicle?.owned ? [["车辆估值", payload.student.vehicle?.value ?? 0, "会持续折旧的消费型资产"]] : [])
  ];

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">学生课堂面板</p>
          <h2>{payload.student.displayName}</h2>
          <p>
            {payload.classroom.name} | 课堂码 {payload.classroom.code} | 角色 {payload.student.roleId}
          </p>
        </div>
        <div className="action-row">
          <button type="button" onClick={props.onRefresh} disabled={props.loading}>
            刷新数据
          </button>
          <button
            type="button"
            onClick={props.onGoDecision}
            disabled={props.loading}
          >
            去做本轮决策
          </button>
          <button type="button" onClick={props.onGoDebts} disabled={props.loading}>
            查看债务明细
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => latestRoundNo && props.onOpenRoundDetail(latestRoundNo)}
            disabled={props.loading || !latestRoundNo}
          >
            查看回合复盘
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
              <span className="info-tag">{formatRoundStatus(payload.round.status)}</span>
            </div>
            <div className="metric-grid dense">
              <article className="metric-card compact">
                <span>净资产</span>
                <strong>{currency(metrics.netWorth)}</strong>
              </article>
              <article className="metric-card compact">
                <span>负债率</span>
                <strong>{percent(metrics.debtRatio)}</strong>
              </article>
              <article className="metric-card compact">
                <span>偿债率 DSR</span>
                <strong>{percent(metrics.dsr)}</strong>
              </article>
              <article className="metric-card compact">
                <span>应急金月数</span>
                <strong>{metrics.emergencyMonths.toFixed(1)} 月</strong>
              </article>
              <article className="metric-card compact">
                <span>综合得分</span>
                <strong>{Number(metrics.finalScore ?? 0).toFixed(1)}</strong>
              </article>
              <article className="metric-card compact">
                <span>当前现金</span>
                <strong>{currency(payload.student.cash)}</strong>
              </article>
              <article className="metric-card compact">
                <span>本轮工资入账</span>
                <strong>{currency(payload.budget?.salary ?? payload.student.baseSalary)}</strong>
              </article>
              <article className="metric-card compact">
                <span>必扣生活费</span>
                <strong>{currency(payload.budget?.mandatoryLiving)}</strong>
              </article>
              <article className="metric-card compact">
                <span>最低还款</span>
                <strong>{currency(payload.budget?.minDebtPay)}</strong>
              </article>
              <article className="metric-card compact">
                <span>可借额度</span>
                <strong>{currency(payload.budget?.borrowLimit)}</strong>
              </article>
              <article className="metric-card compact">
                <span>车辆固定支出</span>
                <strong>{currency(payload.budget?.vehicleMandatory)}</strong>
              </article>
              {showRealEstate ? (
                <article className="metric-card compact">
                  <span>房产固定支出</span>
                  <strong>{currency(payload.budget?.housingMandatory)}</strong>
                </article>
              ) : null}
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">开始事件</p>
                <h3>{payload.currentEvent?.title ?? "等待教师发布本轮事件"}</h3>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={props.onGoDecision}
                disabled={props.loading}
              >
                先看事件，再做配置
              </button>
            </div>
            <p>{payload.currentEvent?.transmissionPath ?? "老师开放回合后，这里会显示事件如何影响资产、生活成本和现金流。"}</p>
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
                    <span>{asset}</span>
                    <strong className={value >= 0 ? "positive" : "negative"}>{Number(value).toFixed(2)}%</strong>
                  </div>
                ))
              ) : (
                <p className="muted-text">本轮市场影响将在老师发布事件后显示。</p>
              )}
            </div>
          </article>

          <AssetPieChart slices={pieSlices} />

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">资产变化</p>
                <h3>用折线看清每轮结果</h3>
              </div>
              <div className="tag-row">
                {(["netWorth", "A5", "A6", "A7", "A8"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={selectedTrend === key ? "mini-tab active" : "mini-tab"}
                    onClick={() => setSelectedTrend(key)}
                  >
                    {key === "netWorth" ? "净资产" : key}
                  </button>
                ))}
              </div>
            </div>
            <AssetTrendChart
              points={currentTrend.values}
              labels={trendLabels}
              title={currentTrend.title}
              suffix={currentTrend.suffix}
              color={currentTrend.color}
            />
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">资产负债概览</p>
                <h3>把钱放在哪，风险就在哪里</h3>
              </div>
              <span className={payload.student.riskTags.length ? "risk-tag" : "info-tag"}>
                {payload.student.riskTags.length ? payload.student.riskTags.join(" / ") : "当前风险可控"}
              </span>
            </div>
            <div className="table-grid">
              <div className="table-grid-head">
                <span>项目</span>
                <span>数值</span>
                <span>说明</span>
              </div>
              {assetRows.map(([label, value, note]) => (
                <div key={label} className="table-grid-row">
                  <span>{label}</span>
                  <span>{currency(Number(value))}</span>
                  <span>{note}</span>
                </div>
              ))}
              <div className="table-grid-row">
                <span>本轮基础生活费</span>
                <span>{currency(payload.budget?.mandatoryLiving)}</span>
                <span>系统必扣，直接影响应急金月数</span>
              </div>
              <div className="table-grid-row">
                <span>应急金分母</span>
                <span>
                  {currency(
                    (payload.budget?.mandatoryLiving ?? 0) +
                      (payload.budget?.vehicleMandatory ?? 0) +
                      (payload.budget?.minDebtPay ?? 0)
                  )}
                </span>
                <span>基础生活费 + 车辆固定支出 + 最低还款</span>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">车辆 / 房产 / 家庭</p>
                <h3>长期固定成本会锁住现金流</h3>
              </div>
            </div>
            <div className="three-col-grid">
              <div className="compact-panel">
                <strong>车辆</strong>
                <p>{payload.student.vehicle?.owned ? "已持有" : "未持有"}</p>
                <p>车辆估值 {currency(payload.student.vehicle?.value)}</p>
                <p>月供 {currency(payload.student.vehicle?.monthlyPayment)} / 养车 {currency(payload.student.vehicle?.maintenance)}</p>
              </div>
              {showRealEstate ? (
                <div className="compact-panel">
                  <strong>房产</strong>
                  <p>{payload.student.house?.owned ? "已持有" : "未持有"}</p>
                  <p>房屋估值 {currency(payload.student.house?.value)}</p>
                  <p>月供 {currency(payload.student.house?.monthlyPayment)} / 维护 {currency(payload.student.house?.maintenance)}</p>
                </div>
              ) : null}
              <div className="compact-panel">
                <strong>家庭阶段</strong>
                <p>{formatFamilyStage(payload.student.family?.stage)}</p>
                <p>家庭固定支出 {currency(payload.student.family?.monthlySupport)}</p>
              </div>
            </div>
          </article>
        </div>

        <div className="dashboard-side">
          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">本轮操作</p>
                <h3>{payload.currentDecision ? "已提交，可继续覆盖" : "还未提交"}</h3>
              </div>
              <span className="info-tag">{payload.currentDecision ? "已提交" : "待提交"}</span>
            </div>
            <div className="metric-grid dense">
              <article className="metric-card compact">
                <span>消费资金</span>
                <strong>见决策页</strong>
              </article>
              <article className="metric-card compact">
                <span>本轮利息</span>
                <strong>{currency(0)}</strong>
              </article>
              <article className="metric-card compact">
                <span>最低还款</span>
                <strong>{currency(payload.budget?.minDebtPay)}</strong>
              </article>
              <article className="metric-card compact">
                <span>应急金分母</span>
                <strong>{currency(payload.budget?.mandatoryLiving)}</strong>
              </article>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">个人掷骰子</p>
                <h3>{payload.currentDice?.card?.title ?? "还没掷出个人事件"}</h3>
              </div>
              <span className="info-tag">简单动画版</span>
            </div>
            <div className="dice-stage">
              <button type="button" className={isRolling ? "dice-face rolling" : "dice-face"} onClick={handleRollDice} disabled={props.loading || isRolling}>
                {isRolling ? rollingFace : payload.currentDice?.roll ?? "?"}
              </button>
              <div className="dice-copy">
                <p>{payload.currentDice?.card?.knowledgePoint ?? "老师开放回合后，学生可以掷出个人生活事件。"}</p>
                {payload.currentDice?.appliedEffect?.cash ? (
                  <p className={payload.currentDice.appliedEffect.cash >= 0 ? "positive" : "negative"}>
                    现金影响 {currency(payload.currentDice.appliedEffect.cash)}
                  </p>
                ) : null}
                {(payload.currentDice?.appliedEffect?.modifiers ?? []).length ? (
                  <div className="tag-row">
                    {payload.currentDice?.appliedEffect?.modifiers?.map((modifier) => (
                      <span key={modifier} className="info-tag">
                        {modifier}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">准备状态</p>
                <h3>准备越足，个人事件越不容易击穿你</h3>
              </div>
            </div>
            <div className="tag-row">
              {prepFlags?.learningReady ? <span className="info-tag">学习准备</span> : null}
              {prepFlags?.healthReady ? <span className="info-tag">健康准备</span> : null}
              {prepFlags?.deviceReady ? <span className="info-tag">设备准备</span> : null}
              {prepFlags?.reserveReady ? <span className="info-tag">应急储备</span> : null}
              {prepFlags?.safetyReady ? <span className="info-tag">安全设置</span> : null}
              {showTax && prepFlags?.taxReady ? <span className="info-tag">税务准备</span> : null}
              {showRetirement && prepFlags?.retirementReady ? <span className="info-tag">长期储备</span> : null}
              {showLegacy && prepFlags?.legacyReady ? <span className="info-tag">家庭支持准备</span> : null}
              {prepFlags?.debtStressed ? <span className="risk-tag">债务承压</span> : null}
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">保障层</p>
                <h3>保险和安全设置不是花钱，是减损</h3>
              </div>
            </div>
            <div className="tag-row">
              {insuranceFlags?.healthCover ? <span className="info-tag">健康保障</span> : null}
              {insuranceFlags?.accidentCover ? <span className="info-tag">意外保障</span> : null}
              {insuranceFlags?.cyberCover ? <span className="info-tag">网络安全保障</span> : null}
              {!insuranceFlags?.healthCover && !insuranceFlags?.accidentCover && !insuranceFlags?.cyberCover ? (
                <span className="risk-tag">当前还没有任何保障</span>
              ) : null}
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">最近回合</p>
                <h3>结算后这里最适合做课后复盘</h3>
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
