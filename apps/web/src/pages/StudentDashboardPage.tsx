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
    roundHistory?: Array<{
      roundNo: number;
      eventTitle?: string;
      settledAt: string;
      avgScore?: number;
    }>;
  };
};

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN")}`;
}

function percent(value?: number) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

export function StudentDashboardPage(props: StudentDashboardPageProps) {
  const { payload } = props;
  const metrics = payload.student.metrics;
  const moduleOpt = payload.moduleConfig?.opt;
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;
  const assets = payload.student.assets ?? {};
  const assetRows = [
    ["现金", payload.student.cash, "应急金与流动性"],
    ["A1 银行存款", assets.A1 ?? 0, "低波动现金管理"],
    ["A4 债券基金", assets.A4 ?? 0, "防守型配置"],
    ["A5 股票基金", assets.A5 ?? 0, "成长型基金配置"],
    ["A6 股票", assets.A6 ?? 0, "个股风险更高"],
    ["A7 虚拟币", assets.A7 ?? 0, "高波动资产"],
    ["A8 期权", assets.A8 ?? 0, "方向性高风险资产"],
    ["A9 赌博/诈骗", assets.A9 ?? 0, "极高风险行为"]
  ];
  const prepFlags = payload.student.prepFlags;
  const insuranceFlags = payload.student.insuranceFlags;
  const latestRoundNo = payload.latestLedger?.roundNo ?? payload.roundHistory?.[payload.roundHistory.length - 1]?.roundNo;

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
          <button type="button" onClick={props.onGoDecision} disabled={props.loading}>
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
          <button type="button" onClick={props.onRollDice} disabled={props.loading}>
            掷个人骰子
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
                <h3>
                  第 {payload.round.no} / {payload.round.total ?? "--"} 回合
                </h3>
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
                <span>现金</span>
                <strong>{currency(payload.student.cash)}</strong>
              </article>
              <article className="metric-card compact">
                <span>本轮工资入账</span>
                <strong>{currency(payload.budget?.salary ?? payload.student.baseSalary)}</strong>
              </article>
              <article className="metric-card compact">
                <span>本轮必扣生活费</span>
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
              <button type="button" className="ghost-button" onClick={props.onGoDecision} disabled={props.loading}>
                先看事件，再做配置
              </button>
            </div>
            <p>{payload.currentEvent?.transmissionPath ?? "老师开放回合后，这里会显示事件如何传导到资产、消费和现金流。"}</p>
            <div className="tag-row">
              {(payload.currentEvent?.teachingPoints ?? []).map((point) => (
                <span key={point} className="info-tag">
                  {point}
                </span>
              ))}
            </div>
            <div className="market-grid top-gap">
              {payload.market
                ? Object.entries(payload.market).map(([asset, value]) => (
                    <div key={asset} className="market-item">
                      <span>{asset}</span>
                      <strong className={value >= 0 ? "positive" : "negative"}>
                        {Number(value).toFixed(2)}%
                      </strong>
                    </div>
                  ))
                : null}
            </div>
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
                <span>应急金月数分母</span>
                <span>{currency((payload.budget?.mandatoryLiving ?? 0) + (payload.budget?.vehicleMandatory ?? 0) + (payload.budget?.minDebtPay ?? 0))}</span>
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
                <p>每轮家庭支持 {currency(payload.student.family?.monthlySupport)}</p>
                <p>这部分支出会直接压缩投资和应急空间</p>
              </div>
            </div>
          </article>
        </div>

        <aside className="dashboard-side">
          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">本轮操作</p>
                <h3>{payload.currentDecision ? "已提交，可继续覆盖" : "尚未提交"}</h3>
              </div>
              <span className={payload.currentDecision ? "info-tag" : "risk-tag"}>
                {payload.currentDecision ? "已提交" : "未提交"}
              </span>
            </div>
            <div className="student-list">
              <div className="student-row">
                <strong>状态</strong>
                <span>{formatRoundStatus(payload.round.status)}</span>
              </div>
              <div className="student-row">
                <strong>决策入口</strong>
                <button type="button" onClick={props.onGoDecision} disabled={props.loading}>
                  打开决策页
                </button>
              </div>
              <div className="student-row">
                <strong>债务入口</strong>
                <button type="button" className="ghost-button" onClick={props.onGoDebts} disabled={props.loading}>
                  查看债务
                </button>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">个人骰子事件</p>
                <h3>{payload.currentDice?.card?.title ?? "还没有掷出本轮个人事件"}</h3>
              </div>
            </div>
            {payload.currentDice ? (
              <>
                <p>
                  点数 {payload.currentDice.roll} / 类别 {payload.currentDice.category}
                </p>
                <p>现金影响 {currency(payload.currentDice.appliedEffect?.cash)}</p>
                <p>{payload.currentDice.card?.knowledgePoint ?? "这张卡会告诉你为什么同样的意外，对不同准备程度的人影响不同。"}</p>
                <div className="student-list">
                  {(payload.currentDice.appliedEffect?.modifiers ?? []).map((item) => (
                    <div key={item} className="student-row">
                      <strong>修正因素</strong>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>点击“掷个人骰子”后，这里会出现本轮额外事件及其影响。</p>
            )}
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">准备状态</p>
                <h3>你不是在碰运气，而是在做准备</h3>
              </div>
            </div>
            <div className="tag-row">
              <span className={prepFlags?.learningReady ? "info-tag" : "risk-tag"}>学习准备</span>
              <span className={prepFlags?.healthReady ? "info-tag" : "risk-tag"}>健康准备</span>
              <span className={prepFlags?.deviceReady ? "info-tag" : "risk-tag"}>设备准备</span>
              <span className={prepFlags?.reserveReady ? "info-tag" : "risk-tag"}>储备准备</span>
              <span className={prepFlags?.safetyReady ? "info-tag" : "risk-tag"}>安全准备</span>
              {showTax ? <span className={prepFlags?.taxReady ? "info-tag" : "risk-tag"}>税务准备</span> : null}
              {showRetirement ? <span className={prepFlags?.retirementReady ? "info-tag" : "risk-tag"}>退休准备</span> : null}
              {showLegacy ? <span className={prepFlags?.legacyReady ? "info-tag" : "risk-tag"}>家庭支持准备</span> : null}
              <span className={prepFlags?.debtStressed ? "risk-tag" : "info-tag"}>债务压力</span>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">保障层</p>
                <h3>保险和安全设置是第二层缓冲</h3>
              </div>
            </div>
            <div className="tag-row">
              <span className={insuranceFlags?.healthCover ? "info-tag" : "risk-tag"}>健康保障</span>
              <span className={insuranceFlags?.accidentCover ? "info-tag" : "risk-tag"}>意外保障</span>
              <span className={insuranceFlags?.cyberCover ? "info-tag" : "risk-tag"}>网络安全保障</span>
            </div>
          </article>

          <article className="panel page-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">最近回合</p>
                <h3>课后可以逐轮复盘</h3>
              </div>
            </div>
            {!payload.roundHistory?.length ? (
              <p>当前还没有已结算回合。</p>
            ) : (
              <div className="student-list">
                {payload.roundHistory
                  .slice()
                  .reverse()
                  .slice(0, 4)
                  .map((round) => (
                    <div key={round.roundNo} className="student-row">
                      <div>
                        <strong>第 {round.roundNo} 回合</strong>
                        <div>{round.eventTitle ?? "宏观事件"}</div>
                      </div>
                      <button type="button" className="ghost-button" onClick={() => props.onOpenRoundDetail(round.roundNo)}>
                        复盘
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </article>
        </aside>
      </section>
    </section>
  );
}
