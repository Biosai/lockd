"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles } from "lucide-react";

// Replace with Martin's actual wallet address
const MARTIN_ADDRESS = "0x0000000000000000000000000000000000000000";

const STORAGE_KEY = "christmas-banner-dismissed";

export function ChristmasBanner() {
  const { address, isConnected } = useAccount();
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check localStorage after hydration
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setIsDismissed(dismissed);
    setIsHydrated(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  // Check if the connected address matches Martin's address (case-insensitive)
  const isMartin =
    isConnected &&
    address?.toLowerCase() === MARTIN_ADDRESS.toLowerCase();

  // Don't show if not Martin, already dismissed, or not hydrated yet
  const shouldShow = isHydrated && isMartin && !isDismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-green-600 px-4 py-4 shadow-lg">
            {/* Decorative sparkles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-2 left-[10%] text-yellow-300/40"
              >
                <Sparkles className="h-6 w-6" />
              </motion.div>
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute bottom-1 left-[30%] text-yellow-200/30"
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-1 right-[20%] text-yellow-300/40"
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
            </div>

            <div className="mx-auto max-w-4xl flex items-center justify-center gap-4 text-center">
              <motion.div
                animate={{
                  rotate: [-10, 10, -10],
                  y: [0, -3, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Gift className="h-8 w-8 text-yellow-200 flex-shrink-0" />
              </motion.div>
              
              <p className="text-white font-medium text-sm md:text-base">
                <span className="font-bold">Félicitations Martin !</span>{" "}
                🎄 Tu as réalisé l&apos;étape la plus importante de ton cadeau de Noël.
                Maintenant, il ne te reste plus qu&apos;à{" "}
                <span className="font-bold underline decoration-yellow-300 decoration-2">
                  claim ton cadeau
                </span>{" "}
                ! 🎁
              </p>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

