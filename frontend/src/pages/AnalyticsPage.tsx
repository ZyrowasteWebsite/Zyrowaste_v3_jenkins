import { getStoredToken } from "../utils/authApi";

const projections = [
  { year: 1, sales: 95.76, ebitda: 10.5, net: 4.74 },
  { year: 2, sales: 111.5, ebitda: 12.2, net: 6.65 },
  { year: 3, sales: 127.98, ebitda: 14.2, net: 8.93 },
  { year: 4, sales: 143.2, ebitda: 16.35, net: 11.12 },
  { year: 5, sales: 158.63, ebitda: 18.5, net: 13.31 },
];

const roiTrend = [20, 25, 32, 38, 45];

const capex = [
  { label: "Extrusion lines", value: 85, color: "bg-swaroop-700" },
  { label: "Blown film", value: 45, color: "bg-swaroop-600" },
  { label: "Facility", value: 30, color: "bg-swaroop-500" },
  { label: "Working capital", value: 40, color: "bg-swaroop-400" },
];

const sensitivity = [
  { case: "Base", npv: "₹12.4 Cr", irr: "22.5%" },
  { case: "Pessimistic", npv: "₹7.1 Cr", irr: "16.8%" },
  { case: "Optimistic", npv: "₹18.6 Cr", irr: "28.3%" },
];

const risks = [
  { name: "PLA resin price spike", likelihood: "Med", impact: "High" },
  { name: "Regulatory tightening (SUP)", likelihood: "High", impact: "Med" },
  { name: "Competitor capacity adds", likelihood: "Med", impact: "Med" },
  { name: "Working capital stretch", likelihood: "Low", impact: "High" },
];

function RiskCell({ items }: { items: typeof risks }) {
  return (
    <div className="rounded-xl border border-swaroop-100 bg-swaroop-50/70 p-3 min-h-[104px]">
      <ul className="space-y-1 text-xs text-gray-800">
        {items.map((r) => (
          <li key={r.name} className="leading-snug">
            • {r.name}
          </li>
        ))}
        {items.length === 0 ? <li className="text-gray-400">—</li> : null}
      </ul>
    </div>
  );
}

function maxMetric(key: "sales" | "ebitda" | "net") {
  return Math.max(...projections.map((p) => p[key]));
}

