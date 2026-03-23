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
          <p className="eyebrow">教师归档</p>
          <h2>回合历史与课堂快照</h2>
          <p>用于教师复盘课堂过程和查看已归档的课堂状态。</p>
        </div>
        <div className="action-row">
          <button type="button" onClick={() => void props.onRefresh?.()} disabled={props.loading}>
            刷新
          </button>
          <button type="button" className="ghost-button" onClick={props.onBack}>
            返回
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>回合历史</h3>
        {roundHistory.length === 0 ? (
          <p>当前还没有已结算的回合历史。</p>
        ) : (
          <div className="student-list">
            {roundHistory
              .slice()
              .reverse()
              .map((item) => (
                <div key={`${item.roundNo}-${item.settledAt}`} className="archive-card">
                  <strong>
                    第 {item.roundNo} 回合 | {item.eventTitle ?? "宏观事件"}
                  </strong>
                  <span>
                    平均分 {item.avgScore ?? 0} | 已提交 {item.submitted ?? 0} | {item.settledAt}
                  </span>
                  <span>
                    前三名：{" "}
                    {(item.rankingTop3 ?? [])
                      .map((entry) => `${entry.rank}.${entry.displayName}(${entry.finalScore})`)
                      .join(" / ") || "--"}
                  </span>
                  <span>
                    主要驱动：{" "}
                    {(item.teachingSummary?.topDrivers ?? [])
                      .map((entry) => `${entry.label} ${entry.total}`)
                      .join(" / ") || "--"}
                  </span>
                  <span>
                    骰子分布：{" "}
                    {(item.teachingSummary?.diceCategories ?? [])
                      .map((entry) => `${entry.category} x${entry.count}`)
                      .join(" / ") || "--"}
                  </span>
                  <span>
                    保护与压力：保护命中 {item.teachingSummary?.protectionSummary?.protectedStudents ?? 0} | 债务压力{" "}
                    {item.teachingSummary?.protectionSummary?.stressedStudents ?? 0} | high risk{" "}
                    {item.teachingSummary?.protectionSummary?.highRiskStudents ?? 0}
                  </span>
                  <span>
                    修正影响：保护型 {item.teachingSummary?.protectionSummary?.supportiveHits ?? 0} |
                    放大型 {item.teachingSummary?.protectionSummary?.amplifiedHits ?? 0}
                  </span>
                  <span>
                    生命周期负担：车辆 {item.teachingSummary?.lifecycleLoadSummary?.vehiclesOwned ?? 0} / 房产{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.homesOwned ?? 0} / 订婚{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.engagedStudents ?? 0} / 已婚{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.marriedStudents ?? 0} / 固定成本锁定{" "}
                    {item.teachingSummary?.lifecycleLoadSummary?.fixedCostLocked ?? 0}
                  </span>
                  <span>生命周期提示：{item.teachingSummary?.lifecycleCue ?? "--"}</span>
                  <span>
                    风险焦点：{" "}
                    {(item.teachingSummary?.topRiskTags ?? [])
                      .map((entry) => `${entry.tag}(${entry.count})`)
                      .join(" / ") || "--"}
                  </span>
                  <span>教师提示：{item.teachingSummary?.teacherCue ?? "--"}</span>
                  <button
                    type="button"
                    onClick={() => void props.onOpenRoundDetail?.(item.roundNo)}
                    disabled={props.loading}
                  >
                    打开详情
                  </button>
                  <span>
                    教学提示：对比为什么同样的宏观事件，会让不同学生出现完全不同的结果。
                  </span>
                </div>
              ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>课堂快照</h3>
        {archives.length === 0 ? (
          <p>当前还没有归档。</p>
        ) : (
          <div className="student-list">
            {archives.map((archive) => (
              <div key={archive.id} className="archive-card">
                <strong>
                  {archive.classroom.name} | {archive.classroom.code}
                </strong>
                <span>
                  第 {archive.round.no} 回合 | {archive.round.status} | {archive.archivedAt}
                </span>
                <span>
                  平均分 {archive.classProfile?.avgScore ?? 0} | 平均净资产{" "}
                  {archive.classProfile?.avgNetWorth ?? 0}
                </span>
                <span>
                  快照驱动：{" "}
                  {(archive.teachingSummary?.topDrivers ?? [])
                    .map((entry) => `${entry.label} ${entry.total}`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  快照风险：{" "}
                  {(archive.teachingSummary?.topRiskTags ?? [])
                    .map((entry) => `${entry.tag}(${entry.count})`)
                    .join(" / ") || "--"}
                </span>
                <span>
                  第一名：{archive.ranking?.[0]?.displayName ?? "--"} / {archive.ranking?.[0]?.finalScore ?? 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
