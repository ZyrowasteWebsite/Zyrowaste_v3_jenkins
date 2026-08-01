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

const productCategories = [
  { emoji: "🛒", name: "Retail", items: "Vegetable bag, Shopping bag, Carry bag, Garbage bag, Animal waste bag" },
  { emoji: "🍽️", name: "HoReCa", items: "Laundry bag, Carry bag, Garbage bag" },
  { emoji: "👗", name: "Fashion", items: "Apparel bag, branded packaging" },
  { emoji: "📦", name: "E-Commerce", items: "Courier bag, self-seal bags" },
  { emoji: "🏥", name: "Healthcare", items: "Biomedical waste bags, Garbage bag" },
  { emoji: "🎉", name: "Events", items: "Carry bag, Garbage bag, Gift bags" },
  { emoji: "🏠", name: "Residential", items: "Carry bag, Garbage bag" },
  { emoji: "🏙️", name: "Municipal", items: "Large garbage bags, community waste bags" },
  { emoji: "🏢", name: "Office / Cafeteria", items: "Carry bag, Garbage bag" },
  { emoji: "🍿", name: "Food Industries", items: "Master packaging bag" },
  { emoji: "🚗", name: "Automobile", items: "Tools packaging bag" },
];

const whyChooseUs = [
  { icon: "🏅", title: "Certified Compostable Products", desc: "Safe for the environment, no harmful residue left behind." },
  { icon: "✅", title: "Quality You Can Trust", desc: "Tested and compliant with IS 17088, ASTM D6400, EN 13432, and ISO 17088." },
  { icon: "🏭", title: "In-House Manufacturing", desc: "Better control over quality, consistent output, and timely delivery." },
  { icon: "🎨", title: "Custom Solutions", desc: "Sizes, thickness, and printing customized as per your needs." },
  { icon: "💰", title: "Competitive Bulk Pricing", desc: "Ideal for B2B, retail, and government orders at scale." },
];

const whyCompostable = [
  "Plastic pollutes for 100+ years; compostable breaks down naturally",
  "No microplastics or toxic residue left behind",
  "Supports sustainability goals & government regulations",
  "Builds a responsible, eco-friendly brand image",
];

const SOCIAL_LINKS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/zyro-waste-9b2ba1389", icon: "in" },
  { name: "YouTube", href: "https://youtube.com/@zyrowaste", icon: "yt" },
  { name: "Instagram", href: "https://www.instagram.com/zyrowaste", icon: "ig" },
  { name: "Facebook", href: "https://www.facebook.com/profile.php?id=61587018775631", icon: "fb" },
];