export default function AnalyticsPage() {
  const token = getStoredToken();

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-2xl border border-green-100 shadow-md max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Analytics dashboards are available to registered users only. Please sign in to view
            financial projections, ROI trends, and investment data.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#/signin"
              className="inline-block px-6 py-3 bg-green-700 text-white font-semibold rounded-xl hover:bg-green-800 transition-colors"
            >
              Sign In
            </a>
            <a
              href="#/signup"
              className="inline-block px-6 py-3 border-2 border-green-700 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors"
            >
              Create Account
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-5">
            Already have an account? <a href="#/signin" className="text-green-600 hover:underline">Sign in here</a>
          </p>
        </div>
      </div>
    );
  }

  const chartH = 180;
  const barW = 36;
  const gap = 14;
  const m = { top: 16, right: 12, bottom: 36, left: 44 };
  const innerW = projections.length * (barW + gap) + gap;
  const innerH = chartH - m.top - m.bottom;
  const maxBar = Math.max(
    maxMetric("sales"),
    maxMetric("ebitda"),
    maxMetric("net"),
  );

  const capexTotal = capex.reduce((s, c) => s + c.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-swaroop-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-swaroop-700 uppercase tracking-wide">
            Level 4 · Adaptive dashboards
          </p>
          <h1 className="text-3xl font-bold text-swaroop-900">Analytics &amp; projections</h1>
          <p className="text-gray-600 max-w-3xl">
            Hardcoded snapshot aligned with the Zyrowaste / Swaroop project report: five-year operating
            performance, CAPEX split, sensitivity, ROI progression, and a qualitative risk matrix.
          </p>
        </header>

        <section className="bg-white rounded-2xl border border-swaroop-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-swaroop-900 mb-1">
            Financial projections (INR Lakhs)
          </h2>
          <p className="text-sm text-gray-500 mb-4">Sales, EBITDA, and net profit — Years 1–5</p>
          <div className="overflow-x-auto">
            <svg
              width={m.left + innerW + m.right}
              height={chartH}
              role="img"
              aria-label="Grouped bar chart of sales EBITDA and net profit by year"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = m.top + innerH * (1 - t);
                const label = Math.round(maxBar * t);
                return (
                  <g key={t}>
                    <line
                      x1={m.left}
                      x2={m.left + innerW}
                      y1={y}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                    <text x={8} y={y + 4} fontSize={11} fill="#6b7280">
                      {label}
                    </text>
                  </g>
                );
              })}
              {projections.map((p, i) => {
                const x0 = m.left + gap + i * (barW + gap);
                const salesH = (p.sales / maxBar) * innerH;
                const ebitdaH = (p.ebitda / maxBar) * innerH;
                const netH = (p.net / maxBar) * innerH;
                const baseY = m.top + innerH;
                const w = 10;
                return (
                  <g key={p.year}>
                    <rect
                      x={x0}
                      y={baseY - salesH}
                      width={w}
                      height={salesH}
                      rx={3}
                      className="fill-swaroop-800"
                    />
                    <rect
                      x={x0 + 12}
                      y={baseY - ebitdaH}
                      width={w}
                      height={ebitdaH}
                      rx={3}
                      className="fill-swaroop-500"
                    />
                    <rect
                      x={x0 + 24}
                      y={baseY - netH}
                      width={w}
                      height={netH}
                      rx={3}
                      className="fill-swaroop-300"
                    />
                    <text
                      x={x0 + barW / 2}
                      y={baseY + 22}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#374151"
                    >
                      Y{p.year}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm bg-swaroop-800" /> Sales
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm bg-swaroop-500" /> EBITDA
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm bg-swaroop-300" /> Net profit
            </span>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-swaroop-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-swaroop-900 mb-1">ROI trend</h2>
            <p className="text-sm text-gray-500 mb-4">Estimated ROI: 20% → 45% (Y1–Y5)</p>
            <div className="flex items-end gap-3 h-40">
              {roiTrend.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-swaroop-700 to-swaroop-400"
                    style={{ height: `${(v / 50) * 100}%` }}
                    title={`Year ${i + 1}: ${v}%`}
                  />
                  <span className="text-xs font-medium text-swaroop-800">{v}%</span>
                  <span className="text-[11px] text-gray-500">Y{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-swaroop-100 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-swaroop-900 mb-1">CAPEX breakdown</h2>
            <p className="text-sm text-gray-500 mb-4">Total ₹200L — extrusion, film, facility, WC</p>
            <div className="space-y-3">
              {capex.map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span>{c.label}</span>
                    <span className="font-semibold text-swaroop-800">₹{c.value}L</span>
                  </div>
                  <div className="h-3 rounded-full bg-swaroop-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.color}`}
                      style={{ width: `${(c.value / capexTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-swaroop-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-swaroop-900 mb-4">Sensitivity (NPV &amp; IRR)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-swaroop-100">
                  <th className="py-2 pr-4">Scenario</th>
                  <th className="py-2 pr-4">NPV</th>
                  <th className="py-2">IRR</th>
                </tr>
              </thead>
              <tbody>
                {sensitivity.map((row) => (
                  <tr key={row.case} className="border-b border-swaroop-50">
                    <td className="py-3 pr-4 font-medium text-swaroop-900">{row.case}</td>
                    <td className="py-3 pr-4 text-gray-800">{row.npv}</td>
                    <td className="py-3 text-gray-800">{row.irr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-swaroop-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-swaroop-900 mb-1">Risk matrix</h2>
          <p className="text-sm text-gray-500 mb-4">Likelihood (rows) vs impact (columns)</p>
          <div className="max-w-3xl">
            <div className="grid grid-cols-[96px_1fr_1fr] gap-2 text-xs font-semibold text-gray-500 mb-2">
              <div />
              <div className="text-center">Lower impact</div>
              <div className="text-center">Higher impact</div>
            </div>
            <div className="grid grid-cols-[96px_1fr_1fr] gap-2">
              <div className="flex items-center text-xs font-semibold text-gray-500">High likelihood</div>
              <RiskCell
                items={risks.filter((r) => r.likelihood === "High" && r.impact !== "High")}
              />
              <RiskCell
                items={risks.filter((r) => r.likelihood === "High" && r.impact === "High")}
              />
              <div className="flex items-center text-xs font-semibold text-gray-500">Med / low likelihood</div>
              <RiskCell
                items={risks.filter((r) => r.likelihood !== "High" && r.impact !== "High")}
              />
              <RiskCell
                items={risks.filter((r) => r.likelihood !== "High" && r.impact === "High")}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
