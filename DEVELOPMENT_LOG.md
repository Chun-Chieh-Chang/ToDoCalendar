# ToDoCalendar Development Log (PDCA)

## [2026-05-16] v1.3.0 Professional - MECE UX Refactoring

### 1. Requirements & Goals (Plan)
- **Goal**: Apply MECE (Mutually Exclusive, Collectively Exhaustive) principles to clean up navigation and functional redundancies.
- **Goal**: Consolidate Data Management into Settings to reduce system-level fragmentation.
- **Goal**: Unify Task List views into a single, high-performance Task Management Center.
- **Goal**: Enhance weekend visibility in the calendar with Morandi-tinted visual cues.

### 2. Implementation Details (Do)
- **Settings Multi-Tab Overhaul**: 
    - Refactored `Settings.tsx` into a tabbed interface (General, Visual, Data).
    - Merged backup, restore, and storage path logic from `DataManagementView` into the "Data" tab.
- **Unified Task Navigation**:
    - Condensed Sidebar: Merged "All", "Scheduled", and "Pending" into a single "Tasks" entry.
    - `TaskListView` Internal Tabs: Added sub-navigation (All / Scheduled / Backlog) for localized view switching.
- **Global Action Hub**: Introduced a "Global New Task" button in the sidebar as the primary system entry point.
- **Calendar Logic**: Implemented `is-saturday` and `is-sunday` color tints (Emerald/Coral) for improved temporal mapping.
- **Backup Naming**: Optimized backup filenames to include precision timestamps (`ToDoCalendar_Backup_yyyyMMdd_HHmmss.json`).

### 3. Verification & Results (Check)
- **UX Audit**: Navigation items reduced from 9 to 5, significantly lowering cognitive load.
- **Robustness**: Verified data import/export functionality within the new Settings tab.
- **Art Direction**: Maintained "Glass Order" aesthetics across all new UI elements (Tabs, Sub-tabs, Buttons).

### 4. Next Steps & Restoration Baseline
- Project state is verified as "v1.3.0 Professional".
- Ready for GitHub synchronization using `chun-chieh-chang` account.

---

## [2026-05-16] UI/UX Optimization & Restoration

### 1. Requirements & Goals (Plan)
- **Goal**: Restore the original "Transparent Glass" UX aesthetic while solving the "Lack of Boundary Sense" issue.
- **Goal**: Horizontally deploy (Yokoten) the UI fixes across all pages (Calendar, Kanban, Dashboard, Settings).
- **Goal**: Restore the original TaskForm layout (UX logic) that was compromised during previous refactoring.

### 2. Issues Encountered & Analysis (Do/Check)
- **Problem A**: Previous optimization made the glass elements too solid (opacity 0.7+), losing the "Ethereal" feel of the production site.
- **Problem B**: Horizontal expansion of TaskForm (3-column grid) made the form feel crowded and deviated from the user's intuitive workflow.
- **RCA (Root Cause Analysis)**:
    - Over-reliance on increasing opacity to solve "boundary" issues instead of using refined edge lighting/highlights.
    - Forced structural changes (Grid) without considering the original semantic grouping of tasks.

### 3. Corrective & Preventive Actions (Act/CAPA)
- **CAPA - UI Restoration**:
    - Reverted `--glass-bg` to `rgba(255, 255, 255, 0.25)` (25% opacity) for ethereal transparency.
    - Enhanced `--border-glass` to `rgba(255, 255, 255, 0.8)` and added `--inner-glow` to define boundaries through lighting, not opacity.
    - Standardized these tokens globally in `index.css`.
- **CAPA - Layout Restoration**:
    - Reverted `TaskForm` to its original row-based layout (Priority row, Category/Recurrence row).
    - Removed experimental `form-grid-3` styles.
- **CAPA - Horizontal Deployment**:
    - Applied the "Defined Glass" standard to `TaskCard`, `KanbanBoard`, `Dashboard`, and `Modals`.

### 4. Verification Results
- **Visual Check**: Glass elements now have clear "Boundary Sense" via crisp edge highlights while remaining transparent and blurred.
- **UX Check**: Task creation workflow restored to original logic.
- **Consistency**: All pages now share the same premium glassmorphism standard.

### 5. Failure Records & Self-Evolution (Critical)
- **Failure C - Repeated 404 (vite.svg)**:
    - **Symptom**: 404 error persisted even after fixing `index.html`.
    - **RCA (Root Cause Analysis)**: Incomplete fix protocol. The model only searched the entry point (`index.html`) but failed to recognize that React components (e.g., `App.tsx`) might dynamically manage the favicon via DOM manipulation.
    - **CAPA (Corrective & Preventive Action)**:
        - **Protocol Update**: Any fix involving asset paths or 404 errors **MUST** include a mandatory `grep_search` across the entire `src` directory before declaring "Done."
        - **Regression Check**: Added a step to check for dynamic favicon updates in the code when a favicon error is reported.
- **Failure D - Hardcoded Blur**:
    - **Symptom**: Settings slider for blur was ineffective for certain UI elements.
    - **RCA**: Inconsistent horizontal deployment. Hardcoded values were used during a "quick fix" for glass luminosity, breaking the link to the global `--glass-blur` variable.
    - **CAPA**: Enforce the **"Variables First"** policy. No hardcoded pixel values for design tokens are allowed in component-specific CSS. All tokens must be centralized in `index.css` and referenced via `var()`.

### 6. GlassEffect Skill & High-End Order Integration (Milestone)
- **Concept Extraction**: Extracted the "Glass Order" (一套秩序) from external source material.
- **Implementation**:
    - Refactored `inner-glow` to use the **Triple-Layer Edge Rule** (Inset Highlight, Border Shadow, Weightless Outer Shadow).
    - Introduced **Adaptive RGB Tinting** to allow glass to "blend" into environment colors in both Light/Dark modes.
- **Skill Creation**: Formally generated the `glass-effect` skill for cross-project reuse.

---

## 2026-03-20 | 歷史存檔 (及之前的開發記錄)
*(此處保留遠端合併過來的歷史記錄，供未來追蹤)*

- 2026-03-20: 設定按鈕修復與全系統國際化 (i18n) 徹底優化。
- 2026-03-20: UI/UX 深度優化與伺服器連線修復。
- 2026-03-14: 24小時制修正與數據管理功能初步移位。
