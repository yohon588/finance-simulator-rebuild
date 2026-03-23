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
          <p className="eyebrow">课堂大屏</p>
          <h2>{props.payload?.classroom.name ?? "实时排行榜"}</h2>
          <p>
            {props.payload?.classroom.code ?? "--"} | 第 {props.payload?.round.no ?? "--"} 回合 / 共{" "}
            {props.payload?.round.total ?? "--"} 回合 / {props.payload?.round.status ?? "--"}
          </p>
        </div>
        <div className="action-row">
          <button type="button" onClick={props.onRefresh} disabled={props.loading}>
            刷新
          </button>
          <button type="button" className="ghost-button" onClick={props.onBack}>
            返回
          </button>
        </div>
      </article>

      <section className="metric-grid">
        <article className="panel metric-card">
          <span>学生人数</span>
          <strong>{profile?.count ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>平均分</span>
          <strong>{profile?.avgScore ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>平均净资产</span>
          <strong>{profile?.avgNetWorth ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>平均应急金月数</span>
          <strong>{profile?.avgEmergencyMonths ?? 0}</strong>
        </article>
        <article className="panel metric-card">
          <span>平均偿债率</span>
          <strong>{profile?.avgDsr ?? 0}</strong>
        </article>
      </section>

      <article className="panel page-panel">
        <h3>当前事件</h3>
        <p>{props.payload?.currentEvent?.title ?? "教师还没有开放回合。"}</p>
        <p>
          保障覆盖：健康 {profile?.insuranceCoverage?.healthCover ?? 0} / 意外{" "}
          {profile?.insuranceCoverage?.accidentCover ?? 0} / 网络安全 {profile?.insuranceCoverage?.cyberCover ?? 0}
        </p>
        <p>
          准备状态：学习 {profile?.preparedness?.learningReady ?? 0} / 健康 {profile?.preparedness?.healthReady ?? 0} /
          设备 {profile?.preparedness?.deviceReady ?? 0} / 储备 {profile?.preparedness?.reserveReady ?? 0} / 安全{" "}
          {profile?.preparedness?.safetyReady ?? 0}
          {showTax ? ` / 税务 ${profile?.preparedness?.taxReady ?? 0}` : ""}
          {showRetirement ? ` / 退休 ${profile?.preparedness?.retirementReady ?? 0}` : ""}
          {showLegacy ? ` / 家庭支持 ${profile?.preparedness?.legacyReady ?? 0}` : ""}
        </p>
        <p>已购车人数：{profile?.vehiclesOwned ?? 0}</p>
        {showRealEstate ? <p>已购房人数：{profile?.homesOwned ?? 0}</p> : null}
        {showRealEstate ? (
          <p>
            家庭阶段：订婚 {profile?.engagedStudents ?? 0} / 已婚 {profile?.marriedStudents ?? 0}
          </p>
        ) : null}
        {showRealEstate ? <p>固定成本锁定：{profile?.fixedCostLocked ?? 0}</p> : null}
      </article>

      <article className="panel page-panel">
        <h3>排行榜</h3>
        {ranking.length === 0 ? (
          <p>当前还没有排行榜数据。</p>
        ) : (
          <div className="student-list">
            {ranking.map((row) => (
              <div key={`${row.rank}-${row.displayName}`} className="student-row">
                <strong>
                  #{row.rank} {row.displayName}
                </strong>
                <span>
                  {row.roleId} | 分数 {row.finalScore} | 净资产 {row.netWorth}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>回合教学总结</h3>
        {!roundSummary ? (
          <p>当前还没有已结算回合总结。</p>
        ) : (
          <div className="student-list">
            <div className="student-row">
              <strong>主要驱动</strong>
              <span>
                {(roundSummary.topDrivers ?? []).map((item) => `${item.label} ${item.total}`).join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>骰子分布</strong>
              <span>
                {(roundSummary.diceCategories ?? []).map((item) => `${item.category} x${item.count}`).join(" / ") ||
                  "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>保护与压力</strong>
              <span>
                保护命中 {roundSummary.protectionSummary?.protectedStudents ?? 0} | 债务压力{" "}
                {roundSummary.protectionSummary?.stressedStudents ?? 0} | 高风险{" "}
                {roundSummary.protectionSummary?.highRiskStudents ?? 0}
              </span>
            </div>
            <div className="student-row">
              <strong>修正影响</strong>
              <span>
                保护型 {roundSummary.protectionSummary?.supportiveHits ?? 0} | 放大型{" "}
                {roundSummary.protectionSummary?.amplifiedHits ?? 0}
              </span>
            </div>
            {showRealEstate ? (
              <>
                <div className="student-row">
                  <strong>生命周期负担</strong>
                  <span>
                    车辆 {roundSummary.lifecycleLoadSummary?.vehiclesOwned ?? 0} | 房产{" "}
                    {roundSummary.lifecycleLoadSummary?.homesOwned ?? 0} | 订婚{" "}
                    {roundSummary.lifecycleLoadSummary?.engagedStudents ?? 0} | 已婚{" "}
                    {roundSummary.lifecycleLoadSummary?.marriedStudents ?? 0} | 固定成本锁定{" "}
                    {roundSummary.lifecycleLoadSummary?.fixedCostLocked ?? 0}
                  </span>
                </div>
                <div className="student-row">
                  <strong>生命周期提示</strong>
                  <span>{roundSummary.lifecycleCue ?? "--"}</span>
                </div>
              </>
            ) : null}
            <div className="student-row">
              <strong>修正主题</strong>
              <span>
                {(roundSummary.modifierThemes ?? [])
                  .map((item) => `${item.theme}(${item.count})`)
                  .join(" / ") || "--"}
              </span>
            </div>
            <div className="student-row">
              <strong>教师提示</strong>
              <span>{roundSummary.teacherCue ?? "--"}</span>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
