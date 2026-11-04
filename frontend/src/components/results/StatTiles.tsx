
import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { Reveal } from "@/components/ui/Reveal";

interface Stat {
  label: string;
  value: string;
}

export function StatTiles({ stats }: { stats: Stat[] }) {
  return (
    <Reveal className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          className="bg-card rounded-card-sm p-4 shadow-sm"
        >
          <p className="text-[11px] uppercase tracking-wider text-tertiary font-semibold mb-1">
            {stat.label}
          </p>
          <p className="text-xl font-bold text-primary">{stat.value}</p>
        </motion.div>
      ))}
    </Reveal>
  );
}
