import { motion } from "framer-motion";
import { useMemo } from "react";
import { BrandMark } from "../components/BrandMark";
import { BRAND_NAME, BRAND_TAGLINE } from "../constants/brand";

export default function EntryPage() {

  // 🌿 Two layers → depth effect
  const leaves = useMemo(() => {
    return Array.from({ length: 45 }).map(() => ({
      left: Math.random() * 100,
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 5,
      size: 10 + Math.random() * 20,
      drift: Math.random() * 80 - 40,
      opacity: 0.2 + Math.random() * 0.8,
      blur: Math.random() > 0.6 ? "blur-sm" : "",
    }));
  }, []);

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center">

      {/* 🌈 Animated Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-100"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* 🍃 Premium Leaves (wind + depth) */}
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className={`absolute select-none ${leaf.blur}`}
          style={{
            left: `${leaf.left}%`,
            fontSize: `${leaf.size}px`,
            opacity: leaf.opacity,
          }}
          initial={{ y: "-10vh" }}
          animate={{
            y: "110vh",
            x: [0, leaf.drift, -leaf.drift / 2, leaf.drift / 2, 0],
            rotate: [0, 120, 240, 360],
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: "easeInOut",
          }}
        >
          🍃
        </motion.div>
      ))}

      {/* 💎 Glass Card */}
      <motion.div
        className="relative z-10 px-8 py-10 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Logo */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <BrandMark size="lg" showWordmark={false} />
        </motion.div>

        {/* Brand */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mt-4">
          {BRAND_NAME}
        </h1>

        <p className="text-gray-700 mt-2 text-lg">
          {BRAND_TAGLINE}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Manufacturing a Greener Future 🌍
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.hash = "/signin")}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700"
          >
            Sign In
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.hash = "/signup")}
            className="px-6 py-3 border border-green-600 text-green-700 font-semibold rounded-lg hover:bg-green-50"
          >
            Sign Up
          </motion.button>
        </div>

        {/* Explore */}
        <button
          onClick={() => (window.location.hash = "/landing")}
          className="mt-6 text-sm text-gray-600 hover:text-green-700 transition"
        >
          Explore Website →
        </button>
      </motion.div>

      {/* 🌿 Bottom Glow */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-green-200/40 to-transparent pointer-events-none" />
    </div>
  );
}