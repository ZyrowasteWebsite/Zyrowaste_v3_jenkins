const subsidiaries = [
  {
    name: "Swaroop Formulation Industries Pvt. Ltd.",
    role: "Manufacturing & certifications",
    summary:
      "PLA-based biodegradable and compostable bags, biomedical waste bags, and packaging — Chukkusehri, Hasanganj, Unnao, Uttar Pradesh 209841, India.",
    href: "#/",
    linkLabel: "Home / pitch",
  },
  {
    name: "Zyrowaste",
    role: "Brand · biodegradable packaging",
    summary:
      "Customer-facing brand for compostable waste bags and eco packaging. Web presence: zyrowaste.in (update when your live site is ready).",
    href: "https://zyrowaste.in",
    linkLabel: "Website",
    external: true,
  },
  {
    name: "Anand Meditrade",
    role: "Medical trade & distribution",
    summary:
      "Trade channel for biomedical and related packaging products. Contact details can be aligned with the Email tab once mailboxes are final.",
    href: "#/contact-email",
    linkLabel: "Contact emails",
  },
];

export default function SubsidiariesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-swaroop-50/80 to-white">
      <main className="max-w-6xl mx-auto px-4 py-14">
        <header className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-swaroop-600 mb-2">
            Group structure
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Subsidiaries</h1>
          <p className="mt-3 text-gray-600">
            Zyrowaste is the customer-facing brand; Swaroop Formulation Industries is the operating manufacturer;
            Anand Meditrade represents the medical trade channel.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {subsidiaries.map((s) => (
            <article
              key={s.name}
              className="bg-white rounded-2xl border border-swaroop-100 shadow-lg shadow-swaroop-100/30 p-6 flex flex-col"
            >
              <h2 className="text-lg font-bold text-gray-900 leading-snug">{s.name}</h2>
              <p className="text-xs font-semibold text-swaroop-600 mt-1 mb-3">{s.role}</p>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">{s.summary}</p>
              <a
                href={s.href}
                {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-flex mt-5 text-sm font-semibold text-swaroop-700 hover:text-swaroop-800"
              >
                {s.linkLabel} →
              </a>
            </article>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-500 border-t border-gray-100 bg-white">
        Zyrowaste · Swaroop Formulation Industries Pvt. Ltd. · Chukkusehri, Hasanganj, Unnao, UP 209841
      </footer>
    </div>
  );
}
