# Logy | OTLP Log Viewer

Logy is a high-performance, premium-designed log dashboard designed to visualize OTLP (OpenTelemetry Protocol) logs. It features advanced data processing pipelines, real-time service grouping, and a responsive histogram view, all optimized for high-volume data streams.

---

## 📂 Project Structure

The project follows a feature-based architecture, grouping components, hooks, and utilities by their domain (`logs`).

```text
src/
├── features/logs/
│   ├── components/      # UI components (Atomic/Compositional)
│   ├── hooks/           # useLogs - data fetching & worker orchestration
│   ├── types/           # OTLP types and internal application interfaces
│   ├── utils/           # Transformation logic (normalize, aggregate, sort)
│   ├── workers/         # Web Worker for CPU-intensive tasks
│   └── __tests__/       # Comprehensive unit & stress tests
└── mocks/               # MSW handlers and local server setup
app/                     # Next.js App Router (Layouts & Pages)
public/                  # Static assets & MSW Service Worker
```

## 🏗️ Architecture & Core Techniques

### 1. **Off-Main-Thread Processing (Web Workers)**
Processing 100,000+ log records (normalization, histogram bucketing, and service grouping) can block the main thread for seconds. 
- **Solution**: We offload the entire data transformation pipeline to a **Dedicated Web Worker**.
- **Result**: The UI remains responsive at 60fps even during heavy computation. Data is serialized exactly once across the thread boundary as a complete "ready-to-render" package.

### 2. **OTLP Data Normalization**
Logs often arrive in deeply nested OTLP structures.
- We implement a linear-time (`O(n)`) normalization pipeline that flattens nested resources and scope logs into a unified `LogEntry` model.
- Includes automatic timestamp resolution from `timeUnixNano` to ISO standards.

### 3. **Centralized Design System**
To ensure visual consistency between the **Logs List** and the **Histogram Distribution**:
- **Single Source of Truth**: A centralized `LOG_LEVEL_STYLES` map in `types/index.ts` defines colors (Teal for Debug, Violet for Unspecified, etc.) and icons for every severity level.
- **Dynamic Icons**: Standardized icons (`AlertCircle`, `SearchCode`, etc.) are mapped to log levels globally.

### 4. **Modern UI Components**
- **Stacked Segment Histogram**: The histogram doesn't just show volume; it uses stacked segments to show the severity distribution *within* each time bucket.
- **Service-Oriented View**: Supports switching between a flat chronological list and a grouped-by-service view for easier debugging.
- **Virtualization Ready**: The list is designed to handle large datasets efficiently.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **State Management**: Custom React Hooks & Web Workers
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Mocking**: [MSW (Mock Service Worker)](https://mswjs.io/)
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## 🚀 Package Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with Turbopack for near-instant refreshes. |
| `npm run build` | Creates an optimized, production-ready build in the `.next` directory. |
| `npm run start` | Runs the production-built application. |
| `npm run test` | Runs the full suite of unit and integration tests using Vitest. |
| `npm run test:watch` | Starts Vitest in interactive watch mode for TDD. |
| `npm run test:e2e` | Executes end-to-end browser tests using Cypress. |
| `npm run lint` | Analyzes code quality and consistency using ESLint. |

---

## 🧪 Testing Strategies

- **MSW (Mock Service Worker)**: Intercepts network requests to provide realistic log data during development and testing without needing a live backend.
- **Pipeline Stress Tests**: A dedicated stress test (`pipeline.stress.test.ts`) validates that the normalization and transformation logic can handle **100,000 logs** in under **250ms**.
- **Component Tests**: Verifies UI states, severity mappings, and user interactions (like view switching and row expansion).
