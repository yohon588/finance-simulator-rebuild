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
          <p className="eyebrow">学生负债</p>
          <h2>债务明细</h2>
          <p>查看当前债务本金、最低还款额和月利率。</p>
        </div>
        <div className="action-row">
          <button type="button" className="ghost-button" onClick={props.onBack}>
            返回
          </button>
        </div>
      </article>

      <article className="panel page-panel">
        <p>
          当前债务池已经区分为日常消费贷、设备分期、医疗纾困、家庭人情周转和应急过桥债。
        </p>
        {debts.length === 0 ? (
          <p>当前没有活动中的债务。</p>
        ) : (
          <div className="student-list">
            {debts.map((debt) => (
              <div key={debt.id} className="student-row">
                <strong>{debt.creditor}</strong>
                <span>
                  {debt.type ?? "债务"} | 本金 {debt.principal} | 最低还款 {debt.minPay} | 月利率{" "}
                  {debt.rateMonthly} | 逾期轮数 {debt.missedRounds ?? 0} | 状态 {debt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
