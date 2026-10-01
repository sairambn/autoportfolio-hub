import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Folio" },
      { name: "description", content: "Sign in or create your Folio account." },
      { property: "og:title", content: "Sign in — Folio" },
      { property: "og:description", content: "Sign in or create your Folio account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/dashboard" }); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) nav({ to: "/dashboard" }); });
    return () => data.subscription.unsubscribe();
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth" } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (mode === "up") setSent(true);
  }

  async function google() {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Google sign-in failed");
  }

  return (
    <div className="grid min-h-screen place-items-center grain px-4">
      <div className="block-card w-full max-w-md p-8">
        <Link to="/" className="font-display text-2xl font-black italic">Folio.</Link>
        <h1 className="mt-6 text-4xl font-black">{mode === "in" ? "Welcome back" : "Create account"}</h1>
        {sent ? (
          <p className="mt-6 text-muted-foreground">Check your email to confirm your account, then come back to sign in.</p>
        ) : (
          <>
            <Button variant="blockOutline" className="mt-6 w-full" onClick={google}>Continue with Google</Button>
            <div className="my-5 text-center text-xs uppercase tracking-widest text-muted-foreground">or</div>
            <form onSubmit={submit} className="space-y-4">
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button variant="block" className="w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Sign up"}</Button>
            </form>
            <button className="mt-5 text-sm underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
