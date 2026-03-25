import { useEffect, useMemo, useState } from "react";

import type { SubmitDecisionInput } from "../api/client";
import {
  buildDecisionPreview,
  readDecisionDraft,
  writeDecisionDraft,
  type DecisionBudget,
  type DecisionDraft,
  type DecisionStudentSnapshot
} from "../lib/decision-preview";

type StudentDecisionPageProps = {
  loading: boolean;
  currentRoundId: string;
  roundStatus: string;
  budget: DecisionBudget | null;
  student: DecisionStudentSnapshot;
  moduleConfig?: {
    opt?: {
      retirement?: boolean;
      tax?: boolean;
      legacy?: boolean;
      realestate?: boolean;
    };
  };
  onBack: () => void;
  onSubmitDecision: (input: SubmitDecisionInput) => Promise<void>;
};

function createSubmissionKey(roundId: string) {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return `${roundId}-${globalThis.crypto.randomUUID()}`;
  }

  return `${roundId}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const defaultDraft = (roundId: string): DecisionDraft => ({
  submissionKey: createSubmissionKey(roundId),
  travel: false,
  course: false,
  healthCover: false,
  accidentCover: false,
  cyberCover: false,
  toolMaintenance: false,
  reserveTopUp: false,
  safetySetup: false,
  taxReserve: false,
  retirementPlan: false,
  legacyReserve: false,
  buyVehicle: false,
  buyHouse: false,
  engagementPrep: false,
  weddingPlan: false,
  borrow: "0",
  repay: "0",
  debtTarget: "D-consumer",
  bondBuy: "0",
  fundBuy: "0",
  stockBuy: "0",
  cryptoBuy: "0",
  optionBuy: "0",
  optionDir: "CALL",
  gambleType: "LOTTERY",
  gambleAmount: "0",
  riskCrypto: false,
  riskOption: false,
  riskGamble: false
});

const consumeRows = [
  { key: "travel", label: "旅行与休闲", amount: 2000, score: "+66.7 分", hint: "提升生活体验，但会占用现金流。" },
  { key: "course", label: "课程学习", amount: 3000, score: "+100 分", hint: "提升能力准备度，也是未来收入的投入。" },
  { key: "healthCover", label: "健康保障", amount: 500, score: "+16.7 分", hint: "降低医疗类冲击。" },
  { key: "accidentCover", label: "意外保障", amount: 200, score: "+6.7 分", hint: "对低频高损事件有缓冲。" },
  { key: "cyberCover", label: "网络安全保障", amount: 150, score: "+5.0 分", hint: "减少诈骗和支付安全风险。" },
  { key: "toolMaintenance", label: "设备维护", amount: 400, score: "+13.3 分", hint: "降低设备故障的现金冲击。" },
  { key: "reserveTopUp", label: "补充应急金", amount: 800, score: "+26.7 分", hint: "提升抗波动能力。" },
  { key: "safetySetup", label: "安全防护", amount: 300, score: "+10.0 分", hint: "降低安全类损失。" },
  { key: "taxReserve", label: "税务准备", amount: 400, score: "+13.3 分", hint: "减少税务事件带来的冲击。" },
  { key: "retirementPlan", label: "养老准备", amount: 700, score: "+23.3 分", hint: "强化长期规划。" },
  { key: "legacyReserve", label: "家庭支持准备", amount: 500, score: "+16.7 分", hint: "应对家庭支出与责任。" },
  { key: "engagementPrep", label: "订婚准备", amount: 6000, score: "+100 分", hint: "进入订婚阶段，会影响后续家庭路径。" },
  { key: "weddingPlan", label: "婚礼计划", amount: 18000, score: "+100 分", hint: "进入已婚阶段，后续会有家庭固定支出。" }
] as const;

const investRows = [
  { key: "bondBuy", label: "债券基金", asset: "A4", placeholder: "稳健防守型资产" },
  { key: "fundBuy", label: "股票基金", asset: "A5", placeholder: "分散持有成长资产" },
  { key: "stockBuy", label: "股票", asset: "A6", placeholder: "波动更大，收益弹性更强" },
  { key: "cryptoBuy", label: "虚拟币", asset: "A7", placeholder: "高波动高风险" },
  { key: "optionBuy", label: "期权", asset: "A8", placeholder: "方向性高风险工具" }
] as const;

function currency(value?: number) {
  return `¥${Number(value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

function shareText(value: number, denominator: number) {
  if (denominator <= 0 || value <= 0) {
    return "0.0%";
  }

  return `${((value / denominator) * 100).toFixed(1)}%`;
}

export function StudentDecisionPage(props: StudentDecisionPageProps) {
  const moduleOpt = props.moduleConfig?.opt;
  const canSubmitDecision = props.roundStatus === "open";
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;
  const [draft, setDraft] = useState<DecisionDraft>(() => readDecisionDraft(props.currentRoundId) ?? defaultDraft(props.currentRoundId));

  useEffect(() => {
    setDraft(readDecisionDraft(props.currentRoundId) ?? defaultDraft(props.currentRoundId));
  }, [props.currentRoundId]);

  useEffect(() => {
    writeDecisionDraft(props.currentRoundId, draft);
  }, [draft, props.currentRoundId]);

  const preview = useMemo(() => {
    if (!props.budget) {
      return null;
    }

    return buildDecisionPreview({
      draft,
      budget: props.budget,
      student: props.student
    });
  }, [draft, props.budget, props.student]);

  const blockedByRiskAck =
    (Number(draft.cryptoBuy) > 0 && !draft.riskCrypto) ||
    (Number(draft.optionBuy) > 0 && !draft.riskOption) ||
    (Number(draft.gambleAmount) > 0 && !draft.riskGamble);
  const submitBlocked = blockedByRiskAck || !canSubmitDecision || !props.budget;

  const updateDraft = <K extends keyof DecisionDraft>(key: K, value: DecisionDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit() {
    if (!canSubmitDecision) {
      return;
    }

    const consume = [];
    const invest = [];
    let gamble = null;
    let option = null;

    if (draft.travel) consume.push({ id: "C1", amount: 2000 });
    if (draft.course) consume.push({ id: "C3", amount: 3000 });
    if (draft.healthCover) consume.push({ id: "I1", amount: 500 });
    if (draft.accidentCover) consume.push({ id: "P1", amount: 200 });
    if (draft.cyberCover) consume.push({ id: "P2", amount: 150 });
    if (draft.toolMaintenance) consume.push({ id: "T1", amount: 400 });
    if (draft.reserveTopUp) consume.push({ id: "R1", amount: 800 });
    if (draft.safetySetup) consume.push({ id: "S1", amount: 300 });
    if (showTax && draft.taxReserve) consume.push({ id: "X1", amount: 400 });
    if (showRetirement && draft.retirementPlan) consume.push({ id: "Q1", amount: 700 });
    if (showLegacy && draft.legacyReserve) consume.push({ id: "L1", amount: 500 });
    if (draft.buyVehicle) consume.push({ id: "C5", amount: 24000 });
    if (showRealEstate && draft.buyHouse) consume.push({ id: "H1", amount: 60000 });
    if (draft.engagementPrep) consume.push({ id: "M1", amount: 6000 });
    if (draft.weddingPlan) consume.push({ id: "W1", amount: 18000 });

    if (Number(draft.bondBuy) > 0) invest.push({ asset: "A4", action: "buy" as const, amount: Number(draft.bondBuy) });
    if (Number(draft.fundBuy) > 0) invest.push({ asset: "A5", action: "buy" as const, amount: Number(draft.fundBuy) });
    if (Number(draft.stockBuy) > 0) invest.push({ asset: "A6", action: "buy" as const, amount: Number(draft.stockBuy) });
    if (Number(draft.cryptoBuy) > 0) invest.push({ asset: "A7", action: "buy" as const, amount: Number(draft.cryptoBuy) });

    if (Number(draft.optionBuy) > 0) {
      invest.push({ asset: "A8", action: "buy" as const, amount: Number(draft.optionBuy) });
      option = { direction: draft.optionDir, amount: Number(draft.optionBuy) };
    }

    if (Number(draft.gambleAmount) > 0) {
      gamble = { type: draft.gambleType, amount: Number(draft.gambleAmount) };
    }

    await props.onSubmitDecision({
      idempotencyKey: draft.submissionKey,
      consume,
      loan: {
        borrow: Number(draft.borrow),
        repay: Number(draft.repay),
        allocateTo: draft.debtTarget
      },
      invest,
      option,
      gamble,
      riskAck: [
        ...(draft.riskCrypto ? ["A7"] : []),
        ...(draft.riskOption ? ["A8"] : []),
        ...(draft.riskGamble ? ["A9"] : [])
      ]
    });

    setDraft((current) => ({
      ...current,
      submissionKey: createSubmissionKey(props.currentRoundId)
    }));
  }

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">学生资金配置</p>
          <h2>先看事件，再做本轮资金分配</h2>
          <p>这里会实时预览你的可支配资金、预计借款、资金分布和固定成本变化。返回首页后，草稿也会继续保留。</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            返回首页
          </button>
        </div>
      </article>

      {preview ? (
        <article className="panel page-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">预算预览</p>
              <h3>先看本轮有多少钱可以分配</h3>
            </div>
            <span className={preview.totalBorrow > 0 ? "risk-tag" : "info-tag"}>
              {preview.totalBorrow > 0 ? `预计新增借款 ${currency(preview.totalBorrow)}` : "当前分配未触发新增借款"}
            </span>
          </div>
          <div className="metric-grid dense">
            <article className="metric-card compact">
              <span>本轮可支配金额</span>
              <strong>{currency(preview.availableCash)}</strong>
            </article>
            <article className="metric-card compact">
              <span>计划生活消费</span>
              <strong>{currency(preview.plannedConsume)}</strong>
            </article>
            <article className="metric-card compact">
              <span>计划金融资产投入</span>
              <strong>{currency(preview.plannedInvest)}</strong>
            </article>
            <article className="metric-card compact">
              <span>计划高风险资金</span>
              <strong>{currency(preview.plannedRisk)}</strong>
            </article>
            <article className="metric-card compact">
              <span>预计提交后现金</span>
              <strong>{currency(preview.projectedCash)}</strong>
            </article>
            <article className="metric-card compact">
              <span>预计净资产</span>
              <strong>{currency(preview.projectedNetWorth)}</strong>
            </article>
            <article className="metric-card compact">
              <span>预计应急金月数</span>
              <strong>{preview.projectedEmergencyMonths.toFixed(1)} 月</strong>
            </article>
            <article className="metric-card compact">
              <span>预计生活品质分</span>
              <strong>{preview.projectedLifeScore.toFixed(1)}</strong>
            </article>
          </div>
          {preview.autoBridgeBorrow > 0 ? (
            <p className="form-error">当前分配已经超过本轮可支配金额，系统预计会自动垫付借款 {currency(preview.autoBridgeBorrow)}。</p>
          ) : null}
          <div className="three-col-grid">
            {preview.categoryDistribution.map((item) => (
              <div key={item.key} className="compact-panel">
                <strong>{item.label}</strong>
                <p>{currency(item.value)}</p>
                <p>占可支配资金 {item.share.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      <article className="panel page-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">生活消费</p>
            <h3>消费不仅花钱，也会影响生活品质分</h3>
          </div>
        </div>
        <div className="student-list">
          {consumeRows
            .filter((item) => {
              if (item.key === "taxReserve") return showTax;
              if (item.key === "retirementPlan") return showRetirement;
              if (item.key === "legacyReserve") return showLegacy;
              return true;
            })
            .map((item) => (
              <label key={item.key} className="compact-panel">
                <span className="student-row">
                  <strong>{item.label}</strong>
                  <span>
                    {currency(item.amount)} / {preview ? shareText(item.amount, preview.availableCash) : "0.0%"} / {item.score}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(draft[item.key])}
                  onChange={(event) => updateDraft(item.key, event.target.checked as never)}
                />
                <p>{item.hint}</p>
              </label>
            ))}
          <label className="compact-panel">
            <span className="student-row">
              <strong>购车首付</strong>
              <span>
                {currency(24000)} / {preview ? shareText(24000, preview.availableCash) : "0.0%"}
              </span>
            </span>
            <input type="checkbox" checked={draft.buyVehicle} onChange={(event) => updateDraft("buyVehicle", event.target.checked)} />
            <p>车辆购置后，首页会同步预览车辆估值与每轮固定成本。</p>
          </label>
          {showRealEstate ? (
            <label className="compact-panel">
              <span className="student-row">
                <strong>购房首付</strong>
                <span>
                  {currency(60000)} / {preview ? shareText(60000, preview.availableCash) : "0.0%"}
                </span>
              </span>
              <input type="checkbox" checked={draft.buyHouse} onChange={(event) => updateDraft("buyHouse", event.target.checked)} />
              <p>房产会进入长期固定成本模块，同时预览房产估值。</p>
            </label>
          ) : null}
        </div>
      </article>

      <article className="panel page-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">金融资产</p>
            <h3>按金额配置，同时看占可支配资金的比例</h3>
          </div>
        </div>
        <div className="three-col-grid">
          {investRows.map((item) => (
            <label key={item.key} className="compact-panel">
              <strong>
                {item.label} {item.asset}
              </strong>
              <input
                type="number"
                min="0"
                value={draft[item.key]}
                onChange={(event) => updateDraft(item.key, event.target.value as never)}
              />
              <p>{item.placeholder}</p>
              <p>占可支配资金 {preview ? shareText(Number(draft[item.key]), preview.availableCash) : "0.0%"}</p>
            </label>
          ))}
        </div>
      </article>

      <article className="panel page-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">借款与高风险</p>
            <h3>超额配置会触发借款，借款会被重点高亮</h3>
          </div>
        </div>
        <div className="three-col-grid">
          <label className="compact-panel">
            <strong>主动借款</strong>
            <input type="number" min="0" value={draft.borrow} onChange={(event) => updateDraft("borrow", event.target.value)} />
            <p>你主动输入的新增借款金额。</p>
          </label>
          <label className="compact-panel">
            <strong>还款金额</strong>
            <input type="number" min="0" value={draft.repay} onChange={(event) => updateDraft("repay", event.target.value)} />
            <p>本轮想主动偿还的金额。</p>
          </label>
          <label className="compact-panel">
            <strong>借款目标</strong>
            <select value={draft.debtTarget} onChange={(event) => updateDraft("debtTarget", event.target.value)}>
              <option value="D-consumer">消费贷</option>
              <option value="D-device">设备分期</option>
              <option value="D-medical">医疗垫付贷</option>
              <option value="D-social">家庭人情垫付贷</option>
              <option value="D-bridge">应急过桥贷</option>
              <option value="AUTO">自动还款顺序</option>
            </select>
            <p>决定新增借款优先进入哪个债务池。</p>
          </label>
          <label className="compact-panel">
            <strong>高风险资金</strong>
            <input
              type="number"
              min="0"
              value={draft.gambleAmount}
              onChange={(event) => updateDraft("gambleAmount", event.target.value)}
            />
            <p>占可支配资金 {preview ? shareText(Number(draft.gambleAmount), preview.availableCash) : "0.0%"}</p>
          </label>
          <label className="compact-panel">
            <strong>高风险类型</strong>
            <select value={draft.gambleType} onChange={(event) => updateDraft("gambleType", event.target.value)}>
              <option value="LOTTERY">彩票</option>
              <option value="SPORTS">体育竞猜</option>
              <option value="CASINO">赌博</option>
              <option value="SCAM">诈骗项目</option>
            </select>
            <p>这部分会单独列在高风险资金中。</p>
          </label>
          <label className="compact-panel">
            <strong>期权方向</strong>
            <select value={draft.optionDir} onChange={(event) => updateDraft("optionDir", event.target.value as "CALL" | "PUT")}>
              <option value="CALL">看涨 CALL</option>
              <option value="PUT">看跌 PUT</option>
            </select>
            <p>仅在配置了期权时生效。</p>
          </label>
        </div>
        <div className="tag-row">
          <label className="info-tag">
            <input type="checkbox" checked={draft.riskCrypto} onChange={(event) => updateDraft("riskCrypto", event.target.checked)} />
            我已知晓虚拟币风险
          </label>
          <label className="info-tag">
            <input type="checkbox" checked={draft.riskOption} onChange={(event) => updateDraft("riskOption", event.target.checked)} />
            我已知晓期权风险
          </label>
          <label className="info-tag">
            <input type="checkbox" checked={draft.riskGamble} onChange={(event) => updateDraft("riskGamble", event.target.checked)} />
            我已知晓高风险投机风险
          </label>
        </div>
      </article>

      {preview ? (
        <article className="panel page-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">资金分布</p>
              <h3>配置时就能直观看到钱会流向哪里</h3>
            </div>
          </div>
          <div className="table-grid">
            <div className="table-grid-head">
              <span>类别</span>
              <span>金额</span>
              <span>占预计总资产</span>
            </div>
            {preview.assetDistribution.map((item) => (
              <div key={item.key} className="table-grid-row">
                <span>{item.label}</span>
                <span>{currency(item.value)}</span>
                <span>{item.share.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {blockedByRiskAck ? <p className="form-error">你配置了高风险资产或高风险投机，但还没有勾选风险确认。</p> : null}
      {!canSubmitDecision ? <p className="form-error">当前回合未开放或已被教师锁定，暂时不能提交决策。</p> : null}

      <article className="panel page-panel">
        <button
          type="button"
          disabled={props.loading || submitBlocked}
          onClick={handleSubmit}
          title={!canSubmitDecision ? "只有在教师开放回合时，学生才能提交资金配置。" : undefined}
        >
          {props.loading ? "提交中..." : "提交本轮资金配置"}
        </button>
      </article>
    </section>
  );
}
