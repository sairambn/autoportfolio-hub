import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchGithubUser, fetchGoogleUser, saveSession, type AuthProvider } from "@/lib/auth";

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
    const provider = (params.get("provider") || "github") as AuthProvider;

    if (err) {
      setMsg(decodeURIComponent(err));
      return;
    }
    if (!token) {
      setMsg("Missing token. Try signing in again.");
      return;
    }

    (async () => {
      try {
        if (provider === "google") {
          const user = await fetchGoogleUser(token);
          saveSession({
            token,
            user,
            provider: "google",
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
          });
        } else {
          const user = await fetchGithubUser(token);
          saveSession({
            token,
            user,
            provider: "github",
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
          });
        }
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
