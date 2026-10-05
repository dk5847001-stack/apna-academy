# Apna Academy Quiz

Standalone quiz platform for B.Tech, BCA, BBA, MBA, MCA, Diploma and other UG/PG students.

## Independence Boundary
All Quiz code, configuration, APIs, database models, authentication, quiz logic, administration and deployment configuration remain inside `Quiz/Frontend/` and `Quiz/Backend/`. No existing ApnaAcademy application is modified for Quiz.

## Current Status
- Phase 1: Complete — independent technical architecture
- Phase 2: Complete — product architecture, UX flows and system contracts
- Phase 3: Complete — premium design system and responsive application shell
- Phase 4: Complete — SEO-ready student landing page
- Phase 5: Complete — student registration/profile
- Phase 6: Next — quiz discovery + quiz details

## Phase 5 Deliverables
- Added dedicated `/register` student registration flow inside the Quiz frontend.
- Added dedicated `/profile` student profile view and edit flow.
- Implemented the approved student profile fields:
  - Full name
  - PRN / roll number
  - Mobile
  - Email
  - College / university
  - Degree / program
  - Branch / specialization
  - Semester / year
  - City
  - State
  - Optional short bio
- Added degree-aware branch/specialization options for B.Tech, BCA, BBA, MBA, MCA, Diploma and Other UG/PG.
- Added client-side validation for required fields, Indian 10-digit mobile numbers and email format.
- Added accessible validation feedback with `aria-invalid` and field error descriptions.
- Added confirmation state after successful profile creation/update.
- Added local persistence using browser `localStorage` only; no backend or existing authentication system was changed.
- Added profile-aware navigation and landing-page CTA behavior.
- Added privacy messaging clarifying that contact details are not intended for public leaderboards.
- Added responsive registration/profile layouts for desktop, tablet and mobile, including the established 320px minimum contract.
- Preserved the approved first-time journey: Discover → Details → Register → Confirm → Start.
- The actual quiz start/API persistence remains deferred to later phases.

## Design Guardrails
- Light premium interface with orange as the primary action color.
- Marketing pages can use subtle visual motion; account/profile pages stay focused and functional.
- ThreeUI/WebGL and advanced GSAP motion remain intentionally deferred to the dedicated motion phase.
- Student profile data is currently device-local only and must not be treated as server-authenticated identity.
- Backend persistence, authentication and secure identity verification remain deferred to the backend phase.

See `ARCHITECTURE.md` for technical boundaries and `PRODUCT_ARCHITECTURE.md` for the approved product contract.
