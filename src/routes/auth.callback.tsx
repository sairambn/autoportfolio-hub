import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchGithubUser, saveSession } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing in…" }, { name: "robots", content: "noindex" }],
  }),
  component: Callback,
});

function Callback() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Finishing sign-in…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const token = params.get("token");
    if (err) {
      setMsg(err);
      return;
    }
    if (!token) {
      setMsg("Missing token. Try signing in again.");
      return;
    }
    (async () => {
      try {
        const user = await fetchGithubUser(token);
        saveSession({
          token,
          user,
          expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
        });
        // Clean URL so token isn't left in history
        window.history.replaceState({}, "", "/auth/callback");
        nav({ to: "/dashboard" });
      } catch (e) {
        setMsg(e instanceof Error ? e.message : "Sign-in failed");
      }
    })();
  }, [nav]);

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <p className="text-lg">{msg}</p>
    </div>
  );
}
