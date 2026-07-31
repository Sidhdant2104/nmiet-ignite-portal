import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
              N
            </span>
            <span className="font-display text-sm font-semibold">NMIET SIH Portal</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            An initiative of the Innovation &amp; Incubation Cell, Nutan Maharashtra Institute of
            Engineering and Technology, Talegaon Dabhade, Pune.
          </p>
        </div>
        <nav aria-label="Footer sections">
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Explore
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { label: "About SIH", href: "/#about" },
              { label: "Themes", href: "/#themes" },
              { label: "Problem statements", href: "/#problem-statements" },
              { label: "Timeline", href: "/#timeline" },
            ].map((l) => (
              <li key={l.label}>
                <a className="text-muted-foreground transition-colors hover:text-foreground" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Participate
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link className="text-muted-foreground transition-colors hover:text-foreground" to="/register">
                Internal registration
              </Link>
            </li>
            <li>
              <a className="text-muted-foreground transition-colors hover:text-foreground" href="/#faq">
                FAQ
              </a>
            </li>
            <li>
              <a className="text-muted-foreground transition-colors hover:text-foreground" href="/#contact">
                Contact the coordinator
              </a>
            </li>
            <li>
              <a
                className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
                href="https://sih.gov.in"
                target="_blank"
                rel="noreferrer"
              >
                Official SIH portal <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="shell flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} NMIET Innovation Cell. Built by students, for students.</p>
        <p>Unofficial internal portal — not affiliated with any government body.</p>
      </div>
    </footer>
  );
}
