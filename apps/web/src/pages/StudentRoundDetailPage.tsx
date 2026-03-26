import {
  formatAssetLabel,
  formatCashFlowLabel,
  formatDebtPool,
  formatDebtStatus,
  formatFamilyStage,
  formatRiskTag
} from "../lib/display";

type StudentRoundDetailPageProps = {
  loading?: boolean;
  onBack: () => void;
  payload: {
    classroom?: {
      code: string;
      name: string;
    };
    student?: {
      displayName: string;
      roleId: string;
    };
    studentRoundDetail?: {
      roundNo: number;
      eventTitle?: string;
      settledAt: string;
      topDrivers?: Array<{ label: string; value: number }>;
      preparedness?: {
        learningReady?: boolean;
        healthReady?: boolean;
        deviceReady?: boolean;
        reserveReady?: boolean;
        safetyReady?: boolean;
        taxReady?: boolean;
        retirementReady?: boolean;
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
      riskTags?: string[];
      ledger?: {
        startWorth: number;
        endWorth: number;
        cashFlow: Record<string, number>;
        vehicleState?: {
          owned?: boolean;
          value?: number;
          monthlyPayment?: number;
          maintenance?: number;
        };
        houseState?: {
          owned?: boolean;
          value?: number;
          monthlyPayment?: number;
          maintenance?: number;
        };
        familyState?: {
          stage?: string;
          monthlySupport?: number;
        };
        assetPnl?: Record<
          string,
          {
            amount: number;
            returnPct: number;
            pnl: number;
          }
        >;
        debtChange?: {
          debtBefore: number;
          debtAfter: number;
          bridgeShortfall?: number;
          bridgeTarget?: string;
          items?: Array<{
            id: string;
            type?: string;
            creditor: string;
            principal: number;
            minPay: number;
            rateMonthly: number;
            status: string;
          }>;
          paidByDebt?: Record<string, number>;
        };
        diceEvent?: {
          title: string;
          knowledgePoint: string;
          teacherNote?: string;
          cashEffect: number;
          modifiers?: string[];
        } | null;
        score?: {
          finalScore?: number;
          wealthScore?: number;
          healthScore?: number;
          lifeScore?: number;
          debtRatio?: number;
          dsr?: number;
          emergencyMonths?: number;
          fixedCostRatio?: number;
        };
        settlementSummary?: string[];
      } | null;
    };
  } | null;
};

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function percent(value?: number) {
  return `${(Number(value ?? 0) * 100).toFixed(1)}%`;
}

export function StudentRoundDetailPage(props: StudentRoundDetailPageProps) {
  const detail = props.payload?.studentRoundDetail;
  const ledger = detail?.ledger;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">学生回合复盘</p>
          <h2>
            {props.payload?.student?.displayName ?? "学生"} | 第 {detail?.roundNo ?? "--"} 回合
          </h2>
          <p>
            {props.payload?.classroom?.name ?? "课堂"} | {detail?.eventTitle ?? "宏观事件"} | {detail?.settledAt ?? "--"}
          </p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack} disabled={props.loading}>
            返回
          </button>
        </div>
      </article>

      {!detail || !ledger ? (
        <article className="panel page-panel">
          <p>当前还没有加载到本轮复盘数据。</p>
        </article>
      ) : (
        <>
          <article className="panel page-panel">
            <h3>结果快照</h3>
            <div className="metric-grid dense">
              <article className="metric-card compact">
                <span>净资产变化</span>
                <strong>
                  {currency(ledger.startWorth)}
                  {" -> "}
                  {currency(ledger.endWorth)}
                </strong>
              </article>
              <article className="metric-card compact">
                <span>综合得分</span>
                <strong>{Number(ledger.score?.finalScore ?? 0).toFixed(1)}</strong>
              </article>
              <article className="metric-card compact">
                <span>财富分 / 健康分 / 生活分</span>
                <strong>
                  {Number(ledger.score?.wealthScore ?? 0).toFixed(1)} / {Number(ledger.score?.healthScore ?? 0).toFixed(1)} /{" "}
                  {Number(ledger.score?.lifeScore ?? 0).toFixed(1)}
                </strong>
              </article>
              <article className="metric-card compact">
                <span>负债率 / 偿债率 / 应急金</span>
                <strong>
                  {percent(ledger.score?.debtRatio)} / {percent(ledger.score?.dsr)} / {Number(ledger.score?.emergencyMonths ?? 0).toFixed(1)} 月
                </strong>
              </article>
            </div>
            <p>风险标签：{(detail.riskTags ?? []).map((tag) => formatRiskTag(tag)).join(" / ") || "当前风险可控"}</p>
          </article>

          <article className="panel page-panel">
            <h3>现金流明细</h3>
            <div className="student-list">
              {Object.entries(ledger.cashFlow ?? {}).map(([key, value]) => (
                <div key={key} className="student-row">
                  <strong>{formatCashFlowLabel(key)}</strong>
                  <span>{currency(value)}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel page-panel">
            <h3>资产收益变化</h3>
            {!ledger.assetPnl || !Object.keys(ledger.assetPnl).length ? (
              <p>本轮没有资产收益记录。</p>
            ) : (
              <div className="student-list">
                {Object.entries(ledger.assetPnl).map(([assetId, item]) => (
                  <div key={assetId} className="student-row">
                    <strong>{formatAssetLabel(assetId)}</strong>
                    <span>
                      持仓 {currency(item.amount)} | 收益率 {item.returnPct.toFixed(2)}% | 盈亏 {currency(item.pnl)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>债务变化</h3>
            <p>
              结算前债务 {currency(ledger.debtChange?.debtBefore)}
              {" -> "}
              结算后债务 {currency(ledger.debtChange?.debtAfter)}
            </p>
            <p>
              被动缺口债务：{currency(ledger.debtChange?.bridgeShortfall)}，进入 {ledger.debtChange?.bridgeTarget ?? "--"}
            </p>
            <div className="student-list">
              {(ledger.debtChange?.items ?? []).map((debt) => (
                <div key={debt.id} className="student-row">
                  <strong>{debt.creditor}</strong>
                  <span>
                    {formatDebtPool(debt.type ?? debt.id)} | 本金 {currency(debt.principal)} | 最低还款 {currency(debt.minPay)} | 月利率{" "}
                    {(debt.rateMonthly * 100).toFixed(2)}% | 已还 {currency(ledger.debtChange?.paidByDebt?.[debt.id] ?? 0)} | 状态{" "}
                    {formatDebtStatus(debt.status)}
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel page-panel">
            <h3>房车与家庭</h3>
            <div className="three-col-grid">
              <div className="compact-panel">
                <strong>车辆</strong>
                <p>{ledger.vehicleState?.owned ? "已持有" : "未持有"}</p>
                <p>估值 {currency(ledger.vehicleState?.value)}</p>
                <p>月供 {currency(ledger.vehicleState?.monthlyPayment)} / 维护 {currency(ledger.vehicleState?.maintenance)}</p>
              </div>
              <div className="compact-panel">
                <strong>房产</strong>
                <p>{ledger.houseState?.owned ? "已持有" : "未持有"}</p>
                <p>估值 {currency(ledger.houseState?.value)}</p>
                <p>月供 {currency(ledger.houseState?.monthlyPayment)} / 维护 {currency(ledger.houseState?.maintenance)}</p>
              </div>
              <div className="compact-panel">
                <strong>家庭阶段</strong>
                <p>{formatFamilyStage(ledger.familyState?.stage)}</p>
                <p>每轮家庭支持 {currency(ledger.familyState?.monthlySupport)}</p>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <h3>个人事件复盘</h3>
            {!ledger.diceEvent ? (
              <p>本轮没有个人事件记录。</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>{ledger.diceEvent.title}</strong>
                  <span>现金影响 {currency(ledger.diceEvent.cashEffect)}</span>
                </div>
                <div className="student-row">
                  <strong>知识点</strong>
                  <span>{ledger.diceEvent.knowledgePoint || "--"}</span>
                </div>
                {ledger.diceEvent.teacherNote ? (
                  <div className="student-row">
                    <strong>教师提示</strong>
                    <span>{ledger.diceEvent.teacherNote}</span>
                  </div>
                ) : null}
                {(ledger.diceEvent.modifiers ?? []).map((item) => (
                  <div key={item} className="student-row">
                    <strong>修正因素</strong>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>结算总结</h3>
            <div className="student-list">
              {(ledger.settlementSummary ?? []).map((item) => (
                <div key={item} className="student-row">
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </article>
        </>
      )}
    </section>
  );
}
