import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheckBig,
  Download,
  ExternalLink,
  Home,
  Loader2,
  Pencil,
  ShieldCheck,
  Users,
  Venus,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AmbientBackdrop } from "@/components/ambient-backdrop";
import { MagneticButton } from "@/components/motion/magnetic-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitRegistration, themesQuery } from "@/lib/api";
import { departments } from "@/lib/departments";

const title = "Register your team — NMIET SIH Portal";
const description =
  "Submit your NMIET Smart India Hackathon 2026 internal registration with complete team details, member information, an optional faculty mentor, and a final review before submission.";
export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const years = ["First Year", "Second Year", "Third Year", "Final Year", "Post Graduate"];
const divisions = ["A", "B", "C", "D"];
const genders = ["Male", "Female", "Other"] as const;
const DRAFT_KEY = "nmiet-sih-registration-draft";

const personSchema = z.object({
  name: z.string().trim().min(3, "Enter the full name").max(80),
  gender: z.enum(genders, { message: "Select gender" }),
  email: z.string().trim().email("Enter a valid email").max(120),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  department: z.enum(departments, { message: "Select a department" }),
  year: z.string().min(2, "Select the academic year"),
  division: z.string().trim().min(1, "Select the division").max(4),
  roll: z.string().trim().min(1, "Enter the roll number").max(20),
});

const schema = z.object({
    team: z.object({
      teamName: z.string().trim().min(3, "Team name must be at least 3 characters").max(60),
      psTitle: z.string().trim().min(6, "Enter the problem statement title").max(200),
      psId: z.string().trim().min(3, "Enter the problem statement ID").max(40),
      category: z.enum(["Software", "Hardware"], { message: "Choose a category" }),
      theme: z.string().min(2, "Choose a theme"),
    }),
    leader: personSchema,
    members: z.array(personSchema).length(5),
    mentor: z
  .object({
    name: z.string().trim(),
    email: z.string().trim(),
    mobile: z.string().trim(),
    department: z.string().trim(),
  })
  .superRefine((mentor, ctx) => {
    const hasAnyField = Object.values(mentor).some(
      (value) => value && value.trim() !== "",
    );

    // Completely empty mentor section is allowed
    if (!hasAnyField) return;

    if (mentor.name.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Enter the mentor's full name",
      });
    }

    if (!z.string().email().safeParse(mentor.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["email"],
        message: "Enter a valid email",
      });
    }

    if (!/^[6-9]\d{9}$/.test(mentor.mobile)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mobile"],
        message: "Enter a valid 10-digit mobile number",
      });
    }

    if (!departments.includes(mentor.department as any)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["department"],
        message: "Select a department",
      });
    }
  }),
  })
  .superRefine((data, ctx) => {
    const allPeople = [data.leader, ...data.members];
    const hasFemale = allPeople.some((p) => p.gender === "Female");
    if (!hasFemale) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one team member must be female",
        path: ["members", 0, "gender"],
      });
    }
  });

type FormValues = z.infer<typeof schema>;
type Person = z.infer<typeof personSchema>;

const emptyPerson: Person = {
  name: "",
  gender: "" as Person["gender"],
  email: "",
  mobile: "",
  department: "" as Person["department"],
  year: "",
  division: "",
  roll: "",
};

const steps = [
  { label: "Team", hint: "Problem statement & category" },
  { label: "Leader", hint: "Single point of contact" },
  { label: "Members", hint: "Members 2 to 6" },
  { label: "Mentor", hint: "Optional" },
  { label: "Review", hint: "Confirm & submit" },
];

const stepPaths: ("team" | "leader" | "members" | "mentor")[][] = [
  ["team"],
  ["leader"],
  ["members"],
  ["mentor"],
  [],
];

function RegisterPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<{ reference: string; values: FormValues } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: themes } = useQuery(themesQuery);
  console.log("Themes:", themes);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      team: { teamName: "", psTitle: "", psId: "", theme: "" },
      leader: { ...emptyPerson },
      members: [
        { ...emptyPerson },
        { ...emptyPerson },
        { ...emptyPerson },
        { ...emptyPerson },
        { ...emptyPerson },
      ],
      mentor: { name: "", email: "", mobile: "", department: "" as FormValues["mentor"]["department"] },
    } as Partial<FormValues> as FormValues,
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const values = watch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { step?: number; values?: FormValues };
        if (parsed.values) reset(parsed.values);
        if (typeof parsed.step === "number") setStep(Math.min(parsed.step, steps.length - 1));
        toast.message("Draft restored", { description: "Your previous progress was loaded." });
      }
    } catch {
      /* ignore corrupt draft */
    }
    setDraftLoaded(true);
  }, [reset]);

  useEffect(() => {
    if (!draftLoaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, values }));
      } catch {
        /* storage full or unavailable */
      }
    }, 400);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [values, step, draftLoaded]);

  const progressPct = Math.round(((step + 1) / steps.length) * 100);

  const next = async () => {
    const valid = await trigger(stepPaths[step] as never);
    if (!valid) {
      toast.error("Please fix the highlighted fields before continuing");
      return;
    }
    if (step === 2) {
      const allPeople = [values.leader, ...(values.members ?? [])];
      if (!allPeople.some((p) => p.gender === "Female")) {
        toast.error("At least one team member must be female");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goTo = (target: number) => {
    setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: FormValues) => {
    setConfirmOpen(false);
    const res = await submitRegistration(data);
    localStorage.removeItem(DRAFT_KEY);
    setSubmitted({
          reference: res.data.registration_id,
          values: data,
        });
    toast.success("Internal registration recorded");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requestSubmit = useCallback(async () => {
    const valid = await trigger();
    if (!valid) {
      toast.error("Please fix the highlighted fields before submitting");
      return;
    }
    setConfirmOpen(true);
  }, [trigger]);

  if (submitted) {
    return <SuccessScreen reference={submitted.reference} values={submitted.values} />;
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
  Five simple steps. Nothing is submitted until you confirm on the review page. Register a team of 6 NMIET students with at least one female member. Faculty mentor details are optional during registration.
</p>
        </motion.div>

        <Stepper step={step} onSelect={goTo} progressPct={progressPct} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === steps.length - 1) void requestSubmit();
          }}
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
                <Fieldset
                  legend="Team details"
                  hint="Tell us what you're building and where it fits."
                >
                  <Field label="Team name" error={errors.team?.teamName?.message}>
                    <Input placeholder="e.g. Team Aarambh" {...register("team.teamName")} />
                  </Field>
                  <Field label="Problem statement title" error={errors.team?.psTitle?.message}>
                    <Input placeholder="Paste the statement title" {...register("team.psTitle")} />
                  </Field>
                  <Field label="Problem statement ID" error={errors.team?.psId?.message}>
                    <Input placeholder="e.g. SIH26-1042" {...register("team.psId")} />
                  </Field>
                  <Field label="Category" error={errors.team?.category?.message}>
                    <Select
                      value={values.team?.category ?? ""}
                      onValueChange={(v) =>
                        setValue("team.category", v as FormValues["team"]["category"], {
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
                  <Field label="Theme / domain" error={errors.team?.theme?.message}>
                    <Select
                      value={values.team?.theme ?? ""}
                      onValueChange={(v) => setValue("team.theme", v, { shouldValidate: true })}
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
                <PersonFields
                  legend="Team leader"
                  hint="All official communication goes to the leader."
                  prefix="leader"
                  errors={errors.leader}
                  register={register}
                  values={values.leader}
                  setValue={setValue}
                />
              ) : null}

              {step === 2 ? (
                <div className="space-y-12">
                  <Notice />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <PersonFields
                      key={i}
                      legend={`Member ${i + 2}`}
                      hint="Complete details are mandatory for every member."
                      prefix={`members.${i}` as const}
                      errors={errors.members?.[i]}
                      register={register}
                      values={values.members?.[i]}
                      setValue={setValue}
                    />
                  ))}
                </div>
              ) : null}

              {step === 3 ? (
                <Fieldset
                  legend="Faculty mentor"
                  hint="Confirm with your mentor before submitting."
                >
                  <Field label="Full name" error={errors.mentor?.name?.message}>
                    <Input {...register("mentor.name")} />
                  </Field>
                  <Field label="Email address" error={errors.mentor?.email?.message}>
                    <Input type="email" inputMode="email" {...register("mentor.email")} />
                  </Field>
                  <Field label="Mobile number" error={errors.mentor?.mobile?.message}>
                    <Input inputMode="numeric" maxLength={10} {...register("mentor.mobile")} />
                  </Field>
                  <Field label="Department" error={errors.mentor?.department?.message}>
                    <SearchableSelect
                      options={departments}
                      value={values.mentor?.department ?? ""}
                      onValueChange={(v) =>
                        setValue("mentor.department", v as FormValues["mentor"]["department"], {
                          shouldValidate: true,
                        })
                      }
                      placeholder="Select department"
                      searchPlaceholder="Search departments…"
                      aria-label="Mentor department"
                    />
                  </Field>
                </Fieldset>
              ) : null}

              {step === 4 ? <Review values={values} onEdit={goTo} /> : null}
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={back}
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
                {step === 3 ? "Review entry" : "Continue"}{" "}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </MagneticButton>
            ) : (
              <MagneticButton
                type="button"
                onClick={requestSubmit}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground shadow-glow hover:brightness-105 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Submitting…
                  </>
                ) : (
                  <>
                    Confirm &amp; Submit <Check className="h-4 w-4" aria-hidden />
                  </>
                )}
              </MagneticButton>
            )}
          </div>
        </form>

        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent className="rounded-3xl sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm registration?</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to submit <strong>{values.team?.teamName || "your team"}</strong> for
                NMIET&apos;s internal SIH 2026 selection. This action cannot be undone — please
                verify all details on the review page first.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Go back</AlertDialogCancel>
              <AlertDialogAction
                disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  void handleSubmit(onSubmit)();
                }}
                className="bg-primary text-primary-foreground hover:brightness-105"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> Submitting…
                  </>
                ) : (
                  "Yes, submit registration"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function Notice() {
  return (
    <div className="flex gap-3 rounded-3xl border border-brand-green/30 bg-brand-green/10 p-5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-green/20 text-brand-green">
        <Venus className="h-5 w-5" aria-hidden />
      </span>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Your team must have <strong className="text-foreground">exactly 6 members</strong> including
        the leader, with <strong className="text-foreground">at least one female member</strong>, and
        all members must belong to the same college.
      </p>
    </div>
  );
}

type RegisterFn = ReturnType<typeof useForm<FormValues>>["register"];
type SetValueFn = ReturnType<typeof useForm<FormValues>>["setValue"];

function PersonFields({
  legend,
  hint,
  prefix,
  errors,
  register,
  values,
  setValue,
}: {
  legend: string;
  hint: string;
  prefix: "leader" | `members.${number}`;
  errors: FieldErrors<Person> | undefined;
  register: RegisterFn;
  values: Partial<Person> | undefined;
  setValue: SetValueFn;
}) {
  const path = (key: keyof Person) => `${prefix}.${key}` as const;

  return (
    <Fieldset legend={legend} hint={hint}>
      <Field label="Full name" error={errors?.name?.message}>
        <Input autoComplete="name" {...register(path("name") as never)} />
      </Field>
      <Field label="Gender" error={errors?.gender?.message}>
        <Select
          value={values?.gender ?? ""}
          onValueChange={(v) =>
            setValue(path("gender") as never, v as never, { shouldValidate: true })
          }
        >
          <SelectTrigger aria-label={`${legend} gender`}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            {genders.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Email address" error={errors?.email?.message}>
        <Input type="email" inputMode="email" autoComplete="email" {...register(path("email") as never)} />
      </Field>
      <Field label="Mobile number" error={errors?.mobile?.message}>
        <Input inputMode="numeric" maxLength={10} autoComplete="tel" {...register(path("mobile") as never)} />
      </Field>
      <Field label="Department" error={errors?.department?.message}>
        <SearchableSelect
          options={departments}
          value={values?.department ?? ""}
          onValueChange={(v) =>
            setValue(path("department") as never, v as never, { shouldValidate: true })
          }
          placeholder="Select department"
          searchPlaceholder="Search departments…"
          aria-label={`${legend} department`}
        />
      </Field>
      <Field label="Academic year" error={errors?.year?.message}>
        <Select
          value={values?.year ?? ""}
          onValueChange={(v) => setValue(path("year") as never, v as never, { shouldValidate: true })}
        >
          <SelectTrigger aria-label={`${legend} academic year`}>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Division" error={errors?.division?.message}>
        <Select
          value={values?.division ?? ""}
          onValueChange={(v) =>
            setValue(path("division") as never, v as never, { shouldValidate: true })
          }
        >
          <SelectTrigger aria-label={`${legend} division`}>
            <SelectValue placeholder="Select division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Roll number" error={errors?.roll?.message}>
        <Input {...register(path("roll") as never)} />
      </Field>
    </Fieldset>
  );
}

function Stepper({
  step,
  onSelect,
  progressPct,
}: {
  step: number;
  onSelect: (i: number) => void;
  progressPct: number;
}) {
  return (
    <div className="mt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Step <span className="font-semibold text-foreground">{step + 1}</span> of{" "}
          <span className="font-semibold text-foreground">{steps.length}</span>
          {step > 0 ? (
            <span className="ml-2 text-brand-green">
              · {step} step{step === 1 ? "" : "s"} completed
            </span>
          ) : null}
        </p>
        <p className="text-sm font-semibold text-primary">{progressPct}%</p>
      </div>
      <Progress value={progressPct} className="mb-8 h-1.5" aria-label="Registration progress" />
      <ol className="grid gap-2 sm:grid-cols-5" aria-label="Registration progress">
      {steps.map((s, i) => {
        const state = i < step ? "done" : i === step ? "current" : "upcoming";
        return (
          <li key={s.label} className="min-w-0">
            <button
              type="button"
              onClick={() => (i <= step ? onSelect(i) : undefined)}
              disabled={i > step}
              aria-current={state === "current" ? "step" : undefined}
              className="flex w-full items-center gap-2 text-left disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            >
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
              <span className="block min-w-0 truncate text-sm font-medium">{s.label}</span>
            </button>
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
    </div>
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

function personRows(p: Partial<Person> | undefined): [string, string | undefined][] {
  return [
    ["Name", p?.name],
    ["Gender", p?.gender],
    ["Email", p?.email],
    ["Mobile", p?.mobile],
    ["Department", p?.department],
    ["Year", p?.year],
    ["Division", p?.division],
    ["Roll number", p?.roll],
  ];
}

type ReviewGroup = {
  title: string;
  step: number;
  rows: [string, string | undefined][];
  subsections?: { title: string; rows: [string, string | undefined][] }[];
};

function reviewGroups(values: Partial<FormValues>): ReviewGroup[] {
  const memberSubsections =
    values.members?.map((m, i) => ({
      title: `Member ${i + 2}`,
      rows: personRows(m),
    })) ?? [];

  return [
    {
      title: "Team details",
      step: 0,
      rows: [
        ["Team name", values.team?.teamName],
        ["Problem statement", values.team?.psTitle],
        ["PS ID", values.team?.psId],
        ["Category", values.team?.category],
        ["Theme", values.team?.theme],
      ],
    },
    { title: "Team leader", step: 1, rows: personRows(values.leader) },
    {
      title: "Members",
      step: 2,
      rows: [],
      subsections: memberSubsections,
    },
    {
      title: "Faculty mentor",
      step: 3,
      rows: [
        ["Name", values.mentor?.name],
        ["Email", values.mentor?.email],
        ["Mobile", values.mentor?.mobile],
        ["Department", values.mentor?.department],
      ],
    },
  ];
}

function Review({
  values,
  onEdit,
}: {
  values: Partial<FormValues>;
  onEdit: (step: number) => void;
}) {
  const groups = reviewGroups(values);

  return (
    <div>
      <h2 className="font-display text-xl font-semibold">Review &amp; confirmation</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Nothing has been submitted yet. Verify every detail — edit any section, then confirm.
      </p>

      <div className="mt-6 flex gap-3 rounded-3xl border border-border bg-accent/40 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
        <p className="text-sm leading-relaxed text-muted-foreground">
  Confirm your team has exactly 6 NMIET student members, including at least one female member. Faculty mentor details are optional during registration.
</p>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {groups.map((g, i) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i, 6) * 0.05 }}
            className={`rounded-3xl border border-border bg-card p-5 shadow-soft ${g.subsections?.length ? "sm:col-span-2" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {g.title}
              </h3>
              <button
                type="button"
                onClick={() => onEdit(g.step)}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[0.7rem] font-medium transition-colors hover:bg-accent"
              >
                <Pencil className="h-3 w-3" aria-hidden /> Edit
              </button>
            </div>
            <dl className="mt-4 space-y-3">
              {g.rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3">
                  <dt className="truncate text-xs text-muted-foreground">{label}</dt>
                  <dd className="min-w-0 break-words text-sm font-medium">{value || "—"}</dd>
                </div>
              ))}
              {g.subsections?.map((sub) => (
                <div key={sub.title} className="border-t border-border pt-3">
                  <p className="mb-2 text-xs font-semibold text-foreground">{sub.title}</p>
                  {sub.rows.map(([label, value]) => (
                    <div
                      key={`${sub.title}-${label}`}
                      className="mb-2 grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3 last:mb-0"
                    >
                      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
                      <dd className="min-w-0 break-words text-sm font-medium">{value || "—"}</dd>
                    </div>
                  ))}
                </div>
              ))}
            </dl>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ reference, values }: { reference: string; values: FormValues }) {
  const groups = reviewGroups(values);

  const download = () => {
    const lines = [
      "NMIET SIH Portal — Internal Registration Summary",
      `Reference number: ${reference}`,
      "",
      ...groups.flatMap((g) => [
        g.title.toUpperCase(),
        ...g.rows.map(([label, value]) => `  ${label}: ${value || "-"}`),
        ...(g.subsections?.flatMap((sub) => [
          `  ${sub.title}`,
          ...sub.rows.map(([label, value]) => `    ${label}: ${value || "-"}`),
        ]) ?? []),
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reference}-summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded (placeholder file)");
  };

  return (
    <div className="relative overflow-hidden pb-28 pt-32 lg:pt-40">
      <AmbientBackdrop className="-z-10" />
      <div className="shell max-w-3xl text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
          className="relative mx-auto grid h-28 w-28 place-items-center rounded-full bg-brand-green/15 text-brand-green shadow-soft"
        >
          <motion.span
            aria-hidden
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-brand-green/25"
          />
          <CircleCheckBig className="h-12 w-12" aria-hidden />
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
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {values.team.teamName} is on the internal shortlist queue. Keep the reference number handy
          for all follow-ups with the coordinator.
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

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          {groups.map((g) => (
            <div key={g.title} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {g.title}
              </h2>
              <dl className="mt-4 space-y-2.5">
                {g.rows.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3">
                    <dt className="truncate text-xs text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 break-words text-sm font-medium">{value || "—"}</dd>
                  </div>
                ))}
                {g.subsections?.map((sub) => (
                  <div key={sub.title} className="border-t border-border pt-2">
                    <p className="mb-1.5 text-xs font-semibold">{sub.title}</p>
                    {sub.rows.map(([label, value]) => (
                      <div
                        key={`${sub.title}-${label}`}
                        className="mb-1.5 grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-3"
                      >
                        <dt className="truncate text-xs text-muted-foreground">{label}</dt>
                        <dd className="min-w-0 break-words text-sm font-medium">{value || "—"}</dd>
                      </div>
                    ))}
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <MagneticButton
            type="button"
            onClick={download}
            className="border border-border bg-card/70 px-6 py-3.5 text-foreground hover:bg-accent"
          >
            <Download className="h-4 w-4" aria-hidden /> Download summary
          </MagneticButton>
          <a href="https://sih.gov.in" target="_blank" rel="noreferrer">
            <MagneticButton className="bg-primary px-6 py-3.5 text-primary-foreground shadow-glow hover:brightness-105">
              Proceed to official SIH registration{" "}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </MagneticButton>
          </a>
          <Link to="/">
            <MagneticButton className="border border-border bg-card/70 px-6 py-3.5 text-foreground hover:bg-accent">
              <Home className="h-4 w-4" aria-hidden /> Return home
            </MagneticButton>
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          Demo mode: nothing was stored. Connect a backend to persist entries.
        </p>
      </div>
    </div>
  );
}
