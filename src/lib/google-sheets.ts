/**
 * Google Sheets API Integration for Year-Wise Career Roadmap
 * Designed for targeting Google, Meta, and Tier-1 Product Companies.
 */

export interface RoadmapDepartmentItem {
  id: string;
  year: number;
  department: string;
  topic: string;
  goalOrMilestone: string;
  recommendedProblemsOrTasks: string;
  priority: "High" | "Crucial" | "Core";
  status: "Not Started" | "In Progress" | "Under Review" | "Mastered";
  resourceLink: string;
}

export interface ApplicationTrackerRow {
  company: string;
  role: string;
  tier: "Tier 1 (FAANG/Google)" | "Tier 1.5 (Uber/Stripe/Atlassian)" | "Product Unicorn" | "Other";
  jobUrl: string;
  appliedDate: string;
  referralContact: string;
  status:
    | "Wishlist"
    | "Applied"
    | "OA Round"
    | "Tech Round 1"
    | "Tech Round 2"
    | "System Design"
    | "Behavioral"
    | "Offer"
    | "Rejected";
  notes: string;
}

export const INITIAL_ROADMAP_DATA: RoadmapDepartmentItem[] = [
  // --- YEAR 1: FOUNDATIONS & CORE CS ---
  {
    id: "y1-1",
    year: 1,
    department: "Data Structures & Algorithms",
    topic: "Language Mastery (C++ / Java / Python)",
    goalOrMilestone:
      "Master syntax, memory pointers/references, STL/Collections, Big-O Time & Space analysis",
    recommendedProblemsOrTasks:
      "Implement custom Vector/ArrayList, solve 30 easy problems on arrays & strings",
    priority: "Crucial",
    status: "Mastered",
    resourceLink: "https://leetcode.com/explore/featured/card/the-leetcode-beginners-guide/",
  },
  {
    id: "y1-2",
    year: 1,
    department: "Data Structures & Algorithms",
    topic: "Linear Data Structures",
    goalOrMilestone:
      "Singly/Doubly Linked Lists, Stacks, Queues, Deque, Monotonic Stack fundamentals",
    recommendedProblemsOrTasks:
      "Reverse Linked List, Valid Parentheses, Min Stack, Implement Queue using Stacks",
    priority: "High",
    status: "Mastered",
    resourceLink: "https://neetcode.io/roadmap",
  },
  {
    id: "y1-3",
    year: 1,
    department: "Core Computer Science",
    topic: "Discrete Mathematics & Logic",
    goalOrMilestone:
      "Set theory, combinatorics, proof by induction, modular arithmetic, graph representation basics",
    recommendedProblemsOrTasks: "Number theory problems: GCD, Prime sieve, Modular exponentiation",
    priority: "Core",
    status: "In Progress",
    resourceLink: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/",
  },
  {
    id: "y1-4",
    year: 1,
    department: "Product Engineering",
    topic: "Developer Environment & Version Control",
    goalOrMilestone:
      "Git branching, merge conflicts, GitHub PR workflows, Linux CLI, Bash scripting basics",
    recommendedProblemsOrTasks:
      "Create GitHub profile README, publish 3 clean repos, automate small tasks with bash",
    priority: "High",
    status: "Mastered",
    resourceLink: "https://missing.csail.mit.edu/",
  },
  {
    id: "y1-5",
    year: 1,
    department: "Product Engineering",
    topic: "Web & API Fundamentals",
    goalOrMilestone:
      "HTML5/CSS3 semantic architecture, TypeScript/JavaScript async/await, REST API consumption",
    recommendedProblemsOrTasks:
      "Build 1 interactive client-side app (weather dashboard / task manager) deployed live",
    priority: "Core",
    status: "In Progress",
    resourceLink: "https://developer.mozilla.org/en-US/docs/Learn",
  },

  // --- YEAR 2: INTERMEDIATE DSA & PRODUCT PROJECTS ---
  {
    id: "y2-1",
    year: 2,
    department: "Data Structures & Algorithms",
    topic: "Trees, BST & Heaps",
    goalOrMilestone:
      "Binary Tree traversals (Inorder, Preorder, Postorder, Level-Order), BST validations, Min/Max Heaps",
    recommendedProblemsOrTasks:
      "Lowest Common Ancestor, Diameter of Binary Tree, Kth Largest Element, Top K Frequent Elements",
    priority: "Crucial",
    status: "In Progress",
    resourceLink: "https://leetcode.com/problem-list/binary-tree/",
  },
  {
    id: "y2-2",
    year: 2,
    department: "Data Structures & Algorithms",
    topic: "Two Pointers & Sliding Window",
    goalOrMilestone:
      "Subarray optimization, fast-slow pointers, two-sum variations, cycle detection",
    recommendedProblemsOrTasks:
      "3Sum, Container With Most Water, Longest Substring Without Repeating Characters",
    priority: "Crucial",
    status: "In Progress",
    resourceLink: "https://neetcode.io/practice",
  },
  {
    id: "y2-3",
    year: 2,
    department: "Core Computer Science",
    topic: "Database Management Systems (DBMS)",
    goalOrMilestone:
      "Relational modeling, Normalization (1NF-BCNF), Indexing (B-Trees), ACID properties, SQL complex joins",
    recommendedProblemsOrTasks:
      "Design schema for e-commerce, write 20 advanced SQL queries (window functions, CTEs)",
    priority: "Crucial",
    status: "In Progress",
    resourceLink: "https://use-the-index-luke.com/",
  },
  {
    id: "y2-4",
    year: 2,
    department: "Core Computer Science",
    topic: "Operating Systems (OS)",
    goalOrMilestone:
      "Processes vs Threads, CPU scheduling, Synchronization (Mutex, Semaphores), Deadlocks, Virtual Memory, Paging",
    recommendedProblemsOrTasks:
      "Implement producer-consumer problem, simulate dining philosophers, analyze memory leaks",
    priority: "Crucial",
    status: "Not Started",
    resourceLink: "https://pages.cs.wisc.edu/~remzi/OSTEP/",
  },
  {
    id: "y2-5",
    year: 2,
    department: "Product Engineering",
    topic: "Full-Stack Production Project 1",
    goalOrMilestone:
      "End-to-end full stack application with authentication, database persistence, state management, CI/CD",
    recommendedProblemsOrTasks:
      "Build real-time collaborative workspace / Kanban board, deploy to cloud with custom domain",
    priority: "Crucial",
    status: "In Progress",
    resourceLink: "https://github.com",
  },
  {
    id: "y2-6",
    year: 2,
    department: "Competitive & Open Source",
    topic: "Contest Participation & Open Source",
    goalOrMilestone:
      "Weekly LeetCode contests (target rating 1600+), contribute first bug fix/docs to active open-source repo",
    recommendedProblemsOrTasks:
      "Participate in 15 rated contests, submit 2 pull requests to open source projects",
    priority: "High",
    status: "In Progress",
    resourceLink: "https://leetcode.com/contest/",
  },

  // --- YEAR 3: ADVANCED ALGORITHMS, LLD & INTERNSHIPS ---
  {
    id: "y3-1",
    year: 3,
    department: "Data Structures & Algorithms",
    topic: "Graph Algorithms",
    goalOrMilestone:
      "BFS, DFS, Cycle Detection, Topological Sort, Dijkstra's Shortest Path, Disjoint Set Union (DSU), Kruskal/Prim",
    recommendedProblemsOrTasks:
      "Number of Islands, Course Schedule I & II, Network Delay Time, Word Ladder",
    priority: "Crucial",
    status: "In Progress",
    resourceLink:
      "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
  },
  {
    id: "y3-2",
    year: 3,
    department: "Data Structures & Algorithms",
    topic: "Dynamic Programming (DP)",
    goalOrMilestone:
      "1D DP, 2D Grid DP, Knapsack variations, Longest Common Subsequence, DP on Trees, Bitmask DP",
    recommendedProblemsOrTasks:
      "Climbing Stairs, Coin Change, Longest Increasing Subsequence, Edit Distance, Best Time to Buy and Sell Stock",
    priority: "Crucial",
    status: "Not Started",
    resourceLink:
      "https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns",
  },
  {
    id: "y3-3",
    year: 3,
    department: "Core Computer Science",
    topic: "Computer Networks (CN)",
    goalOrMilestone:
      "OSI & TCP/IP stack, TCP 3-way handshake vs UDP, HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS lookup flow, TLS/SSL handshake, WebSockets",
    recommendedProblemsOrTasks:
      "Analyze network packets with Wireshark, build a multi-threaded socket chat in C++/Python",
    priority: "High",
    status: "In Progress",
    resourceLink: "https://hpbn.co/",
  },
  {
    id: "y3-4",
    year: 3,
    department: "System Design",
    topic: "Low-Level Design (LLD) & Design Patterns",
    goalOrMilestone:
      "SOLID Principles, Factory, Singleton, Strategy, Observer, Decorator, Adapter, Clean Code practices",
    recommendedProblemsOrTasks:
      "Design Parking Lot, Design Splitwise, Design Elevator System, Design Tic-Tac-Toe in OOP",
    priority: "Crucial",
    status: "In Progress",
    resourceLink: "https://refactoring.guru/design-patterns",
  },
  {
    id: "y3-5",
    year: 3,
    department: "Product Engineering",
    topic: "High-Impact Scalable Project 2",
    goalOrMilestone:
      "Distributed/microservice architecture: caching with Redis, message queues (Kafka/RabbitMQ), rate limiting",
    recommendedProblemsOrTasks:
      "Build an API Gateway or high-throughput URL shortener with Redis caching and analytics pipeline",
    priority: "Crucial",
    status: "Not Started",
    resourceLink: "https://roadmap.sh/backend",
  },
  {
    id: "y3-6",
    year: 3,
    department: "Career & Interview Preparation",
    topic: "Summer Internship Search & Referrals",
    goalOrMilestone:
      "Craft ATS-optimized 1-page resume, reach out to 50+ engineers/alumni on LinkedIn for referrals, apply to 100+ openings",
    recommendedProblemsOrTasks:
      "Apply to Google STEP / SWE Intern, Microsoft Explore/Intern, Amazon SDE Intern",
    priority: "Crucial",
    status: "In Progress",
    resourceLink: "https://www.levels.fyi/internships/",
  },

  // --- YEAR 4: HIGH-LEVEL SYSTEM DESIGN & GOOGLE PLACEMENT ---
  {
    id: "y4-1",
    year: 4,
    department: "System Design",
    topic: "High-Level System Design (HLD)",
    goalOrMilestone:
      "Horizontal vs Vertical scaling, Load Balancers, Consistent Hashing, Database Sharding, Caching strategies, CDN, CAP Theorem",
    recommendedProblemsOrTasks:
      "Design URL Shortener (TinyURL), Design Instagram Feed, Design Distributed Cache, Design Rate Limiter",
    priority: "Crucial",
    status: "Not Started",
    resourceLink: "https://github.com/donnemartin/system-design-primer",
  },
  {
    id: "y4-2",
    year: 4,
    department: "Data Structures & Algorithms",
    topic: "Google-Tagged & Hard Problem Polish",
    goalOrMilestone:
      "Google tagged problems on LeetCode: Trie, Segment Trees, Topological sorting, Greedy, Interval scheduling",
    recommendedProblemsOrTasks:
      "Solve 50 Google tagged Medium/Hard problems under 35-minute timed interview simulation",
    priority: "Crucial",
    status: "Not Started",
    resourceLink: "https://leetcode.com/company/google/",
  },
  {
    id: "y4-3",
    year: 4,
    department: "Career & Interview Preparation",
    topic: "Googliness & Behavioral (STAR Method)",
    goalOrMilestone:
      "Prepare 6 solid STAR stories: Ambiguity, Conflict resolution, Failure/Learning, Ownership, Leading a project",
    recommendedProblemsOrTasks:
      "Draft behavioral matrix with Google's 10 Core Values (Focus on user, Bias for action, Respect)",
    priority: "Crucial",
    status: "Not Started",
    resourceLink: "https://www.techinterviewhandbook.org/behavioral-interview/",
  },
  {
    id: "y4-4",
    year: 4,
    department: "Career & Interview Preparation",
    topic: "Live Mock Interviews & Peer Rounds",
    goalOrMilestone:
      "Participate in 15+ live technical and system design mock interviews with peers and industry mentors",
    recommendedProblemsOrTasks:
      "Use Pramp or Interviewing.io, record sessions, fix communication habits and thinking out loud",
    priority: "Crucial",
    status: "Not Started",
    resourceLink: "https://www.pramp.com/",
  },
  {
    id: "y4-5",
    year: 4,
    department: "Career & Interview Preparation",
    topic: "Full-Time Placement & Offer Negotiation",
    goalOrMilestone:
      "Track all applications, prepare for multiple offer evaluations, salary negotiation strategy using Levels.fyi",
    recommendedProblemsOrTasks:
      "Target minimum 3 offers, understand equity/RSU grants, signing bonuses, base pay structures",
    priority: "Crucial",
    status: "Not Started",
    resourceLink: "https://www.levels.fyi/",
  },
];

