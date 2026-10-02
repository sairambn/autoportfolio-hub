import { r as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { r as require_jsx_runtime } from "../_libs/@radix-ui/react-label+[...].mjs";
import { t as Button } from "./button-D-5TbdOV.mjs";
import { t as Input } from "./input-D62ypCpI.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as closestCenter, h as CSS, i as PointerSensor, m as useSensors, p as useSensor, r as KeyboardSensor, t as DndContext } from "../_libs/@dnd-kit/core+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as Download, a as Save, b as ArrowLeft, c as LoaderCircle, d as GripVertical, f as Github, g as ExternalLink, h as EyeOff, m as Eye, n as Upload, r as Trash2, s as Plus } from "../_libs/lucide-react.mjs";
import { d as uid, i as TEMPLATES, n as FONTS, r as SECTION_LABELS, t as ALL_SECTIONS, u as normalize } from "./portfolio-QX5LsIJC.mjs";
import { t as PortfolioView } from "./PortfolioView-CZmJebbf.mjs";
import { i as getPortfolio, o as updatePortfolio } from "./storage-CDPa_T-Y.mjs";
import { l as createServerFn } from "./createServerFn-DDDJMFWM.mjs";
import { i as stringType, r as objectType, t as anyType } from "../_libs/zod.mjs";
import { i as publishPortfolio, n as Textarea, r as createSsrRpc, t as Label } from "./github-client-B-SGFy1Q.mjs";
import { t as Route } from "./editor._id-DyiBVdpD.mjs";
import { t as useGithubRepos } from "./use-github-repos-6OdD9TOQ.mjs";
import { a as verticalListSortingStrategy, i as useSortable, n as arrayMove, r as sortableKeyboardCoordinates, t as SortableContext } from "../_libs/dnd-kit__sortable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/editor._id-BULor95J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var inputSchema = objectType({
	title: stringType(),
	content: anyType(),
	theme: anyType(),
	sections: anyType()
});
/** Server-render a complete standalone HTML portfolio for download. */
var exportPortfolioHtml = createServerFn({ method: "POST" }).validator((d) => inputSchema.parse(d)).handler(createSsrRpc("6bce8897996b231829ad936cf478c6f186657139a43be54f49b0ae759ea7076f"));
/** Download a full portfolio as a single index.html file (no GitHub needed). */
async function downloadPortfolioHtml(opts) {
	const { html } = await exportPortfolioHtml({ data: {
		title: opts.title,
		content: opts.content,
		theme: opts.theme,
		sections: opts.sections
	} });
	const safe = (opts.filename || opts.title || "portfolio").toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "portfolio";
	const blob = new Blob([html], { type: "text/html;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${safe}.html`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
function EditorPage() {
	const { id } = Route.useParams();
	const { session } = Route.useRouteContext();
	const login = session.user.login;
	const row = getPortfolio(login, id);
	if (!row) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center px-4 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-black",
			children: "Portfolio not found"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "block",
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/dashboard",
				children: "Back to dashboard"
			})
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editor, {
		row,
		token: session.token,
		login
	}, row.id);
}
function Editor({ row, token, login }) {
	const initial = normalize(row);
	const [title, setTitle] = (0, import_react.useState)(row.title);
	const [slug, setSlug] = (0, import_react.useState)(row.slug);
	const [published, setPublished] = (0, import_react.useState)(row.published);
	const [autoPush, setAutoPush] = (0, import_react.useState)(row.auto_push);
	const [content, setContent] = (0, import_react.useState)(initial.content);
	const [theme, setTheme] = (0, import_react.useState)(initial.theme);
	const [sections, setSections] = (0, import_react.useState)(initial.sections);
	const [tab, setTab] = (0, import_react.useState)("content");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [dirty, setDirty] = (0, import_react.useState)(false);
	const [repoName, setRepoName] = (0, import_react.useState)(row.github_repo ?? "my-portfolio");
	const [publishing, setPublishing] = (0, import_react.useState)(false);
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	const guest = login === "guest" || !token;
	const saveTimer = (0, import_react.useRef)(null);
	const repos = useGithubRepos(content.githubUsername);
	const markDirty = (0, import_react.useCallback)(() => setDirty(true), []);
	const persist = (0, import_react.useCallback)(async (opts) => {
		setSaving(true);
		const updated = updatePortfolio(login, row.id, {
			title,
			slug,
			published,
			auto_push: autoPush,
			content,
			theme,
			sections
		});
		setSaving(false);
		if (!updated) {
			toast.error("Could not save");
			return false;
		}
		setDirty(false);
		if (!opts?.silent) toast.success("Saved");
		return true;
	}, [
		title,
		slug,
		published,
		autoPush,
		content,
		theme,
		sections,
		row.id,
		login
	]);
	const autoPushRef = (0, import_react.useRef)(autoPush);
	(0, import_react.useEffect)(() => {
		autoPushRef.current = autoPush;
	}, [autoPush]);
	(0, import_react.useEffect)(() => {
		if (!dirty) return;
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(async () => {
			if (await persist({ silent: true }) && autoPushRef.current && repoName.trim() && token) try {
				const latest = getPortfolio(login, row.id);
				if (latest) {
					await publishPortfolio({
						token,
						login,
						repo: repoName.trim(),
						portfolio: latest
					});
					updatePortfolio(login, row.id, {
						github_repo: repoName.trim(),
						last_pushed_at: (/* @__PURE__ */ new Date()).toISOString(),
						published: true
					});
				}
			} catch {}
		}, 1200);
		return () => {
			if (saveTimer.current) clearTimeout(saveTimer.current);
		};
	}, [
		dirty,
		persist,
		repoName,
		row.id,
		login,
		token
	]);
	function patchContent(partial) {
		setContent((c) => ({
			...c,
			...partial
		}));
		markDirty();
	}
	function patchContact(key, value) {
		setContent((c) => ({
			...c,
			contact: {
				...c.contact,
				[key]: value
			}
		}));
		markDirty();
	}
	function setTemplate(id) {
		setTheme(structuredClone(TEMPLATES[id].theme));
		markDirty();
	}
	function setPalette(key, value) {
		setTheme((t) => ({
			...t,
			palette: {
				...t.palette,
				[key]: value
			}
		}));
		markDirty();
	}
	function setFont(font) {
		setTheme((t) => ({
			...t,
			font
		}));
		markDirty();
	}
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	function onDragEnd(event) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		setSections((items) => {
			const oldIndex = items.findIndex((s) => s.id === active.id);
			const newIndex = items.findIndex((s) => s.id === over.id);
			return arrayMove(items, oldIndex, newIndex);
		});
		markDirty();
	}
	function toggleSection(sid) {
		setSections((ss) => ss.map((s) => s.id === sid ? {
			...s,
			visible: !s.visible
		} : s));
		markDirty();
	}
	function addSection(type) {
		setSections((ss) => [...ss, {
			id: uid(),
			type,
			visible: true
		}]);
		markDirty();
	}
	function removeSection(sid) {
		setSections((ss) => ss.filter((s) => s.id !== sid));
		markDirty();
	}
	async function doDownload() {
		setDownloading(true);
		try {
			await persist({ silent: true });
			await downloadPortfolioHtml({
				title,
				content,
				theme,
				sections,
				filename: title || "portfolio"
			});
			toast.success("Downloaded HTML file");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Download failed");
		}
		setDownloading(false);
	}
	async function doPublish() {
		if (guest) {
			toast.error("Sign in with GitHub to publish, or use Download HTML");
			return;
		}
		setPublishing(true);
		await persist({ silent: true });
		try {
			const latest = getPortfolio(login, row.id);
			if (!latest) throw new Error("Portfolio missing");
			const result = await publishPortfolio({
				token,
				login,
				repo: repoName.trim(),
				portfolio: {
					...latest,
					content,
					theme,
					sections,
					title,
					slug
				}
			});
			updatePortfolio(login, row.id, {
				github_repo: repoName.trim(),
				last_pushed_at: (/* @__PURE__ */ new Date()).toISOString(),
				published: true
			});
			setPublished(true);
			toast.success(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"Published!",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					className: "underline",
					href: result.pagesUrl,
					target: "_blank",
					rel: "noreferrer",
					children: "Open site"
				})
			] }));
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Publish failed");
		}
		setPublishing(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-screen flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex shrink-0 items-center gap-3 border-b-2 border-ink px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/dashboard",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {}), " Dashboard"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "max-w-[200px] border-0 bg-transparent text-lg font-bold shadow-none focus-visible:ring-0",
					value: title,
					onChange: (e) => {
						setTitle(e.target.value);
						markDirty();
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: saving ? "Saving…" : dirty ? "Unsaved" : "Saved"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "block",
							size: "sm",
							onClick: doDownload,
							disabled: downloading,
							children: [downloading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "blockOutline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/p/$slug",
								params: { slug },
								target: "_blank",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {}), " Preview"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "blockOutline",
							size: "sm",
							onClick: () => persist(),
							disabled: saving,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}), " Save"]
						})
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "flex w-full max-w-md shrink-0 flex-col border-r-2 border-ink bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex border-b-2 border-ink",
					children: [
						"content",
						"theme",
						"sections",
						"github"
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTab(t),
						className: `flex-1 py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`,
						children: t === "github" ? "export" : t
					}, t))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 overflow-y-auto p-4",
					children: [
						tab === "content" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentPanel, {
							content,
							patchContent,
							patchContact,
							setContent: (c) => {
								setContent(c);
								markDirty();
							}
						}),
						tab === "theme" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemePanel, {
							theme,
							setTemplate,
							setPalette,
							setFont
						}),
						tab === "sections" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionsPanel, {
							sections,
							sensors,
							onDragEnd,
							toggleSection,
							removeSection,
							addSection
						}),
						tab === "github" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GithubPanel, {
							content,
							patchContent,
							login,
							guest,
							slug,
							setSlug: (s) => {
								setSlug(s);
								markDirty();
							},
							autoPush,
							setAutoPush: (v) => {
								setAutoPush(v);
								markDirty();
							},
							repoName,
							setRepoName,
							onPublish: doPublish,
							onDownload: doDownload,
							publishing,
							downloading
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "min-w-0 flex-1 overflow-y-auto bg-muted/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto min-h-full max-w-4xl shadow-lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioView, {
						content,
						theme,
						sections,
						repos: repos.data ?? null
					})
				})
			})]
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
		className: "mb-1 block",
		children: label
	}), children] });
}
function ContentPanel({ content, patchContent, patchContact, setContent }) {
	function updateProject(i, field, value) {
		const projects = content.projects.map((p, idx) => idx === i ? {
			...p,
			[field]: value
		} : p);
		setContent({
			...content,
			projects
		});
	}
	function updateExp(i, field, value) {
		const experience = content.experience.map((e, idx) => idx === i ? {
			...e,
			[field]: value
		} : e);
		setContent({
			...content,
			experience
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Name",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: content.name,
					onChange: (e) => patchContent({ name: e.target.value })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Headline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: content.headline,
					onChange: (e) => patchContent({ headline: e.target.value })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Location",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: content.location,
					onChange: (e) => patchContent({ location: e.target.value }),
					placeholder: "City, Country"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Avatar URL",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: content.avatarUrl,
					onChange: (e) => patchContent({ avatarUrl: e.target.value }),
					placeholder: "https://…"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Bio",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 4,
					value: content.bio,
					onChange: (e) => patchContent({ bio: e.target.value })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Skills (comma separated)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: content.skills.join(", "),
					onChange: (e) => patchContent({ skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "GitHub username (for repos section)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: content.githubUsername,
					onChange: (e) => patchContent({ githubUsername: e.target.value.trim() }),
					placeholder: "your-handle"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Projects" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => setContent({
						...content,
						projects: [...content.projects, {
							title: "New project",
							description: "",
							url: "",
							tags: ""
						}]
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Add"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: content.projects.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 rounded-md border-2 border-ink/20 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Title",
								value: p.title,
								onChange: (e) => updateProject(i, "title", e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "icon",
								variant: "ghost",
								onClick: () => setContent({
									...content,
									projects: content.projects.filter((_, j) => j !== i)
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							placeholder: "Description",
							value: p.description,
							onChange: (e) => updateProject(i, "description", e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "URL",
							value: p.url,
							onChange: (e) => updateProject(i, "url", e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Tags",
							value: p.tags,
							onChange: (e) => updateProject(i, "tags", e.target.value)
						})
					]
				}, i))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Experience" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => setContent({
						...content,
						experience: [...content.experience, {
							role: "Role",
							company: "Company",
							period: "",
							description: ""
						}]
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Add"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: content.experience.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 rounded-md border-2 border-ink/20 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Role",
								value: e.role,
								onChange: (ev) => updateExp(i, "role", ev.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "icon",
								variant: "ghost",
								onClick: () => setContent({
									...content,
									experience: content.experience.filter((_, j) => j !== i)
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Company",
							value: e.company,
							onChange: (ev) => updateExp(i, "company", ev.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Period",
							value: e.period,
							onChange: (ev) => updateExp(i, "period", ev.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							rows: 2,
							placeholder: "Description",
							value: e.description,
							onChange: (ev) => updateExp(i, "description", ev.target.value)
						})
					]
				}, i))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Contact" }), [
					"email",
					"website",
					"github",
					"linkedin",
					"twitter"
				].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: k,
					value: content.contact[k],
					onChange: (e) => patchContact(k, e.target.value)
				}, k))]
			})
		]
	});
}
function ThemePanel({ theme, setTemplate, setPalette, setFont }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "mb-2 block",
				children: "Template"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: Object.keys(TEMPLATES).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTemplate(id),
					className: `rounded-md border-2 px-3 py-2 text-left text-sm font-semibold capitalize ${theme.template === id ? "border-primary bg-primary/10" : "border-ink/20"}`,
					children: TEMPLATES[id].label
				}, id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "mb-2 block",
				children: "Colors"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: Object.keys(theme.palette).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "color",
							value: theme.palette[k],
							onChange: (e) => setPalette(k, e.target.value),
							className: "h-9 w-12 cursor-pointer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "capitalize text-sm",
							children: k
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: theme.palette[k],
							onChange: (e) => setPalette(k, e.target.value),
							className: "font-mono text-xs"
						})
					]
				}, k))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "mb-2 block",
				children: "Font"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-2",
				children: Object.keys(FONTS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setFont(id),
					className: `rounded-md border-2 px-3 py-2 text-left text-sm ${theme.font === id ? "border-primary bg-primary/10" : "border-ink/20"}`,
					children: FONTS[id].label
				}, id))
			})] })
		]
	});
}
function SectionsPanel({ sections, sensors, onDragEnd, toggleSection, removeSection, addSection }) {
	const used = new Set(sections.map((s) => s.type));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Drag to reorder. Toggle visibility per section."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
				sensors,
				collisionDetection: closestCenter,
				onDragEnd,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
					items: sections.map((s) => s.id),
					strategy: verticalListSortingStrategy,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: sections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableRow, {
							section: s,
							onToggle: () => toggleSection(s.id),
							onRemove: () => removeSection(s.id)
						}, s.id))
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2 pt-2",
				children: ALL_SECTIONS.filter((t) => !used.has(t)).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					type: "button",
					size: "sm",
					variant: "outline",
					onClick: () => addSection(t),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
						" ",
						SECTION_LABELS[t]
					]
				}, t))
			})
		]
	});
}
function SortableRow({ section, onToggle, onRemove }) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		style,
		className: "flex items-center gap-2 rounded-md border-2 border-ink/20 bg-background px-2 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "cursor-grab p-1",
				...attributes,
				...listeners,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1 text-sm font-medium",
				children: SECTION_LABELS[section.type]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon",
				variant: "ghost",
				onClick: onToggle,
				children: section.visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "icon",
				variant: "ghost",
				onClick: onRemove,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
			})
		]
	});
}
function GithubPanel({ content, patchContent, login, guest, slug, setSlug, autoPush, setAutoPush, repoName, setRepoName, onPublish, onDownload, publishing, downloading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-md border-2 border-ink bg-accent/40 p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-5" }), " Easiest path"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Download a complete ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "index.html" }),
							". Open it offline, email it, or drag it onto Netlify Drop / any static host. No account required."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "block",
						className: "w-full",
						onClick: onDownload,
						disabled: downloading,
						children: [downloading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), "Download portfolio HTML"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "Portfolio slug (optional)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: slug,
					onChange: (e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-")),
					placeholder: "my-portfolio"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "mb-1 block",
					children: "Public GitHub username"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs text-muted-foreground",
					children: "Optional. Pulls public repos into the design."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: content.githubUsername,
					onChange: (e) => patchContent({ githubUsername: e.target.value.trim() }),
					placeholder: "your-handle"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 rounded-md border-2 border-ink/20 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, { className: "size-5" }), " Optional: GitHub Pages"]
				}), guest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Sign in once if you want a live URL. Otherwise Download is enough."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "blockOutline",
					className: "w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/auth",
						children: "Sign in with GitHub"
					})
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Signed in as ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["@", login] }),
							". Creates a public repo and enables Pages."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Repository name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: repoName,
							onChange: (e) => setRepoName(e.target.value.replace(/[^A-Za-z0-9._-]/g, "-")),
							placeholder: "my-portfolio"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex cursor-pointer items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "h-4 w-4",
							checked: autoPush,
							onChange: (e) => setAutoPush(e.target.checked)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium",
							children: "Auto-push on save"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "block",
						className: "w-full",
						onClick: onPublish,
						disabled: publishing || !repoName.trim(),
						children: [publishing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {}), "Publish to GitHub"]
					})
				] })]
			})
		]
	});
}
//#endregion
export { EditorPage as component };
