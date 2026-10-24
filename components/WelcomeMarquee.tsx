"use client";

import { motion, useReducedMotion } from "framer-motion";

const messages = [
  "Bienvenue à Sédhiou",
  "La mairie vous souhaite la bienvenue sur Sédhiou Connect",
  "Vos démarches en ligne, simplement",
];

export default function WelcomeMarquee() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section aria-label="Message de bienvenue" className="overflow-hidden bg-green-700 py-3 text-white">
      <p className="sr-only">Bienvenue à Sédhiou. La mairie vous souhaite la bienvenue sur Sédhiou Connect.</p>
      <motion.div
        aria-hidden="true"
        className="flex w-max items-center gap-8 whitespace-nowrap text-sm font-semibold tracking-wide sm:text-base"
        animate={shouldReduceMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={shouldReduceMotion ? undefined : { duration: 24, ease: "linear", repeat: Infinity }}
      >
        {(shouldReduceMotion ? [0] : [0, 1]).map((copy) => (
          <span key={copy} className="flex shrink-0 items-center gap-8 px-4">
            {messages.map((message, index) => (
              <span key={message} className="flex shrink-0 items-center gap-8">
                <span>{message}</span>
                {index < messages.length - 1 && <span className="text-green-200" aria-hidden="true">✦</span>}
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
