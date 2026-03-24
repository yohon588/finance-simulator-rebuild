import { formatFamilyStage } from "../lib/display";

type StudentLedgerPageProps = {
  onBack: () => void;
  payload: {
    latestLedger: {
      roundNo: number;
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
        borrow: number;
        repay: number;
        bridgeShortfall?: number;
        bridgeTarget?: string;
        allocateTo?: string;
        paidByDebt?: Record<string, number>;
        items?: Array<{
          id: string;
          type?: string;
          creditor: string;
          principal: number;
          minPay: number;
          rateMonthly: number;
          status: string;
        }>;
      };
      diceEvent?: {
        title: string;
        knowledgePoint: string;
        teacherNote?: string;
        cashEffect: number;
        modifiers?: string[];
      } | null;
      gambleResult?: {
        type: string | null;
        amount: number;
        outcome: string;
        pnl: number;
      };
      settlementSummary: string[];
      score: {
        finalScore: number;
        wealthScore?: number;
        healthScore?: number;
        lifeScore?: number;
        debtRatio: number;
        dsr: number;
        emergencyMonths: number;
        fixedCostRatio?: number;
      };
      riskTags: string[];
    } | null;
  };
};

export function StudentLedgerPage(props: StudentLedgerPageProps) {
  const ledger = props.payload.latestLedger;
  const highlightDrivers = ledger
    ? [
        { label: "基础生活费", value: Math.abs(ledger.cashFlow.mandatoryLiving ?? 0) },
        {
          label: "债务支出",
          value: Math.abs((ledger.cashFlow.minDebtPay ?? 0) + (ledger.cashFlow.loanInterest ?? 0))
        },
        { label: "可选消费", value: Math.abs(ledger.cashFlow.consume ?? 0) },
        { label: "投资盈亏", value: Math.abs(ledger.cashFlow.investmentPnl ?? 0) },
        { label: "个人骰子事件", value: Math.abs(ledger.cashFlow.dice ?? 0) }
      ]
        .sort((left, right) => right.value - left.value)
        .slice(0, 3)
    : [];

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">学生账单</p>
          <h2>回合结算单</h2>
          <p>查看现金流、资产变化、债务分配和分数解释。</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            返回
          </button>
        </div>
      </article>

      {!ledger ? (
        <article className="panel page-panel">
          <p>当前还没有生成结算单。</p>
        </article>
      ) : (
        <>
          <article className="panel page-panel">
            <h3>结果总览</h3>
            <p>
              净资产：{ledger.startWorth} -&gt; {ledger.endWorth}
            </p>
            <p>综合得分：{ledger.score.finalScore}</p>
          </article>

          <article className="panel page-panel">
            <h3>主要驱动因素</h3>
            {highlightDrivers.length === 0 ? (
              <p>当前没有识别出主要驱动因素。</p>
            ) : (
              <div className="student-list">
                {highlightDrivers.map((item) => (
                  <div key={item.label} className="student-row">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>分数拆解</h3>
            <div className="student-list">
              <div className="student-row">
                <strong>财富分</strong>
                <span>{ledger.score.wealthScore ?? "--"}</span>
              </div>
              <div className="student-row">
                <strong>健康分</strong>
                <span>{ledger.score.healthScore ?? "--"}</span>
              </div>
              <div className="student-row">
                <strong>生活质量分</strong>
                <span>{ledger.score.lifeScore ?? "--"}</span>
              </div>
              <div className="student-row">
                <strong>负债率 / 偿债率 / 应急金月数 / 固定成本占比</strong>
                <span>
                  {ledger.score.debtRatio} / {ledger.score.dsr} / {ledger.score.emergencyMonths} /{" "}
                  {ledger.score.fixedCostRatio ?? 0}
                </span>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <h3>现金流</h3>
            <div className="student-list">
              {Object.entries(ledger.cashFlow).map(([key, value]) => (
                <div key={key} className="student-row">
                  <strong>{key}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel page-panel">
            <h3>车辆</h3>
            {!ledger.vehicleState?.owned ? (
              <p>本轮没有车辆持仓。</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>车辆价值</strong>
                  <span>{ledger.vehicleState.value ?? 0}</span>
                </div>
                <div className="student-row">
                  <strong>月供 / 养车成本</strong>
                  <span>
                    {ledger.vehicleState.monthlyPayment ?? 0} / {ledger.vehicleState.maintenance ?? 0}
                  </span>
                </div>
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>房产</h3>
            {!ledger.houseState?.owned ? (
              <p>本轮没有房产持仓。</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>房屋价值</strong>
                  <span>{ledger.houseState.value ?? 0}</span>
                </div>
                <div className="student-row">
                  <strong>月供 / 维护成本</strong>
                  <span>
                    {ledger.houseState.monthlyPayment ?? 0} / {ledger.houseState.maintenance ?? 0}
                  </span>
                </div>
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>家庭生命周期</h3>
            <div className="student-list">
              <div className="student-row">
                <strong>阶段</strong>
                <span>{formatFamilyStage(ledger.familyState?.stage)}</span>
              </div>
              <div className="student-row">
                <strong>每轮家庭支持</strong>
                <span>{ledger.familyState?.monthlySupport ?? 0}</span>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <h3>资产收益明细</h3>
            {!ledger.assetPnl || Object.keys(ledger.assetPnl).length === 0 ? (
              <p>本轮没有资产收益明细。</p>
            ) : (
              <div className="student-list">
                {Object.entries(ledger.assetPnl).map(([assetId, item]) => (
                  <div key={assetId} className="student-row">
                    <strong>{assetId}</strong>
                    <span>
                      持仓 {item.amount} | 收益率 {item.returnPct}% | 盈亏 {item.pnl}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>债务分配</h3>
            <p>
              结算前债务 {ledger.debtChange?.debtBefore ?? 0} -&gt; 结算后债务 {ledger.debtChange?.debtAfter ?? 0}
            </p>
            <p>
              新增借款 {ledger.debtChange?.borrow ?? 0} | 已还款 {ledger.debtChange?.repay ?? 0} | 目标债池{" "}
              {ledger.debtChange?.allocateTo ?? "--"}
            </p>
            <p>
              被动缺口债务：{ledger.debtChange?.bridgeShortfall ?? 0}，进入{" "}
              {ledger.debtChange?.bridgeTarget ?? "--"}
            </p>
            {ledger.debtChange?.items?.length ? (
              <div className="student-list">
                {ledger.debtChange.items.map((debt) => (
                  <div key={debt.id} className="student-row">
                    <strong>{debt.creditor}</strong>
                    <span>
                      {debt.type ?? "债务"} | 本金 {debt.principal} | 最低还款 {debt.minPay} | 月利率{" "}
                      {debt.rateMonthly} | 已还 {ledger.debtChange?.paidByDebt?.[debt.id] ?? 0} | 状态 {debt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>

          <article className="panel page-panel">
            <h3>个人骰子事件</h3>
            {!ledger.diceEvent ? (
              <p>本轮没有个人骰子事件。</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>{ledger.diceEvent.title}</strong>
                  <span>现金影响 {ledger.diceEvent.cashEffect}</span>
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
            <h3>高风险结果</h3>
            {!ledger.gambleResult || !ledger.gambleResult.type ? (
              <p>本轮没有赌博或诈骗类操作。</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>{ledger.gambleResult.type}</strong>
                  <span>
                    金额 {ledger.gambleResult.amount} | 结果 {ledger.gambleResult.outcome} | 盈亏 {ledger.gambleResult.pnl}
                  </span>
                </div>
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>结算总结</h3>
            <div className="student-list">
              {ledger.settlementSummary.map((item) => (
                <div key={item} className="student-row">
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel page-panel">
            <h3>风险标签</h3>
            {ledger.riskTags.length === 0 ? (
              <p>当前没有激活中的风险标签。</p>
            ) : (
              <div className="tag-row">
                {ledger.riskTags.map((tag) => (
                  <span key={tag} className="risk-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
}
