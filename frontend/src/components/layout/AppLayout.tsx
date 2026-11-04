import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "./Navbar";
import { pageTransition } from "@/lib/motion";

export function AppLayout() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          {...pageTransition}
          className="min-h-[calc(100vh-64px)]"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-6 py-10 text-center text-sm text-tertiary">
          <p>DeepfakeGuard - BSc Final Year Project, Uganda Christian University</p>
          <p className="mt-1">Nimaro Patience Torach - Supervised by Julius Torach</p>
        </div>
      </footer>
    </div>
  );
}
