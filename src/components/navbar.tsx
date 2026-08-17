import { Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { registrationStatusQuery } from "@/lib/api";

const primaryNavItems = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Themes", href: "/themes" },
  { label: "Problems", href: "/problem-statements" },
  { label: "Guidelines", href: "/guidelines" },
];

const moreNavItems = [
  { label: "Organizing Committee", href: "/organizing-committee" },
  { label: "Journey", href: "/previous-years" },
  { label: "PPT Submission", href: "/ppt-submission" },
  { label: "PPT Template", href: "/ppt-template" },
  { label: "Timeline", href: "/#selection" },
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
          {theme === "dark" ? (
            <Sun className="h-[1.05rem] w-[1.05rem]" />
          ) : (
            <Moon className="h-[1.05rem] w-[1.05rem]" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const moreRef = useRef<HTMLLIElement>(null);
  const location = useLocation();
  const { scrollY } = useScroll();
  const registrationControl = useQuery(registrationStatusQuery);
  const registrationsOpen = registrationControl.data?.is_open !== false;
  const [scrolled, setScrolled] = useState(false);
  const progress = useTransform(scrollY, [0, 2400], ["0%", "100%"]);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (value) => setScrolled(value > 24));
    return unsubscribe;
  }, [scrollY]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
    setMobileMoreOpen(false);
  }, [location.href]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) setMoreOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

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
          <Link
            to="/"
            className="flex shrink-0 items-center gap-4"
            aria-label="NMIET SIH Portal home"
          >
            <div className="flex shrink-0 items-center gap-2">
              <img
                src="/logos/nmiet-logo.png"
                alt="NMIET"
                className="h-8 w-auto object-contain sm:h-10 md:h-12"
              />
              <img
                src="/logos/IIC.png"
                alt="Innovation & Incubation Council"
                className="h-7 w-auto object-contain sm:h-8 md:h-10"
              />
            </div>
            <div className="leading-tight">
              <h1 className="whitespace-nowrap font-display text-sm font-semibold">
                NMIET SIH Portal
              </h1>
              <p className="whitespace-nowrap text-xs text-muted-foreground">
                Smart India Hackathon 2026
              </p>
            </div>
          </Link>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {primaryNavItems.map((item) => (
              <li key={item.label}>
<Link
  to={item.href}
  className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
>
  {item.label}
</Link>
              </li>
            ))}
            <li
              ref={moreRef}
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((value) => !value)}
                className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                More
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    moreOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.ul
                    role="menu"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-strong absolute right-0 top-full mt-2 w-56 origin-top-right rounded-2xl p-1.5 shadow-lift"
                  >
                    {moreNavItems.map((item) => (
                      <li key={item.label} role="none">
<Link
  to={item.href}
  role="menuitem"
  onClick={() => setMoreOpen(false)}
  className="block rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            {registrationsOpen ? <Link to="/register" className="hidden sm:block"><MagneticButton className="bg-primary text-primary-foreground shadow-glow hover:brightness-105">Register</MagneticButton></Link> : null}
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card/60 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="glass-strong lg:hidden"
          >
            <ul className="shell flex flex-col gap-1 py-4">
              <li className="flex justify-center pt-2">
                <ThemeToggle />
              </li>
              {primaryNavItems.map((item) => (
                <li key={item.label}>
                  <Link
  to={item.href}
  onClick={() => setOpen(false)}
  className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-accent"
>
  {item.label}
</Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  aria-expanded={mobileMoreOpen}
                  onClick={() => setMobileMoreOpen((value) => !value)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-medium text-foreground/90 transition-colors hover:bg-accent"
                >
                  More{" "}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", mobileMoreOpen && "rotate-180")}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {mobileMoreOpen && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4"
                    >
                      {moreNavItems.map((item) => (
                        <li key={item.label}>
                          <Link
  to={item.href}
  className="whitespace-nowrap rounded-full px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
>
  {item.label}
</Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
              {registrationsOpen ? <li className="pt-2">
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Register your team
                </Link>
              </li> : null}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
