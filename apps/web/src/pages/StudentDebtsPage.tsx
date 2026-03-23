type StudentDebtsPageProps = {
  onBack: () => void;
  payload: {
    debts?: Array<{
      id: string;
      type?: string;
      creditor: string;
      principal: number;
      minPay: number;
      rateMonthly: number;
      missedRounds?: number;
      status: string;
    }>;
  };
};

export function StudentDebtsPage(props: StudentDebtsPageProps) {
  const debts = props.payload.debts ?? [];

  return (
    <section className="page-stack">
      <article className="panel dashboard-hero">
        <div>
          <p className="eyebrow">Student Debts</p>
          <h2>Debt Detail</h2>
          <p>Current debt principal, min pay, and monthly rate.</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            Back
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <p>
          Debt pools now separate everyday credit, device financing, medical relief, family or social advances, and
          emergency bridge borrowing.
        </p>
        {debts.length === 0 ? (
          <p>No active debts.</p>
        ) : (
          <div className="student-list">
            {debts.map((debt) => (
              <div key={debt.id} className="student-row">
                <strong>{debt.creditor}</strong>
                <span>
                  {debt.type ?? "DEBT"} | principal {debt.principal} | min pay {debt.minPay} | rate{" "}
                  {debt.rateMonthly} | missed {debt.missedRounds ?? 0} | {debt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
