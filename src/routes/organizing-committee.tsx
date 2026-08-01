import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  FileText,
  Handshake,
  Headphones,
  Mail,
  Megaphone,
  Phone,
  Quote,
  UsersRound,
} from "lucide-react";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/section-heading";
import { facultyCoordinators, responsibilities, studentCommittee } from "@/lib/committee-data";

export const Route = createFileRoute("/organizing-committee")({ component: OrganizingCommittee });

const responsibilityIcons = [
  UsersRound,
  ClipboardCheck,
  Handshake,
  Headphones,
  Megaphone,
  FileText,
  BookOpenCheck,
  Quote,
];

function OrganizingCommittee() {
  return (
    <>
      <section className="relative isolate overflow-hidden pb-18 pt-36 sm:pb-24 sm:pt-44">
        <AmbientBackdrop />
        <div className="shell relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-border bg-card/60 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              NMIET SIH 2026
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.04] sm:text-6xl">
              Meet the Team Behind <span className="text-gradient">NMIET SIH</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              From planning registrations to mentoring teams and organizing internal evaluations,
              this dedicated team ensures the successful execution of Smart India Hackathon at
              NMIET.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-pad relative">
        <div className="shell">
          <SectionHeading
            eyebrow="Guidance & leadership"
            title={
              <>
                Faculty <span className="text-gradient">Coordinators</span>
              </>
            }
            description="The mentors and campus leaders helping ideas become meaningful solutions."
          />
          <StaggerGroup className="mt-12 grid gap-5 md:grid-cols-2">
            {facultyCoordinators.map((member) => (
              <StaggerItem key={member.email}>
                <article className="glass hover-lift flex h-full flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:p-6">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-24 w-24 rounded-2xl object-cover shadow-soft"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                      {member.role}
                    </span>
                    <h3 className="mt-3 text-xl font-semibold">{member.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {member.designation} · {member.department}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <a
                        className="flex items-center gap-2 hover:text-foreground"
                        href={`mailto:${member.email}`}
                      >
                        <Mail className="h-4 w-4 text-primary" />
                        {member.email}
                      </a>
                      {member.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-primary" />
                          {member.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="section-pad relative overflow-hidden">
        <AmbientBackdrop variant="soft" />
        <div className="shell relative">
          <SectionHeading
            eyebrow="Students who make it happen"
            title={
              <>
                Student Organizing <span className="text-gradient">Committee</span>
              </>
            }
            description="A collaborative group making the SIH experience clear, welcoming and memorable."
            align="center"
          />
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {studentCommittee.map((member) => (
              <StaggerItem key={member.name}>
                <article className="glass hover-lift h-full rounded-3xl p-5">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                  <span className="mt-5 inline-flex rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
                    {member.role}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{member.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.year} · {member.department}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="section-pad">
        <div className="shell">
          <SectionHeading
            eyebrow="What we do"
            title={
              <>
                The details behind a <span className="text-gradient">great experience</span>
              </>
            }
            align="center"
          />
          <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {responsibilities.map((responsibility, index) => {
              const Icon = responsibilityIcons[index];
              return (
                <StaggerItem key={responsibility}>
                  <div className="glass hover-lift flex min-h-40 flex-col justify-between rounded-3xl p-5">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-semibold">{responsibility}</h3>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      <section className="pb-24">
        <div className="shell">
          <Reveal>
            <div className="glass-strong relative overflow-hidden rounded-4xl p-8 shadow-lift sm:p-12">
              <AmbientBackdrop variant="soft" />
              <div className="relative mx-auto max-w-3xl text-center">
                <Quote className="mx-auto h-9 w-9 text-primary" />
                <blockquote className="mt-6 font-display text-2xl font-medium leading-relaxed sm:text-3xl">
                  “Great innovations are built by collaborative communities. The Organizing
                  Committee is committed to providing every student the opportunity to showcase
                  their ideas.”
                </blockquote>
                <p className="mt-6 text-sm font-semibold text-muted-foreground">
                  Principal / IIC Head
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal className="mt-10 text-center">
            <p className="text-lg font-medium">Ready to participate?</p>
            <h2 className="mt-2 text-3xl font-semibold">Register your team</h2>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-105"
            >
              Register Now <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
