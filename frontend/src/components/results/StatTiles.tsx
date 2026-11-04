import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";

interface Stat {
  label: string;
  value: string;
}

export function StatTiles({ stats }: { stats: Stat[] }) {
  return (
    <Reveal className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          className="bg-card rounded-card-sm px-5 py-5 shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.1em] text-tertiary font-medium mb-2">
            {stat.label}
          </p>
          <p className="text-2xl font-semibold text-primary truncate">{stat.value}</p>
        </motion.div>
      ))}
    </Reveal>
  );
}
