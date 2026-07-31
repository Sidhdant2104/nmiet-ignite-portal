import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheckBig,
  ExternalLink,
  Loader2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitRegistration } from "@/lib/api";
import { themesQuery } from "@/lib/api";

const title = "Register your team — NMIET SIH Portal";
const description =
  "Submit your NMIET internal Smart India Hackathon 2026 entry: team details, problem statement, members and faculty mentor.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegisterPage,
});

const mobile = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");
const name = z.string().min(3, "Enter the full name");

const schema = z.object({
  teamName: z.string().min(3, "Team name must be at least 3 characters"),
  psTitle: z.string().min(6, "Enter the problem statement title"),
  psId: z.string().min(4, "Enter the problem statement ID"),
  category: z.enum(["Software", "Hardware"], { message: "Choose a category" }),
  theme: z.string().min(2, "Choose a theme"),

  leaderName: name,
  leaderEmail: z.string().email("Enter a valid email"),
  leaderMobile: mobile,

  member2Name: name,
  member2Email: z.string().email("Enter a valid email"),
  member2Mobile: mobile,
  member3Name: name,
  member4Name: name,
  member5Name: name,
  member6Name: name,

  mentorName: name,
  mentorEmail: z.string().email("Enter a valid email"),
  mentorMobile: mobile,
});

type FormValues = z.infer<typeof schema>;

const stepFields: (keyof FormValues)[][] = [
  ["teamName", "psTitle", "psId", "category", "theme"],
  ["leaderName", "leaderEmail", "leaderMobile"],
  [
    "member2Name",
    "member2Email",
    "member2Mobile",
    "member3Name",
    "member4Name",
    "member5Name",
    "member6Name",
  ],
  ["mentorName", "mentorEmail", "mentorMobile"],
  [],
];

