import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { useAccount } from "@/components/AccountProvider";
import { loginSchema, signUpSchema } from "@/lib/account-validation";

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const navigate = useNavigate();
  const { user, ready } = useAccount();
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (ready && user) {
      const to = sessionStorage.getItem("swell-do-return") === "/offer" ? "/offer" : "/post";
      sessionStorage.removeItem("swell-do-return");
      void navigate({ to, replace: true });
    }
  }, [ready, user, navigate]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFailure("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = signup ? signUpSchema.safeParse(values) : loginSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next); return;
    }
    setErrors({}); setBusy(true);
    try {
      if (signup) {
        const data = signUpSchema.parse(values);
        const result = await supabase.auth.signUp({ email: data.email, password: data.password, options: {
          data: { display_name: data.display_name }, emailRedirectTo: `${window.location.origin}/auth`,
        } });
        if (result.error) {
          if (result.error.message.includes("email address is not allowed")) {
            setErrors({ email: "Use a real email address you can receive mail at, not a placeholder or mistyped domain." });
            return;
          }
          throw result.error;
        }
        if (!result.data.session) setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) { setFailure("Couldn't log in. Check your email and password, and confirm your email first."); return; }
      }
    } catch { setFailure("Couldn't create your account. Check your details or try again later."); }
    finally { setBusy(false); }
  }
  async function social(provider: "google" | "lovable") {
    setBusy(true); setFailure("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setFailure("Sign-in didn't finish. Please try again.");
      if (result.redirected) return;
    } catch { setFailure("Sign-in didn't finish. Please try again."); }
    finally { setBusy(false); }
  }
  const field = "w-full rounded-md border bg-background px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  function error(key: string) { return errors[key] ? <span id={`${key}-error`} className="mt-1 block text-sm text-destructive" role="alert">{errors[key]}</span> : null; }
  return <main className="min-h-screen px-6 py-8 sm:py-12">
    <div className="mx-auto max-w-md">
      <Button asChild variant="link" className="px-0"><Link to="/"><ArrowLeft /> Back to tasks</Link></Button>
      <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-card)]" style={{ background: "var(--gradient-sea)" }}>
        <ShieldCheck className="h-7 w-7" />
      </div>
      <p className="mt-5 font-display text-xl font-bold text-primary">swell do</p>
      <h1 className="mt-2 font-display text-4xl font-bold">{sent ? "Check your email" : signup ? "Join the community" : "Welcome back"}</h1>
      <p className="mt-3 text-muted-foreground">{sent ? "Open the confirmation link we sent to activate your account. Then log in to post a task." : signup ? "A name, a confirmed email, and a place in the island community." : "Log in to post your next quick task."}</p>
      {sent ? <Button asChild className="mt-6"><Link to="/auth"><Mail /> Go to login</Link></Button> : <>
        <form onSubmit={submit} noValidate className="mt-7 space-y-5 rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
          {signup && <label className="block text-sm font-semibold">Display name<input name="display_name" autoComplete="name" maxLength={80} className={`${field} mt-2`} placeholder="e.g. Jr Escosura" aria-invalid={!!errors['display_name']} aria-describedby={errors['display_name'] ? "display_name-error" : undefined} />{error("display_name")}</label>}
          <label className="block text-sm font-semibold">Email<input name="email" type="email" autoComplete="email" maxLength={254} className={`${field} mt-2`} placeholder="you@example.com" aria-invalid={!!errors['email']} aria-describedby={errors['email'] ? "email-error" : undefined} />{error("email")}</label>
          <label className="block text-sm font-semibold">Password<div className="relative mt-2"><input name="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} maxLength={128} className={`${field} pr-12`} aria-invalid={!!errors['password']} /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</Button></div>{error("password")}</label>
          {signup && <label className="block text-sm font-semibold">Confirm password<input name="confirm_password" type={visible ? "text" : "password"} autoComplete="new-password" maxLength={128} className={`${field} mt-2`} aria-invalid={!!errors['confirm_password']} />{error("confirm_password")}</label>}
          {failure && <p role="alert" className="text-sm text-destructive">{failure}</p>}
          <Button disabled={busy} className="h-12 w-full" type="submit">{busy ? "Please wait…" : signup ? "Create account" : "Log in"}</Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
        <div className="space-y-3"><Button variant="outline" className="h-11 w-full" disabled={busy} onClick={() => social("google")}>Continue with Google</Button><Button className="lovable-auth-button w-full" disabled={busy} onClick={() => social("lovable")}>Continue with Lovable</Button></div>
        <p className="mt-6 text-center text-sm">{signup ? "Already have an account? " : "New to the community? "}<Link to={signup ? "/auth" : "/signup"} className="font-bold text-primary underline">{signup ? "Log in" : "Sign up"}</Link></p>
      </>}
    </div>
  </main>;
}