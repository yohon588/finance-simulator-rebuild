type TeacherPrintPageProps = {
  onBack: () => void;
  payload: {
    classroom: {
      code: string;
      name: string;
    };
    moduleConfig?: {
      opt?: {
        retirement?: boolean;
        tax?: boolean;
        legacy?: boolean;
        realestate?: boolean;
      };
    };
    ranking?: Array<{
      rank: number;
      displayName: string;
      roleId: string;
      finalScore: number;
      netWorth: number;
    }>;
    classProfile?: {
      avgScore: number;
      avgNetWorth: number;
      avgEmergencyMonths: number;
      avgDsr?: number;
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
      topRiskTags?: Array<{ tag: string; count: number }>;
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
    } | null;
  } | null;
};

export function TeacherPrintPage(props: TeacherPrintPageProps) {
  const ranking = props.payload?.ranking ?? [];
  const classProfile = props.payload?.classProfile;
  const roundSummary = props.payload?.currentRoundSummary;
  const moduleOpt = props.payload?.moduleConfig?.opt;
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Teacher Print View</p>
          <h2>{props.payload?.classroom.name ?? "Classroom Report"}</h2>
          <p>{props.payload?.classroom.code ?? "--"} | Print-friendly summary</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            Back
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>Class Profile</h3>
        <p>Average score: {classProfile?.avgScore ?? 0}</p>
        <p>Average net worth: {classProfile?.avgNetWorth ?? 0}</p>
        <p>Average emergency months: {classProfile?.avgEmergencyMonths ?? 0}</p>
        <p>Average DSR: {classProfile?.avgDsr ?? 0}</p>
        <p>
          Preparedness L {classProfile?.preparedness?.learningReady ?? 0} / H{" "}
          {classProfile?.preparedness?.healthReady ?? 0} / T {classProfile?.preparedness?.deviceReady ?? 0} / R{" "}
          {classProfile?.preparedness?.reserveReady ?? 0} / S {classProfile?.preparedness?.safetyReady ?? 0}
          {showTax ? ` / X ${classProfile?.preparedness?.taxReady ?? 0}` : ""}
          {showRetirement ? ` / Q ${classProfile?.preparedness?.retirementReady ?? 0}` : ""}
          {showLegacy ? ` / L ${classProfile?.preparedness?.legacyReady ?? 0}` : ""} / D{" "}
          {classProfile?.preparedness?.debtStressed ?? 0}
        </p>
        <p>
          Coverage health {classProfile?.insuranceCoverage?.healthCover ?? 0} / accident{" "}
          {classProfile?.insuranceCoverage?.accidentCover ?? 0} / cyber{" "}
          {classProfile?.insuranceCoverage?.cyberCover ?? 0}
        </p>
        <p>Vehicles owned: {classProfile?.vehiclesOwned ?? 0}</p>
        {showRealEstate ? <p>Homes owned: {classProfile?.homesOwned ?? 0}</p> : null}
        {showRealEstate ? (
          <p>
            Family stages engaged {classProfile?.engagedStudents ?? 0} / married {classProfile?.marriedStudents ?? 0}
          </p>
        ) : null}
        {showRealEstate ? <p>Fixed cost lock: {classProfile?.fixedCostLocked ?? 0}</p> : null}
        <p>
          Risk focus:{" "}
          {(classProfile?.topRiskTags ?? []).map((item) => `${item.tag}(${item.hits})`).join(" / ") || "--"}
        </p>
      </article>

      <article className="panel page-panel">
        <h3>Current Round Teaching Summary</h3>
        {!roundSummary ? (
          <p>No settled round summary yet.</p>
        ) : (
          <>
            <p>
              Drivers:{" "}
              {(roundSummary.topDrivers ?? []).map((item) => `${item.label} ${item.total}`).join(" / ") || "--"}
            </p>
            <p>
              Risk focus:{" "}
              {(roundSummary.topRiskTags ?? []).map((item) => `${item.tag}(${item.count})`).join(" / ") || "--"}
            </p>
            <p>
              Protection {roundSummary.protectionSummary?.protectedStudents ?? 0} | stress{" "}
              {roundSummary.protectionSummary?.stressedStudents ?? 0} | supportive hits{" "}
              {roundSummary.protectionSummary?.supportiveHits ?? 0} | amplified hits{" "}
              {roundSummary.protectionSummary?.amplifiedHits ?? 0}
            </p>
            {showRealEstate ? (
              <>
                <p>
                  Lifecycle load vehicles {roundSummary.lifecycleLoadSummary?.vehiclesOwned ?? 0} / homes{" "}
                  {roundSummary.lifecycleLoadSummary?.homesOwned ?? 0} / engaged{" "}
                  {roundSummary.lifecycleLoadSummary?.engagedStudents ?? 0} / married{" "}
                  {roundSummary.lifecycleLoadSummary?.marriedStudents ?? 0} / fixed lock{" "}
                  {roundSummary.lifecycleLoadSummary?.fixedCostLocked ?? 0}
                </p>
                <p>Lifecycle cue: {roundSummary.lifecycleCue ?? "--"}</p>
              </>
            ) : null}
            <p>Teacher cue: {roundSummary.teacherCue ?? "--"}</p>
          </>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Ranking Summary</h3>
        {ranking.length === 0 ? (
          <p>No ranking data yet.</p>
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
    </section>
  );
}
