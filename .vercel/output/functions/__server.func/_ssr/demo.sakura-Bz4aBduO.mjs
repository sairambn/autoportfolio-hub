import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo.sakura-Bz4aBduO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Unsplash stock — soft cherry-blossom bokeh (no design-layer CDN dependency). */
var UNSPLASH_SCENE = "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1600&q=80";
/** Unsplash — pink blossom branch-style subject */
var UNSPLASH_FOREGROUND = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80";
var FONT_LINK_ID = "sakura-editorial-poster-fonts";
var FONT_HREF = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@300;400;500;600&family=Saira+Extra+Condensed:wght@700;800&display=swap";
var SAKURA_EDITORIAL_DEFAULT_KEYWORDS = [
	{ label: "Bloom" },
	{ label: "Pause" },
	{ label: "Return" }
];
var DEFAULT_BODY = "For a few still days the canopy turns pale pink, and the street below goes quiet. Walk while the color lasts — it is already leaving, petal by petal, into the wind.";
var FRAME_PAD_CLASS = "p-[clamp(1.25rem,4vmin,2.5rem)]";
function cn(...parts) {
	return parts.filter(Boolean).join(" ");
}
function clamp01(value) {
	return Math.min(1, Math.max(0, value));
}
function getScrollParent(el) {
	let node = el.parentElement;
	while (node) {
		const oy = window.getComputedStyle(node).overflowY;
		if ((oy === "auto" || oy === "scroll" || oy === "overlay") && node.scrollHeight > node.clientHeight + 1) {
			if (node === document.documentElement || node === document.body) return window;
			return node;
		}
		node = node.parentElement;
	}
	return window;
}
function readScrollProgress(track, scrollRoot) {
	if (!(scrollRoot instanceof HTMLElement) || typeof document !== "undefined" && (scrollRoot === document.documentElement || scrollRoot === document.body)) {
		const rect = track.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const scrollable = track.offsetHeight - vh;
		if (scrollable <= 0) return 1;
		return clamp01(-rect.top / scrollable);
	}
	const rootRect = scrollRoot.getBoundingClientRect();
	const trackRect = track.getBoundingClientRect();
	const scrollable = track.offsetHeight - scrollRoot.clientHeight;
	if (scrollable <= 0) return 1;
	return clamp01((rootRect.top - trackRect.top) / scrollable);
}
function splitTitleChars(title) {
	const chars = Array.from(title);
	const mid = Math.max(chars.length - 1, 1) / 2;
	return chars.map((char, index) => ({
		key: `${index}-${char === " " ? "sp" : char}`,
		char: char === " " ? "\xA0" : char,
		index,
		fromCenter: mid <= 0 ? 0 : Math.abs(index - mid) / mid
	}));
}
function charReveal(progress, fromCenter) {
	const start = fromCenter * .55;
	const end = Math.min(1, start + .38);
	return clamp01((progress - start) / Math.max(.001, end - start));
}
function useSakuraEditorialFonts() {
	(0, import_react.useEffect)(() => {
		if (typeof document === "undefined") return;
		if (document.getElementById(FONT_LINK_ID)) return;
		const link = document.createElement("link");
		link.id = FONT_LINK_ID;
		link.rel = "stylesheet";
		link.href = FONT_HREF;
		document.head.appendChild(link);
	}, []);
}
function SakuraFitTitle({ title, revealProgress }) {
	const wrapRef = (0, import_react.useRef)(null);
	const probeRef = (0, import_react.useRef)(null);
	const [fontPx, setFontPx] = (0, import_react.useState)(null);
	const chars = splitTitleChars(title);
	const titleProgress = clamp01(revealProgress / .4);
	(0, import_react.useEffect)(() => {
		const wrap = wrapRef.current;
		const probe = probeRef.current;
		if (!wrap || !probe) return;
		const PROBE = 100;
		let cancelled = false;
		const fit = () => {
			if (cancelled) return;
			const next = wrap.clientWidth / Math.max(1, probe.scrollWidth) * PROBE;
			if (!Number.isFinite(next) || next <= 0) return;
			setFontPx(next);
		};
		const ro = new ResizeObserver(fit);
		ro.observe(wrap);
		const fonts = document.fonts;
		const onFonts = () => {
			fonts?.ready.then(fit);
		};
		fonts?.addEventListener?.("loadingdone", onFonts);
		(async () => {
			try {
				await fonts?.load?.("800 100px \"Saira Extra Condensed\"");
			} catch {}
			await fonts?.ready;
			fit();
		})();
		fit();
		return () => {
			cancelled = true;
			ro.disconnect();
			fonts?.removeEventListener?.("loadingdone", onFonts);
		};
	}, [title]);
	const titleStyle = {
		fontFamily: "\"Saira Extra Condensed\", \"Arial Narrow\", sans-serif",
		fontWeight: 800,
		letterSpacing: "0.02em",
		WebkitFontSmoothing: "antialiased",
		MozOsxFontSmoothing: "grayscale",
		textRendering: "geometricPrecision"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "absolute inset-x-[4%] top-[4%] z-20 overflow-visible",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			ref: probeRef,
			"aria-hidden": true,
			className: "pointer-events-none invisible absolute whitespace-nowrap uppercase leading-none",
			style: {
				...titleStyle,
				fontSize: 100
			},
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "m-0 overflow-visible whitespace-nowrap text-left uppercase leading-none text-white",
			style: {
				...titleStyle,
				fontSize: fontPx != null ? `${fontPx}px` : "min(36cqw, 52cqh)"
			},
			children: [chars.map((item) => {
				const t = charReveal(titleProgress, item.fromCenter);
				const y = (1 - t) * (18 + item.fromCenter * 24);
				const side = item.index < chars.length / 2 ? 1 : -1;
				const x = (1 - t) * (item.fromCenter > .01 ? item.fromCenter * 16 * side : 0);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					"aria-hidden": true,
					className: "inline-block",
					style: {
						opacity: t,
						transform: `translate3d(${x}px, ${y}px, 0)`
					},
					children: item.char
				}, item.key);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: title
			})]
		})]
	});
}
function SakuraHeroVisual({ title, sceneSrc, sceneAlt, foregroundSrc, foregroundAlt, revealProgress }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-full w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: sceneSrc,
					alt: sceneAlt,
					className: "absolute inset-0 h-full w-full scale-105 object-cover object-center",
					draggable: false
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					"aria-hidden": true,
					className: "pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-overlay",
					style: { backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")" }
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SakuraFitTitle, {
				title,
				revealProgress
			}),
			foregroundSrc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: foregroundSrc,
				alt: foregroundAlt,
				className: "pointer-events-none absolute bottom-0 left-1/2 z-30 h-auto w-[min(92%,78cqh)] -translate-x-[40%] object-contain object-bottom drop-shadow-[0_10px_28px_rgba(40,20,20,0.18)]",
				draggable: false
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 z-[35] bg-gradient-to-b from-transparent via-transparent to-[#f5f5f0]/18"
			})
		]
	});
}
function SakuraEditorialCopy({ keywordItems, headline, body, subheadline, footerLeft, footerCenter, footerRight, socialHandle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-[38%] flex-col border-0 bg-transparent p-[clamp(1.1rem,4.5cqw,2.25rem)] text-[#f6eee8]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-[#4a2c32]/55 via-[#c99aa0]/25 to-transparent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative z-10 flex items-start justify-between gap-3 text-[clamp(9px,1.7cqw,11px)] font-light tracking-[0.16em] text-[#f6eee8]/70",
				children: keywordItems.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label }, item.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "relative z-10 mt-[clamp(0.7rem,2.2cqw,1.15rem)] text-[clamp(1.2rem,3.6cqw,1.7rem)] font-semibold leading-[1.3] text-[#f6eee8]",
				style: { fontFamily: "\"Cormorant Garamond\", \"Hiragino Mincho ProN\", \"Yu Mincho\", Georgia, serif" },
				children: headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative z-10 mt-[clamp(0.5rem,1.6cqw,0.75rem)] max-w-[62%] text-[clamp(10px,1.7cqw,12px)] font-light leading-[1.55] text-[#f6eee8]/85",
				children: body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "relative z-10 mt-[clamp(0.65rem,2cqw,0.95rem)] text-[clamp(0.95rem,2.6cqw,1.2rem)] font-medium leading-[1.35] text-[#f6eee8]",
				style: { fontFamily: "\"Jost\", ui-sans-serif, sans-serif" },
				children: subheadline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 mt-auto flex items-end justify-between gap-3 pt-[clamp(0.7rem,2.4cqw,1.1rem)] text-[clamp(9px,1.6cqw,11px)] font-light tracking-[0.08em] text-[#f6eee8]/75",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: footerLeft }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: footerCenter }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: footerRight })
				]
			}),
			socialHandle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute bottom-[clamp(0.35rem,1.2cqw,0.65rem)] right-[clamp(0.75rem,4.5cqw,2.25rem)] z-10 text-[clamp(9px,2cqw,11px)] font-light tracking-[0.04em] text-[#f6eee8]/40",
				children: socialHandle
			}) : null
		]
	});
}
function SakuraEditorialPoster({ title = "SAKURA", keywords = SAKURA_EDITORIAL_DEFAULT_KEYWORDS, headline = "Petals Hold the Light | 花びらが光を抱く。", body = DEFAULT_BODY, subheadline = "Stay for the fall. 散るまで、見ていて。", footerLeft = "Folio", footerCenter = "Vol. 01", footerRight = "03.26 2026", socialHandle = "@folio", sceneSrc = UNSPLASH_SCENE, sceneAlt = "Soft bokeh cherry blossoms background", foregroundSrc = UNSPLASH_FOREGROUND, foregroundAlt = "Cherry blossom branch in the foreground", height = "280vh", forceProgress, preview = false, className }) {
	useSakuraEditorialFonts();
	const trackRef = (0, import_react.useRef)(null);
	const keywordItems = keywords.filter((item) => item.label.trim().length > 0);
	const locked = forceProgress != null && Number.isFinite(forceProgress);
	const [progress, setProgress] = (0, import_react.useState)(forceProgress != null ? clamp01(forceProgress) : 0);
	const [stickyPx, setStickyPx] = (0, import_react.useState)(null);
	const fillViewport = locked || preview;
	const trackHeight = fillViewport ? "auto" : height;
	const useSticky = !locked && !preview;
	(0, import_react.useEffect)(() => {
		if (locked || preview) {
			setProgress(clamp01(forceProgress ?? 0));
			setStickyPx(null);
			return;
		}
		const track = trackRef.current;
		if (!track) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setProgress(1);
			return;
		}
		const scrollRoot = getScrollParent(track);
		let target = 0;
		let current = 0;
		let raf = 0;
		const read = () => {
			const fromRoot = readScrollProgress(track, scrollRoot);
			if (scrollRoot === window) return fromRoot;
			const fromWindow = readScrollProgress(track, window);
			return Math.abs(fromWindow - fromRoot) > .02 ? fromWindow : fromRoot;
		};
		const loop = () => {
			const delta = target - current;
			current += Math.abs(delta) > .35 ? delta * .22 : delta * .14;
			if (Math.abs(delta) < 8e-4) current = target;
			setProgress(current);
			raf = window.requestAnimationFrame(loop);
		};
		const onScroll = () => {
			target = read();
		};
		const onResize = () => {
			if (scrollRoot === window) setStickyPx(window.innerHeight);
			else setStickyPx(scrollRoot.clientHeight);
			target = read();
		};
		onResize();
		target = read();
		current = target;
		setProgress(current);
		scrollRoot.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onResize);
		raf = window.requestAnimationFrame(loop);
		return () => {
			scrollRoot.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onResize);
			window.cancelAnimationFrame(raf);
		};
	}, [
		forceProgress,
		locked,
		preview
	]);
	const revealProgress = locked || preview ? clamp01(forceProgress ?? 0) : progress;
	const copyOffset = `${(1 - clamp01((revealProgress - .78) / .22)) * 100}%`;
	const panelHeight = useSticky && stickyPx != null ? stickyPx : fillViewport ? "100%" : "100svh";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		ref: trackRef,
		className: cn("relative isolate w-full bg-[#ece8df]", fillViewport && "h-screen", className),
		style: {
			height: useSticky ? trackHeight : void 0,
			fontFamily: "\"Jost\", ui-sans-serif, sans-serif"
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("box-border w-full overflow-hidden", FRAME_PAD_CLASS, useSticky ? "sticky top-0" : "relative"),
			style: { height: panelHeight },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "@container relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-xl bg-[#f5f5f0] shadow-[0_24px_80px_rgba(80,50,50,0.12)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "@container relative min-h-0 flex-1 overflow-hidden [container-type:size]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SakuraHeroVisual, {
						title,
						sceneSrc,
						sceneAlt,
						foregroundSrc,
						foregroundAlt,
						revealProgress
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-x-0 bottom-0 z-30 will-change-transform",
					style: { transform: `translate3d(0, ${copyOffset}, 0)` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SakuraEditorialCopy, {
						keywordItems,
						headline,
						body,
						subheadline,
						footerLeft,
						footerCenter,
						footerRight,
						socialHandle
					})
				})]
			})
		})
	});
}
function SakuraDemoPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-[#ece8df]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 z-50 flex items-center justify-between border-b border-black/10 bg-[#ece8df]/90 px-4 py-3 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-sm font-semibold underline-offset-4 hover:underline",
					children: "← Folio"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs tracking-wide text-black/50",
					children: "Scroll to reveal"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SakuraEditorialPoster, { className: "w-full" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-lg px-6 py-16 text-center text-sm text-black/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Component path: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
					className: "text-black/80",
					children: "src/components/ui/sakura-editorial-poster.tsx"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2",
					children: "Images: Unsplash (cherry blossoms). No extra npm packages required."
				})]
			})
		]
	});
}
//#endregion
export { SakuraDemoPage as component };
