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
          <p className="eyebrow">Student Round Review</p>
          <h2>
            {props.payload?.student?.displayName ?? "Student"} | Round {detail?.roundNo ?? "--"}
          </h2>
          <p>
            {props.payload?.classroom?.name ?? "Classroom"} | {detail?.eventTitle ?? "Macro Event"} |{" "}
            {detail?.settledAt ?? "--"}
          </p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack} disabled={props.loading}>
            Back
          </button>
        </div>
      </article>

      {!detail || !ledger ? (
        <article className="panel page-panel">
          <p>No round review loaded.</p>
        </article>
      ) : (
        <>
          <article className="panel page-panel">
            <h3>Outcome Snapshot</h3>
            <p>
              Net worth: {ledger.startWorth} -&gt; {ledger.endWorth}
            </p>
            <p>Final score: {ledger.score?.finalScore ?? 0}</p>
            <p>Risk tags: {(detail.riskTags ?? []).join(" / ") || "--"}</p>
          </article>

          <article className="panel page-panel">
            <h3>Top Drivers</h3>
            {!detail.topDrivers?.length ? (
              <p>No main drivers captured.</p>
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
            <h3>Preparedness Snapshot</h3>
            <p>
              L {detail.preparedness?.learningReady ? 1 : 0} / H {detail.preparedness?.healthReady ? 1 : 0} / T{" "}
              {detail.preparedness?.deviceReady ? 1 : 0} / R {detail.preparedness?.reserveReady ? 1 : 0} / S{" "}
              {detail.preparedness?.safetyReady ? 1 : 0} / X {detail.preparedness?.taxReady ? 1 : 0} / Q{" "}
              {detail.preparedness?.retirementReady ? 1 : 0} / D {detail.preparedness?.debtStressed ? 1 : 0}
            </p>
            <p>
              Insurance H {detail.insuranceFlags?.healthCover ? 1 : 0} / A{" "}
              {detail.insuranceFlags?.accidentCover ? 1 : 0} / C {detail.insuranceFlags?.cyberCover ? 1 : 0}
            </p>
            <p>
              Family stage {detail.family?.stage ?? "single"} | monthly support {detail.family?.monthlySupport ?? 0}
            </p>
            <p>Fixed cost ratio {ledger.score?.fixedCostRatio ?? 0}</p>
          </article>

          <article className="panel page-panel">
            <h3>Cash Flow Detail</h3>
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
            <h3>Vehicle Snapshot</h3>
            {ledger.vehicleState?.owned ? (
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
            ) : (
              <p>No vehicle owned in this round.</p>
            )}
          </article>

          <article className="panel page-panel">
            <h3>Housing Snapshot</h3>
            {ledger.houseState?.owned ? (
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
            ) : (
              <p>No house owned in this round.</p>
            )}
          </article>

          <article className="panel page-panel">
            <h3>Family Snapshot</h3>
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
            <h3>Debt Change</h3>
            <p>
              Debt before {ledger.debtChange?.debtBefore ?? 0} -&gt; debt after {ledger.debtChange?.debtAfter ?? 0}
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
                      {debt.type ?? debt.id} | principal {debt.principal} | min pay {debt.minPay} | rate{" "}
                      {debt.rateMonthly} | paid {ledger.debtChange?.paidByDebt?.[debt.id] ?? 0} | {debt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>

          <article className="panel page-panel">
            <h3>Personal Event Review</h3>
            {!ledger.diceEvent ? (
              <p>No personal event recorded.</p>
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
            <h3>Score Snapshot</h3>
            <div className="student-list">
              <div className="student-row">
                <strong>Wealth / Health / Life</strong>
                <span>
                  {ledger.score?.wealthScore ?? 0} / {ledger.score?.healthScore ?? 0} / {ledger.score?.lifeScore ?? 0}
                </span>
              </div>
              <div className="student-row">
                <strong>Debt Ratio / DSR / Emergency Months</strong>
                <span>
                  {ledger.score?.debtRatio ?? 0} / {ledger.score?.dsr ?? 0} / {ledger.score?.emergencyMonths ?? 0}
                </span>
              </div>
            </div>
          </article>

          <article className="panel page-panel">
            <h3>Settlement Summary</h3>
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
