import { createFileRoute, Link } from "@tanstack/react-router";
import SakuraEditorialPoster from "@/components/ui/sakura-editorial-poster";

export const Route = createFileRoute("/demo/sakura")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sakura editorial poster — demo" },
      {
        name: "description",
        content: "Scroll-driven sakura editorial poster component demo.",
      },
    ],
  }),
  component: SakuraDemoPage,
});

function SakuraDemoPage() {
  return (
    <div className="min-h-screen bg-[#ece8df]">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-black/10 bg-[#ece8df]/90 px-4 py-3 backdrop-blur">
        <Link to="/" className="text-sm font-semibold underline-offset-4 hover:underline">
          ← Folio
        </Link>
        <span className="text-xs tracking-wide text-black/50">Scroll to reveal</span>
      </div>
      <SakuraEditorialPoster className="w-full" />
      <div className="mx-auto max-w-lg px-6 py-16 text-center text-sm text-black/60">
        <p>
          Component path:{" "}
          <code className="text-black/80">src/components/ui/sakura-editorial-poster.tsx</code>
        </p>
        <p className="mt-2">Images: Unsplash (cherry blossoms). No extra npm packages required.</p>
      </div>
    </div>
  );
}
