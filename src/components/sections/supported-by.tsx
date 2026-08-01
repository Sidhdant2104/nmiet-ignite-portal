import { motion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";

const partners = [
  { name: "NMIET", logo: "/logos/nmiet-logo.png", href: "https://www.nmiet.edu.in" },
  { name: "Innovation & Incubation Cell", logo: "/logos/IIC.png" },
  { name: "Smart India Hackathon", logo: "/logos/SIH.png", href: "https://sih.gov.in" },
  { name: "Ministry of Education", logo: "/logos/MOE.png", href: "https://www.education.gov.in" },
  { name: "NMVPM", logo: "/logos/nmpvp.png" },
];

export function SupportedBySection() {
  return (
    <div aria-label="Supported by" className="border-b border-border/60 pb-10 pt-2">
      <Reveal>
        <p className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Supported by
        </p>
      </Reveal>

      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          {partners.map((partner, i) => (
            <motion.li
              key={partner.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              {partner.href ? (
                <a
                  href={partner.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block opacity-100 transition-all duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  aria-label={partner.name}
                >
                  <img
                    src={partner.logo}
                    alt=""
                    className="h-8 w-auto max-w-[7.5rem] text-foreground dark:invert-[0.15] sm:h-9 sm:max-w-[8.5rem]"
                  />
                </a>
              ) : (
                <span className="block opacity-100">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-8 w-auto max-w-[7.5rem] text-foreground dark:invert-[0.15] sm:h-9 sm:max-w-[8.5rem]"
                  />
                </span>
              )}
            </motion.li>
          ))}
        </ul>
    </div>
  );
}
