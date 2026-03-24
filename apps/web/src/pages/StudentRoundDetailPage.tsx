import { formatFamilyStage } from "../lib/display";

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
            {props.payload?.classroom?.name ?? "课堂"} | {detail?.eventTitle ?? "宏观事件"} |{" "}
            {detail?.settledAt ?? "--"}
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
          <p>当前没有加载到回合复盘。</p>
        </article>
      ) : (
        <>
          <article className="panel page-panel">
            <h3>结果快照</h3>
            <p>
              净资产：{ledger.startWorth} -&gt; {ledger.endWorth}
            </p>
            <p>综合得分：{ledger.score?.finalScore ?? 0}</p>
            <p>风险标签：{(detail.riskTags ?? []).join(" / ") || "--"}</p>
          </article>

          <article className="panel page-panel">
            <h3>主要驱动因素</h3>
            {!detail.topDrivers?.length ? (
              <p>当前没有记录到主要驱动因素。</p>
            ) : (
              <div className="student-list">
                {detail.topDrivers.map((item) => (
                  <div key={item.label} className="student-row">
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>准备状态快照</h3>
            <p>
              L {detail.preparedness?.learningReady ? 1 : 0} / H {detail.preparedness?.healthReady ? 1 : 0} / T{" "}
              {detail.preparedness?.deviceReady ? 1 : 0} / R {detail.preparedness?.reserveReady ? 1 : 0} / S{" "}
              {detail.preparedness?.safetyReady ? 1 : 0} / X {detail.preparedness?.taxReady ? 1 : 0} / Q{" "}
              {detail.preparedness?.retirementReady ? 1 : 0} / D {detail.preparedness?.debtStressed ? 1 : 0}
            </p>
            <p>
              保障 H {detail.insuranceFlags?.healthCover ? 1 : 0} / A{" "}
              {detail.insuranceFlags?.accidentCover ? 1 : 0} / C {detail.insuranceFlags?.cyberCover ? 1 : 0}
            </p>
            <p>
              家庭阶段 {formatFamilyStage(detail.family?.stage)} | 每轮支持 {detail.family?.monthlySupport ?? 0}
            </p>
            <p>固定成本占比 {ledger.score?.fixedCostRatio ?? 0}</p>
          </article>

          <article className="panel page-panel">
            <h3>现金流明细</h3>
            <div className="student-list">
              {Object.entries(ledger.cashFlow ?? {}).map(([key, value]) => (
                <div key={key} className="student-row">
                  <strong>{key}</strong>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="panel page-panel">
            <h3>车辆快照</h3>
            {ledger.vehicleState?.owned ? (
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
            ) : (
              <p>本轮没有车辆。</p>
            )}
          </article>

          <article className="panel page-panel">
            <h3>房产快照</h3>
            {ledger.houseState?.owned ? (
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
            ) : (
              <p>本轮没有房产。</p>
            )}
          </article>

          <article className="panel page-panel">
            <h3>家庭快照</h3>
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
            <h3>债务变化</h3>
            <p>
              结算前债务 {ledger.debtChange?.debtBefore ?? 0} -&gt; 结算后债务 {ledger.debtChange?.debtAfter ?? 0}
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
                      {debt.type ?? debt.id} | 本金 {debt.principal} | 最低还款 {debt.minPay} | 月利率{" "}
                      {debt.rateMonthly} | 已还 {ledger.debtChange?.paidByDebt?.[debt.id] ?? 0} | 状态 {debt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>

          <article className="panel page-panel">
            <h3>个人事件复盘</h3>
            {!ledger.diceEvent ? (
              <p>本轮没有个人事件记录。</p>
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
            <h3>分数快照</h3>
            <div className="student-list">
              <div className="student-row">
                <strong>财富分 / 健康分 / 生活质量分</strong>
                <span>
                  {ledger.score?.wealthScore ?? 0} / {ledger.score?.healthScore ?? 0} / {ledger.score?.lifeScore ?? 0}
                </span>
              </div>
              <div className="student-row">
                <strong>负债率 / 偿债率 / 应急金月数</strong>
                <span>
                  {ledger.score?.debtRatio ?? 0} / {ledger.score?.dsr ?? 0} / {ledger.score?.emergencyMonths ?? 0}
                </span>
              </div>
            </div>
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
