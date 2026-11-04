/** Gradient stand-in for a video frame, used before real images exist. */

const backgrounds = {
  original: "linear-gradient(135deg, #D6D2CA 0%, #C9C5BC 50%, #B9B5AB 100%)",
  heatmap:
    "linear-gradient(135deg, #D8D4CC 0%, #E4CBC6 35%, #D9827A 62%, #E6C9C3 82%, #D6D6CB 100%)",
};

interface FramePlaceholderProps {
  variant: "original" | "heatmap";
  label?: string;
  className?: string;
}

export function FramePlaceholder({ variant, label, className = "" }: FramePlaceholderProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: backgrounds[variant] }}
    >
      {label && <span className="text-sm text-black/40">{label}</span>}
    </div>
  );
}
