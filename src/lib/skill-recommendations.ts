export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface RoleRecommendation {
  role: string;
  matchPatterns: RegExp[];
  categories: SkillCategory[];
  topRecommendations: string[];
  description: string;
}

export const SOFTWARE_ENGINEER_SKILLS: RoleRecommendation = {
  role: "Software Engineer",
  matchPatterns: [
    /\bsoftware\s*enginee?r\b/i,
    /\bsoftware\s*engineering\b/i,
    /\bsoftware\s*dev(eloper)?\b/i,
    /\b(sde|swe)\b/i,
    /\bsde[- ]?[123i]{1,3}\b/i,
    /\bswe[- ]?[123i]{1,3}\b/i,
    /\bsoftware\s*architect\b/i,
  ],
  description:
    "Core competencies, frameworks, systems, and tools highly sought after for Software Engineering (SWE / SDE) roles.",
  topRecommendations: [
    "TypeScript",
    "React",
    "Python",
    "Node.js",
    "Data Structures & Algorithms",
    "System Design",
    "PostgreSQL",
    "Docker",
    "Git",
    "REST APIs",
    "AWS",
    "CI/CD",
  ],
  categories: [
    {
      name: "Core Languages",
      skills: ["TypeScript", "JavaScript", "Python", "Java", "C++", "Go", "SQL"],
    },
    {
      name: "CS Fundamentals & Architecture",
      skills: [
        "Data Structures & Algorithms",
        "System Design",
        "Object-Oriented Programming (OOP)",
        "Design Patterns",
        "Microservices",
        "Concurrency & Multithreading",
      ],
    },
    {
      name: "Frameworks & Web Development",
      skills: ["React", "Node.js", "Next.js", "Express", "REST APIs", "GraphQL", "TailwindCSS"],
    },
    {
      name: "Databases & Caching",
      skills: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "Prisma / Drizzle ORM"],
    },
    {
      name: "DevOps, Cloud & Tools",
      skills: [
        "Git & GitHub",
        "Docker",
        "Kubernetes",
        "CI/CD Pipelines",
        "AWS",
        "Linux",
        "Unit & Integration Testing (Jest/Vitest)",
      ],
    },
  ],
};

