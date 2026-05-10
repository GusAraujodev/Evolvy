import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative min-h-dvh bg-background overflow-hidden flex flex-col px-6 pt-20 pb-10">
      {/* ambient lime light */}
      <motion.div
        aria-hidden
        className="absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary blur-3xl opacity-40"
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-44 -left-24 w-[24rem] h-[24rem] rounded-full bg-primary blur-3xl opacity-25"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex-1 flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
              <span className="text-primary font-black text-lg">E</span>
            </div>
            <span className="font-bold tracking-tight">Evolvy</span>
          </div>
        </div>

        <div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[2.4rem] leading-[1.08] font-extrabold tracking-tight"
          >
            <span className="bg-primary px-2 -mx-1 rounded-md inline-block">Evoluir</span> é para todos.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-base font-medium text-muted-foreground mt-5 max-w-[22rem]"
          >
            Alcance sua melhor versão com um plano que se adapta à sua rotina.
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={onStart}
          className="group w-full bg-foreground text-background font-semibold py-5 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          Começar minha evolução
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}
