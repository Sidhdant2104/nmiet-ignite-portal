import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FileUp, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { pptApi, type PptSession } from "@/lib/ppt-api";

export const Route = createFileRoute("/ppt-submission")({ component: PptSubmission });
function PptSubmission() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [session, setSession] = useState<PptSession | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [done, setDone] = useState<{ version: number; uploaded_at: string } | null>(null);

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      setSession(await pptApi.verify(reference, email));
      toast.success("Registration verified");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const upload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !file) return;
    if (file.size > 25 * 1024 * 1024) return toast.error("File must be 25 MB or smaller.");
    if (!/\.(ppt|pptx|pdf)$/i.test(file.name))
      return toast.error("Upload a .ppt, .pptx or .pdf file.");

    setBusy(true);
    setUploadProgress(0);
    try {
      const result = await pptApi.upload(file, session.token, { onProgress: setUploadProgress });
      setDone(result);
      toast.success("PPT submitted successfully");
    } catch {
      toast.error("PPT submission failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const fileSize = file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : null;

  return (
    <div className="mesh-bg min-h-dvh pt-28 pb-16">
      <section className="shell max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
          Secure submission
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Upload your SIH PPT</h1>
        <p className="mt-3 text-muted-foreground">
          Verify your registration, then submit your presentation. Re-uploads are recorded as a new
          version until the published deadline.
        </p>
        {done ? (
          <div className="mt-8 rounded-3xl border bg-card p-8 shadow-lift">
            <CheckCircle2 className="text-emerald-600" size={42} />
            <h2 className="mt-4 text-2xl font-bold">PPT submitted successfully</h2>
            <p className="mt-2 text-muted-foreground">
              Version {done.version} received. Your presentation was uploaded{" "}
              {new Date(done.uploaded_at).toLocaleString()}. Email confirmation will arrive
              separately.
            </p>
            <Button
              className="mt-6"
              onClick={() => {
                setDone(null);
                setFile(null);
              }}
            >
              Upload another version
            </Button>
          </div>
        ) : !session ? (
          <form onSubmit={verify} className="mt-8 rounded-3xl border bg-card p-6 shadow-lift">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" />
              <h2 className="font-display text-xl font-bold">Verify your team</h2>
            </div>
            <Input
              className="mt-5"
              placeholder="Reference ID (e.g. SIH2026-0001)"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              required
            />
            <Input
              className="mt-3"
              type="email"
              placeholder="Leader email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button className="mt-5" disabled={busy}>
              {busy ? "Verifying…" : "Verify registration"}
            </Button>
          </form>
        ) : (
          <form onSubmit={upload} className="mt-8 rounded-3xl border bg-card p-6 shadow-lift">
            <div className="rounded-2xl bg-muted p-4 text-sm">
              <b>{session.team_name}</b>
              <span className="mt-1 block text-muted-foreground">
                {session.reference_id} · {session.ps_id} · {session.theme}
              </span>
            </div>
            <label className="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed p-8 text-center hover:bg-accent">
              <FileUp className="text-primary" />
              <span className="mt-3 font-semibold">{file ? file.name : "Choose PPT or PDF"}</span>
              <span className="mt-1 text-xs text-muted-foreground">
                {fileSize ? `${fileSize} · ` : ""}.ppt, .pptx or .pdf · maximum 25 MB
              </span>
              <input
                className="sr-only"
                type="file"
                accept=".ppt,.pptx,.pdf,application/pdf"
                disabled={busy}
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                required
              />
            </label>
            {busy && file ? (
              <div className="mt-5" aria-live="polite">
                <div className="flex justify-between text-sm font-medium">
                  <span>Uploading presentation…</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress
                  className="mt-2 h-2"
                  value={uploadProgress}
                  aria-label="PPT upload progress"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {file.name} · {fileSize}
                </p>
              </div>
            ) : null}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button disabled={!file || busy}>{busy ? "Uploading PPT…" : "Submit PPT"}</Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setSession(null)}
              >
                Use another team
              </Button>
            </div>
          </form>
        )}
        <p className="mt-6 text-sm text-muted-foreground">
          Need help? Read the{" "}
          <Link className="font-semibold text-primary" to="/submission-guidelines">
            submission guidelines
          </Link>{" "}
          or download the{" "}
          <Link className="font-semibold text-primary" to="/ppt-template">
            official template
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
