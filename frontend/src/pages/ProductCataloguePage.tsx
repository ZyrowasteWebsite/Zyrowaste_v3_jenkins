import { useState } from "react";

interface Product {
  id: string;
  name: string;
  category: string;
  emoji: string;
  tagline: string;
  bestFor: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

const PRODUCTS: Product[] = [
  {
    id: "carry-bags",
    name: "Compostable Carry Bags",
    category: "Retail & Shopping",
    emoji: "🛍️",
    tagline: "Eco-friendly bags for everyday retail use",
    bestFor: "Retail stores, supermarkets, clothing shops, pharmacies",
    features: [
      "Material: Corn Starch, PLA, PBAT",
      "Thickness: Starts from 15 microns",
      "Capacity: 1–20 KG",
      "Types: U-Cut, W-Cut, D-Cut",
      "Custom printing available",
      "100% compostable & biodegradable",
    ],
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  {
    id: "garbage-bags",
    name: "Compostable Garbage Bags",
    category: "Waste Management",
    emoji: "♻️",
    tagline: "Strong, leak-proof bags for responsible waste disposal",
    bestFor: "Hotels, apartments, hospitals, municipalities",
    features: [
      "Capacity: 5L to 240L",
      "Flat seal & star seal options",
      "With or without core",
      "Strong & leak-proof construction",
      "Available in multiple sizes",
      "Meets compostability standards",
    ],
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    id: "pet-poop-bags",
    name: "Compostable Pet Poop Bags",
    category: "Pet Care",
    emoji: "🐾",
    tagline: "Convenient & eco-friendly for responsible pet owners",
    bestFor: "Pet owners, residential & municipal use",
    features: [
      "Capacity: 3L to 5L",
      "Easy tear perforation",
      "Compact and portable design",
      "Eco-friendly material",
      "Odor-resistant",
      "Compostable in 90–180 days",
    ],
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
  },
  {
    id: "apparel-bags",
    name: "Compostable Apparel Bags",
    category: "Fashion & E-commerce",
    emoji: "👗",
    tagline: "Stylish, sustainable packaging for fashion brands",
    bestFor: "E-commerce brands, clothing stores",
    features: [
      "Self-adhesive seal",
      "Starting thickness: 25 microns",
      "Custom colors & branding",
      "Professional appearance",
      "Tear-resistant material",
      "Eco-certified packaging",
    ],
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    id: "custom-bags",
    name: "Custom Compostable Bags",
    category: "Custom Solutions",
    emoji: "🎨",
    tagline: "Tailored packaging solutions for every industry",
    bestFor: "Healthcare, restaurants, electronics, events",
    features: [
      "Fully customizable dimensions",
      "Side seal / wrap options",
      "Branding with eco-friendly inks",
      "Various thickness options",
      "Bulk order pricing",
      "OEM & private label available",
    ],
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "red-biohazard",
    name: "Red Biohazard Bags",
    category: "Biomedical Waste",
    emoji: "🔴",
    tagline: "Safe disposal of contaminated recyclable plastic waste",
    bestFor: "Hospitals, clinics, diagnostic labs",
    features: [
      "Used for: IV tubes & sets, catheters, urine bags",
      "Syringes (without needles), gloves",
      "Disposal: Autoclaving / Disinfection then recycling",
      "Compliant with BMW Rules 2016",
      "Color-coded for easy identification",
      "Puncture-resistant material",
    ],
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    id: "yellow-biohazard",
    name: "Yellow Biohazard Bags",
    category: "Biomedical Waste",
    emoji: "🟡",
    tagline: "Critical containment for highly infectious medical waste",
    bestFor: "Hospitals, surgical centers, pathology labs",
    features: [
      "Used for: Human tissues & body parts",
      "Blood-soaked bandages, cotton, dressings",
      "Expired medicines & pharmaceuticals",
      "Disposal method: High-temperature incineration",
      "Most critical biomedical waste category",
      "Strict handling & labeling protocols",
    ],
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  {
    id: "blue-biohazard",
    name: "Blue Biohazard Bags / Containers",
    category: "Biomedical Waste",
    emoji: "🔵",
    tagline: "Secure handling of glass and metallic biomedical waste",
    bestFor: "Labs, hospitals, research centers",
    features: [
      "Used for: Glass bottles & vials",
      "Broken glass, metallic implants",
      "Disposal: Disinfection and recycling",
      "Puncture-proof construction",
      "Leak-proof sealed design",
      "Compliant with biomedical waste norms",
    ],
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "green-waste",
    name: "Green Waste Bags (General)",
    category: "General Waste",
    emoji: "🟢",
    tagline: "Reliable bags for everyday non-medical waste disposal",
    bestFor: "Offices, restaurants, residential complexes",
    features: [
      "Used for: Food waste, paper & packaging",
      "General garbage disposal",
      "Not classified as biomedical waste",
      "Disposal: Municipal waste disposal",
      "Compostable & eco-friendly",
      "Suitable for wet & dry waste",
    ],
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
];

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`${product.bgColor} px-6 pt-6 pb-4 rounded-t-2xl border-b ${product.borderColor}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{product.emoji}</span>
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${product.color}`}>
                  {product.category}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-0.5">{product.name}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-2 flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-2">{product.tagline}</p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Best For</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{product.bestFor}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Key Features</h3>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${product.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <a
              href={`https://wa.me/916307758139?text=${encodeURIComponent(`Hello! I'm interested in your ${product.name}. Could you share pricing and availability?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enquire on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = ["All", "Retail & Shopping", "Waste Management", "Pet Care", "Fashion & E-commerce", "Custom Solutions", "Biomedical Waste", "General Waste"];

export default function ProductCataloguePage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-700/50 rounded-full px-4 py-1.5 mb-4">
            <span className="text-green-200 text-sm font-medium">100% Compostable</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">Product Catalogue</h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Explore our complete range of compostable and biodegradable packaging solutions.
            Click any product to view detailed specifications.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Why Choose section */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: "🌿", title: "Certified Compostable", desc: "Safe for the environment, no harmful residue" },
            { icon: "✅", title: "Quality You Can Trust", desc: "Tested and compliant with industry standards" },
            { icon: "🏭", title: "In-House Manufacturing", desc: "Better control, consistent quality, timely delivery" },
            { icon: "📦", title: "Custom Solutions", desc: "Sizes, thickness, and printing as per your needs" },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-green-100 p-4 flex items-start gap-3 shadow-sm">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-green-700 text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setSelected(product)}
              className={`text-left bg-white rounded-2xl border-2 ${product.borderColor} shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group`}
            >
              <div className={`${product.bgColor} px-6 pt-6 pb-4`}>
                <span className="text-4xl block mb-3">{product.emoji}</span>
                <span className={`text-xs font-semibold uppercase tracking-wider ${product.color}`}>
                  {product.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-1">{product.name}</h3>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.tagline}</p>
                <div className="text-xs text-gray-500 mb-3">
                  <span className="font-semibold text-gray-700">Best for: </span>
                  {product.bestFor}
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold ${product.color} group-hover:gap-2.5 transition-all`}>
                  View details
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bulk Order CTA */}
        <div className="mt-14 bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-8 text-white text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Looking for Bulk Orders?</h2>
          <p className="text-green-100 mb-6 max-w-xl mx-auto">
            We offer competitive pricing for B2B, retail, and government orders.
            Get a custom quote tailored to your requirements.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`https://wa.me/916307758139?text=${encodeURIComponent("Hello! I'm interested in placing a bulk order for compostable bags. Could you share your pricing catalogue?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-green-800 hover:bg-green-50 font-bold px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
            <a
              href="#/contact"
              className="flex items-center gap-2 border-2 border-white text-white hover:bg-green-600 font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
