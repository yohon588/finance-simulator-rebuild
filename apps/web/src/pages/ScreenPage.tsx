type ScreenPageProps = {
  loading: boolean;
  onBack: () => void;
  onRefresh: () => void;
  payload: {
    classroom: {
      code: string;
      name: string;
      teacherName: string;
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
    } | null;
    ranking?: Array<{
      rank: number;
      displayName: string;
      roleId: string;
      finalScore: number;
      netWorth: number;
      riskTags: string[];
    }>;
    classProfile?: {
      count: number;
      avgNetWorth: number;
      avgDebtRatio: number;
      avgDsr?: number;
      avgEmergencyMonths: number;
      avgScore: number;
      preparedness?: {
        learningReady: number;
        healthReady?: number;
        deviceReady?: number;
        reserveReady: number;
        safetyReady: number;
        taxReady?: number;
        retirementReady?: number;
        legacyReady?: number;
        debtStressed: number;
      };
      insuranceCoverage?: {
        healthCover?: number;
        accidentCover?: number;
        cyberCover?: number;
      };
      vehiclesOwned?: number;
      homesOwned?: number;
      engagedStudents?: number;
      marriedStudents?: number;
      fixedCostLocked?: number;
      topRiskTags: Array<{ tag: string; hits: number }>;
    };
    currentRoundSummary?: {
      topDrivers?: Array<{ label: string; total: number }>;
      diceCategories?: Array<{ category: string; count: number }>;
      modifierThemes?: Array<{ theme: string; count: number }>;
      teacherCue?: string;
      protectionSummary?: {
        protectedStudents: number;
        stressedStudents: number;
        highRiskStudents: number;
        supportiveHits?: number;
        amplifiedHits?: number;
      };
      lifecycleLoadSummary?: {
        vehiclesOwned?: number;
        homesOwned?: number;
        engagedStudents?: number;
        marriedStudents?: number;
        fixedCostLocked?: number;
      };
      lifecycleCue?: string;
      topRiskTags?: Array<{ tag: string; count: number }>;
    } | null;
  } | null;
};

