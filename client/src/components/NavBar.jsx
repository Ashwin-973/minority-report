import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { path: "/onboarding", label: "ONBOARD" },
  { path: "/worker", label: "WORKER" },
  { path: "/policy", label: "POLICY" },
  { path: "/admin", label: "ADMIN" },
  { path: "/analytics", label: "ANALYTICS" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [time, setTime] = useState("");
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-void/95 backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
        }`}
    >
      <div className="flex items-center justify-between px-6 md:px-10 h-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className="display-text text-white text-xl tracking-tighter"
              style={{ fontStyle: "italic" }}
            >
              MINORITY
            </span>
            <br />
            <span className="display-text text-white text-xl tracking-tighter">
              REPORT
            </span>
            {/* blinking dot */}
            <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse-slow" />
          </div>
          <div className="w-px h-8 bg-white/15 ml-1" />
          <span className="font-mono text-[10px] text-white/40 leading-tight">
            PRE-CRIME<br />INSURANCE
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-8">
          {NAV_LINKS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `font-display font-700 text-sm tracking-widest transition-all duration-200 relative group ${isActive ? "text-white" : "text-white/45 hover:text-white/80"
                }`
              }
              style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}
            >
              {label}
              <span
                className={`absolute -bottom-0.5 left-0 h-px bg-signal-green transition-all duration-300 ${location.pathname === path ? "w-full" : "w-0 group-hover:w-full"
                  }`}
              />
            </NavLink>
          ))}
        </nav>

        {/* Right — clock + status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" />
            <span className="font-mono text-[11px] text-white/50">LIVE</span>
          </div>
          <span className="font-mono text-sm text-white/60">{time}</span>
        </div>
      </div>
    </header>
  );
}