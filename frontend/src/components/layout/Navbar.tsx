import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Shield, Menu, X } from "lucide-react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/detect", label: "Detect" },
  { to: "/live", label: "Live" },
  { to: "/history", label: "History" },
  { to: "/models", label: "Models" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-bg/85 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-bg border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-serif text-xl text-primary">
          <Shield className="w-5 h-5 text-accent" />
          DeepfakeGuard
        </Link>

        {/* Desktop nav links in pill container */}
        <div className="hidden md:flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-full p-1 relative">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors z-10 ${
                  isActive ? "text-primary" : "text-secondary hover:text-primary"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-card rounded-full shadow-sm"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <Link
          to="/detect"
          className="hidden md:block bg-primary text-bg px-5 py-2 rounded-full text-sm font-semibold hover:-translate-y-0.5 transition-transform"
        >
          Start analysis
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="md:hidden border-t border-border bg-bg px-6 py-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-secondary hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/detect"
            onClick={() => setMobileOpen(false)}
            className="block mt-3 text-center bg-primary text-bg px-5 py-2.5 rounded-full text-sm font-semibold"
          >
            Start analysis
          </Link>
        </motion.div>
      )}
    </nav>
  );
}
