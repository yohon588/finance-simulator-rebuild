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
          <p className="eyebrow">教师打印视图</p>
          <h2>{props.payload?.classroom.name ?? "课堂报告"}</h2>
          <p>{props.payload?.classroom.code ?? "--"} | 适合打印的课堂摘要</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            返回
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>班级画像</h3>
        <p>平均分：{classProfile?.avgScore ?? 0}</p>
        <p>平均净资产：{classProfile?.avgNetWorth ?? 0}</p>
        <p>平均应急金月数：{classProfile?.avgEmergencyMonths ?? 0}</p>
        <p>平均偿债率：{classProfile?.avgDsr ?? 0}</p>
        <p>
          准备状态：学习 {classProfile?.preparedness?.learningReady ?? 0} / 健康{" "}
          {classProfile?.preparedness?.healthReady ?? 0} / 设备 {classProfile?.preparedness?.deviceReady ?? 0} / 储备{" "}
          {classProfile?.preparedness?.reserveReady ?? 0} / 安全 {classProfile?.preparedness?.safetyReady ?? 0}
          {showTax ? ` / 税务 ${classProfile?.preparedness?.taxReady ?? 0}` : ""}
          {showRetirement ? ` / 退休 ${classProfile?.preparedness?.retirementReady ?? 0}` : ""}
          {showLegacy ? ` / 家庭支持 ${classProfile?.preparedness?.legacyReady ?? 0}` : ""} / 债务压力{" "}
          {classProfile?.preparedness?.debtStressed ?? 0}
        </p>
        <p>
          保障覆盖：健康 {classProfile?.insuranceCoverage?.healthCover ?? 0} / 意外{" "}
          {classProfile?.insuranceCoverage?.accidentCover ?? 0} / 网络安全 {classProfile?.insuranceCoverage?.cyberCover ?? 0}
        </p>
        <p>已购车人数：{classProfile?.vehiclesOwned ?? 0}</p>
        {showRealEstate ? <p>已购房人数：{classProfile?.homesOwned ?? 0}</p> : null}
        {showRealEstate ? (
          <p>
            家庭阶段：订婚 {classProfile?.engagedStudents ?? 0} / 已婚 {classProfile?.marriedStudents ?? 0}
          </p>
        ) : null}
        {showRealEstate ? <p>固定成本锁定：{classProfile?.fixedCostLocked ?? 0}</p> : null}
        <p>
          风险焦点：{(classProfile?.topRiskTags ?? []).map((item) => `${item.tag}(${item.hits})`).join(" / ") || "--"}
        </p>
      </article>

      <article className="panel page-panel">
        <h3>当前回合教学总结</h3>
        {!roundSummary ? (
          <p>当前还没有已结算回合总结。</p>
        ) : (
          <>
            <p>
              主要驱动：{(roundSummary.topDrivers ?? []).map((item) => `${item.label} ${item.total}`).join(" / ") || "--"}
            </p>
            <p>
              风险焦点：{(roundSummary.topRiskTags ?? []).map((item) => `${item.tag}(${item.count})`).join(" / ") || "--"}
            </p>
            <p>
              保护命中 {roundSummary.protectionSummary?.protectedStudents ?? 0} | 压力{" "}
              {roundSummary.protectionSummary?.stressedStudents ?? 0} | 保护型修正{" "}
              {roundSummary.protectionSummary?.supportiveHits ?? 0} | 放大型修正{" "}
              {roundSummary.protectionSummary?.amplifiedHits ?? 0}
            </p>
            {showRealEstate ? (
              <>
                <p>
                  生命周期负担：车辆 {roundSummary.lifecycleLoadSummary?.vehiclesOwned ?? 0} / 房产{" "}
                  {roundSummary.lifecycleLoadSummary?.homesOwned ?? 0} / 订婚{" "}
                  {roundSummary.lifecycleLoadSummary?.engagedStudents ?? 0} / 已婚{" "}
                  {roundSummary.lifecycleLoadSummary?.marriedStudents ?? 0} / 固定成本锁定{" "}
                  {roundSummary.lifecycleLoadSummary?.fixedCostLocked ?? 0}
                </p>
                <p>生命周期提示：{roundSummary.lifecycleCue ?? "--"}</p>
              </>
            ) : null}
            <p>教师提示：{roundSummary.teacherCue ?? "--"}</p>
          </>
        )}
      </article>

      <article className="panel page-panel">
        <h3>排行榜摘要</h3>
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
    </section>
  );
}