export function ScreenPage(props: ScreenPageProps) {
  const ranking = props.payload?.ranking ?? [];
  const profile = props.payload?.classProfile;
  const roundSummary = props.payload?.currentRoundSummary;
  const moduleOpt = props.payload?.moduleConfig?.opt;
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero screen-hero">
        <div>
          <p className="eyebrow">Classroom Screen</p>
          <h2>{props.payload?.classroom.name ?? "Live Ranking"}</h2>
          <p>
            {props.payload?.classroom.code ?? "--"} | Round {props.payload?.round.no ?? "--"} /{" "}
            {props.payload?.round.total ?? "--"} | {props.payload?.round.status ?? "--"}
          </p>
        </div>
        <div className="action-row">
          <button type="button" onClick={props.onRefresh} disabled={props.loading}>
            Refresh
          </button>
          <button type="button" className="ghost-button" onClick={props.onBack}>
            Back
          </button>
        </div>
      </article>

      <section className="metric-grid">
        <article className="panel metric-card">
          <span>Students</span>
          <strong>{profile?.count ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>Avg Score</span>
          <strong>{profile?.avgScore ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>Avg Net Worth</span>
          <strong>{profile?.avgNetWorth ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>Avg Emergency Months</span>
          <strong>{profile?.avgEmergencyMonths ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>Avg DSR</span>
          <strong>{profile?.avgDsr ?? 0}</strong>
        </article>
      </section>

      <article className="panel page-panel">
        <h3>Current Event</h3>
        <p>{props.payload?.currentEvent?.title ?? "Teacher has not opened a round yet."}</p>
        <p>
          Coverage health {profile?.insuranceCoverage?.healthCover ?? 0} / accident{" "}
          {profile?.insuranceCoverage?.accidentCover ?? 0} / cyber{" "}
          {profile?.insuranceCoverage?.cyberCover ?? 0}
        </p>
        <p>
          Preparedness L {profile?.preparedness?.learningReady ?? 0} / H {profile?.preparedness?.healthReady ?? 0} / T{" "}
          {profile?.preparedness?.deviceReady ?? 0} / R {profile?.preparedness?.reserveReady ?? 0} / S{" "}
          {profile?.preparedness?.safetyReady ?? 0}
          {showTax ? ` / X ${profile?.preparedness?.taxReady ?? 0}` : ""}
          {showRetirement ? ` / Q ${profile?.preparedness?.retirementReady ?? 0}` : ""}
          {showLegacy ? ` / L ${profile?.preparedness?.legacyReady ?? 0}` : ""}
        </p>
        <p>Vehicles owned: {profile?.vehiclesOwned ?? 0}</p>
        {showRealEstate ? <p>Homes owned: {profile?.homesOwned ?? 0}</p> : null}
        {showRealEstate ? (
          <p>
            Family stages engaged {profile?.engagedStudents ?? 0} / married {profile?.marriedStudents ?? 0}
          </p>
        ) : null}
        {showRealEstate ? <p>Fixed cost lock: {profile?.fixedCostLocked ?? 0}</p> : null}
      </article>

      <article className="panel page-panel">
        <h3>Leaderboard</h3>
        {ranking.length === 0 ? (
          <p>No ranked students yet.</p>
        ) : (
          <div className="student-list">
            {ranking.map((row) => (
              <div key={`${row.rank}-${row.displayName}`} className="student-row">
                <strong>
                  #{row.rank} {row.displayName}
                </strong>
                <span>
                  {row.roleId} | score {row.finalScore} | net worth {row.netWorth}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Round Teaching Summary</h3>
        {!roundSummary ? (
          <p>No settled round summary yet.</p>
        ) : (
          <div className="student-list">
            <div className="student-row">
              <strong>Top Drivers</strong>
              <span>
                {(roundSummary.topDrivers ?? [])
                  .map((item) => `${item.label} ${item.total}`)
                  .join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>Dice Mix</strong>
              <span>
                {(roundSummary.diceCategories ?? [])
                  .map((item) => `${item.category} x${item.count}`)
                  .join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>Protection And Stress</strong>
              <span>
                protected {roundSummary.protectionSummary?.protectedStudents ?? 0} | debt stress{" "}
                {roundSummary.protectionSummary?.stressedStudents ?? 0} | high risk{" "}
                {roundSummary.protectionSummary?.highRiskStudents ?? 0}
              </span>
            </div>
            <div className="student-row">
              <strong>Modifier Impact</strong>
              <span>
                supportive {roundSummary.protectionSummary?.supportiveHits ?? 0} | amplified{" "}
                {roundSummary.protectionSummary?.amplifiedHits ?? 0}
              </span>
            </div>
            {showRealEstate ? (
              <>
                <div className="student-row">
                  <strong>Lifecycle Load</strong>
                  <span>
                    vehicles {roundSummary.lifecycleLoadSummary?.vehiclesOwned ?? 0} | homes{" "}
                    {roundSummary.lifecycleLoadSummary?.homesOwned ?? 0} | engaged{" "}
                    {roundSummary.lifecycleLoadSummary?.engagedStudents ?? 0} | married{" "}
                    {roundSummary.lifecycleLoadSummary?.marriedStudents ?? 0} | fixed lock{" "}
                    {roundSummary.lifecycleLoadSummary?.fixedCostLocked ?? 0}
                  </span>
                </div>
                <div className="student-row">
                  <strong>Lifecycle Cue</strong>
                  <span>{roundSummary.lifecycleCue ?? "--"}</span>
                </div>
              </>
            ) : null}
            <div className="student-row">
              <strong>Modifier Themes</strong>
              <span>
                {(roundSummary.modifierThemes ?? [])
                  .map((item) => `${item.theme}(${item.count})`)
                  .join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>Teacher Cue</strong>
              <span>{roundSummary.teacherCue ?? "--"}</span>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
