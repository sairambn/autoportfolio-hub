import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  KeyRound,
  AlertTriangle,
  Image,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help & Troubleshooting — Folio" },
      {
        name: "description",
        content:
          "Help, troubleshooting, GitHub token setup, and Pages deployment guidance for Folio.",
      },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen grain px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Nav header */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Back to Folio
          </Link>
          <span className="font-display text-xl font-black italic">Folio.</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
            <HelpCircle className="size-3.5" /> Campus Lab & Workshop Guide
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Help & FAQs</h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Fast answers to common questions during your campus portfolio lab or placement
            preparation.
          </p>
        </div>

        {/* 1. GitHub Token Setup */}
        <section className="block-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <h2 className="text-xl font-bold">How to make a GitHub Personal Access Token</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            If GitHub OAuth is not configured or blocked on your network, use a classic token with{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-semibold">
              public_repo
            </code>{" "}
            scope. Takes 60 seconds:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-foreground/90">
            <li>
              Log into GitHub and click your profile picture (top right) → <strong>Settings</strong>
              .
            </li>
            <li>
              Scroll to the bottom of the left sidebar and click <strong>Developer settings</strong>{" "}
              → <strong>Personal access tokens</strong> → <strong>Tokens (classic)</strong>.
            </li>
            <li>
              Click <strong>Generate new token</strong> →{" "}
              <strong>Generate new token (classic)</strong>.
            </li>
            <li>
              Note: type <strong className="font-mono">Folio</strong>. Expiration: choose{" "}
              <strong>7 days</strong>.
            </li>
            <li>
              Check the box for <strong className="font-mono text-primary">public_repo</strong>{" "}
              (access public repositories).
            </li>
            <li>
              Scroll to the bottom and click green <strong>Generate token</strong>.
            </li>
            <li>
              Copy the green token string (<code className="font-mono text-xs">ghp_...</code>) and
              paste it into Folio.
            </li>
          </ol>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
            ⚠️ <strong>Never share or screenshot your token:</strong> Treat it like a password.
            Folio keeps it in this browser tab only (
            <code className="font-mono">sessionStorage</code>) and never logs or stores it on any
            backend.
          </div>
          <a
            href="https://github.com/settings/tokens/new?scopes=public_repo,read:user,user:email&description=Folio%20Portfolio%20Publisher"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary underline hover:text-primary/80"
          >
            Direct shortcut to GitHub Token Generator <ExternalLink className="size-3" />
          </a>
        </section>

        {/* 2. My site shows 404 */}
        <section className="block-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <AlertTriangle className="size-5" />
            </div>
            <h2 className="text-xl font-bold">My live site shows a 404 error</h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>
              GitHub Pages usually takes <strong>1 to 2 minutes</strong> to finish its initial build
              on a brand-new repository. If you see a 404:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-foreground/90">
              <li>
                <strong>Wait 90 seconds and hard-refresh:</strong> Press{" "}
                <kbd className="bg-muted px-1 rounded font-mono text-xs">Ctrl + Shift + R</kbd>{" "}
                (Windows) or{" "}
                <kbd className="bg-muted px-1 rounded font-mono text-xs">Cmd + Shift + R</kbd> (Mac)
                to bypass browser cache.
              </li>
              <li>
                <strong>Check repository Pages settings:</strong> Open your repository on GitHub →
                Click <strong>Settings</strong> tab → Click <strong>Pages</strong> in the left menu.
                Verify that Source is set to <em>Deploy from a branch</em> and Branch is{" "}
                <em>main / (root)</em>.
              </li>
              <li>
                <strong>Check the Actions tab:</strong> If there is a build error, the Actions tab
                in your repository will show the exact build log.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. How to change photo */}
        <section className="block-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <Image className="size-5" />
            </div>
            <h2 className="text-xl font-bold">How to change or crop your photo</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            In Step 1 of the builder or on your dashboard, click <strong>Upload Photo</strong>. You
            can upload any standard image (JPEG, PNG, WebP). The builder automatically scales and
            optimizes it to a crisp 640px square avatar so your site loads lightning fast on mobile
            devices and campus Wi-Fi.
          </p>
        </section>

        {/* 4. How to unpublish */}
        <section className="block-card p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </div>
            <h2 className="text-xl font-bold">How to unpublish or take down a site</h2>
          </div>
          <div className="space-y-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <p>Because your portfolio lives entirely in your own GitHub account:</p>
            <ol className="list-decimal list-inside space-y-1 text-foreground/90">
              <li>Open your repository on GitHub.</li>
              <li>
                Go to <strong>Settings</strong> → <strong>Pages</strong>.
              </li>
              <li>
                Click the three dots{" "}
                <code className="bg-muted px-1 py-0.5 rounded font-mono">...</code> next to your
                deployment and click <strong>Unpublish site</strong>.
              </li>
              <li>
                Alternatively, changing the repository from Public to Private instantly takes down
                the live Pages URL.
              </li>
            </ol>
          </div>
        </section>

        {/* 5. Privacy & Data Safety */}
        <section className="block-card p-6 sm:p-7 space-y-3 bg-muted/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600" />
            <h3 className="text-base font-bold">Data Privacy Guarantee</h3>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Folio has no central database holding your private personal data. Drafts stay in your
            browser. All phone numbers and street addresses are automatically stripped before
            generating your site to protect your personal privacy when published on the public
            internet.
          </p>
        </section>

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <Button asChild variant="block" size="lg">
            <Link to="/create">Start Creating My Portfolio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