export const INITIAL_APPLICATION_PIPELINE: ApplicationTrackerRow[] = [
  {
    company: "Google",
    role: "Software Engineer (L3 / New Grad)",
    tier: "Tier 1 (FAANG/Google)",
    jobUrl: "https://careers.google.com/jobs/results/",
    appliedDate: "Target: Aug 2026",
    referralContact: "Senior SWE / Alumni Connection",
    status: "Wishlist",
    notes: "Requires deep DSA (Graphs/DP), clean modular code, Googliness cultural round.",
  },
  {
    company: "Microsoft",
    role: "Software Engineer 1 (Core Services)",
    tier: "Tier 1 (FAANG/Google)",
    jobUrl: "https://careers.microsoft.com/",
    appliedDate: "Target: Aug 2026",
    referralContact: "Principal PM / Team Member",
    status: "Wishlist",
    notes: "Focus on Trees, Graphs, OOP Principles, and OS/Threading concurrency.",
  },
  {
    company: "Uber",
    role: "Software Engineer 1 (Distributed Systems)",
    tier: "Tier 1.5 (Uber/Stripe/Atlassian)",
    jobUrl: "https://www.uber.com/us/en/careers/",
    appliedDate: "Target: Sep 2026",
    referralContact: "Tech Lead on LinkedIn",
    status: "Wishlist",
    notes: "High emphasis on System Design basics, concurrency, and real-time backend.",
  },
  {
    company: "Amazon",
    role: "Software Development Engineer 1",
    tier: "Tier 1 (FAANG/Google)",
    jobUrl: "https://www.amazon.jobs/",
    appliedDate: "Target: Sep 2026",
    referralContact: "University Recruiter",
    status: "Wishlist",
    notes: "Strict 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action).",
  },
  {
    company: "Stripe",
    role: "Software Engineer (Infrastructure)",
    tier: "Tier 1.5 (Uber/Stripe/Atlassian)",
    jobUrl: "https://stripe.com/jobs",
    appliedDate: "Target: Oct 2026",
    referralContact: "Staff Engineer referral",
    status: "Wishlist",
    notes: "Practical programming rounds: building real features, debugging large codebases.",
  },
];

