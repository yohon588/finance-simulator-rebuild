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
          <p className="eyebrow">学生首页</p>
          <h2>{payload.student.displayName}</h2>
          <p>
            {payload.classroom.name} | {payload.classroom.code} | {payload.student.roleId}
          </p>
        </div>
        <div className="action-row">
          <button type="button" onClick={props.onRefresh} disabled={props.loading}>
            刷新
          </button>
          <button type="button" onClick={props.onGoDecision} disabled={props.loading}>
            去做决策
          </button>
          <button type="button" onClick={props.onGoDebts} disabled={props.loading}>
            查看债务
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => props.onOpenRoundDetail(payload.latestLedger?.roundNo ?? payload.round.no - 1)}
            disabled={props.loading || !(payload.roundHistory?.length || payload.latestLedger)}
          >
            回合复盘
          </button>
          <button type="button" onClick={props.onRollDice} disabled={props.loading}>
            掷骰子
          </button>
          <button type="button" className="ghost-button" onClick={props.onLogout}>
            退出登录
          </button>
        </div>
      </article>

      <section className="metric-grid">
        <article className="panel metric-card">
          <span>回合状态</span>
          <strong>
            第 {payload.round.no} 回合 / 共 {payload.round.total ?? "--"} 回合 / {payload.round.status}
          </strong>
        </article>
        <article className="panel metric-card">
          <span>净资产</span>
          <strong>{metrics.netWorth}</strong>
        </article>
        <article className="panel metric-card">
          <span>负债率</span>
          <strong>{metrics.debtRatio}</strong>
        </article>
        <article className="panel metric-card">
          <span>DSR</span>
          <strong>{metrics.dsr}</strong>
        </article>
        <article className="panel metric-card">
          <span>应急金月数</span>
          <strong>{metrics.emergencyMonths}</strong>
        </article>
        <article className="panel metric-card">
          <span>现金</span>
          <strong>{payload.student.cash}</strong>
        </article>
      </section>

      <article className="panel page-panel">
        <h3>预算摘要</h3>
        <p>工资收入：{payload.budget?.salary ?? payload.student.baseSalary}</p>
        <p>基础必需支出：{payload.budget?.mandatoryLiving ?? "--"}</p>
        <p>最低还款：{payload.budget?.minDebtPay ?? "--"}</p>
        <p>车辆固定支出：{payload.budget?.vehicleMandatory ?? 0}</p>
        {showRealEstate ? <p>住房固定支出：{payload.budget?.housingMandatory ?? 0}</p> : null}
        <p>家庭固定支出：{payload.budget?.familyMandatory ?? 0}</p>
        <p>可借额度：{payload.budget?.borrowLimit ?? "--"}</p>
      </article>

      <article className="panel page-panel">
        <h3>当前持仓</h3>
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
          <p>当前还没有已记录资产。</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>车辆</h3>
        {payload.student.vehicle?.owned ? (
          <div className="student-list">
            <div className="student-row">
              <strong>是否持有</strong>
              <span>是</span>
            </div>
            <div className="student-row">
              <strong>车辆价值</strong>
              <span>{payload.student.vehicle.value ?? 0}</span>
            </div>
            <div className="student-row">
              <strong>月供 / 养车成本</strong>
              <span>
                {payload.student.vehicle.monthlyPayment ?? 0} / {payload.student.vehicle.maintenance ?? 0}
              </span>
            </div>
          </div>
        ) : (
          <p>当前还没有购车。</p>
        )}
      </article>

      {showRealEstate ? (
        <article className="panel page-panel">
          <h3>住房</h3>
          {payload.student.house?.owned ? (
            <div className="student-list">
              <div className="student-row">
                <strong>是否持有</strong>
                <span>是</span>
              </div>
              <div className="student-row">
                <strong>房屋价值</strong>
                <span>{payload.student.house.value ?? 0}</span>
              </div>
              <div className="student-row">
                <strong>月供 / 维护成本</strong>
                <span>
                  {payload.student.house.monthlyPayment ?? 0} / {payload.student.house.maintenance ?? 0}
                </span>
              </div>
            </div>
          ) : (
            <p>当前还没有购房。</p>
          )}
        </article>
      ) : null}

      <article className="panel page-panel">
        <h3>家庭生命周期</h3>
        <div className="student-list">
          <div className="student-row">
            <strong>阶段</strong>
            <span>{payload.student.family?.stage ?? "单身"}</span>
          </div>
          <div className="student-row">
            <strong>每月家庭支出</strong>
            <span>{payload.student.family?.monthlySupport ?? 0}</span>
          </div>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>准备状态</h3>
        {payload.student.prepFlags ? (
          <>
            <div className="tag-row">
              <span className={payload.student.prepFlags.learningReady ? "info-tag" : "risk-tag"}>学习准备</span>
              <span className={payload.student.prepFlags.healthReady ? "info-tag" : "risk-tag"}>健康准备</span>
              <span className={payload.student.prepFlags.deviceReady ? "info-tag" : "risk-tag"}>设备准备</span>
              <span className={payload.student.prepFlags.reserveReady ? "info-tag" : "risk-tag"}>储备准备</span>
              <span className={payload.student.prepFlags.safetyReady ? "info-tag" : "risk-tag"}>安全准备</span>
              {showTax ? (
                <span className={payload.student.prepFlags.taxReady ? "info-tag" : "risk-tag"}>税务准备</span>
              ) : null}
              {showRetirement ? (
                <span className={payload.student.prepFlags.retirementReady ? "info-tag" : "risk-tag"}>退休准备</span>
              ) : null}
              {showLegacy ? (
                <span className={payload.student.prepFlags.legacyReady ? "info-tag" : "risk-tag"}>家庭支持准备</span>
              ) : null}
              <span className={payload.student.prepFlags.debtStressed ? "risk-tag" : "info-tag"}>债务压力</span>
            </div>
            <div className="student-list top-gap">
              <div className="student-row">
                <strong>学习准备</strong>
                <span>最近的学习投入可以提升创收机会，也能缓冲部分冲击。</span>
              </div>
              <div className="student-row">
                <strong>健康准备</strong>
                <span>健康保障会减少医疗事件带来的自付损失。</span>
              </div>
              <div className="student-row">
                <strong>设备准备</strong>
                <span>设备维护可以减少手机、电脑故障带来的损失。</span>
              </div>
              <div className="student-row">
                <strong>储备准备</strong>
                <span>应急金和额外储备能帮助你吸收医疗与居住冲击。</span>
              </div>
              <div className="student-row">
                <strong>安全准备</strong>
                <span>安全设置会降低诈骗和账户安全事件造成的损失。</span>
              </div>
              {showTax ? (
                <div className="student-row">
                  <strong>税务准备</strong>
                  <span>税务预留能让新增收入少受税费和手续摩擦影响。</span>
                </div>
              ) : null}
              {showRetirement ? (
                <div className="student-row">
                  <strong>退休准备</strong>
                  <span>长期储蓄纪律能减少短期超支冲动，并让长期目标更清晰。</span>
                </div>
              ) : null}
              {showLegacy ? (
                <div className="student-row">
                  <strong>家庭支持准备</strong>
                  <span>家庭支持储备能缓冲照护、亲属求助和人情支出冲击。</span>
                </div>
              ) : null}
              <div className="student-row">
                <strong>债务压力</strong>
                <span>债务压力会放大同样事件的损失，也会提高整体风险。</span>
              </div>
            </div>
          </>
        ) : (
          <p>当前还没有准备状态。</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>保障层</h3>
        <div className="tag-row">
          <span className={payload.student.insuranceFlags?.healthCover ? "info-tag" : "risk-tag"}>健康保障</span>
          <span className={payload.student.insuranceFlags?.accidentCover ? "info-tag" : "risk-tag"}>意外保障</span>
          <span className={payload.student.insuranceFlags?.cyberCover ? "info-tag" : "risk-tag"}>网络安全保障</span>
        </div>
        <div className="student-list top-gap">
          <div className="student-row">
            <strong>健康保障</strong>
            <span>可以降低普通医疗和治疗事件的冲击。</span>
          </div>
          <div className="student-row">
            <strong>意外保障</strong>
            <span>更针对突发受伤和意外事故类损失。</span>
          </div>
          <div className="student-row">
            <strong>网络安全保障</strong>
            <span>能抵消一部分诈骗、盗刷和账号安全损失。</span>
          </div>
        </div>
      </article>

      <article className="panel page-panel">
        <h3>宏观事件</h3>
        {payload.currentEvent ? (
          <>
            <p>{payload.currentEvent.title}</p>
            <p>{payload.currentEvent.transmissionPath ?? "事件传导路径暂未生成。"}</p>
            <div className="tag-row">
              {(payload.currentEvent.teachingPoints ?? []).map((point) => (
                <span key={point} className="info-tag">
                  {point}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p>当前还没有开放事件，请等待老师开放回合。</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>个人骰子事件</h3>
        {payload.currentDice ? (
          <>
            <p>
              点数 {payload.currentDice.roll} | 类别 {payload.currentDice.category}
            </p>
            <p>{payload.currentDice.card?.title ?? "个人骰子事件"}</p>
            <p>现金影响：{payload.currentDice.appliedEffect?.cash ?? 0}</p>
            <p>{payload.currentDice.card?.knowledgePoint ?? ""}</p>
            {(payload.currentDice.appliedEffect?.modifiers ?? []).length > 0 ? (
              <div className="student-list top-gap">
                {payload.currentDice.appliedEffect?.modifiers?.map((item) => (
                  <div key={item} className="student-row">
                    <strong>修正说明</strong>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <p>本回合还没有掷出个人骰子事件。</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>市场影响</h3>
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
          <p>开放回合后会显示市场影响。</p>
        )}
      </article>

      <article className="panel page-panel">
        <h3>最近回合</h3>
        {!payload.roundHistory?.length ? (
          <p>当前还没有可复盘的已结算回合。</p>
        ) : (
          <div className="student-list">
            {payload.roundHistory
              .slice()
              .reverse()
              .slice(0, 4)
              .map((round) => (
                <div key={round.roundNo} className="student-row">
                  <strong>
                    第 {round.roundNo} 回合 | {round.eventTitle ?? "宏观事件"}
                  </strong>
                  <span>{round.settledAt}</span>
                  <button type="button" className="ghost-button" onClick={() => props.onOpenRoundDetail(round.roundNo)}>
                    复盘
                  </button>
                </div>
              ))}
          </div>
        )}
      </article>

      <article className="panel page-panel">
        <h3>风险标签</h3>
        {payload.student.riskTags.length === 0 ? (
          <p>当前没有风险标签。</p>
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
        <h3>提交状态</h3>
        {payload.currentDecision ? (
          <p>
            已提交，本次幂等键为 {payload.currentDecision.idempotencyKey}，提交时间 {payload.currentDecision.submittedAt}
          </p>
        ) : (
          <p>本回合还没有提交决策。</p>
        )}
      </article>
    </section>
  );
}
