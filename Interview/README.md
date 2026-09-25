# ApnaAcademy Interview AI

Premium React frontend for the ApnaAcademy AI interview experience.

## Frontend architecture

    src/
    ├── components/
    │   ├── brand/          # Shared brand elements
    │   ├── common/         # Reusable visual/interaction primitives
    │   ├── layout/         # Application chrome
    │   └── system/         # Error and system-level UI
    ├── context/            # Interview flow state
    ├── data/               # Static configuration and defaults
    ├── hooks/              # Reusable React hooks
    ├── pages/              # Route-level screens
    ├── routes/             # SPA routing and route metadata
    ├── services/           # Backend/API boundary
    ├── theme/              # Material UI design system
    └── utils/              # Browser/storage utilities

## Styling system

- **Tailwind CSS v4** for composable utility styling.
- **Material UI** for accessible interaction primitives and icons.
- **Premium custom CSS** for the reference landing-page visual system, glass effects, responsive artwork and canvas glow.
- Shared CSS variables live in `src/index.css`.
- Material UI tokens live in `src/theme/theme.js`.

## Frontend flow

The route architecture is ready for the complete interview journey:

    Home
      → Interview Setup
      → Preparation
      → Live Interview
      → Interview Complete
      → Results
      → History

Phase 2 provides the route/state/service boundaries. The individual interview screens are intentionally implemented in their dedicated phases.

## API boundary

`src/services/interviewApi.js` contains the frontend contract and a mock implementation. The React UI must call this boundary rather than importing NVIDIA SDKs or secrets.

Production architecture:

    Interview React
        ↓
    interviewApi.js
        ↓
    ApnaAcademy Backend
        ↓
    NVIDIA API

No NVIDIA secret belongs in the React application.

## Run locally

    cd Interview
    npm install
    npm run dev

Build:

    npm run build

Lint:

    npm run lint