export const OTHER_ROLE_RECOMMENDATIONS: RoleRecommendation[] = [
  {
    role: "Frontend Engineer",
    matchPatterns: [/\bfront[- ]?end\b/i, /\bui(\/ux)?\s*engineer\b/i, /\breact\s*dev\b/i],
    description: "Modern frontend web architectures, component libraries, state, and tooling.",
    topRecommendations: [
      "TypeScript",
      "React",
      "Next.js",
      "TailwindCSS",
      "JavaScript (ES6+)",
      "HTML5 / CSS3",
      "Redux / Zustand",
      "GraphQL",
      "Jest / Vitest",
      "Vite / Webpack",
    ],
    categories: [
      {
        name: "Languages & Frameworks",
        skills: ["TypeScript", "JavaScript (ES6+)", "React", "Next.js", "Vue.js", "HTML5 / CSS3"],
      },
      {
        name: "Styling & UI",
        skills: ["TailwindCSS", "CSS Modules", "Framer Motion", "Shadcn UI", "Responsive Design"],
      },
      {
        name: "State & Testing",
        skills: ["Zustand", "Redux Toolkit", "React Query", "Vitest", "Playwright / Cypress"],
      },
    ],
  },
  {
    role: "Backend Engineer",
    matchPatterns: [/\bback[- ]?end\b/i, /\bapi\s*engineer\b/i, /\bserver[- ]?side\b/i],
    description: "High-throughput server runtimes, databases, distributed caches, and security.",
    topRecommendations: [
      "Node.js",
      "Go",
      "Python",
      "PostgreSQL",
      "Redis",
      "Docker",
      "REST APIs",
      "gRPC",
      "Microservices",
      "System Design",
    ],
    categories: [
      {
        name: "Runtimes & Languages",
        skills: ["Node.js", "Go", "Python", "Java", "C#", "Rust"],
      },
      {
        name: "APIs & Systems",
        skills: [
          "REST APIs",
          "gRPC",
          "GraphQL",
          "Microservices",
          "System Design",
          "Kafka / RabbitMQ",
        ],
      },
      {
        name: "Databases & Storage",
        skills: ["PostgreSQL", "Redis", "MongoDB", "Elasticsearch", "SQL Optimization"],
      },
    ],
  },
  {
    role: "Full Stack Engineer",
    matchPatterns: [/\bfull[- ]?stack\b/i],
    description:
      "End-to-end web software engineering across UI, server, database, and infrastructure.",
    topRecommendations: [
      "TypeScript",
      "React",
      "Next.js",
      "Node.js",
      "PostgreSQL",
      "Docker",
      "TailwindCSS",
      "Prisma",
      "REST APIs",
      "Git",
    ],
    categories: [
      {
        name: "Full Stack Tech",
        skills: ["TypeScript", "React", "Next.js", "Node.js", "Express", "TailwindCSS"],
      },
      {
        name: "Database & Cloud",
        skills: ["PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "Git"],
      },
    ],
  },
  {
    role: "DevOps & Cloud Engineer",
    matchPatterns: [/\bdevops\b/i, /\bcloud\s*engineer\b/i, /\bsre\b/i, /\binfrastructure\b/i],
    description: "Containerization, cloud infrastructure as code, CI/CD, and monitoring.",
    topRecommendations: [
      "Docker",
      "Kubernetes",
      "Terraform",
      "AWS",
      "CI/CD (GitHub Actions)",
      "Linux",
      "Prometheus & Grafana",
      "Bash / Python",
      "Ansible",
    ],
    categories: [
      {
        name: "Containers & Orchestration",
        skills: ["Docker", "Kubernetes", "Helm", "Container Security"],
      },
      {
        name: "Cloud & IaC",
        skills: ["AWS", "GCP", "Terraform", "CloudFormation", "Linux Administration"],
      },
    ],
  },
  {
    role: "Data Analyst",
    matchPatterns: [
      /\bdata\s*analyst\b/i,
      /\bdata\s*analytics\b/i,
      /\bbusiness\s*analyst\b/i,
      /\bbi\s*analyst\b/i,
      /\banalytics\s*engineer\b/i,
      /\banalyst\b/i,
    ],
    description:
      "Statistical analysis, business intelligence, dashboards, SQL pipelines, and reporting.",
    topRecommendations: [
      "SQL",
      "Python",
      "Tableau",
      "Power BI",
      "Pandas",
      "Excel (Advanced)",
      "Data Visualization",
      "Statistics & Probability",
      "ETL Pipelines",
      "Google Sheets",
      "A/B Testing",
      "Data Warehousing",
    ],
    categories: [
      {
        name: "Core Tools & Querying",
        skills: ["SQL", "Python", "Excel (Advanced)", "Google Sheets", "R", "Bash"],
      },
      {
        name: "Analysis & Libraries",
        skills: [
          "Pandas",
          "NumPy",
          "Statistics & Probability",
          "Hypothesis Testing",
          "A/B Testing",
        ],
      },
      {
        name: "BI & Visualization",
        skills: ["Tableau", "Power BI", "Data Visualization", "Looker", "Matplotlib / Seaborn"],
      },
      {
        name: "Data Warehousing & ETL",
        skills: ["ETL Pipelines", "PostgreSQL", "Snowflake", "BigQuery", "Data Modeling"],
      },
    ],
  },
  {
    role: "AI / Machine Learning Engineer",
    matchPatterns: [
      /\b(ai|ml)\s*engineer\b/i,
      /\bmachine\s*learning\b/i,
      /\bdata\s*scientist\b/i,
      /\bdata\s*science\b/i,
      /\bdeep\s*learning\b/i,
      /\bnlp\b/i,
      /\bcomputer\s*vision\b/i,
    ],
    description: "Model training, inference pipelines, PyTorch, LLMs, statistics, and MLOps.",
    topRecommendations: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "Scikit-Learn",
      "LangChain",
      "HuggingFace",
      "FastAPI",
      "Docker",
      "NumPy & Pandas",
      "MLOps",
      "Vector DBs (Pinecone/Milvus)",
    ],
    categories: [
      {
        name: "Frameworks & Math",
        skills: [
          "Python",
          "PyTorch",
          "TensorFlow",
          "Scikit-Learn",
          "NumPy & Pandas",
          "Linear Algebra",
        ],
      },
      {
        name: "Generative AI & Production",
        skills: ["HuggingFace", "LangChain", "Vector Databases", "FastAPI", "Docker", "MLOps"],
      },
    ],
  },
  {
    role: "Cybersecurity Analyst",
    matchPatterns: [
      /\b(cyber)?security\b/i,
      /\binfosec\b/i,
      /\bsoc\s*analyst\b/i,
      /\bpenetration\b/i,
    ],
    description: "Vulnerability analysis, network defense, threat modeling, and security hygiene.",
    topRecommendations: [
      "Network Security",
      "Linux",
      "Wireshark",
      "Python Scripting",
      "SIEM Tools (Splunk)",
      "Vulnerability Assessment",
      "OWASP Top 10",
      "Cryptography",
      "Identity & Access Management (IAM)",
    ],
    categories: [
      {
        name: "Security Fundamentals",
        skills: ["Network Security", "OWASP Top 10", "Cryptography", "IAM", "Threat Modeling"],
      },
      {
        name: "Tools & Forensics",
        skills: ["Wireshark", "Nmap", "Splunk", "Metasploit", "Burp Suite", "Linux Administration"],
      },
    ],
  },
  {
    role: "Mobile App Developer",
    matchPatterns: [
      /\bmobile\b/i,
      /\bandroid\b/i,
      /\bios\b/i,
      /\bflutter\b/i,
      /\breact\s*native\b/i,
    ],
    description: "Cross-platform and native mobile software engineering for iOS and Android.",
    topRecommendations: [
      "Flutter",
      "React Native",
      "Kotlin",
      "Swift",
      "TypeScript",
      "REST APIs",
      "Firebase Mobile",
      "Mobile UI/UX Design",
      "App Store Deployment",
    ],
    categories: [
      {
        name: "Mobile Frameworks",
        skills: ["Flutter", "React Native", "Kotlin", "Swift", "Dart"],
      },
      {
        name: "Architecture & Integration",
        skills: [
          "REST APIs",
          "Firebase Mobile",
          "SQLite",
          "State Management (Bloc/Redux)",
          "Mobile CI/CD",
        ],
      },
    ],
  },
];

export const ALL_RECOMMENDATIONS: RoleRecommendation[] = [
  SOFTWARE_ENGINEER_SKILLS,
  ...OTHER_ROLE_RECOMMENDATIONS,
];

/**
 * Checks if the given text matches "software engineer" or related synonyms
 */
export function isSoftwareEngineerRole(text: string): boolean {
  if (!text) return false;
  return SOFTWARE_ENGINEER_SKILLS.matchPatterns.some((pattern) => pattern.test(text));
}

/**
 * Detects the best matching role recommendation from headline/profile/role text.
 * Prioritizes Software Engineer when detected.
 */
export function detectRoleRecommendations(text: string): RoleRecommendation | null {
  if (!text || !text.trim()) return null;
  const clean = text.trim();

  // If Software Engineer is detected, always prioritize it
  if (isSoftwareEngineerRole(clean)) {
    return SOFTWARE_ENGINEER_SKILLS;
  }

  // Check other roles
  for (const rec of OTHER_ROLE_RECOMMENDATIONS) {
    if (rec.matchPatterns.some((pattern) => pattern.test(clean))) {
      return rec;
    }
  }

  return null;
}
