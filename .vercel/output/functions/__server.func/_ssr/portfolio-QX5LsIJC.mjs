//#region node_modules/.nitro/vite/services/ssr/assets/portfolio-QX5LsIJC.js
var SECTION_LABELS = {
	hero: "Hero",
	about: "About",
	skills: "Skills",
	projects: "Projects",
	repos: "GitHub Repos",
	experience: "Experience",
	contact: "Contact"
};
var FONTS = {
	fraunces: {
		label: "Fraunces + Space Grotesk",
		heading: "'Fraunces', serif",
		body: "'Space Grotesk', sans-serif",
		google: "family=Fraunces:ital,wght@0,400;0,700;0,800;1,700&family=Space+Grotesk:wght@400;500;600;700"
	},
	playfair: {
		label: "Playfair + Karla",
		heading: "'Playfair Display', serif",
		body: "'Karla', sans-serif",
		google: "family=Playfair+Display:wght@400;700;900&family=Karla:wght@400;500;700"
	},
	syne: {
		label: "Syne + Manrope",
		heading: "'Syne', sans-serif",
		body: "'Manrope', sans-serif",
		google: "family=Syne:wght@500;700;800&family=Manrope:wght@400;500;700"
	},
	dmserif: {
		label: "DM Serif + DM Sans",
		heading: "'DM Serif Display', serif",
		body: "'DM Sans', sans-serif",
		google: "family=DM+Serif+Display&family=DM+Sans:wght@400;500;700"
	},
	mono: {
		label: "JetBrains Mono",
		heading: "'JetBrains Mono', monospace",
		body: "'JetBrains Mono', monospace",
		google: "family=JetBrains+Mono:wght@400;500;700;800"
	},
	outfit: {
		label: "Outfit + Source Sans",
		heading: "'Outfit', sans-serif",
		body: "'Source Sans 3', sans-serif",
		google: "family=Outfit:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600"
	}
};
/** Order = display order on create / theme picker. */
var TEMPLATE_ORDER = [
	"signal",
	"minimal",
	"midnight",
	"ocean",
	"campus",
	"neon",
	"mono"
];
var TEMPLATES = {
	signal: {
		label: "Signal",
		blurb: "Cream paper · editorial (like a personal brand site)",
		theme: {
			template: "signal",
			font: "fraunces",
			palette: {
				bg: "#f4f0e8",
				fg: "#1a1814",
				accent: "#c45c26",
				muted: "#6b6560",
				surface: "#e9e3d8"
			}
		}
	},
	minimal: {
		label: "Minimal",
		blurb: "Clean white · quiet and professional",
		theme: {
			template: "minimal",
			font: "dmserif",
			palette: {
				bg: "#ffffff",
				fg: "#111111",
				accent: "#2563eb",
				muted: "#6b6b6b",
				surface: "#f4f4f5"
			}
		}
	},
	midnight: {
		label: "Midnight",
		blurb: "Dark navy · serious product feel",
		theme: {
			template: "midnight",
			font: "outfit",
			palette: {
				bg: "#0b1220",
				fg: "#e8eef7",
				accent: "#7dd3fc",
				muted: "#94a3b8",
				surface: "#151e2e"
			}
		}
	},
	ocean: {
		label: "Ocean",
		blurb: "Soft blue · calm engineering resume",
		theme: {
			template: "ocean",
			font: "outfit",
			palette: {
				bg: "#eef6fb",
				fg: "#0f2744",
				accent: "#0284c7",
				muted: "#5b7a96",
				surface: "#ddeff8"
			}
		}
	},
	campus: {
		label: "Campus",
		blurb: "Green academic · great for college profiles",
		theme: {
			template: "campus",
			font: "playfair",
			palette: {
				bg: "#f3f7f0",
				fg: "#1c2b1a",
				accent: "#3f7d3a",
				muted: "#5f735c",
				surface: "#e4ecdf"
			}
		}
	},
	neon: {
		label: "Neon",
		blurb: "Black + lime · bold hacker energy",
		theme: {
			template: "neon",
			font: "syne",
			palette: {
				bg: "#0e0e0e",
				fg: "#f4f1ea",
				accent: "#c6f432",
				muted: "#9a978f",
				surface: "#1a1a1a"
			}
		}
	},
	mono: {
		label: "Mono",
		blurb: "GitHub terminal · code-first",
		theme: {
			template: "mono",
			font: "mono",
			palette: {
				bg: "#0d1117",
				fg: "#c9d1d9",
				accent: "#3fb950",
				muted: "#8b949e",
				surface: "#161b22"
			}
		}
	}
};
var ALL_SECTIONS = [
	"hero",
	"about",
	"skills",
	"projects",
	"repos",
	"experience",
	"contact"
];
var uid = () => Math.random().toString(36).slice(2, 10);
var defaultContent = () => ({
	name: "Your Name",
	headline: "Software Engineer · DSA · Python · Java",
	bio: "I write code that works, practice every day, and ship systems people actually use.",
	avatarUrl: "",
	location: "Jeppiaar Engineering College",
	skills: [
		"Python",
		"Java",
		"DSA"
	],
	projects: [{
		title: "Project One",
		description: "A short description of what you built and why it matters.",
		url: "",
		tags: "Python · Java"
	}],
	experience: [{
		role: "Role",
		company: "Company / Club",
		period: "2024 — Now",
		description: "What you did there."
	}],
	contact: {
		email: "",
		website: "",
		github: "",
		linkedin: "",
		twitter: ""
	},
	githubUsername: ""
});
var defaultSections = () => ALL_SECTIONS.map((type) => ({
	id: uid(),
	type,
	visible: true
}));
var defaultTheme = () => structuredClone(TEMPLATES.signal.theme);
function normalize(row) {
	const c = {
		...defaultContent(),
		...row.content ?? {}
	};
	c.contact = {
		...defaultContent().contact,
		...c.contact ?? {}
	};
	let t = row.theme;
	if (t?.palette) {
		const id = String(t.template || "");
		if (id === "editorial") t = {
			...t,
			template: "signal"
		};
		else if (id === "bold") t = {
			...t,
			template: "neon"
		};
		else if (id === "terminal") t = {
			...t,
			template: "mono"
		};
		else if (!(id in TEMPLATES)) t = defaultTheme();
	} else t = defaultTheme();
	const s = Array.isArray(row.sections) && row.sections.length ? row.sections : defaultSections();
	return {
		content: c,
		theme: t,
		sections: s
	};
}
var googleFontsHref = (font) => `https://fonts.googleapis.com/css2?${FONTS[font]?.google ?? FONTS.fraunces.google}&display=swap`;
//#endregion
export { TEMPLATE_ORDER as a, defaultTheme as c, uid as d, TEMPLATES as i, googleFontsHref as l, FONTS as n, defaultContent as o, SECTION_LABELS as r, defaultSections as s, ALL_SECTIONS as t, normalize as u };
