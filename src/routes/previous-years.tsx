import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Expand, Lightbulb, Quote, Trophy, Users } from "lucide-react";
import { useState } from "react";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { Counter } from "@/components/motion/counter";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  achievements,
  featuredTeams,
  gallery,
  journey,
  testimonials,
} from "@/lib/previous-years-data";

export const Route = createFileRoute("/previous-years")({ component: PreviousYears });

function PreviousYears() {
  const [selectedImage, setSelectedImage] = useState<(typeof gallery)[number] | null>(null);
  const loopedGallery = [...gallery, ...gallery];
  return (
    <>
      <section className="relative isolate overflow-hidden pb-20 pt-36 sm:pb-28 sm:pt-44">
        <AmbientBackdrop />
        <div className="shell relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-border bg-card/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Our innovation story
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.04] sm:text-6xl">
              NMIET at <span className="text-gradient">Smart India Hackathon</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Celebrating innovation, teamwork and impactful solutions built by NMIET students.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad">
        <div className="shell">
          <SectionHeading
            eyebrow="Journey timeline"
            title={
              <>
                Every year, a new <span className="text-gradient">possibility</span>
              </>
            }
            description="A growing culture of curiosity, collaboration and purposeful problem solving."
          />
          <div className="relative mt-12 max-w-4xl before:absolute before:bottom-0 before:left-4 before:top-0 before:w-px before:bg-gradient-to-b before:from-primary before:via-brand-blue before:to-brand-green sm:before:left-1/2">
            {journey.map((item, index) => (
              <Reveal
                key={item.year}
                delay={index * 0.05}
                className={`relative mb-8 pl-12 sm:ml-[50%] sm:w-1/2 sm:pl-12 ${index % 2 === 0 ? "sm:ml-0 sm:pr-12 sm:pl-0 sm:text-right" : ""}`}
              >
                <span
                  className={`absolute left-[0.45rem] top-6 h-3 w-3 rounded-full bg-primary ring-8 ring-background sm:left-[-0.35rem] ${index % 2 === 0 ? "sm:left-auto sm:right-[-0.4rem]" : ""}`}
                />
                <div className="glass hover-lift rounded-3xl p-6">
                  <span className="font-display text-2xl font-semibold text-primary">
                    {item.year}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad relative overflow-hidden">
        <AmbientBackdrop variant="soft" />
        <div className="shell relative">
          <SectionHeading
            eyebrow="By the numbers"
            title={
              <>
                A legacy of <span className="text-gradient">building together</span>
              </>
            }
            align="center"
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((item) => (
              <Reveal key={item.label}>
                <div className="glass hover-lift rounded-3xl p-6 text-center">
                  <div className="font-display text-4xl font-semibold text-primary">
                    <Counter to={item.value} suffix={item.suffix} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="shell">
          <SectionHeading
            eyebrow="Hall of innovation"
            title={
              <>
                The moments that <span className="text-gradient">made us</span>
              </>
            }
            description="A glimpse into the energy, focus and joy of creating together."
            align="center"
          />
          <div className="mt-12 grid auto-rows-[180px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((image, index) => (
              <button
                key={image.title}
                onClick={() => setSelectedImage(image)}
                className={`group relative overflow-hidden rounded-3xl text-left ${index === 0 || index === 3 ? "sm:row-span-2" : ""}`}
              >
                <img
                  src={image.image}
                  alt={image.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-sm font-semibold text-white">
                  {image.title}
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur">
                    <Expand className="h-4 w-4" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad relative overflow-hidden">
        <AmbientBackdrop variant="soft" />
        <div className="shell relative">
          <SectionHeading
            eyebrow="Featured SIH teams"
            title={
              <>
                Ideas that became <span className="text-gradient">impactful work</span>
              </>
            }
            align="center"
          />
          <StaggerGroup className="mt-12 grid gap-5 lg:grid-cols-3">
            {featuredTeams.map((team) => (
              <StaggerItem key={team.name}>
                <article className="glass hover-lift h-full rounded-3xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                      <Trophy className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {team.year}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{team.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {team.description}
                  </p>
                  <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Problem statement
                      </dt>
                      <dd className="mt-1">{team.problem}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span>{team.theme}</span>
                      <span className="font-medium text-brand-green">{team.achievement}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {team.members}
                    </div>
                  </dl>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="section-pad">
        <div className="shell">
          <SectionHeading
            eyebrow="From our innovators"
            title={
              <>
                Memories that <span className="text-gradient">stay with us</span>
              </>
            }
            align="center"
          />
          <StaggerGroup className="mt-12 grid gap-5 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <StaggerItem key={testimonial.year}>
                <figure className="glass hover-lift h-full rounded-3xl p-6">
                  <Quote className="h-7 w-7 text-primary" />
                  <blockquote className="mt-5 font-display text-xl leading-relaxed">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-6 text-sm text-muted-foreground">
                    <span className="block font-semibold text-foreground">{testimonial.name}</span>
                    {testimonial.year}
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="overflow-hidden pb-24">
        <div className="shell">
          <div className="mb-6 flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">A shared gallery of ideas in motion</p>
          </div>
        </div>
        <div className="flex w-max gap-4 animate-marquee">
          {loopedGallery.map((image, index) => (
            <img
              key={`${image.title}-${index}`}
              src={image.image}
              alt=""
              className="h-48 w-72 rounded-3xl object-cover shadow-soft"
            />
          ))}
        </div>
        <Reveal className="shell mt-16 text-center">
          <p className="text-lg font-medium">Become the next success story.</p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-105"
          >
            Register Now <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
      <Dialog
        open={Boolean(selectedImage)}
        onOpenChange={(open) => !open && setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl overflow-hidden border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{selectedImage?.title}</DialogTitle>
          {selectedImage && (
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-h-[80vh] w-full rounded-3xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
