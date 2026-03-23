import { useEffect, useState } from "react";

import type { SubmitDecisionInput } from "../api/client";

type StudentDecisionPageProps = {
  loading: boolean;
  currentRoundId: string;
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
      if (!raw) {
        return;
      }
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
  }, [storageKey]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }
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
    const consume = [];
    const invest = [];
    let gamble = null;
    let option = null;

    if (travel) {
      consume.push({ id: "C1", amount: 2000 });
    }

    if (course) {
      consume.push({ id: "C3", amount: 3000 });
    }

    if (healthCover) {
      consume.push({ id: "I1", amount: 500 });
    }

    if (accidentCover) {
      consume.push({ id: "P1", amount: 200 });
    }

    if (cyberCover) {
      consume.push({ id: "P2", amount: 150 });
    }

    if (toolMaintenance) {
      consume.push({ id: "T1", amount: 400 });
    }

    if (reserveTopUp) {
      consume.push({ id: "R1", amount: 800 });
    }

    if (safetySetup) {
      consume.push({ id: "S1", amount: 300 });
    }

    if (showTax && taxReserve) {
      consume.push({ id: "X1", amount: 400 });
    }

    if (showRetirement && retirementPlan) {
      consume.push({ id: "Q1", amount: 700 });
    }

    if (showLegacy && legacyReserve) {
      consume.push({ id: "L1", amount: 500 });
    }

    if (buyVehicle) {
      consume.push({ id: "C5", amount: 24000 });
    }

    if (showRealEstate && buyHouse) {
      consume.push({ id: "H1", amount: 60000 });
    }

    if (engagementPrep) {
      consume.push({ id: "M1", amount: 6000 });
    }

    if (weddingPlan) {
      consume.push({ id: "W1", amount: 18000 });
    }

    if (Number(bondBuy) > 0) {
      invest.push({ asset: "A4", action: "buy" as const, amount: Number(bondBuy) });
    }

    if (Number(fundBuy) > 0) {
      invest.push({ asset: "A5", action: "buy" as const, amount: Number(fundBuy) });
    }

    if (Number(stockBuy) > 0) {
      invest.push({ asset: "A6", action: "buy" as const, amount: Number(stockBuy) });
    }

    if (Number(cryptoBuy) > 0) {
      invest.push({ asset: "A7", action: "buy" as const, amount: Number(cryptoBuy) });
    }

    if (Number(optionBuy) > 0) {
      invest.push({ asset: "A8", action: "buy" as const, amount: Number(optionBuy) });
      option = {
        direction: optionDir,
        amount: Number(optionBuy)
      };
    }

    if (Number(gambleAmount) > 0) {
      gamble = {
        type: gambleType,
        amount: Number(gambleAmount)
      };
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

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Student Decision</p>
          <h2>Round Decision Pack</h2>
          <p>Minimal form for the first interactive classroom loop.</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            Back
          </button>
        </div>
      </article>

      <article className="panel auth-panel">
        <p>
          Preparation options: learning boosts future opportunities, health and accident cover soften medical shocks,
          cyber protection reduces fraud losses, tool maintenance softens equipment shocks, reserve top-up softens cash
          shocks, safety setup reduces fraud and security losses, tax reserve reduces admin friction on income gains,
          retirement planning reinforces long-term discipline, family support reserve softens care and obligation shocks,
          buying a vehicle increases future fixed cash outflows,
          buying a home locks in longer-term housing cashflow, and family lifecycle choices can create future recurring
          support costs.
        </p>

        <label className="checkbox-row">
          <input type="checkbox" checked={travel} onChange={(event) => setTravel(event.target.checked)} />
          Add travel expense (C1 / 2000)
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={course} onChange={(event) => setCourse(event.target.checked)} />
          Add learning course (C3 / 3000)
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={healthCover} onChange={(event) => setHealthCover(event.target.checked)} />
          Add health cover (I1 / 500)
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={accidentCover} onChange={(event) => setAccidentCover(event.target.checked)} />
          Add accident cover (P1 / 200)
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={cyberCover} onChange={(event) => setCyberCover(event.target.checked)} />
          Add cyber protection (P2 / 150)
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={toolMaintenance}
            onChange={(event) => setToolMaintenance(event.target.checked)}
          />
          Add tool maintenance (T1 / 400)
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={reserveTopUp}
            onChange={(event) => setReserveTopUp(event.target.checked)}
          />
          Add reserve top-up (R1 / 800)
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={safetySetup}
            onChange={(event) => setSafetySetup(event.target.checked)}
          />
          Add safety setup (S1 / 300)
        </label>

        {showTax ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={taxReserve} onChange={(event) => setTaxReserve(event.target.checked)} />
            Add tax reserve (X1 / 400)
          </label>
        ) : null}

        {showRetirement ? (
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={retirementPlan}
              onChange={(event) => setRetirementPlan(event.target.checked)}
            />
            Add retirement contribution plan (Q1 / 700)
          </label>
        ) : null}

        {showLegacy ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={legacyReserve} onChange={(event) => setLegacyReserve(event.target.checked)} />
            Add family support reserve (L1 / 500)
          </label>
        ) : null}

        <label className="checkbox-row">
          <input type="checkbox" checked={buyVehicle} onChange={(event) => setBuyVehicle(event.target.checked)} />
          Buy vehicle (C5 / down payment 24000, then 2800 carrying cost each round)
        </label>

        {showRealEstate ? (
          <label className="checkbox-row">
            <input type="checkbox" checked={buyHouse} onChange={(event) => setBuyHouse(event.target.checked)} />
            Buy house (H1 / down payment 60000, then 2200 carrying cost each round)
          </label>
        ) : null}

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={engagementPrep}
            onChange={(event) => setEngagementPrep(event.target.checked)}
          />
          Engagement prep (M1 / 6000 one-time, moves family stage to engaged)
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={weddingPlan} onChange={(event) => setWeddingPlan(event.target.checked)} />
          Wedding plan (W1 / 18000 one-time, then 900 family support each round)
        </label>

        <label>
          Borrow amount
          <input type="number" min="0" value={borrow} onChange={(event) => setBorrow(event.target.value)} />
        </label>

        <label>
          Borrow target
          <select value={debtTarget} onChange={(event) => setDebtTarget(event.target.value)}>
            <option value="D-consumer">Consumer Credit</option>
            <option value="D-device">Device Installment</option>
            <option value="D-medical">Medical Relief</option>
            <option value="D-social">Family Social Advance</option>
            <option value="D-bridge">Emergency Bridge</option>
            <option value="AUTO">Auto Repay Order</option>
          </select>
        </label>

        <label>
          Repay amount
          <input type="number" min="0" value={repay} onChange={(event) => setRepay(event.target.value)} />
        </label>

        <label>
          Buy bond fund (A4)
          <input type="number" min="0" value={bondBuy} onChange={(event) => setBondBuy(event.target.value)} />
        </label>

        <label>
          Buy stock fund (A5)
          <input type="number" min="0" value={fundBuy} onChange={(event) => setFundBuy(event.target.value)} />
        </label>

        <label>
          Buy stock (A6)
          <input type="number" min="0" value={stockBuy} onChange={(event) => setStockBuy(event.target.value)} />
        </label>

        <label>
          Buy crypto (A7)
          <input type="number" min="0" value={cryptoBuy} onChange={(event) => setCryptoBuy(event.target.value)} />
        </label>

        <label>
          Buy option (A8)
          <input type="number" min="0" value={optionBuy} onChange={(event) => setOptionBuy(event.target.value)} />
        </label>

        <label>
          Option direction
          <select value={optionDir} onChange={(event) => setOptionDir(event.target.value as "CALL" | "PUT")}>
            <option value="CALL">CALL</option>
            <option value="PUT">PUT</option>
          </select>
        </label>

        <label>
          Gamble type
          <select value={gambleType} onChange={(event) => setGambleType(event.target.value)}>
            <option value="LOTTERY">Lottery</option>
            <option value="SPORTS">Sports</option>
            <option value="CASINO">Casino</option>
            <option value="SCAM">Scam</option>
          </select>
        </label>

        <label>
          Gamble amount
          <input
            type="number"
            min="0"
            value={gambleAmount}
            onChange={(event) => setGambleAmount(event.target.value)}
          />
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={riskCrypto} onChange={(event) => setRiskCrypto(event.target.checked)} />
          Confirm high-risk exposure for crypto
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={riskOption} onChange={(event) => setRiskOption(event.target.checked)} />
          Confirm high-risk exposure for options
        </label>

        <label className="checkbox-row">
          <input type="checkbox" checked={riskGamble} onChange={(event) => setRiskGamble(event.target.checked)} />
          Confirm gambling and fraud risk
        </label>

        {((Number(cryptoBuy) > 0 && !riskCrypto) ||
          (Number(optionBuy) > 0 && !riskOption) ||
          (Number(gambleAmount) > 0 && !riskGamble)) ? (
          <p className="form-error">High-risk assets and gambling require their confirmation checkbox.</p>
        ) : null}

        <button
          type="button"
          disabled={
            props.loading ||
            (Number(cryptoBuy) > 0 && !riskCrypto) ||
            (Number(optionBuy) > 0 && !riskOption) ||
            (Number(gambleAmount) > 0 && !riskGamble)
          }
          onClick={handleSubmit}
        >
          {props.loading ? "Submitting..." : "Submit Decision"}
        </button>
      </article>
    </section>
  );
}