function SocialIconSVG({ type }: { type: string }) {
  if (type === "in") return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
  if (type === "yt") return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  );
  if (type === "ig") return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">

      {/* ══ Hero ══ */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 text-white">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/20 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/60 backdrop-blur rounded-full px-4 py-1.5 mb-6 text-sm font-medium text-green-200">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {BRAND_NAME} · {BRAND_TAGLINE}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Be the <span className="text-green-300">Pollution Solution</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-green-100 mb-4">
            India's trusted manufacturer of compostable PLA-based packaging — groceries, food packaging,
            agricultural films, and biomedical solutions. Certified, sustainable, and export-ready.
          </p>

          <p className="text-green-300 text-sm mb-10 font-medium">
            📞 6307758139 · 7270060339 &nbsp;|&nbsp; ✉️ info@zyrowaste.com
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#/products"
              className="px-7 py-3.5 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition shadow-lg"
            >
              View Products
            </a>
            <a
              href="#/contact"
              className="px-7 py-3.5 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition"
            >
              Contact Us
            </a>
            <a
              href={`https://wa.me/916307758139?text=${encodeURIComponent("Hello Zyrowaste! I'm interested in your compostable packaging solutions.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition shadow-lg flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </header>

      {/* ══ Manufacturing Process ══ */}
      <section className="py-16 bg-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">How We Make It</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Manufacturing Process</h2>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { step: 1, name: "PLA Raw Material Compounding", icon: "⚗️" },
              { step: 2, name: "Extrusion & Film Blowing", icon: "🌬️" },
              { step: 3, name: "Printing & Branding", icon: "🖨️" },
              { step: 4, name: "Cutting & Sealing", icon: "✂️" },
              { step: 5, name: "Quality Control & Testing", icon: "🔬" },
              { step: 6, name: "Packaging & Dispatch", icon: "🚚" },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-center gap-3 bg-white border border-green-100 rounded-xl px-5 py-3 shadow-sm"
              >
                <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-green-700 text-white text-sm font-bold rounded-full">
                  {s.step}
                </span>
                <span className="text-base">{s.icon}</span>
                <span className="text-sm font-medium text-gray-800">{s.name}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-sm mt-6 max-w-2xl mx-auto">
            Compostable bags are made of natural plant starch and do not produce any toxic material.
            They break down through microbial activity to form compost within 90–180 days.
          </p>
        </div>
      </section>

      {/* ══ About / Problem-Solution ══ */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">About the Project</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Why Compostable Packaging?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "The Problem",
                icon: "⚠️",
                color: "bg-red-50 border-red-100",
                text: "Traditional plastics decompose over 500+ years. India's 2022 ban on single-use plastics underscores the urgency for eco-friendly alternatives.",
              },
              {
                title: "Our Solution",
                icon: "🌿",
                color: "bg-green-50 border-green-100",
                text: "Biodegradable bags using Polylactic Acid (PLA) & PBAT blends — fully compostable, meeting IS 17088, ASTM D6400, EN 13432, and ISO 17088 standards.",
              },
              {
                title: "The Opportunity",
                icon: "📈",
                color: "bg-blue-50 border-blue-100",
                text: "Global biodegradable plastics market projected at USD 12.2B by 2030 (CAGR 9.2%). India ranks in top 10 but imports 70% of supply — a massive domestic gap.",
              },
            ].map((card) => (
              <div key={card.title} className={`p-6 rounded-2xl border ${card.color}`}>
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Why Choose Compostable ══ */}
      <section className="py-16 bg-green-800 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Why Choose Compostable Over Plastics?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyCompostable.map((item) => (
              <div key={item} className="bg-green-700/50 rounded-xl p-5 flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 text-green-300">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-green-100 text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Product Categories ══ */}
      <section id="products" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Industries We Serve</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Product Categories</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From grocery bags to biomedical waste — we supply compostable packaging across industries.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productCategories.map((cat) => (
              <div
                key={cat.name}
                className="bg-white rounded-xl border border-green-100 p-5 hover:border-green-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <h3 className="font-bold text-gray-900">{cat.name}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{cat.items}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="#/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition shadow-lg"
            >
              View Full Product Catalogue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ══ Why Choose Zyrowaste ══ */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Our Advantage</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Why Choose Zyrowaste?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 bg-green-50 rounded-xl border border-green-100">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Our Vision ══ */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-green-300">Our Vision</span>
          <blockquote className="mt-4 text-xl md:text-2xl font-medium leading-relaxed text-white/90">
            "To lead the transition from conventional plastic to truly sustainable, compostable packaging
            solutions — creating a cleaner and greener future for generations to come."
          </blockquote>
          <p className="mt-4 text-green-200 text-sm max-w-2xl mx-auto">
            At ZyroWaste, we aim to become one of India's largest and most trusted manufacturers of
            compostable products, empowering businesses and communities with reliable eco-friendly
            alternatives that reduce pollution and support a circular economy.
          </p>
        </div>
      </section>

      {/* ══ Financial Projections ══ */}
      <section id="financials" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Investment Pitch</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Financial Projections</h2>
            <p className="text-gray-500 mt-2">Year-wise summary in INR Lakhs</p>
          </div>
          <div className="overflow-x-auto max-w-2xl mx-auto">
            <table className="w-full text-sm rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-green-700 text-white">
                  <th className="text-left py-3 px-5">Metric</th>
                  <th className="text-right py-3 px-5">Year 1</th>
                  <th className="text-right py-3 px-5">Year 3</th>
                  <th className="text-right py-3 px-5">Year 5</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {financials.map((row, i) => (
                  <tr
                    key={row.metric}
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-green-50/50" : "bg-white"}`}
                  >
                    <td className="py-3 px-5 font-medium text-gray-800">{row.metric}</td>
                    <td className="py-3 px-5 text-right text-gray-600">{row.y1}</td>
                    <td className="py-3 px-5 text-right text-gray-600">{row.y3}</td>
                    <td className="py-3 px-5 text-right text-gray-600">{row.y5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-6">
            <a href="#/analytics" className="text-green-700 hover:text-green-800 font-semibold text-sm">
              View detailed analytics & dashboards →
            </a>
          </div>
        </div>
      </section>

      {/* ══ Certifications ══ */}
      <section id="certifications" className="py-20 bg-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-green-600">Quality Assurance</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">Certifications</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {certifications.map((cert) => (
              <div
                key={cert.certNo}
                className="bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden"
              >
                <a
                  href={cert.imageSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-b border-green-100"
                >
                  <img
                    src={cert.imageSrc}
                    alt={cert.imageAlt}
                    className="w-full h-auto object-contain max-h-48 bg-white"
                    loading="lazy"
                  />
                </a>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-800 rounded-full font-bold text-xs">
                      ISO
                    </span>
                    <div>
                      <p className="font-bold text-gray-900">{cert.standard}</p>
                      <p className="text-xs text-gray-500">{cert.title}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-800">Certificate:</span> {cert.certNo}</p>
                    <p><span className="font-medium text-gray-800">Issued:</span> {cert.issued}</p>
                    <p><span className="font-medium text-gray-800">Expiry:</span> {cert.expiry}</p>
                  </div>
                  <a href="#/certifications" className="mt-3 inline-block text-sm font-semibold text-green-700 hover:text-green-800">
                    Full certification page →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Contact / Partner CTA ══ */}
      <section id="contact" className="py-20 bg-green-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Partner With Us</h2>
          <p className="text-green-200 mb-8 max-w-xl mx-auto">
            We seek investment, infrastructure, and policy support to catalyze India's transition
            to eco-friendly packaging. Have a business inquiry? We are here to help.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-8 text-sm">
            <div className="bg-green-800/60 rounded-xl p-4">
              <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-1">Factory</p>
              <p className="text-white">Hasanganj, Unnao, Uttar Pradesh</p>
            </div>
            <div className="bg-green-800/60 rounded-xl p-4">
              <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-1">Phone</p>
              <p className="text-white">6307758139 · 7270060339</p>
            </div>
            <div className="bg-green-800/60 rounded-xl p-4">
              <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-1">Email</p>
              <p className="text-white">info@zyrowaste.com</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="#/contact"
              className="px-6 py-3 bg-white text-green-800 font-bold rounded-xl hover:bg-green-50 transition"
            >
              Contact Form
            </a>
            <a
              href={`https://wa.me/916307758139?text=${encodeURIComponent("Hello Zyrowaste! I would like to know more about your sustainable packaging solutions.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ══ Footer ══ */}
      <footer className="bg-gray-950 text-gray-400 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-white font-bold text-lg">{BRAND_NAME}</p>
              <p className="text-gray-500 text-sm">{LEGAL_ENTITY}</p>
              <p className="text-gray-600 text-xs mt-1">Chukkusehri, Hasanganj, Unnao, UP 209841</p>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm mr-1">Follow us:</span>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-green-700 hover:text-white transition-colors"
                  aria-label={s.name}
                >
                  <SocialIconSVG type={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {BRAND_NAME} · {LEGAL_ENTITY}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
