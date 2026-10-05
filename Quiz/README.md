# Apna Academy Quiz

Apna Academy Quiz is an independent quiz platform for students across B.Tech, BCA, BBA, MBA, MCA, diploma, and other undergraduate/postgraduate programs.

## Independence Boundary

All Quiz application code, configuration, documentation, environment files, APIs, database models, authentication, quiz logic, administration, and deployment configuration must remain inside:

- `Quiz/Frontend/`
- `Quiz/Backend/`

No Quiz feature may require changes to the existing ApnaAcademy platform, existing Interview application, main Backend, main Frontend, existing authentication, payment system, or existing database schemas.

## Applications

### Frontend
Path: `Quiz/Frontend/`

- React 19
- Vite 8
- JavaScript/JSX
- Oxlint
- Independent browser application

### Backend
Path: `Quiz/Backend/`

- Node.js
- Express will be introduced during backend implementation
- MongoDB will be introduced through an independent Quiz database connection
- Independent REST API
- Server-side quiz validation and scoring

## Planned Product Scope

1. Student onboarding/profile
2. Quiz discovery and filtering
3. Quiz instructions
4. Secure quiz attempt engine
5. Server-side scoring
6. Result and performance analytics
7. Leaderboards
8. Admin quiz/question management
9. Advanced quiz controls
10. Production deployment and QA

## Phase 1 Status

Phase 1 establishes the independent architecture and ownership boundary. No existing application outside `Quiz/` is part of this system.

See `Quiz/ARCHITECTURE.md` for the approved architecture contract.