const steps = [
  { label: "Team", hint: "Problem statement & category" },
  { label: "Leader", hint: "Single point of contact" },
  { label: "Members", hint: "Five more students" },
  { label: "Mentor", hint: "Faculty guide" },
  { label: "Review", hint: "Confirm & submit" },
];

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [reference, setReference] = useState<string | null>(null);
  const { data: themes } = useQuery(themesQuery);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      teamName: "",
      psTitle: "",
      psId: "",
      theme: "",
      leaderName: "",
      leaderEmail: "",
      leaderMobile: "",
      member2Name: "",
      member2Email: "",
      member2Mobile: "",
      member3Name: "",
      member4Name: "",
      member5Name: "",
      member6Name: "",
      mentorName: "",
      mentorEmail: "",
      mentorMobile: "",
    } as Partial<FormValues> as FormValues,
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const values = watch();

  const next = async () => {
    const valid = await trigger(stepFields[step]);
    if (!valid) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onSubmit = async (data: FormValues) => {
    const res = await submitRegistration(data);
    setReference(res.reference);
    toast.success("Internal registration recorded");
  };

  if (reference) {
    return <SuccessScreen reference={reference} teamName={values.teamName} />;
  }

  return (
    <div className="relative overflow-hidden pb-28 pt-32 lg:pt-40">
      <AmbientBackdrop variant="soft" className="-z-10" />
      <div className="shell max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Users className="h-3.5 w-3.5 text-primary" aria-hidden /> Internal SIH 2026 entry
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl">
            Register your <span className="text-gradient">team</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Five short steps. Nothing is submitted to the national portal from here — this is
            NMIET&apos;s internal selection entry.
          </p>
        </motion.div>

        <Stepper step={step} />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass mt-8 rounded-4xl p-6 shadow-lift sm:p-9"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 ? (
                <Fieldset legend="Team details" hint="Tell us what you're building and where it fits.">
                  <Field label="Team name" error={errors.teamName?.message}>
                    <Input placeholder="e.g. Team Aarambh" {...register("teamName")} />
                  </Field>
                  <Field label="Problem statement title" error={errors.psTitle?.message}>
                    <Input
                      placeholder="Paste the statement title"
                      {...register("psTitle")}
                    />
                  </Field>
                  <Field label="Problem statement ID" error={errors.psId?.message}>
                    <Input placeholder="e.g. SIH26-1042" {...register("psId")} />
                  </Field>
                  <Field label="Category" error={errors.category?.message}>
                    <Select
                      value={values.category ?? ""}
                      onValueChange={(v) =>
                        setValue("category", v as FormValues["category"], {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger aria-label="Category">
                        <SelectValue placeholder="Software or Hardware" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Theme / domain" error={errors.theme?.message}>
                    <Select
                      value={values.theme}
                      onValueChange={(v) => setValue("theme", v, { shouldValidate: true })}
                    >
                      <SelectTrigger aria-label="Theme">
                        <SelectValue placeholder="Choose a theme" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {(themes ?? []).map((t) => (
                          <SelectItem key={t.id} value={t.name}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </Fieldset>
              ) : null}

              {step === 1 ? (
                <Fieldset legend="Team leader" hint="All official communication goes here.">
                  <Field label="Leader name" error={errors.leaderName?.message}>
                    <Input {...register("leaderName")} />
                  </Field>
                  <Field label="Leader email" error={errors.leaderEmail?.message}>
                    <Input type="email" inputMode="email" {...register("leaderEmail")} />
                  </Field>
                  <Field label="Leader mobile" error={errors.leaderMobile?.message}>
                    <Input inputMode="numeric" maxLength={10} {...register("leaderMobile")} />
                  </Field>
                </Fieldset>
              ) : null}

              {step === 2 ? (
                <Fieldset legend="Team members" hint="Five members besides the leader.">
                  <Field label="Member 2 name" error={errors.member2Name?.message}>
                    <Input {...register("member2Name")} />
                  </Field>
                  <Field label="Member 2 email" error={errors.member2Email?.message}>
                    <Input type="email" inputMode="email" {...register("member2Email")} />
                  </Field>
                  <Field label="Member 2 mobile" error={errors.member2Mobile?.message}>
                    <Input inputMode="numeric" maxLength={10} {...register("member2Mobile")} />
                  </Field>
                  <Field label="Member 3 name" error={errors.member3Name?.message}>
                    <Input {...register("member3Name")} />
                  </Field>
                  <Field label="Member 4 name" error={errors.member4Name?.message}>
                    <Input {...register("member4Name")} />
                  </Field>
                  <Field label="Member 5 name" error={errors.member5Name?.message}>
                    <Input {...register("member5Name")} />
                  </Field>
                  <Field label="Member 6 name" error={errors.member6Name?.message}>
                    <Input {...register("member6Name")} />
                  </Field>
                </Fieldset>
              ) : null}

              {step === 3 ? (
                <Fieldset legend="Faculty mentor" hint="Confirm with your mentor before submitting.">
                  <Field label="Faculty mentor name" error={errors.mentorName?.message}>
                    <Input {...register("mentorName")} />
                  </Field>
                  <Field label="Faculty mentor email" error={errors.mentorEmail?.message}>
                    <Input type="email" inputMode="email" {...register("mentorEmail")} />
                  </Field>
                  <Field label="Faculty mentor mobile" error={errors.mentorMobile?.message}>
                    <Input inputMode="numeric" maxLength={10} {...register("mentorMobile")} />
                  </Field>
                </Fieldset>
              ) : null}

              {step === 4 ? <Review values={values} /> : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </button>

            {step < steps.length - 1 ? (
              <MagneticButton
                type="button"
                onClick={next}
                className="bg-primary text-primary-foreground shadow-glow hover:brightness-105"
              >
                Continue <ArrowRight className="h-4 w-4" aria-hidden />
              </MagneticButton>
            ) : (
              <MagneticButton
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground shadow-glow hover:brightness-105 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Submitting
                  </>
                ) : (
                  <>
                    Submit registration <Check className="h-4 w-4" aria-hidden />
                  </>
                )}
              </MagneticButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mt-12 grid gap-2 sm:grid-cols-5" aria-label="Registration progress">
      {steps.map((s, i) => {
        const state = i < step ? "done" : i === step ? "current" : "upcoming";
        return (
          <li key={s.label} className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors ${
                  state === "done"
                    ? "bg-brand-green text-primary-foreground"
                    : state === "current"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground"
                }`}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{s.label}</span>
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
              <motion.div
                className="h-full bg-primary"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 hidden text-xs text-muted-foreground sm:block">{s.hint}</p>
          </li>
        );
      })}
    </ol>
  );
}

function Fieldset({
  legend,
  hint,
  children,
}: {
  legend: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="font-display text-xl font-semibold">{legend}</legend>
      <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="block text-sm font-medium">
        {label}
        <div className="mt-2 [&_button]:h-11 [&_button]:rounded-2xl [&_input]:h-11 [&_input]:rounded-2xl">
          {children}
        </div>
      </label>
      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs font-medium text-destructive"
          role="alert"
        >
          {error}
        </motion.p>
      ) : null}
    </div>
  );
}

function Review({ values }: { values: Partial<FormValues> }) {
  const groups = [
    {
      title: "Team",
      rows: [
        ["Team name", values.teamName],
        ["Problem statement", values.psTitle],
        ["PS ID", values.psId],
        ["Category", values.category],
        ["Theme", values.theme],
      ],
    },
    {
      title: "Team leader",
      rows: [
        ["Name", values.leaderName],
        ["Email", values.leaderEmail],
        ["Mobile", values.leaderMobile],
      ],
    },
    {
      title: "Members",
      rows: [
        ["Member 2", `${values.member2Name ?? ""} · ${values.member2Email ?? ""}`],
        ["Member 3", values.member3Name],
        ["Member 4", values.member4Name],
        ["Member 5", values.member5Name],
        ["Member 6", values.member6Name],
      ],
    },
    {
      title: "Faculty mentor",
      rows: [
        ["Name", values.mentorName],
        ["Email", values.mentorEmail],
        ["Mobile", values.mentorMobile],
      ],
    },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Review your entry</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Check every detail — the coordinator uses exactly this data for nomination.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {groups.map((g, i) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="rounded-3xl border border-border bg-card p-5 shadow-soft"
          >
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {g.title}
            </h3>
            <dl className="mt-4 space-y-3">
              {g.rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3">
                  <dt className="truncate text-xs text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-words text-sm font-medium">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ reference, teamName }: { reference: string; teamName?: string }) {
  return (
    <div className="relative flex min-h-[80dvh] items-center overflow-hidden pb-24 pt-32">
      <AmbientBackdrop className="-z-10" />
      <div className="shell max-w-2xl text-center">
        <motion.span
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-green/15 text-brand-green shadow-soft"
        >
          <CircleCheckBig className="h-9 w-9" aria-hidden />
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 text-4xl font-semibold sm:text-5xl"
        >
          Registration <span className="text-gradient">successful</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {teamName ? `${teamName} is` : "Your team is"} on the internal shortlist queue. Keep the
          reference number handy for all follow-ups with the coordinator.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass mx-auto mt-9 inline-flex flex-col items-center rounded-3xl px-8 py-6 shadow-lift"
        >
          <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Reference number
          </span>
          <span className="mt-2 font-mono text-2xl font-semibold">{reference}</span>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="https://sih.gov.in" target="_blank" rel="noreferrer">
            <MagneticButton className="bg-primary px-7 py-3.5 text-primary-foreground shadow-glow hover:brightness-105">
              Proceed to Official SIH Portal <ExternalLink className="h-4 w-4" aria-hidden />
            </MagneticButton>
          </a>
          <a href="/">
            <MagneticButton className="border border-border bg-card/70 px-7 py-3.5 text-foreground hover:bg-accent">
              Back to home
            </MagneticButton>
          </a>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Demo mode: nothing was stored. Connect a backend to persist entries.
        </p>
      </div>
    </div>
  );
}
