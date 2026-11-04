import { Link } from "react-router-dom";

const columns = [
  {
    title: "Product",
    links: [
      { to: "/detect", label: "Detect" },
      { to: "/live", label: "Live analysis" },
      { to: "/models", label: "Models" },
      { to: "/history", label: "History" },
    ],
  },
  {
    title: "Research",
    links: [
      { to: "/about#architecture", label: "Architecture" },
      { to: "/about#datasets", label: "Datasets" },
      { to: "/about#limitations", label: "Limitations" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/about#ethics", label: "Ethical use" },
      { to: "/about#privacy", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 py-6">
          <div className="col-span-2 md:col-span-1 max-w-sm">
            <p className="font-serif text-xl mb-3">DeepfakeGuard</p>
            <p className="text-sm text-tertiary leading-relaxed">
              An explainable hybrid CNN framework for real-time deepfake
              detection in digital forensics.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-tertiary mb-4">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-[15px] text-secondary hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-10 py-8 text-center text-sm text-tertiary leading-relaxed">
          <p>DeepfakeGuard · BSc Final Year Project, Uganda Christian University</p>
          <p>Nimaro Patience Torach</p>
        </div>
      </div>
    </footer>
  );
}
