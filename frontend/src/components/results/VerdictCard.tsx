import { motion, useSpring, useMotionValue, useMotionValueEvent } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface VerdictCardProps {
  verdict: string;
  probability: number;
  threshold: number;
  onReset?: () => void;
  onCompare?: () => void;
}

export function VerdictCard({ verdict, probability, threshold, onReset, onCompare }: VerdictCardProps) {
  const [displayPct, setDisplayPct] = useState(0);

  // Animate the percentage number
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 20 });

  useEffect(() => {
    motionVal.set(probability * 100);
  }, [probability, motionVal]);

  useMotionValueEvent(spring, "change", (v) => {
    setDisplayPct(Math.round(v * 10) / 10);
  });

  const verdictColor =
    verdict === "Likely Fake"
      ? "text-fake-red"
      : verdict === "Likely Real"
        ? "text-real-green"
        : "text-amber";

  const strokeColor =
    verdict === "Likely Fake"
      ? "var(--color-fake-red)"
      : verdict === "Likely Real"
        ? "var(--color-real-green)"
        : "var(--color-amber)";

  // SVG gauge
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - probability);

  return (
    <div className="bg-card rounded-card px-8 pt-10 pb-8 shadow-sm text-center">
      {/* Radial gauge */}
      <div className="relative w-[170px] h-[170px] mx-auto mb-6">
        <svg className="absolute inset-0" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="none" strokeWidth="9" stroke="var(--color-bg)" />
        </svg>
        <svg className="absolute inset-0" viewBox="0 0 180 180">
          <motion.circle
            cx="90" cy="90" r={radius}
            fill="none" strokeWidth="9"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-serif text-5xl leading-none ${verdictColor}`}>
            {displayPct.toFixed(1)}%
          </span>
          <span className="text-xs text-tertiary mt-2">probability</span>
        </div>
      </div>

      <h2 className={`font-serif text-3xl ${verdictColor} mb-2`}>{verdict}</h2>
      <p className="text-sm text-tertiary mb-7">Threshold: {threshold.toFixed(2)}</p>

      <div className="flex flex-col gap-2.5">
        <Button variant="primary" className="w-full !py-3" onClick={() => window.print()}>
          Download PDF report
        </Button>
        {onCompare && (
          <Button variant="outlined" className="w-full !py-3" onClick={onCompare}>
            Compare with another model
          </Button>
        )}
        {onReset && (
          <Button variant="outlined" className="w-full !py-3" onClick={onReset}>
            Analyze another video
          </Button>
        )}
      </div>
    </div>
  );
}
