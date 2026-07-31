import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/#home" },
  { label: "About SIH", href: "/#about" },
  { label: "Themes", href: "/#themes" },
  { label: "Problem Statements", href: "/#problem-statements" },
  { label: "Timeline", href: "/#timeline" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card/60 text-foreground transition-colors hover:bg-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.25 }}
          className="grid place-items-center"
        >
          {theme === "dark" ? <Sun className="h-[1.05rem] w-[1.05rem]" /> : <Moon className="h-[1.05rem] w-[1.05rem]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const progress = useTransform(scrollY, [0, 2400], ["0%", "100%"]);

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 24));
    return unsub;
  }, [scrollY]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        className="h-[2px] origin-left bg-primary"
        style={{ width: progress }}
        aria-hidden
      />
      <div
        className={cn(
          "transition-all duration-500",
          scrolled ? "glass-strong shadow-soft" : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          aria-label="Primary"
          className="shell grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 lg:flex lg:justify-between"
        >
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="NMIET SIH Portal home">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-glow">
              N
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-semibold leading-tight">
                NMIET SIH Portal
              </span>
              <span className="block truncate text-[0.7rem] text-muted-foreground">
                Smart India Hackathon 2026
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/register" className="hidden sm:block">
              <MagneticButton className="bg-primary text-primary-foreground shadow-glow hover:brightness-105">
                Register
              </MagneticButton>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card/60 xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="glass-strong xl:hidden"
          >
            <ul className="shell flex flex-col gap-1 py-4">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Register your team
                </Link>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
