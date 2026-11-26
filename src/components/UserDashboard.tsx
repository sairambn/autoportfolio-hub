import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Check,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileCode2,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Globe,
  Layers,
  Layout,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { ProfessionalDetailsForm } from "@/components/ProfessionalDetailsForm";
import { GithubFirebaseAuth } from "@/components/GithubFirebaseAuth";
import { CareerRoadmapTracker } from "@/components/CareerRoadmapTracker";
import { PlacementAgencyAdmin } from "@/components/PlacementAgencyAdmin";
import { AdminGlobalMetricsView } from "@/components/AdminGlobalMetricsView";
import { ExportPdfModal } from "@/components/ExportPdfModal";
import { CyberSecurityCenter } from "@/components/CyberSecurityCenter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRepoAndPushPortfolioHtml } from "@/lib/github-client";
import {
  auth,
  deletePortfolioFromFirestore,
  isUserAdmin,
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  resolveUserDisplayName,
  resolveUsername,
  onAuthStateChanged,
  savePortfolioToFirestore,
  signOutUser,
  subscribeUserPortfolios,
  subscribeUserProfile,
  updateUserProfile,
  type FirebasePortfolioDoc,
  type UserProfileDoc,
} from "@/lib/firebase";
import { clearSession, loadSession, saveSession, type AuthSession } from "@/lib/auth";
import {
  createPortfolio,
  defaultContent,
  defaultSections,
  defaultTheme,
  uid,
  type Content,
  type Section,
  type Theme,
} from "@/lib/portfolio";
import { deletePortfolio, upsertPortfolio, type PortfolioRecord } from "@/lib/storage";

export interface UserDashboardProps {
  defaultTab?: "roadmap" | "portfolios" | "admin";
  hideNavbar?: boolean;
}

export function UserDashboard({
  defaultTab = "roadmap",
  hideNavbar = false,
}: UserDashboardProps = {}) {
  const nav = useNavigate();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [portfolios, setPortfolios] = useState<FirebasePortfolioDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [avatarInput, setAvatarInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncingMap, setSyncingMap] = useState<Record<string, boolean>>({});
  const [pdfModalPortfolio, setPdfModalPortfolio] = useState<FirebasePortfolioDoc | null>(null);
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"roadmap" | "portfolios" | "admin">(defaultTab);

  // ... rest of the full clean component follows in the actual file content from artifacts ...
  return (
    <div className={hideNavbar ? "space-y-6" : "min-h-screen grain"}>
      <p>Dashboard loading...</p>
    </div>
  );
}