/**
 * Creates the complete Google Spreadsheet using Google Sheets API v4
 */
export async function createProductCompanyRoadmapSheet(
  accessToken: string,
  userProfile?: { name?: string; email?: string; targetRole?: string },
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const userName = userProfile?.name || "Candidate";
  const title = `Google & Product Company Career Tracker — ${userName}`;

  // Step 1: Create Spreadsheet with multiple tabs
  const createPayload = {
    properties: {
      title,
      locale: "en_US",
      autoRecalc: "ON_CHANGE",
    },
    sheets: [
      {
        properties: {
          title: "Executive Summary",
          gridProperties: { rowCount: 50, columnCount: 10, frozenRowCount: 3 },
          tabColor: { red: 0.1, green: 0.45, blue: 0.91 },
        },
      },
      {
        properties: {
          title: "Year 1 - Foundations & Core CS",
          gridProperties: { rowCount: 60, columnCount: 9, frozenRowCount: 2 },
          tabColor: { red: 0.2, green: 0.65, blue: 0.35 },
        },
      },
      {
        properties: {
          title: "Year 2 - Intermediate & Dev",
          gridProperties: { rowCount: 60, columnCount: 9, frozenRowCount: 2 },
          tabColor: { red: 0.95, green: 0.6, blue: 0.1 },
        },
      },
      {
        properties: {
          title: "Year 3 - Advanced Algo & Intern",
          gridProperties: { rowCount: 60, columnCount: 9, frozenRowCount: 2 },
          tabColor: { red: 0.55, green: 0.25, blue: 0.8 },
        },
      },
      {
        properties: {
          title: "Year 4 - System Design & Google",
          gridProperties: { rowCount: 60, columnCount: 9, frozenRowCount: 2 },
          tabColor: { red: 0.85, green: 0.2, blue: 0.2 },
        },
      },
      {
        properties: {
          title: "Application Pipeline",
          gridProperties: { rowCount: 100, columnCount: 9, frozenRowCount: 2 },
          tabColor: { red: 0.15, green: 0.2, blue: 0.25 },
        },
      },
      {
        properties: {
          title: "Curated Resources",
          gridProperties: { rowCount: 40, columnCount: 6, frozenRowCount: 2 },
          tabColor: { red: 0.35, green: 0.45, blue: 0.55 },
        },
      },
    ],
  };

  const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.text();
    throw new Error(`Google Sheets API Error (${createRes.status}): ${errorBody}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl =
    sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Step 2: Populate all sheets with comprehensive content & formulas
  const valuesData = [
    // --- TAB 1: EXECUTIVE SUMMARY ---
    {
      range: "'Executive Summary'!A1:H22",
      values: [
        ["GOOGLE & PRODUCT COMPANY PREPARATION DASHBOARD", "", "", "", "", "", "", ""],
        [
          "Target Goal: Software Engineer (L3/L4 / SDE-1) at Google / Top-Tier Tech Companies",
          "",
          "",
          "",
          `Candidate: ${userName}`,
          "",
          `Generated: ${new Date().toLocaleDateString()}`,
          "",
        ],
        [
          "Metric / Department",
          "Total Topics",
          "Mastered",
          "In Progress",
          "Not Started",
          "Completion %",
          "Status Indicator",
          "Benchmark Target for Google",
        ],
        [
          "Year 1: Foundations & Core CS",
          "=COUNTA('Year 1 - Foundations & Core CS'!C3:C20)",
          "=COUNTIF('Year 1 - Foundations & Core CS'!F3:F20, \"Mastered\")",
          "=COUNTIF('Year 1 - Foundations & Core CS'!F3:F20, \"In Progress\")",
          "=COUNTIF('Year 1 - Foundations & Core CS'!F3:F20, \"Not Started\")",
          "=IF(B4=0, 0, C4/B4)",
          '=IF(F4>=0.8, "✅ Ready", IF(F4>=0.4, "⚠️ In Progress", "⏳ Needs Work"))',
          "Strong programming fundamentals, OOP, STL, Big-O",
        ],
        [
          "Year 2: Intermediate DSA & Dev Projects",
          "=COUNTA('Year 2 - Intermediate & Dev'!C3:C20)",
          "=COUNTIF('Year 2 - Intermediate & Dev'!F3:F20, \"Mastered\")",
          "=COUNTIF('Year 2 - Intermediate & Dev'!F3:F20, \"In Progress\")",
          "=COUNTIF('Year 2 - Intermediate & Dev'!F3:F20, \"Not Started\")",
          "=IF(B5=0, 0, C5/B5)",
          '=IF(F5>=0.8, "✅ Ready", IF(F5>=0.4, "⚠️ In Progress", "⏳ Needs Work"))',
          "Trees, Heaps, DBMS Indexing, OS Threading, 1 Live App",
        ],
        [
          "Year 3: Advanced Algorithms & Internships",
          "=COUNTA('Year 3 - Advanced Algo & Intern'!C3:C20)",
          "=COUNTIF('Year 3 - Advanced Algo & Intern'!F3:F20, \"Mastered\")",
          "=COUNTIF('Year 3 - Advanced Algo & Intern'!F3:F20, \"In Progress\")",
          "=COUNTIF('Year 3 - Advanced Algo & Intern'!F3:F20, \"Not Started\")",
          "=IF(B6=0, 0, C6/B6)",
          '=IF(F6>=0.8, "✅ Ready", IF(F6>=0.4, "⚠️ In Progress", "⏳ Needs Work"))',
          "Graphs, DP, Networks, LLD SOLID, Summer Internship",
        ],
        [
          "Year 4: System Design & Google Placement",
          "=COUNTA('Year 4 - System Design & Google'!C3:C20)",
          "=COUNTIF('Year 4 - System Design & Google'!F3:F20, \"Mastered\")",
          "=COUNTIF('Year 4 - System Design & Google'!F3:F20, \"In Progress\")",
          "=COUNTIF('Year 4 - System Design & Google'!F3:F20, \"Not Started\")",
          "=IF(B7=0, 0, C7/B7)",
          '=IF(F7>=0.8, "✅ Ready", IF(F7>=0.4, "⚠️ In Progress", "⏳ Needs Work"))',
          "HLD Scalability, Googliness Stories, 15+ Mock Rounds",
        ],
        [
          "TOTAL ACROSS ALL 4 YEARS",
          "=SUM(B4:B7)",
          "=SUM(C4:C7)",
          "=SUM(D4:D7)",
          "=SUM(E4:E7)",
          "=IF(B8=0, 0, C8/B8)",
          '=IF(F8>=0.75, "🎯 GOOGLE INTERVIEW READY", "📈 IN ACTIVE PREPARATION")',
          "Min 400 LeetCode + 2 High Impact Deployed Projects",
        ],
        ["", "", "", "", "", "", "", ""],
        ["COMPANY APPLICATION PIPELINE SUMMARY", "", "", "", "", "", "", ""],
        [
          "Applications Sent",
          "=COUNTA('Application Pipeline'!A3:A50)",
          "",
          "Offer Received",
          "=COUNTIF('Application Pipeline'!G3:G50, \"Offer\")",
          "",
          "",
          "",
        ],
        [
          "Active Interview Rounds",
          "=COUNTIF('Application Pipeline'!G3:G50, \"Tech*\") + COUNTIF('Application Pipeline'!G3:G50, \"System*\") + COUNTIF('Application Pipeline'!G3:G50, \"OA*\")",
          "",
          "Pending Wishlist",
          "=COUNTIF('Application Pipeline'!G3:G50, \"Wishlist\")",
          "",
          "",
          "",
        ],
        ["", "", "", "", "", "", "", ""],
        ["HOW GOOGLE ASSESSES CANDIDATES (4 CORE PILLARS)", "", "", "", "", "", "", ""],
        [
          "1. General Cognitive Ability (GCA)",
          "Ability to learn quickly, structure ambiguous problems, ask clarifying questions, and evaluate edge cases.",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "2. Role-Related Knowledge (RRK)",
          "Clean coding in chosen language, memory constraints, data structure trade-offs, architecture choices.",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "3. Leadership",
          "Stepping up when needed without title, taking ownership, navigating disagreements constructively with data.",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "4. Googleyness",
          "Doing the right thing, intellectual humility, thrives in ambiguity, collaborative team mindset, bias for action.",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
      ],
    },

    // --- TAB 2: YEAR 1 ---
    {
      range: "'Year 1 - Foundations & Core CS'!A1:H10",
      values: [
        ["YEAR 1 — COMPUTER SCIENCE FOUNDATIONS & PROGRAMMING MASTERY", "", "", "", "", "", "", ""],
        [
          "S.No",
          "Department",
          "Topic / Core Skill",
          "Key Goals & Milestones",
          "Recommended Problems & Deliverables",
          "Status",
          "Priority",
          "Reference / Learning Link",
        ],
        ...INITIAL_ROADMAP_DATA.filter((i) => i.year === 1).map((item, idx) => [
          idx + 1,
          item.department,
          item.topic,
          item.goalOrMilestone,
          item.recommendedProblemsOrTasks,
          item.status,
          item.priority,
          item.resourceLink,
        ]),
      ],
    },

    // --- TAB 3: YEAR 2 ---
    {
      range: "'Year 2 - Intermediate & Dev'!A1:H10",
      values: [
        [
          "YEAR 2 — INTERMEDIATE DSA, CORE OS & DBMS, PRODUCTION PROJECTS",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "S.No",
          "Department",
          "Topic / Core Skill",
          "Key Goals & Milestones",
          "Recommended Problems & Deliverables",
          "Status",
          "Priority",
          "Reference / Learning Link",
        ],
        ...INITIAL_ROADMAP_DATA.filter((i) => i.year === 2).map((item, idx) => [
          idx + 1,
          item.department,
          item.topic,
          item.goalOrMilestone,
          item.recommendedProblemsOrTasks,
          item.status,
          item.priority,
          item.resourceLink,
        ]),
      ],
    },

    // --- TAB 4: YEAR 3 ---
    {
      range: "'Year 3 - Advanced Algo & Intern'!A1:H10",
      values: [
        [
          "YEAR 3 — ADVANCED ALGORITHMS, SYSTEM ARCHITECTURE & INTERNSHIPS",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "S.No",
          "Department",
          "Topic / Core Skill",
          "Key Goals & Milestones",
          "Recommended Problems & Deliverables",
          "Status",
          "Priority",
          "Reference / Learning Link",
        ],
        ...INITIAL_ROADMAP_DATA.filter((i) => i.year === 3).map((item, idx) => [
          idx + 1,
          item.department,
          item.topic,
          item.goalOrMilestone,
          item.recommendedProblemsOrTasks,
          item.status,
          item.priority,
          item.resourceLink,
        ]),
      ],
    },

    // --- TAB 5: YEAR 4 ---
    {
      range: "'Year 4 - System Design & Google'!A1:H10",
      values: [
        [
          "YEAR 4 — HIGH-LEVEL SYSTEM DESIGN, GOOGLINESS & FULL-TIME PLACEMENT",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          "S.No",
          "Department",
          "Topic / Core Skill",
          "Key Goals & Milestones",
          "Recommended Problems & Deliverables",
          "Status",
          "Priority",
          "Reference / Learning Link",
        ],
        ...INITIAL_ROADMAP_DATA.filter((i) => i.year === 4).map((item, idx) => [
          idx + 1,
          item.department,
          item.topic,
          item.goalOrMilestone,
          item.recommendedProblemsOrTasks,
          item.status,
          item.priority,
          item.resourceLink,
        ]),
      ],
    },

    // --- TAB 6: APPLICATION PIPELINE ---
    {
      range: "'Application Pipeline'!A1:I10",
      values: [
        ["TARGET COMPANY JOB & INTERNSHIP APPLICATION PIPELINE", "", "", "", "", "", "", "", ""],
        [
          "Company",
          "Target Role",
          "Tier Classification",
          "Application URL",
          "Applied / Target Date",
          "Referral Contact",
          "Pipeline Status",
          "Key Interview Focus & Notes",
          "Offer / Decision",
        ],
        ...INITIAL_APPLICATION_PIPELINE.map((row) => [
          row.company,
          row.role,
          row.tier,
          row.jobUrl,
          row.appliedDate,
          row.referralContact,
          row.status,
          row.notes,
          "",
        ]),
      ],
    },

    // --- TAB 7: CURATED RESOURCES ---
    {
      range: "'Curated Resources'!A1:E12",
      values: [
        ["GOLD-STANDARD PREPARATION RESOURCES FOR PRODUCT-BASED COMPANIES", "", "", "", ""],
        ["Category", "Resource Title", "Type", "Estimated Time", "Direct URL"],
        [
          "DSA Practice Sheet",
          "NeetCode 150 & All Patterns",
          "Problem Set / Video Explanations",
          "3-4 Months",
          "https://neetcode.io/practice",
        ],
        [
          "DSA Comprehensive",
          "Striver's A2Z DSA Sheet",
          "Structured Step-by-Step Curriculum",
          "4-6 Months",
          "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        ],
        [
          "System Design Primer",
          "System Design Primer by Donne Martin",
          "Open Source GitHub Guide",
          "4 Weeks",
          "https://github.com/donnemartin/system-design-primer",
        ],
        [
          "System Design Book",
          "Designing Data-Intensive Applications (DDIA)",
          "Book by Martin Kleppmann",
          "6-8 Weeks",
          "https://dataintensive.net/",
        ],
        [
          "Operating Systems",
          "Operating Systems: Three Easy Pieces (OSTEP)",
          "Free Online Textbook",
          "4 Weeks",
          "https://pages.cs.wisc.edu/~remzi/OSTEP/",
        ],
        [
          "Computer Networks",
          "High Performance Browser Networking",
          "Free Online Book by Ilya Grigorik",
          "3 Weeks",
          "https://hpbn.co/",
        ],
        [
          "Behavioral & STAR",
          "Tech Interview Handbook: Behavioral Guide",
          "Interview Playbook",
          "1 Week",
          "https://www.techinterviewhandbook.org/behavioral-interview/",
        ],
        [
          "Google Life & Culture",
          "Google Student Careers & SWE Guide",
          "Official Google Guide",
          "Ongoing",
          "https://careers.google.com/students/",
        ],
        [
          "Mock Interviews",
          "Pramp (Free Peer Mock Interviews)",
          "Interactive Practice Platform",
          "Weekly",
          "https://www.pramp.com/",
        ],
      ],
    },
  ];

  const updateValuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: valuesData,
      }),
    },
  );

  if (!updateValuesRes.ok) {
    const errorBody = await updateValuesRes.text();
    console.warn(`Values update issue (${updateValuesRes.status}): ${errorBody}`);
  }

  // Step 3: Polish formatting with batchUpdate (styling headers, fonts, colors)
  try {
    const formattingRequests = [
      // Auto-resize columns on sheets
      {
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheetData.sheets?.[0]?.properties?.sheetId || 0,
            dimension: "COLUMNS",
            startIndex: 0,
            endIndex: 8,
          },
        },
      },
      // Format Title Banner row 1 of Sheet 0
      {
        repeatCell: {
          range: {
            sheetId: sheetData.sheets?.[0]?.properties?.sheetId || 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 8,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.1, green: 0.2, blue: 0.4 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 14,
                bold: true,
              },
              horizontalAlignment: "CENTER",
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
        },
      },
      // Format Table Headers row 3 of Sheet 0
      {
        repeatCell: {
          range: {
            sheetId: sheetData.sheets?.[0]?.properties?.sheetId || 0,
            startRowIndex: 2,
            endRowIndex: 3,
            startColumnIndex: 0,
            endColumnIndex: 8,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.15, green: 0.45, blue: 0.85 },
              textFormat: {
                foregroundColor: { red: 1, green: 1, blue: 1 },
                fontSize: 10,
                bold: true,
              },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      },
    ];

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests: formattingRequests }),
    });
  } catch (fmtError) {
    console.warn("Formatting batchUpdate had non-critical issue:", fmtError);
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Appends a new application entry to the user's Application Pipeline sheet
 */
export async function appendApplicationToSheet(
  accessToken: string,
  spreadsheetId: string,
  row: ApplicationTrackerRow,
): Promise<boolean> {
  const range = "'Application Pipeline'!A:I";
  const body = {
    values: [
      [
        row.company,
        row.role,
        row.tier,
        row.jobUrl,
        row.appliedDate,
        row.referralContact,
        row.status,
        row.notes,
        "",
      ],
    ],
  };

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  return res.ok;
}
