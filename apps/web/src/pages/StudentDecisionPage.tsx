import { useEffect, useState } from "react";

import type { SubmitDecisionInput } from "../api/client";

type StudentDecisionPageProps = {
  loading: boolean;
  currentRoundId: string;
  roundStatus: string;
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

export function StudentDecisionPage(props: StudentDecisionPageProps) {
  const moduleOpt = props.moduleConfig?.opt;
  const canSubmitDecision = props.roundStatus === "open";
  const showTax = moduleOpt?.tax !== false;
  const showRetirement = moduleOpt?.retirement !== false;
  const showLegacy = moduleOpt?.legacy !== false;
  const showRealEstate = moduleOpt?.realestate !== false;
  const storageKey = `finance-rebuild-decision-${props.currentRoundId}`;
  const [draftReady, setDraftReady] = useState(false);
  const [submissionKey, setSubmissionKey] = useState(`${props.currentRoundId}-draft`);
  const [travel, setTravel] = useState(false);
  const [course, setCourse] = useState(false);
  const [healthCover, setHealthCover] = useState(false);
  const [accidentCover, setAccidentCover] = useState(false);
  const [cyberCover, setCyberCover] = useState(false);
  const [toolMaintenance, setToolMaintenance] = useState(false);
  const [reserveTopUp, setReserveTopUp] = useState(false);
  const [safetySetup, setSafetySetup] = useState(false);
  const [taxReserve, setTaxReserve] = useState(false);
  const [retirementPlan, setRetirementPlan] = useState(false);
  const [legacyReserve, setLegacyReserve] = useState(false);
  const [buyVehicle, setBuyVehicle] = useState(false);
  const [buyHouse, setBuyHouse] = useState(false);
  const [engagementPrep, setEngagementPrep] = useState(false);
  const [weddingPlan, setWeddingPlan] = useState(false);
  const [borrow, setBorrow] = useState("0");
  const [repay, setRepay] = useState("0");
  const [debtTarget, setDebtTarget] = useState("D-consumer");
  const [bondBuy, setBondBuy] = useState("0");
  const [fundBuy, setFundBuy] = useState("0");
  const [stockBuy, setStockBuy] = useState("0");
  const [cryptoBuy, setCryptoBuy] = useState("0");
  const [optionBuy, setOptionBuy] = useState("0");
  const [optionDir, setOptionDir] = useState<"CALL" | "PUT">("CALL");
  const [gambleType, setGambleType] = useState("LOTTERY");
  const [gambleAmount, setGambleAmount] = useState("0");
  const [riskCrypto, setRiskCrypto] = useState(false);
  const [riskOption, setRiskOption] = useState(false);
  const [riskGamble, setRiskGamble] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(storageKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as Record<string, unknown>;
      setSubmissionKey(String(draft.submissionKey ?? `${props.currentRoundId}-draft`));
      setTravel(Boolean(draft.travel));
      setCourse(Boolean(draft.course));
      setHealthCover(Boolean(draft.healthCover));
      setAccidentCover(Boolean(draft.accidentCover));
      setCyberCover(Boolean(draft.cyberCover));
      setToolMaintenance(Boolean(draft.toolMaintenance));
      setReserveTopUp(Boolean(draft.reserveTopUp));
      setSafetySetup(Boolean(draft.safetySetup));
      setTaxReserve(Boolean(draft.taxReserve));
      setRetirementPlan(Boolean(draft.retirementPlan));
      setLegacyReserve(Boolean(draft.legacyReserve));
      setBuyVehicle(Boolean(draft.buyVehicle));
      setBuyHouse(Boolean(draft.buyHouse));
      setEngagementPrep(Boolean(draft.engagementPrep));
      setWeddingPlan(Boolean(draft.weddingPlan));
      setBorrow(String(draft.borrow ?? "0"));
      setRepay(String(draft.repay ?? "0"));
      setDebtTarget(String(draft.debtTarget ?? "D-consumer"));
      setBondBuy(String(draft.bondBuy ?? "0"));
      setFundBuy(String(draft.fundBuy ?? "0"));
      setStockBuy(String(draft.stockBuy ?? "0"));
      setCryptoBuy(String(draft.cryptoBuy ?? "0"));
      setOptionBuy(String(draft.optionBuy ?? "0"));
      setOptionDir((draft.optionDir as "CALL" | "PUT") ?? "CALL");
      setGambleType(String(draft.gambleType ?? "LOTTERY"));
      setGambleAmount(String(draft.gambleAmount ?? "0"));
      setRiskCrypto(Boolean(draft.riskCrypto));
      setRiskOption(Boolean(draft.riskOption));
      setRiskGamble(Boolean(draft.riskGamble));
    } catch {
      window.sessionStorage.removeItem(storageKey);
    }
    setDraftReady(true);
  }, [storageKey, props.currentRoundId]);

  useEffect(() => {
    if (!draftReady) return;
    window.sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        travel,
        submissionKey,
        course,
        healthCover,
        accidentCover,
        cyberCover,
        toolMaintenance,
        reserveTopUp,
        safetySetup,
        taxReserve,
        retirementPlan,
        legacyReserve,
        buyVehicle,
        buyHouse,
        engagementPrep,
        weddingPlan,
        borrow,
        repay,
        debtTarget,
        bondBuy,
        fundBuy,
        stockBuy,
        cryptoBuy,
        optionBuy,
        optionDir,
        gambleType,
        gambleAmount,
        riskCrypto,
        riskOption,
        riskGamble
      })
    );
  }, [
    draftReady,
    storageKey,
    travel,
    submissionKey,
    course,
    healthCover,
    accidentCover,
    cyberCover,
    toolMaintenance,
    reserveTopUp,
    safetySetup,
    taxReserve,
    retirementPlan,
    legacyReserve,
    buyVehicle,
    buyHouse,
    engagementPrep,
    weddingPlan,
    borrow,
    repay,
    debtTarget,
    bondBuy,
    fundBuy,
    stockBuy,
    cryptoBuy,
    optionBuy,
    optionDir,
    gambleType,
    gambleAmount,
    riskCrypto,
    riskOption,
    riskGamble
  ]);

  async function handleSubmit() {
    if (!canSubmitDecision) {
      return;
    }

    const consume = [];
    const invest = [];
    let gamble = null;
    let option = null;

    if (travel) consume.push({ id: "C1", amount: 2000 });
    if (course) consume.push({ id: "C3", amount: 3000 });
    if (healthCover) consume.push({ id: "I1", amount: 500 });
    if (accidentCover) consume.push({ id: "P1", amount: 200 });
    if (cyberCover) consume.push({ id: "P2", amount: 150 });
    if (toolMaintenance) consume.push({ id: "T1", amount: 400 });
    if (reserveTopUp) consume.push({ id: "R1", amount: 800 });
    if (safetySetup) consume.push({ id: "S1", amount: 300 });
    if (showTax && taxReserve) consume.push({ id: "X1", amount: 400 });
    if (showRetirement && retirementPlan) consume.push({ id: "Q1", amount: 700 });
    if (showLegacy && legacyReserve) consume.push({ id: "L1", amount: 500 });
    if (buyVehicle) consume.push({ id: "C5", amount: 24000 });
    if (showRealEstate && buyHouse) consume.push({ id: "H1", amount: 60000 });
    if (engagementPrep) consume.push({ id: "M1", amount: 6000 });
    if (weddingPlan) consume.push({ id: "W1", amount: 18000 });

    if (Number(bondBuy) > 0) invest.push({ asset: "A4", action: "buy" as const, amount: Number(bondBuy) });
    if (Number(fundBuy) > 0) invest.push({ asset: "A5", action: "buy" as const, amount: Number(fundBuy) });
    if (Number(stockBuy) > 0) invest.push({ asset: "A6", action: "buy" as const, amount: Number(stockBuy) });
    if (Number(cryptoBuy) > 0) invest.push({ asset: "A7", action: "buy" as const, amount: Number(cryptoBuy) });

    if (Number(optionBuy) > 0) {
      invest.push({ asset: "A8", action: "buy" as const, amount: Number(optionBuy) });
      option = { direction: optionDir, amount: Number(optionBuy) };
    }

    if (Number(gambleAmount) > 0) {
      gamble = { type: gambleType, amount: Number(gambleAmount) };
    }

    await props.onSubmitDecision({
      idempotencyKey: submissionKey,
      consume,
      loan: {
        borrow: Number(borrow),
        repay: Number(repay),
        allocateTo: debtTarget
      },
      invest,
      option,
      gamble,
      riskAck: [
        ...(riskCrypto ? ["A7"] : []),
        ...(riskOption ? ["A8"] : []),
        ...(riskGamble ? ["A9"] : [])
      ]
    });

    window.sessionStorage.removeItem(storageKey);
    setSubmissionKey(`${props.currentRoundId}-submitted`);
  }

  const blockedByRiskAck =
    (Number(cryptoBuy) > 0 && !riskCrypto) ||
    (Number(optionBuy) > 0 && !riskOption) ||
    (Number(gambleAmount) > 0 && !riskGamble);
  const submitBlocked = blockedByRiskAck || !canSubmitDecision;

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">学生决策</p>
          <h2>本回合决策包</h2>
          <p>在这里填写本回合的消费、保障、借贷、投资和高风险操作。</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            返回
          </button>
        </div>
      </article>

      <article className="panel auth-panel">
        <p>
          准备项会影响后续个人事件后果：学习会提升机会收益，健康险和意外险会减轻医疗冲击，网络安全会减少诈骗损失，
          设备维护会减轻设备故障冲击，应急储备能缓冲现金流压力，税务和退休准备会强化长期规划，家庭支持储备会缓和照护与人情支出，
          而买车、买房和婚姻决策会带来长期固定成本。
        </p>

        <label className="checkbox-row">
          <input type="checkbox" checked={travel} onChange={(event) => setTravel(event.target.checked)} />
          增加旅游消费（C1 / 2000）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={course} onChange={(event) => setCourse(event.target.checked)} />
          增加学习课程（C3 / 3000）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={healthCover} onChange={(event) => setHealthCover(event.target.checked)} />
          增加健康保障（I1 / 500）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={accidentCover} onChange={(event) => setAccidentCover(event.target.checked)} />
          增加意外保障（P1 / 200）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={cyberCover} onChange={(event) => setCyberCover(event.target.checked)} />
          增加网络安全保障（P2 / 150）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={toolMaintenance} onChange={(event) => setToolMaintenance(event.target.checked)} />
          增加工具维护（T1 / 400）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={reserveTopUp} onChange={(event) => setReserveTopUp(event.target.checked)} />
          增加应急储备（R1 / 800）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={safetySetup} onChange={(event) => setSafetySetup(event.target.checked)} />
          增加安全设置（S1 / 300）
        </label>

        {showTax ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={taxReserve} onChange={(event) => setTaxReserve(event.target.checked)} />
            增加税务预留（X1 / 400）
          </label>
        ) : null}

        {showRetirement ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={retirementPlan} onChange={(event) => setRetirementPlan(event.target.checked)} />
            增加退休计划（Q1 / 700）
          </label>
        ) : null}

        {showLegacy ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={legacyReserve} onChange={(event) => setLegacyReserve(event.target.checked)} />
            增加家庭支持储备（L1 / 500）
          </label>
        ) : null}

        <label className="checkbox-row">
          <input type="checkbox" checked={buyVehicle} onChange={(event) => setBuyVehicle(event.target.checked)} />
          买车（C5 / 首付 24000，之后每轮固定支出 2800）
        </label>

        {showRealEstate ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={buyHouse} onChange={(event) => setBuyHouse(event.target.checked)} />
            买房（H1 / 首付 60000，之后每轮固定支出 2200）
          </label>
        ) : null}

        <label className="checkbox-row">
          <input type="checkbox" checked={engagementPrep} onChange={(event) => setEngagementPrep(event.target.checked)} />
          订婚准备（M1 / 一次性 6000，并进入订婚阶段）
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={weddingPlan} onChange={(event) => setWeddingPlan(event.target.checked)} />
          婚礼计划（W1 / 一次性 18000，之后每轮家庭支出 900）
        </label>

        <label>
          借款金额
          <input type="number" min="0" value={borrow} onChange={(event) => setBorrow(event.target.value)} />
        </label>

        <label>
          借款目标
          <select value={debtTarget} onChange={(event) => setDebtTarget(event.target.value)}>
            <option value="D-consumer">消费贷</option>
            <option value="D-device">设备分期</option>
            <option value="D-medical">医疗纾困</option>
            <option value="D-social">家庭人情周转</option>
            <option value="D-bridge">应急过桥债</option>
            <option value="AUTO">自动还款顺序</option>
          </select>
        </label>

        <label>
          还款金额
          <input type="number" min="0" value={repay} onChange={(event) => setRepay(event.target.value)} />
        </label>

        <label>
          买入债券基金（A4）
          <input type="number" min="0" value={bondBuy} onChange={(event) => setBondBuy(event.target.value)} />
        </label>

        <label>
          买入股票基金（A5）
          <input type="number" min="0" value={fundBuy} onChange={(event) => setFundBuy(event.target.value)} />
        </label>

        <label>
          买入股票（A6）
          <input type="number" min="0" value={stockBuy} onChange={(event) => setStockBuy(event.target.value)} />
        </label>

        <label>
          买入虚拟币（A7）
          <input type="number" min="0" value={cryptoBuy} onChange={(event) => setCryptoBuy(event.target.value)} />
        </label>

        <label>
          买入期权（A8）
          <input type="number" min="0" value={optionBuy} onChange={(event) => setOptionBuy(event.target.value)} />
        </label>

        <label>
          期权方向
          <select value={optionDir} onChange={(event) => setOptionDir(event.target.value as "CALL" | "PUT")}>
            <option value="CALL">看涨 CALL</option>
            <option value="PUT">看跌 PUT</option>
          </select>
        </label>

        <label>
          赌博/诈骗类型
          <select value={gambleType} onChange={(event) => setGambleType(event.target.value)}>
            <option value="LOTTERY">彩票</option>
            <option value="SPORTS">体育投注</option>
            <option value="CASINO">赌场</option>
            <option value="SCAM">诈骗盘</option>
          </select>
        </label>

        <label>
          赌博/诈骗金额
          <input type="number" min="0" value={gambleAmount} onChange={(event) => setGambleAmount(event.target.value)} />
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={riskCrypto} onChange={(event) => setRiskCrypto(event.target.checked)} />
          确认虚拟币属于高风险暴露
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={riskOption} onChange={(event) => setRiskOption(event.target.checked)} />
          确认期权属于高风险暴露
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={riskGamble} onChange={(event) => setRiskGamble(event.target.checked)} />
          确认赌博和诈骗风险
        </label>

        {blockedByRiskAck ? <p className="form-error">高风险资产和赌博/诈骗操作必须先勾选风险确认。</p> : null}
        {!canSubmitDecision ? <p className="form-error">当前回合未开放或已被教师锁定，暂时不能提交决策。</p> : null}

        <button
          type="button"
          disabled={props.loading || submitBlocked}
          onClick={handleSubmit}
          title={!canSubmitDecision ? "只有在教师开放回合时，学生才能提交资产配置。" : undefined}
        >
          {props.loading ? "提交中..." : "提交决策"}
        </button>
      </article>
    </section>
  );
}
