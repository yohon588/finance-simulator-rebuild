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
        { label: "Living Cost", value: Math.abs(ledger.cashFlow.mandatoryLiving ?? 0) },
        {
          label: "Debt Service",
          value: Math.abs((ledger.cashFlow.minDebtPay ?? 0) + (ledger.cashFlow.loanInterest ?? 0))
        },
        { label: "Optional Spend", value: Math.abs(ledger.cashFlow.consume ?? 0) },
        { label: "Investment PnL", value: Math.abs(ledger.cashFlow.investmentPnl ?? 0) },
        { label: "Dice Event", value: Math.abs(ledger.cashFlow.dice ?? 0) }
      ]
        .sort((left, right) => right.value - left.value)
        .slice(0, 3)
    : [];

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Student Ledger</p>
          <h2>Round Settlement</h2>
          <p>Cashflow, asset move, debt allocation, and score explanation.</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            Back
          </button>
        </div>
      </article>

      {!ledger ? (
        <article className="panel page-panel">
          <p>No settlement generated yet.</p>
        </article>
      ) : (
        <>
          <article className="panel page-panel">
            <h3>Outcome</h3>
            <p>
              Net worth: {ledger.startWorth} -&gt; {ledger.endWorth}
            </p>
            <p>Final score: {ledger.score.finalScore}</p>
          </article>

          <article className="panel page-panel">
            <h3>Top Drivers</h3>
            {highlightDrivers.length === 0 ? (
              <p>No major drivers identified.</p>
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
            <h3>Score Breakdown</h3>
            <div className="student-list">
              <div className="student-row">
                <strong>Wealth Score</strong>
                <span>{ledger.score.wealthScore ?? "--"}</span>
              </div>
              <div className="student-row">
                <strong>Health Score</strong>
                <span>{ledger.score.healthScore ?? "--"}</span>
              </div>
              <div className="student-row">
                <strong>Life Score</strong>
                <span>{ledger.score.lifeScore ?? "--"}</span>
              </div>
              <div className="student-row">
                <strong>Debt Ratio / DSR / Emergency Months / Fixed Cost Ratio</strong>
                <span>
                  {ledger.score.debtRatio} / {ledger.score.dsr} / {ledger.score.emergencyMonths} /{" "}
                  {ledger.score.fixedCostRatio ?? 0}
                </span>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <h3>Cash Flow</h3>
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
            <h3>Vehicle</h3>
            {!ledger.vehicleState?.owned ? (
              <p>No vehicle position this round.</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>Vehicle Value</strong>
                  <span>{ledger.vehicleState.value ?? 0}</span>
                </div>
                <div className="student-row">
                  <strong>Payment / Maintenance</strong>
                  <span>
                    {ledger.vehicleState.monthlyPayment ?? 0} / {ledger.vehicleState.maintenance ?? 0}
                  </span>
                </div>
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>Housing</h3>
            {!ledger.houseState?.owned ? (
              <p>No housing position this round.</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>House Value</strong>
                  <span>{ledger.houseState.value ?? 0}</span>
                </div>
                <div className="student-row">
                  <strong>Payment / Maintenance</strong>
                  <span>
                    {ledger.houseState.monthlyPayment ?? 0} / {ledger.houseState.maintenance ?? 0}
                  </span>
                </div>
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>Family Lifecycle</h3>
            <div className="student-list">
              <div className="student-row">
                <strong>Stage</strong>
                <span>{ledger.familyState?.stage ?? "single"}</span>
              </div>
              <div className="student-row">
                <strong>Monthly Support</strong>
                <span>{ledger.familyState?.monthlySupport ?? 0}</span>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <h3>Asset Return Detail</h3>
            {!ledger.assetPnl || Object.keys(ledger.assetPnl).length === 0 ? (
              <p>No asset return detail for this round.</p>
            ) : (
              <div className="student-list">
                {Object.entries(ledger.assetPnl).map(([assetId, item]) => (
                  <div key={assetId} className="student-row">
                    <strong>{assetId}</strong>
                    <span>
                      holding {item.amount} | return {item.returnPct}% | pnl {item.pnl}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>Debt Allocation</h3>
            <p>
              Debt before {ledger.debtChange?.debtBefore ?? 0} -&gt; debt after {ledger.debtChange?.debtAfter ?? 0}
            </p>
            <p>
              Borrowed {ledger.debtChange?.borrow ?? 0} | repaid {ledger.debtChange?.repay ?? 0} | target{" "}
              {ledger.debtChange?.allocateTo ?? "--"}
            </p>
            <p>
              Forced shortfall debt: {ledger.debtChange?.bridgeShortfall ?? 0} via{" "}
              {ledger.debtChange?.bridgeTarget ?? "--"}
            </p>
            {ledger.debtChange?.items?.length ? (
              <div className="student-list">
                {ledger.debtChange.items.map((debt) => (
                  <div key={debt.id} className="student-row">
                    <strong>{debt.creditor}</strong>
                    <span>
                      {debt.type ?? "DEBT"} | principal {debt.principal} | min pay {debt.minPay} | rate{" "}
                      {debt.rateMonthly} | paid {ledger.debtChange?.paidByDebt?.[debt.id] ?? 0} | {debt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>

          <article className="panel page-panel">
            <h3>Dice Event</h3>
            {!ledger.diceEvent ? (
              <p>No personal dice event this round.</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>{ledger.diceEvent.title}</strong>
                  <span>cash effect {ledger.diceEvent.cashEffect}</span>
                </div>
                <div className="student-row">
                  <strong>Knowledge Point</strong>
                  <span>{ledger.diceEvent.knowledgePoint || "--"}</span>
                </div>
                {ledger.diceEvent.teacherNote ? (
                  <div className="student-row">
                    <strong>Teacher Note</strong>
                    <span>{ledger.diceEvent.teacherNote}</span>
                  </div>
                ) : null}
                {(ledger.diceEvent.modifiers ?? []).map((item) => (
                  <div key={item} className="student-row">
                    <strong>Modifier</strong>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>High-Risk Outcome</h3>
            {!ledger.gambleResult || !ledger.gambleResult.type ? (
              <p>No gambling or fraud position was taken this round.</p>
            ) : (
              <div className="student-list">
                <div className="student-row">
                  <strong>{ledger.gambleResult.type}</strong>
                  <span>
                    amount {ledger.gambleResult.amount} | {ledger.gambleResult.outcome} | pnl {ledger.gambleResult.pnl}
                  </span>
                </div>
              </div>
            )}
          </article>

          <article className="panel page-panel">
            <h3>Settlement Summary</h3>
            <div className="student-list">
              {ledger.settlementSummary.map((item) => (
                <div key={item} className="student-row">
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel page-panel">
            <h3>Risk Tags</h3>
            {ledger.riskTags.length === 0 ? (
              <p>No active risk tags.</p>
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
