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

## Execution contract

The backend sends a published DSA problem slug, selected language, source code, and server-selected test cases. The worker generates a language-specific harness for the repository's supported `class Solution` problems and runs each test case in an isolated container.

Supported languages:

- Java
- C++
- Python
- JavaScript

The worker never decides premium access. The backend must authorize the submission before creating the judge job.

## Start locally

1. Install Docker Desktop or Docker Engine and make sure the Docker daemon is running.
2. Copy `.env.example` to `.env` and use the same `JUDGE_SERVICE_SECRET` in Backend.
3. Set `BACKEND_PUBLIC_URL` to the reachable Backend API URL.
4. Install dependencies and start the worker:

```bash
npm install
npm start
```

The service listens on port `6000` by default.

## Health and readiness

- `GET /health` is a liveness endpoint and does not require the judge secret.
- `GET /ready` reports whether the worker is accepting jobs and Docker is available. It returns HTTP `503` when the worker is not ready or is shutting down.
- `POST /v1/jobs` requires `X-Judge-Secret` and is rejected while the worker is shutting down or Docker is unavailable.

## Graceful shutdown

On `SIGTERM` or `SIGINT`, the worker stops accepting new jobs, closes the HTTP listener, and waits up to `JUDGE_SHUTDOWN_GRACE_MS` for the in-memory queue to become idle. Deployments should give the process at least this much termination grace time.

The queue is intentionally in-memory. For multi-instance production deployments, use an external durable queue before relying on horizontal scaling; do not assume queued jobs survive a process restart.

## Production deployment notes

The worker needs access to the Docker CLI and a Docker daemon on the worker host. The worker itself should run in a dedicated, hardened environment with tightly controlled access to that daemon. Do **not** expose the Docker socket to untrusted submitted code and do not mount the Docker socket into execution containers.

Recommended operational checks:

1. Configure a long random `JUDGE_SERVICE_SECRET` and keep it identical between Backend and Worker.
2. Keep `BACKEND_PUBLIC_URL` private/restricted to the backend endpoint where possible.
3. Configure the deployment health check to `/health` and readiness check to `/ready`.
4. Give the process a termination grace period greater than `JUDGE_SHUTDOWN_GRACE_MS`.
5. Monitor queue depth, runtime errors, callback failures, and repeated Docker failures.
6. Pin approved language images rather than allowing user-controlled images or commands.

See `.env.example` for all runtime configuration values.