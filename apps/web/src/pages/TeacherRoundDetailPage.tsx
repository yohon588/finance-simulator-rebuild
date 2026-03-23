type TeacherRoundDetailPageProps = {
  loading?: boolean;
  onBack: () => void;
  payload: {
    classroom?: {
      code: string;
      name: string;
    };
    roundDetail?: {
      roundNo: number;
      eventTitle?: string;
      settledAt: string;
      avgScore?: number;
      submitted?: number;
      teachingSummary?: {
        topDrivers?: Array<{ label: string; total: number }>;
        diceCategories?: Array<{ category: string; count: number }>;
        topRiskTags?: Array<{ tag: string; count: number }>;
        teacherCue?: string;
      };
      students?: Array<{
        studentId: string;
        displayName: string;
        roleId: string;
        finalScore: number;
        netWorth?: number;
        preparedness?: {
          learningReady?: boolean;
          healthReady?: boolean;
          deviceReady?: boolean;
          reserveReady?: boolean;
          safetyReady?: boolean;
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
        riskTags: string[];
        diceEvent?: {
          title?: string;
          category?: string;
          knowledgePoint?: string;
          teacherNote?: string;
          cashEffect?: number;
          modifiers?: string[];
        } | null;
        debtChange?: {
          debtBefore: number;
          debtAfter: number;
          bridgeShortfall?: number;
          bridgeTarget?: string | null;
          paidByDebt?: Record<string, number>;
          items?: Array<{
            id: string;
            type?: string;
            principal: number;
            status: string;
          }>;
        } | null;
        topDrivers?: Array<{ label: string; value: number }>;
        cashFlow?: Record<string, number> | null;
        score?: {
          finalScore?: number;
          wealthScore?: number;
          healthScore?: number;
          lifeScore?: number;
          debtRatio?: number;
          dsr?: number;
          emergencyMonths?: number;
          fixedCostRatio?: number;
        } | null;
        settlementSummary?: string[];
      }>;
    };
  } | null;
};

export function TeacherRoundDetailPage(props: TeacherRoundDetailPageProps) {
  const detail = props.payload?.roundDetail;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Teacher Round Detail</p>
          <h2>
            {props.payload?.classroom?.name ?? "Classroom"} | Round {detail?.roundNo ?? "--"}
          </h2>
          <p>{detail?.eventTitle ?? "Macro Event"} | {detail?.settledAt ?? "--"}</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack} disabled={props.loading}>
            Back
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>Round Summary</h3>
        {!detail ? (
          <p>No round detail loaded.</p>
        ) : (
          <>
            <p>Average score: {detail.avgScore ?? 0}</p>
            <p>Submitted: {detail.submitted ?? 0}</p>
            <p>
              Drivers:{" "}
              {(detail.teachingSummary?.topDrivers ?? [])
                .map((item) => `${item.label} ${item.total}`)
                .join(" / ") || "--"}
            </p>
            <p>
              Dice mix:{" "}
              {(detail.teachingSummary?.diceCategories ?? [])
                .map((item) => `${item.category} x${item.count}`)
                .join(" / ") || "--"}
            </p>
            <p>
              Risk focus:{" "}
              {(detail.teachingSummary?.topRiskTags ?? [])
                .map((item) => `${item.tag}(${item.count})`)
                .join(" / ") || "--"}
            </p>
            <p>Teacher cue: {detail.teachingSummary?.teacherCue ?? "--"}</p>
          </>
        )}
      </article>

      <article className="panel page-panel">
        <h3>Student Snapshots</h3>
        {!detail?.students || detail.students.length === 0 ? (
          <p>No student detail available for this round.</p>
        ) : (
          <div className="student-list">
            {detail.students.map((student) => (
              <div key={student.studentId} className="archive-card">
                <strong>
                  {student.displayName} | {student.roleId} | score {student.finalScore} | net worth {student.netWorth ?? 0}
                </strong>
                <span>
                  Dice: {student.diceEvent?.title ?? "--"} ({student.diceEvent?.category ?? "--"})
                </span>
                <span>
                  Dice cash effect: {student.diceEvent?.cashEffect ?? 0} |{" "}
                  {(student.diceEvent?.modifiers ?? []).join(" / ") || "no modifiers"}
                </span>
                {student.diceEvent?.knowledgePoint ? (
                  <span>Knowledge: {student.diceEvent.knowledgePoint}</span>
                ) : null}
                {student.diceEvent?.teacherNote ? <span>Teacher note: {student.diceEvent.teacherNote}</span> : null}
                <span>
                  Prep: L {student.preparedness?.learningReady ? 1 : 0} / H {student.preparedness?.healthReady ? 1 : 0} / T{" "}
                  {student.preparedness?.deviceReady ? 1 : 0} / R {student.preparedness?.reserveReady ? 1 : 0} / S{" "}
                  {student.preparedness?.safetyReady ? 1 : 0} / D {student.preparedness?.debtStressed ? 1 : 0}
                </span>
                <span>
                  Cover: H {student.insuranceFlags?.healthCover ? 1 : 0} / A {student.insuranceFlags?.accidentCover ? 1 : 0} / C{" "}
                  {student.insuranceFlags?.cyberCover ? 1 : 0} | family {student.family?.stage ?? "single"} / support{" "}
                  {student.family?.monthlySupport ?? 0}
                </span>
                <span>
                  Ratios: debt {student.score?.debtRatio ?? 0} / dsr {student.score?.dsr ?? 0} / emergency{" "}
                  {student.score?.emergencyMonths ?? 0} / fixed cost {student.score?.fixedCostRatio ?? 0}
                </span>
                <span>
                  Drivers:{" "}
                  {(student.topDrivers ?? [])
                    .map((item) => `${item.label} ${item.value}`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  Debt: {student.debtChange?.debtBefore ?? 0} to {student.debtChange?.debtAfter ?? 0} | shortfall{" "}
                  {student.debtChange?.bridgeShortfall ?? 0} via {student.debtChange?.bridgeTarget ?? "--"}
                </span>
                <span>
                  Debt states:{" "}
                  {(student.debtChange?.items ?? [])
                    .map((item) => `${item.type ?? item.id}:${item.status}/${item.principal}`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  Debt allocation:{" "}
                  {Object.entries(student.debtChange?.paidByDebt ?? {})
                    .map(([debtId, paid]) => `${debtId}:${paid}`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  Cash flow:{" "}
                  {Object.entries(student.cashFlow ?? {})
                    .slice(0, 6)
                    .map(([key, value]) => `${key}:${value}`)
                    .join(" / ") || "--"}
                </span>
                <span>Risk tags: {student.riskTags.join(" / ") || "--"}</span>
                <span>{student.settlementSummary?.[0] ?? "No summary."}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
