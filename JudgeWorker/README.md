# ApnaAcademy DSA Judge Worker

The judge worker is a separate service. It accepts authenticated jobs from the backend and executes submitted source code inside short-lived Docker containers.

## Security boundary

Each execution uses:

- `--network=none`
- read-only root filesystem
- dropped Linux capabilities
- `no-new-privileges`
- PID limit
- CPU limit
- memory limit and matching swap limit
- a small non-executable temporary filesystem
- a read-only source mount
- an execution timeout enforced by the worker process

The Docker daemon/socket must never be mounted into a judge container.

## Start locally

1. Install Docker Desktop or Docker Engine.
2. Copy `.env.example` to `.env` and use the same `JUDGE_SERVICE_SECRET` in Backend.
3. Start the worker:

```bash
npm install
npm start
```

The service listens on port `6000` by default.

## Current execution contract

The worker currently executes complete stdin/stdout programs. The repository's seeded DSA problems currently use `class Solution` starter templates, so problem adapters/harness generation must be added before enabling Run/Submit against those seeded problems. Do not treat this worker alone as a production-ready LeetCode-style adapter.
