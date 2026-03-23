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

export function StudentDashboardPage(props: StudentDashboardPageProps) {
  const { payload } = props;
  const metrics = payload.student.metrics;
  const moduleOpt = payload.moduleConfig?.opt;
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Student Dashboard</p>
          <h2>{payload.student.displayName}</h2>
          <p>
            {payload.classroom.name} | {payload.classroom.code} | {payload.student.roleId}
          </p>
        </div>
        <div className="action-row">
          <button type="button" onClick={props.onRefresh} disabled={props.loading}>
            Refresh
          </button>
          <button type="button" onClick={props.onGoDecision} disabled={props.loading}>
            Go Decision
          </button>
          <button type="button" onClick={props.onGoDebts} disabled={props.loading}>
            View Debts
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => props.onOpenRoundDetail(payload.latestLedger?.roundNo ?? payload.round.no - 1)}
            disabled={props.loading || !(payload.roundHistory?.length || payload.latestLedger)}
          >
            Round Review
          </button>
          <button type="button" onClick={props.onRollDice} disabled={props.loading}>
            Roll Dice
          </button>
          <button type="button" className="ghost-button" onClick={props.onLogout}>
            Logout
          </button>
        </div>
      </article>

      <section className="metric-grid">
        <article className="panel metric-card">
          <span>Round Status</span>
          <strong>
            Round {payload.round.no} / {payload.round.total ?? "--"} / {payload.round.status}
          </strong>
        </article>
        <article className="panel metric-card">
          <span>Net Worth</span>
          <strong>{metrics.netWorth}</strong>
        </article>
        <article className="panel metric-card">
          <span>Debt Ratio</span>
          <strong>{metrics.debtRatio}</strong>
        </article>
        <article className="panel metric-card">
          <span>DSR</span>
          <strong>{metrics.dsr}</strong>
        </article>
        <article className="panel metric-card">
          <span>Emergency Months</span>
          <strong>{metrics.emergencyMonths}</strong>
        </article>
        <article className="panel metric-card">
          <span>Cash</span>
          <strong>{payload.student.cash}</strong>
        </article>
      </section>

      <article className="panel page-panel">
        <h3>Budget Summary</h3>
        <p>Salary: {payload.budget?.salary ?? payload.student.baseSalary}</p>
        <p>Mandatory Living: {payload.budget?.mandatoryLiving ?? "--"}</p>
        <p>Min Debt Pay: {payload.budget?.minDebtPay ?? "--"}</p>
        <p>Vehicle Mandatory: {payload.budget?.vehicleMandatory ?? 0}</p>
        {showRealEstate ? <p>Housing Mandatory: {payload.budget?.housingMandatory ?? 0}</p> : null}
        <p>Family Mandatory: {payload.budget?.familyMandatory ?? 0}</p>
        <p>Borrow Limit: {payload.budget?.borrowLimit ?? "--"}</p>
      </article>

      <article className="panel page-panel">
        <h3>Asset Holdings</h3>
        {payload.student.assets ? (
          <div className="market-grid">
            {Object.entries(payload.student.assets).map(([asset, value]) => (
              <div key={asset} className="market-item">
                <span>{asset}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p>No tracked assets yet.</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Vehicle</h3>
        {payload.student.vehicle?.owned ? (
          <div className="student-list">
            <div className="student-row">
              <strong>Owned</strong>
              <span>Yes</span>
            </div>
            <div className="student-row">
              <strong>Vehicle Value</strong>
              <span>{payload.student.vehicle.value ?? 0}</span>
            </div>
            <div className="student-row">
              <strong>Monthly Payment / Maintenance</strong>
              <span>
                {payload.student.vehicle.monthlyPayment ?? 0} / {payload.student.vehicle.maintenance ?? 0}
              </span>
            </div>
          </div>
        ) : (
          <p>No vehicle owned yet.</p>
        )}
      </article>

      {showRealEstate ? (
        <article className="panel page-panel">
          <h3>Housing</h3>
          {payload.student.house?.owned ? (
            <div className="student-list">
              <div className="student-row">
                <strong>Owned</strong>
                <span>Yes</span>
              </div>
              <div className="student-row">
                <strong>House Value</strong>
                <span>{payload.student.house.value ?? 0}</span>
              </div>
              <div className="student-row">
                <strong>Payment / Maintenance</strong>
                <span>
                  {payload.student.house.monthlyPayment ?? 0} / {payload.student.house.maintenance ?? 0}
                </span>
              </div>
            </div>
          ) : (
            <p>No house owned yet.</p>
          )}
        </article>
      ) : null}

      <article className="panel page-panel">
        <h3>Family Lifecycle</h3>
        <div className="student-list">
          <div className="student-row">
            <strong>Stage</strong>
            <span>{payload.student.family?.stage ?? "single"}</span>
          </div>
          <div className="student-row">
            <strong>Monthly Support</strong>
            <span>{payload.student.family?.monthlySupport ?? 0}</span>
          </div>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>Preparedness</h3>
        {payload.student.prepFlags ? (
          <>
            <div className="tag-row">
              <span className={payload.student.prepFlags.learningReady ? "info-tag" : "risk-tag"}>Learning Ready</span>
              <span className={payload.student.prepFlags.healthReady ? "info-tag" : "risk-tag"}>Health Ready</span>
              <span className={payload.student.prepFlags.deviceReady ? "info-tag" : "risk-tag"}>Device Ready</span>
              <span className={payload.student.prepFlags.reserveReady ? "info-tag" : "risk-tag"}>Reserve Ready</span>
              <span className={payload.student.prepFlags.safetyReady ? "info-tag" : "risk-tag"}>Safety Ready</span>
              {showTax ? (
                <span className={payload.student.prepFlags.taxReady ? "info-tag" : "risk-tag"}>Tax Ready</span>
              ) : null}
              {showRetirement ? (
                <span className={payload.student.prepFlags.retirementReady ? "info-tag" : "risk-tag"}>
                  Retirement Ready
                </span>
              ) : null}
              {showLegacy ? (
                <span className={payload.student.prepFlags.legacyReady ? "info-tag" : "risk-tag"}>Legacy Ready</span>
              ) : null}
              <span className={payload.student.prepFlags.debtStressed ? "risk-tag" : "info-tag"}>Debt Stress</span>
            </div>
            <div className="student-list top-gap">
              <div className="student-row">
                <strong>Learning Ready</strong>
                <span>Recent learning investment can improve income and soften some shocks.</span>
              </div>
              <div className="student-row">
                <strong>Health Ready</strong>
                <span>Health cover reduces out-of-pocket damage from medical events.</span>
              </div>
              <div className="student-row">
                <strong>Device Ready</strong>
                <span>Tool maintenance reduces losses from phone and computer breakdowns.</span>
              </div>
              <div className="student-row">
                <strong>Reserve Ready</strong>
                <span>Emergency reserves and reserve top-up help absorb health and housing shocks.</span>
              </div>
              <div className="student-row">
                <strong>Safety Ready</strong>
                <span>Security setup lowers losses from fraud and safety incidents.</span>
              </div>
              {showTax ? (
                <div className="student-row">
                  <strong>Tax Ready</strong>
                  <span>Tax reserve protects more of new income from admin and withholding friction.</span>
                </div>
              ) : null}
              {showRetirement ? (
                <div className="student-row">
                  <strong>Retirement Ready</strong>
                  <span>
                    Retirement discipline reduces short-term overspending pressure and keeps long-term goals visible.
                  </span>
                </div>
              ) : null}
              {showLegacy ? (
                <div className="student-row">
                  <strong>Legacy Ready</strong>
                  <span>Family support reserve softens caregiving, kin support, and social obligation shocks.</span>
                </div>
              ) : null}
              <div className="student-row">
                <strong>Debt Stress</strong>
                <span>Debt stress makes the same event more painful and raises risk pressure.</span>
              </div>
            </div>
          </>
        ) : (
          <p>No preparedness flags yet.</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Protection Layer</h3>
        <div className="tag-row">
          <span className={payload.student.insuranceFlags?.healthCover ? "info-tag" : "risk-tag"}>Health Cover</span>
          <span className={payload.student.insuranceFlags?.accidentCover ? "info-tag" : "risk-tag"}>Accident Cover</span>
          <span className={payload.student.insuranceFlags?.cyberCover ? "info-tag" : "risk-tag"}>Cyber Protection</span>
        </div>
        <div className="student-list top-gap">
          <div className="student-row">
            <strong>Health Cover</strong>
            <span>Reduces ordinary medical and treatment shocks.</span>
          </div>
          <div className="student-row">
            <strong>Accident Cover</strong>
            <span>Specifically reduces sudden injury and accident-style losses.</span>
          </div>
          <div className="student-row">
            <strong>Cyber Protection</strong>
            <span>Offsets part of fraud, scam, and account-security losses.</span>
          </div>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>Macro Event</h3>
        {payload.currentEvent ? (
          <>
            <p>{payload.currentEvent.title}</p>
            <p>{payload.currentEvent.transmissionPath ?? "Transmission path pending."}</p>
            <div className="tag-row">
              {(payload.currentEvent.teachingPoints ?? []).map((point) => (
                <span key={point} className="info-tag">
                  {point}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p>No active event yet. Wait for the teacher to open the round.</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Dice Event</h3>
        {payload.currentDice ? (
          <>
            <p>
              Roll {payload.currentDice.roll} | {payload.currentDice.category}
            </p>
            <p>{payload.currentDice.card?.title ?? "Dice Event"}</p>
            <p>Cash effect: {payload.currentDice.appliedEffect?.cash ?? 0}</p>
            <p>{payload.currentDice.card?.knowledgePoint ?? ""}</p>
            {(payload.currentDice.appliedEffect?.modifiers ?? []).length > 0 ? (
              <div className="student-list top-gap">
                {payload.currentDice.appliedEffect?.modifiers?.map((item) => (
                  <div key={item} className="student-row">
                    <strong>Modifier</strong>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p>No dice event rolled yet for this round.</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Market Impact</h3>
        {payload.market ? (
          <div className="market-grid">
            {Object.entries(payload.market).map(([asset, value]) => (
              <div key={asset} className="market-item">
                <span>{asset}</span>
                <strong className={value >= 0 ? "positive" : "negative"}>
                  {value}%
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p>Market impact will appear after the round is opened.</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Recent Rounds</h3>
        {!payload.roundHistory?.length ? (
          <p>No settled rounds to review yet.</p>
        ) : (
          <div className="student-list">
            {payload.roundHistory
              .slice()
              .reverse()
              .slice(0, 4)
              .map((round) => (
                <div key={round.roundNo} className="student-row">
                  <strong>
                    Round {round.roundNo} | {round.eventTitle ?? "Macro Event"}
                  </strong>
                  <span>{round.settledAt}</span>
                  <button type="button" className="ghost-button" onClick={() => props.onOpenRoundDetail(round.roundNo)}>
                    Review
                  </button>
                </div>
              ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Risk Tags</h3>
        {payload.student.riskTags.length === 0 ? (
          <p>No active risk tags.</p>
        ) : (
          <div className="tag-row">
            {payload.student.riskTags.map((tag) => (
              <span key={tag} className="risk-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Submission State</h3>
        {payload.currentDecision ? (
          <p>
            Submitted with key {payload.currentDecision.idempotencyKey} at {payload.currentDecision.submittedAt}
          </p>
        ) : (
          <p>No decision submitted yet for this round.</p>
        )}
      </article>
    </section>
  );
}
