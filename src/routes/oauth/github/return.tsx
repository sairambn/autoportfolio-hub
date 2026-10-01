import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/oauth/github/return")({
  head: () => ({ meta: [{ title: "Connecting GitHub…" }, { name: "robots", content: "noindex" }] }),
  component: OAuthReturn,
});

function OAuthReturn() {
  const [msg, setMsg] = useState("Finishing connection…");
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const send = (type: string, code?: string) => {
      window.opener?.postMessage({ type, connectorId: "github", code: code ?? null }, window.location.origin);
      window.close();
    };
    if (p.get("success") !== "true") { setMsg(p.get("error") ?? "Connection did not complete."); return send("appUserConnectorOAuthFailed"); }
    const code = p.get("code");
    if (!code) {
      if (p.get("offline_access_allowed") === "false") return send("appUserConnectorOAuthComplete");
      setMsg("Missing code."); return send("appUserConnectorOAuthFailed");
    }
    send("appUserConnectorOAuthComplete", code);
  }, []);
  return <p className="p-10">{msg}</p>;
}
