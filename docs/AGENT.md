
# 🏗️ Sagent: Frontend Master Architecture (Vite + React)

## Some basic informations:
*   Web name: "Sagent", not "ReseachIQ".
*   In the dashboard, we will only have the following screens:
    *   Home
    * Paper Discovery
    * Workspace (You can see in docs/images/ that it has the name "Projects"), which is renamed from "Projects"
    * Synthesis Lab
    * Analytics
    * Settings

## 1. Complete Project Directory Structure
*Teammates: Use this structure to maintain a clean SPA (Single Page Application) with Vite.*

```text
src/
├── routes/                     # ROUTING (Centralized React Router config)
│   ├── AppRoutes.tsx           # Main routing logic & protected routes
│   └── paths.ts                # Constant string paths (e.g., DASHBOARD: '/home')
│
├── layouts/                    # WRAPPERS
│   ├── AuthLayout.tsx          # Wrapper for Login/Register (no sidebar)
│   └── DashboardLayout.tsx     # Wrapper with Sidebar, Topbar, and (?) Chat
│
├── pages/                      # VIEW ENTRY POINTS (Connected to Routes)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── dashboard/
│   │   ├── HomePage.tsx        # [HOME SCREEN]
│   │   ├── DiscoveryPage.tsx   # [PAPER DISCOVERY SCREEN]
│   │   ├── WorkspacePage.tsx   # [MY WORKSPACES SCREEN] - List View
│   │   ├── WorkspaceDetail.tsx # [MY WORKSPACES SCREEN] - Single View
│   │   ├── SynthesisPage.tsx   # [SYNTHESIS LAB SCREEN]
│   │   ├── AnalyticsPage.tsx   # [ANALYTICS SCREEN]
│   │   └── SettingsPage.tsx    # [SETTINGS SCREEN]
│
├── features/                   # BUSINESS LOGIC (Domain-specific)
│   ├── ai-agent/               # Agent Activity Feed & Floating Chat logic
│   │   ├── components/         # ChatWindow.tsx, ActivityCard.tsx
│   │   ├── hooks/              # useTaskPolling.ts (Check Celery status)
│   │   └── api/                # sendChatMessage.ts
│   ├── discovery/              # Search, Filters, and PDF Upload
│   │   ├── components/         # SearchFilters.tsx, UploadButton.tsx
│   │   └── api/                # fetchExternalPapers.ts
│   ├── workspaces/             # Workspace CRUD & Paper Management
│   │   ├── components/         # WorkspaceTable.tsx, ProjectCard.tsx
│   │   └── api/                # createWorkspace.ts
│   └── analytics/              # Data visualization logic
│       └── components/         # TrendChart.tsx, MethodsBarChart.tsx
│
├── shared/                     # REUSABLE FOUNDATION
│   ├── components/             # UI Kit (Buttons, Badges, Modals)
│   │   ├── ui/                 # Atomic components (shadcn/ui)
│   │   └── layout/             # Sidebar.tsx, Topbar.tsx
│   ├── hooks/                  # useAuth.ts, useDebounce.ts
│   └── utils/                  # axios-instance.ts, formatters.ts
│
├── config/                     # APP CONFIGURATION
│   └── constants.ts            # API URLs and Global settings
├── types/                      # GLOBAL TYPES
│   └── index.ts                # Paper, User, and Task interfaces
├── App.tsx                     # Global Providers (Auth, QueryClient)
└── main.tsx                    # Vite Entry Point
```

---

## 2. Screen Descriptions & Content

### A. Home (Research Dashboard)
*   **Purpose:** Overview of current research progress.
*   **Key Components:**
    *   **Active Workspace Cards:** (See `docs/images/` "Project Cards") - Shows status ribbons like "Critic Agent: Reviewing Consistency."
    *   **Agent Activity Feed:** Timeline of AI tasks (Synthesizer/Critic) across all workspaces.

### B. Paper Discovery
*   **Purpose:** Searching external databases (arXiv, etc.) and uploading PDFs.
*   **Key Components:**
    *   **Filter Sidebar:** Date range, venues, and keyword filters.
    *   **Search Bar:** Main input with an "AI Enhance" toggle.
    *   **Results:** Paper cards with options to "Save to Workspace."

### C. Workspace (Renamed from "Projects")
*   **Purpose:** Managing your saved paper collections.
*   **Key Components:**
    *   **Management Table:** (See `docs/images/` table design) - Project ID, Name, Paper Count.
    *   **Detail View:** Clicking a workspace reveals the list of papers within that specific folder.

### D. Synthesis Lab
*   **Purpose:** Where agents generate comparison tables and reviews.
*   **Key Components:**
    *   **Template Gallery:** Choose "Literature Review" or "Comparison Table."
    *   **Markdown Viewer:** Displays the finalized AI-generated artifact.

### E. Analytics
*   **Purpose:** Visual stats of your library.
*   **Key Components:** Line charts for publication trends and bar charts for methodology distribution.

### F. Settings
*   **Purpose:** Account preferences, notifications, and profile management.

---

## 3. Development Instructions for Vite

### A. Routing Logic
Since Vite does not have file-based routing, use `react-router-dom`. All pages should be imported into `src/routes/AppRoutes.tsx`.

### B. Clean-Up Action (Redundancy Removal)
Based on your current folder screenshot, tell your team to:
1.  **DELETE** the `src/app/` folder (that was for Next.js).
2.  **DELETE** `src/App.css` (move styles to `src/index.css`).
3.  **KEEP** `main.tsx` (This is your Vite entry point).
4.  **MOVE** `Sidebar.tsx` and `TopBar.tsx` into `src/shared/components/layout/`.
5.  **MOVE** `ProjectCard.tsx` into `src/features/workspaces/components/`.

### C. The Floating Chat
Place the `FloatingChat.tsx` component inside `src/layouts/DashboardLayout.tsx`. This ensures it appears on every page except Login/Register.

### D. Shared UI Consistency
*   Follow the design in `docs/images/`.
*   **Synthesizer Agent** = Blue Badge.
*   **Critic Agent** = Amber/Yellow Badge.
*   Even though images say "Projects", the code and labels must say **"Workspaces"**.

---

## 4. API & Integration
*   All backend calls should go to the **CS422-Sagent-Backend**.
*   Use `useTaskPolling.ts` in `features/ai-agent/hooks/` to check the status of async AI tasks from the Django/Celery backend.

## 5. References:
*   Current folder is CS422-Sagent-Frontend. If you want to find any information about the backend or the background handling logic, please refer to folder CS422-Sagent-Backend.
* Related docs will consist of: prompt.txt; which contains the system prompt and the user prompt. Remember that you have to follow the system prompt first, then to the user prompt.
* We also have some demonstration in `docs/images`. In that folder we contains some image example about our project frontend. Remember that the content in the images is a little bit different from ours; for example, in the images we have "Projects", but in our project that is "Workspaces". However, they just different in names - everything remains in normal. So, if you can, please follow the design in that folder.

---

### Summary Checklist for Implementation:
1. [ ] Configure `react-router-dom` in `src/routes/AppRoutes.tsx`.
2. [ ] Create the `DashboardLayout` with Sidebar and Topbar.
3. [ ] Build the `AgentProvider` context in `features/ai-agent` for the floating chat.
4. [ ] Implement the Workspace Table in `pages/dashboard/WorkspacePage.tsx`.