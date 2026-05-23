const PLANS = [
  { name: 'Starter', range: '$100 – $1,000', roi: '7% – 15%', fee: '20%', color: '#8899AF' },
  { name: 'Growth', range: '$1,100 – $10,000', roi: '7% – 15%', fee: '15%', color: '#C9A84C', popular: true },
  { name: 'Premium', range: '$10,100 – $50,000', roi: '7% – 15%', fee: '10%', color: '#E0BA5C' },
  { name: 'Elite', range: '$50,100+', roi: '7% – 15%', fee: '5%', color: '#F2CC6E' },
];

export default function Investments({ transactions }) {
  const { investments = [] } = transactions;

  const formatDate = (ts) => new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div>
      <h1 className="dash-page-title">Investment Plans</h1>
      <p className="dash-page-sub">View available plans and your investment history</p>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="card"
            style={{
              borderColor: plan.popular ? 'var(--gold-500)' : undefined,
              boxShadow: plan.popular ? '0 0 20px rgba(201,168,76,0.12)' : undefined,
              position: 'relative',
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--gold-gradient)', color: '#060D18',
                fontSize: '0.68rem', fontWeight: 700, padding: '3px 12px',
                borderRadius: '50px', whiteSpace: 'nowrap',
              }}>Most Popular</div>
            )}
            <div style={{ fontWeight: 700, fontSize: '1rem', color: plan.color, marginBottom: '6px' }}>{plan.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)', marginBottom: '14px' }}>{plan.range}</div>
            <div style={{
              fontSize: '1.6rem', fontFamily: "'Playfair Display', serif", fontWeight: 700,
              background: 'var(--gold-gradient)', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              lineHeight: 1, marginBottom: '4px',
            }}>{plan.roi}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: '14px' }}>Bi-Weekly ROI</div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              Profit fee: <strong style={{ color: 'var(--text-secondary)' }}>{plan.fee}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="card">
        <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '20px', fontSize: '1.1rem' }}>
          Investment History
        </h3>
        {investments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-faint)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</div>
            <p>No investments yet. Contact support to activate an investment plan.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>ROI Range</th>
                  <th>Profit Fee</th>
                  <th>Status</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.plan_name}</td>
                    <td>${parseFloat(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>{inv.roi_min}% – {inv.roi_max}%</td>
                    <td>{inv.profit_fee}%</td>
                    <td>
                      <span className={`badge ${inv.status === 'active' ? 'badge-verified' : 'badge-unverified'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-faint)', fontSize: '0.83rem' }}>{formatDate(inv.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
