type TeacherArchivesPageProps = {
  onBack: () => void;
  loading?: boolean;
  onRefresh?: () => Promise<void>;
  onOpenRoundDetail?: (roundNo: number) => Promise<void>;
  payload: {
    roundHistory?: Array<{
      roundNo: number;
      eventTitle?: string;
      settledAt: string;
      avgScore?: number;
      submitted?: number;
      classProfile?: {
        avgEmergencyMonths?: number;
        avgDsr?: number;
      };
      teachingSummary?: {
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
      };
      rankingTop3?: Array<{
        rank: number;
        displayName: string;
        finalScore: number;
      }>;
    }>;
    archives?: Array<{
      id: string;
      archivedAt: string;
      classroom: {
        code: string;
        name: string;
      };
      round: {
        no: number;
        status: string;
      };
      ranking?: Array<{
        rank: number;
        displayName: string;
        finalScore: number;
      }>;
      classProfile?: {
        avgScore: number;
        avgNetWorth: number;
      };
      teachingSummary?: {
        topDrivers?: Array<{ label: string; total: number }>;
        topRiskTags?: Array<{ tag: string; count: number }>;
      };
    }>;
  } | null;
};

export function TeacherArchivesPage(props: TeacherArchivesPageProps) {
  const archives = props.payload?.archives ?? [];
  const roundHistory = props.payload?.roundHistory ?? [];

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Teacher Archives</p>
          <h2>Round History And Snapshots</h2>
          <p>Use this page for class replay and archived classroom states.</p>
        </div>
        <div className="action-row">
          <button type="button" onClick={() => void props.onRefresh?.()} disabled={props.loading}>
            Refresh
          </button>
          <button type="button" className="ghost-button" onClick={props.onBack}>
            Back
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>Round History</h3>
        {roundHistory.length === 0 ? (
          <p>No settled round history yet.</p>
        ) : (
          <div className="student-list">
            {roundHistory
              .slice()
              .reverse()
              .map((item) => (
                <div key={`${item.roundNo}-${item.settledAt}`} className="archive-card">
                  <strong>
                    Round {item.roundNo} | {item.eventTitle ?? "Macro Event"}
                  </strong>
                  <span>
                    Avg score {item.avgScore ?? 0} | submitted {item.submitted ?? 0} | {item.settledAt}
                  </span>
                  <span>
                    Top 3:{" "}
                    {(item.rankingTop3 ?? [])
                      .map((entry) => `${entry.rank}.${entry.displayName}(${entry.finalScore})`)
                      .join(" / ") || "--"}
                  </span>
                  <span>
                    Drivers:{" "}
                    {(item.teachingSummary?.topDrivers ?? [])
                      .map((entry) => `${entry.label} ${entry.total}`)
                      .join(" / ") || "--"}
                  </span>
                  <span>
                    Dice mix:{" "}
                    {(item.teachingSummary?.diceCategories ?? [])
                      .map((entry) => `${entry.category} x${entry.count}`)
                      .join(" / ") || "--"}
                  </span>
                  <span>
                    Protection: protected {item.teachingSummary?.protectionSummary?.protectedStudents ?? 0} | debt stress{" "}
                    {item.teachingSummary?.protectionSummary?.stressedStudents ?? 0} | high risk{" "}
                    {item.teachingSummary?.protectionSummary?.highRiskStudents ?? 0}
                  </span>
                  <span>
                    Modifier impact: supportive {item.teachingSummary?.protectionSummary?.supportiveHits ?? 0} |
                    amplified {item.teachingSummary?.protectionSummary?.amplifiedHits ?? 0}
                  </span>
                  <span>
                    Lifecycle: vehicles {item.teachingSummary?.lifecycleLoadSummary?.vehiclesOwned ?? 0} / homes{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.homesOwned ?? 0} / engaged{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.engagedStudents ?? 0} / married{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.marriedStudents ?? 0} / fixed lock{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.fixedCostLocked ?? 0}
                  </span>
                  <span>Lifecycle cue: {item.teachingSummary?.lifecycleCue ?? "--"}</span>
                  <span>
                    Risk focus:{" "}
                    {(item.teachingSummary?.topRiskTags ?? [])
                      .map((entry) => `${entry.tag}(${entry.count})`)
                      .join(" / ") || "--"}
                  </span>
                  <span>Teacher cue: {item.teachingSummary?.teacherCue ?? "--"}</span>
                  <button
                    type="button"
                    onClick={() => void props.onOpenRoundDetail?.(item.roundNo)}
                    disabled={props.loading}
                  >
                    Open Detail
                  </button>
                  <span>
                    Teaching cue: compare why the same macro event produced different outcomes across the top three.
                  </span>
                </div>
              ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Snapshots</h3>
        {archives.length === 0 ? (
          <p>No archives yet.</p>
        ) : (
          <div className="student-list">
            {archives.map((archive) => (
              <div key={archive.id} className="archive-card">
                <strong>
                  {archive.classroom.name} | {archive.classroom.code}
                </strong>
                <span>
                  Round {archive.round.no} | {archive.round.status} | {archive.archivedAt}
                </span>
                <span>
                  Avg score {archive.classProfile?.avgScore ?? 0} | Avg net worth{" "}
                  {archive.classProfile?.avgNetWorth ?? 0}
                </span>
                <span>
                  Snapshot drivers:{" "}
                  {(archive.teachingSummary?.topDrivers ?? [])
                    .map((entry) => `${entry.label} ${entry.total}`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  Snapshot risks:{" "}
                  {(archive.teachingSummary?.topRiskTags ?? [])
                    .map((entry) => `${entry.tag}(${entry.count})`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  Leader: {archive.ranking?.[0]?.displayName ?? "--"} / {archive.ranking?.[0]?.finalScore ?? 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
