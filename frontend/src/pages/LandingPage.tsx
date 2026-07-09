import { BrandMark } from "../components/BrandMark";
import { BRAND_NAME, BRAND_TAGLINE, LEGAL_ENTITY } from "../constants/brand";

const certifications = [
  {
    standard: "ISO 9001:2015",
    title: "Quality Management System",
    certNo: "QSR/QS/2603392923",
    issued: "23-03-2026",
    expiry: "22-03-2029",
    imageSrc: "/certificates/C_1.png",
    imageAlt: "ISO 9001:2015 certificate (Swaroop Formulation Industries)",
  },
  {
    standard: "ISO 13485:2016",
    title: "Quality Management System for Medical Devices",
    certNo: "IN01232718",
    issued: "25-03-2026",
    expiry: "24-03-2029",
    imageSrc: "/certificates/C_2.png",
    imageAlt: "ISO 13485:2016 certificate (Swaroop Formulation Industries)",
  },
];

const financials = [
  { metric: "Sales (INR Lakhs)", y1: "95.76", y3: "127.98", y5: "158.63" },
  { metric: "EBITDA", y1: "~10.5", y3: "~14.2", y5: "~18.5" },
  { metric: "Net Profit", y1: "4.74", y3: "8.93", y5: "13.31" },
  { metric: "ROI (Est.)", y1: "20%", y3: "32%", y5: "45%" },
  { metric: "DSCR", y1: "3.05", y3: "3.13", y5: "4.91" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <BrandMark size="md" />
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600 items-center">
            <a href="#about" className="hover:text-swaroop-700 transition">About</a>
            <a href="#products" className="hover:text-swaroop-700 transition">Products</a>
            <a href="#financials" className="hover:text-swaroop-700 transition">Financials</a>
            <a href="#/subsidiaries" className="hover:text-swaroop-700 transition">Subsidiaries</a>
            <a href="#/certifications" className="hover:text-swaroop-700 transition">Certifications</a>
            <a href="#/contact-email" className="hover:text-swaroop-700 transition">Email</a>
            <a href="#/signin" className="hover:text-swaroop-700 transition">Sign in</a>
            <a href="#contact" className="hover:text-swaroop-700 transition">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden bg-gradient-to-br from-swaroop-50 via-white to-emerald-50">
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-swaroop-700 bg-swaroop-100 rounded-full">
            {BRAND_NAME} · {BRAND_TAGLINE}
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            <span className="text-swaroop-700">{BRAND_NAME}</span>
            {" — "}
            Manufacturing a <span className="text-swaroop-600">Greener Future</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
            PLA-based biodegradable plastic bags for groceries, food packaging,
            agricultural mulch films, and biomedical applications — brought to you by{" "}
            {LEGAL_ENTITY}. Certified, compostable, and export-ready.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#financials"
              className="px-6 py-3 bg-swaroop-600 text-white font-semibold rounded-lg hover:bg-swaroop-700 transition shadow-lg shadow-swaroop-200"
            >
              View Investment Pitch
            </a>
            <a
              href="#contact"
              className="px-6 py-3 border-2 border-swaroop-600 text-swaroop-700 font-semibold rounded-lg hover:bg-swaroop-50 transition"
            >
              Partner With Us
            </a>
          </div>
        </div>
      </header>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            About the Project
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Problem",
                text: "Traditional plastics decompose over 500+ years. India's 2022 ban on single-use plastics underscores the urgency for eco-friendly alternatives.",
              },
              {
                title: "Solution",
                text: "Biodegradable bags using Polylactic Acid (PLA) blends -- fully compostable, meeting IS 17088, ASTM D6400, EN 13432, and ISO 17088 standards.",
              },
              {
                title: "Opportunity",
                text: "Global biodegradable plastics market projected at USD 12.2B by 2030 (CAGR 9.2%). India ranks top 10 but imports 70% of supply.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="p-6 bg-gray-50 rounded-xl border border-gray-100"
              >
                <h3 className="text-lg font-bold text-swaroop-700 mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {card.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Products &amp; Process
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Product Range
              </h3>
              <ul className="space-y-2 text-gray-600">
                {[
                  "Grocery & retail carry bags",
                  "Agricultural mulch films",
                  "Food packaging films",
                  "Biomedical waste bags",
                  "Compostable bin liners",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-swaroop-500 mt-1">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                Manufacturing Process
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  "PLA Raw Material Compounding",
                  "Extrusion & Film Blowing",
                  "Printing & Branding",
                  "Cutting & Sealing",
                  "Quality Control & Testing",
                  "Packaging & Dispatch",
                ].map((step, i) => (
                  <div
                    key={step}
                    className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-100"
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-swaroop-100 text-swaroop-700 font-bold rounded-full text-sm">
                      {i + 1}
                    </span>
                    <span className="text-gray-700 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financials */}
      <section id="financials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Financial Projections
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Year-wise summary in INR Lakhs
          </p>
          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl mx-auto text-sm">
              <thead>
                <tr className="border-b-2 border-swaroop-200">
                  <th className="text-left py-3 px-4 text-gray-700">Metric</th>
                  <th className="text-right py-3 px-4 text-gray-700">Year 1</th>
                  <th className="text-right py-3 px-4 text-gray-700">Year 3</th>
                  <th className="text-right py-3 px-4 text-gray-700">Year 5</th>
                </tr>
              </thead>
              <tbody>
                {financials.map((row) => (
                  <tr
                    key={row.metric}
                    className="border-b border-gray-100 hover:bg-swaroop-50/50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">
                      {row.metric}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {row.y1}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {row.y3}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">
                      {row.y5}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Certifications
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {certifications.map((cert) => (
              <div
                key={cert.certNo}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
              >
                <a
                  href={cert.imageSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 border-b border-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-swaroop-500"
                >
                  <img
                    src={cert.imageSrc}
                    alt={cert.imageAlt}
                    className="w-full h-auto object-contain max-h-56 bg-white"
                    loading="lazy"
                  />
                </a>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-swaroop-100 text-swaroop-700 rounded-full font-bold text-xs">
                      ISO
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{cert.standard}</p>
                      <p className="text-xs text-gray-500">{cert.title}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-700">
                        Certificate:
                      </span>{" "}
                      {cert.certNo}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Issued:</span>{" "}
                      {cert.issued}
                    </p>
                    <p>
                      <span className="font-medium text-gray-700">Expiry:</span>{" "}
                      {cert.expiry}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Scope: Manufacturing of Plastic Bio Medical and Bio
                      Degradable Compostable Waste Bags and Other Packaging Goods
                    </p>
                  </div>
                  <a
                    href="#/certifications"
                    className="mt-4 text-sm font-semibold text-swaroop-700 hover:text-swaroop-800"
                  >
                    Full certification page →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-swaroop-800 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Partner With Us</h2>
          <p className="text-swaroop-200 mb-6 max-w-xl mx-auto">
            We seek investment, infrastructure, and policy support to catalyze
            India&apos;s transition to eco-friendly packaging.
          </p>
          <div className="text-sm text-swaroop-300 space-y-1">
            <p className="font-semibold text-white">{BRAND_NAME}</p>
            <p>{LEGAL_ENTITY}</p>
            <p>Chukkusehri, Hasanganj, Unnao, Uttar Pradesh 209841, India</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-gray-900 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} {BRAND_NAME} · {LEGAL_ENTITY}. All rights reserved.
      </footer>
    </div>
  );
}
