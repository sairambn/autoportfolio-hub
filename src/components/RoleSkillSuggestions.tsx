import React, { useState } from "react";
import { Sparkles, Check, Plus, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  detectRoleRecommendations,
  SOFTWARE_ENGINEER_SKILLS,
  type RoleRecommendation,
  ALL_RECOMMENDATIONS,
} from "@/lib/skill-recommendations";

interface RoleSkillSuggestionsProps {
  /** The text typed by the user (headline, profile role, bio, target role, etc.) */
  profileQuery: string;
  /** Currently active skills in the portfolio */
  activeSkills: string[];
  /** Callback to add a single skill */
  onAddSkill: (skill: string) => void;
  /** Optional callback to add multiple skills at once */
  onAddMultipleSkills?: (skills: string[]) => void;
  /** Variant: 'compact' (e.g. for under headline input) or 'detailed' (e.g. for inside Skills tab) */
  variant?: "compact" | "detailed" | "banner";
  /** Optional callback if compact variant has a "View all in Skills tab" button */
  onSwitchToSkillsTab?: () => void;
}

export const RoleSkillSuggestions: React.FC<RoleSkillSuggestionsProps> = ({
  profileQuery,
  activeSkills,
  onAddSkill,
  onAddMultipleSkills,
  variant = "detailed",
  onSwitchToSkillsTab,
}) => {
  // Allow manual override if user clicks a different role pill
  const [overrideRole, setOverrideRole] = useState<RoleRecommendation | null>(null);

  // Detect matching role recommendation based on profileQuery
  const detectedRole = detectRoleRecommendations(profileQuery);
  // Default to Software Engineer if none detected, but flag whether it was explicitly triggered
  const recommendation: RoleRecommendation =
    overrideRole || detectedRole || SOFTWARE_ENGINEER_SKILLS;
  const isDirectMatch = Boolean(detectedRole && detectedRole.role === recommendation.role);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Reset override if profileQuery changes and matches a role
  React.useEffect(() => {
    if (detectedRole) {
      setOverrideRole(null);
    }
  }, [profileQuery, detectedRole]);

  // Filter skills based on selected category
  const displayedSkills = React.useMemo(() => {
    if (selectedCategory === "All") {
      return recommendation.topRecommendations;
    }
    const cat = recommendation.categories.find((c) => c.name === selectedCategory);
    return cat ? cat.skills : recommendation.topRecommendations;
  }, [recommendation, selectedCategory]);

  // Determine unadded skills
  const unaddedDisplayedSkills = displayedSkills.filter(
    (s) => !activeSkills.some((active) => active.toLowerCase() === s.toLowerCase()),
  );

  function handleAddAll() {
    if (onAddMultipleSkills) {
      onAddMultipleSkills(unaddedDisplayedSkills);
    } else {
      unaddedDisplayedSkills.forEach((s) => onAddSkill(s));
    }
  }

  // 1. Compact Banner variant (e.g., inline below headline input)
  if (variant === "compact" || variant === "banner") {
    // Only show when the profile text actually matches a detected role (e.g. Software Engineer)
    const shouldShow = Boolean(detectedRole || overrideRole);
    if (!shouldShow) {
      return null;
    }

    return (
      <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-3.5 text-xs shadow-sm transition-all animate-in fade-in-50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <Sparkles className="size-4 animate-pulse text-amber-500" />
            <span>Recommended for {recommendation.role}:</span>
          </div>

          <div className="flex items-center gap-2">
            {unaddedDisplayedSkills.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 border-primary/30 bg-card px-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground"
                onClick={handleAddAll}
              >
                <Plus className="mr-1 size-3" /> Add All ({unaddedDisplayedSkills.length})
              </Button>
            )}
            {onSwitchToSkillsTab && (
              <button
                type="button"
                onClick={onSwitchToSkillsTab}
                className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
              >
                More in Skills <ArrowRight className="size-3" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-1 text-[11px] text-muted-foreground">
          Click any skill below to add it directly to your portfolio skills:
        </p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {displayedSkills.slice(0, 10).map((skill) => {
            const isAdded = activeSkills.some((a) => a.toLowerCase() === skill.toLowerCase());
            return (
              <button
                key={skill}
                type="button"
                onClick={() => !isAdded && onAddSkill(skill)}
                disabled={isAdded}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all ${
                  isAdded
                    ? "border-emerald-500/40 bg-emerald-50 text-emerald-700 opacity-80 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-primary/30 bg-card text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground shadow-xs"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{skill}</span>
                  </>
                ) : (
                  <>
                    <Plus className="size-3" />
                    <span>{skill}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Detailed variant (for inside the Skills tab)
  return (
    <div className="rounded-xl border-2 border-ink bg-card p-5 shadow-[3px_3px_0_0_oklch(0.2_0.02_60)]">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles className="size-4 text-amber-500" />
            </div>
            <h4 className="font-display text-base font-black">
              Recommended Skills for {recommendation.role}
            </h4>
            {isDirectMatch && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Profile Match
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{recommendation.description}</p>
        </div>

        {/* Action: Add All Button */}
        {unaddedDisplayedSkills.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="block"
            onClick={handleAddAll}
            className="shrink-0 font-bold"
          >
            <Plus className="mr-1.5 size-4" /> Add All ({unaddedDisplayedSkills.length})
          </Button>
        )}
      </div>

      {/* Categories Bar */}
      <div className="mt-4 flex flex-wrap gap-1.5 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setSelectedCategory("All")}
          className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
            selectedCategory === "All"
              ? "bg-ink text-white shadow-xs"
              : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Top Skills ({recommendation.topRecommendations.length})
        </button>
        {recommendation.categories.map((cat) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setSelectedCategory(cat.name)}
            className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
              selectedCategory === cat.name
                ? "bg-ink text-white shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Skills Badges Grid */}
      <div className="mt-4 flex flex-wrap gap-2">
        {displayedSkills.map((skill) => {
          const isAdded = activeSkills.some((a) => a.toLowerCase() === skill.toLowerCase());
          return (
            <button
              key={skill}
              type="button"
              onClick={() => !isAdded && onAddSkill(skill)}
              disabled={isAdded}
              title={isAdded ? `${skill} is already in your skills` : `Click to add ${skill}`}
              className={`group inline-flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-all ${
                isAdded
                  ? "border-emerald-500/40 bg-emerald-50 text-emerald-800 opacity-75 dark:bg-emerald-950/30 dark:text-emerald-300 cursor-default"
                  : "border-ink bg-card text-foreground hover:-translate-y-0.5 hover:bg-ink hover:text-white shadow-[2px_2px_0_0_oklch(0.2_0.02_60)] active:translate-y-0"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{skill}</span>
                  <span className="text-[10px] font-normal text-emerald-700/70 dark:text-emerald-400/70">
                    (Added)
                  </span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5 text-muted-foreground group-hover:text-white" />
                  <span>{skill}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Switcher for user convenience if they want to explore recommendations */}
      <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-dashed border-border/80 text-xs">
        <span className="flex items-center gap-1 font-semibold text-muted-foreground">
          <Layers className="size-3" /> Explore role recommendations:
        </span>
        {ALL_RECOMMENDATIONS.map((r) => {
          const isActive = recommendation.role === r.role;
          return (
            <button
              key={r.role}
              type="button"
              onClick={() => {
                setOverrideRole(r);
                setSelectedCategory("All");
              }}
              className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 text-primary font-bold"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {r.role}
            </button>
          );
        })}
      </div>
    </div>
  );
};
