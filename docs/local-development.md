# Local Development

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| .NET SDK | 10.0.1xx (pinned in `global.json`, newer feature bands allowed) | `dotnet --version` |
| Node.js | 24 (see `frontend/.nvmrc`) | `node --version` |
| Docker Desktop | Recent, with Compose v2+ | `docker compose version` |
| Git | Any recent | `git --version` |

After installing a tool, restart your terminal/IDE so the new `PATH` is picked up.

## First-time setup

```bash
git clone https://github.com/dungtt3/logitics-tranportation.git
cd logitics-tranportation

cp infrastructure/docker/.env.example infrastructure/docker/.env   # local-only credentials, git-ignored
docker compose -f infrastructure/docker/compose.yaml up -d --wait  # waits until all health checks pass

dotnet restore
cd frontend && npm ci
```

## Running

| What | Command | URL |
|---|---|---|
| Infrastructure | `docker compose -f infrastructure/docker/compose.yaml up -d --wait` | — |
| API | `dotnet run --project src/Api` | http://localhost:5140 |
| Frontend | `cd frontend && npm run dev` | http://localhost:5173 |
| OpenAPI document | (API running, Development) | http://localhost:5140/openapi/v1.json |

The Vite dev server proxies `/api` and `/health` to the API, so the browser only talks to `:5173`.
Override the target with `VITE_API_PROXY_TARGET`.

## Ports

| Service | Host port | Inside the compose network |
|---|---|---|
| API | 5140 | — |
| Frontend (Vite) | 5173 | — |
| PostgreSQL | `POSTGRES_PORT` (5432) | `postgres:5432` |
| Redis | `REDIS_PORT` (6379) | `redis:6379` |
| Kafka | `KAFKA_PORT` (9092) | `kafka:29092` |

If a port is already used by a local installation, change it in `infrastructure/docker/.env`.

## Tests

```bash
dotnet test                          # unit, integration, architecture tests
cd frontend && npm test              # Vitest, single run
cd frontend && npm run test:watch    # Vitest, watch mode
cd frontend && npm run lint          # oxlint
```

Run the same checks as CI before pushing:

```bash
dotnet build -c Release && dotnet test -c Release --no-build
cd frontend && npm ci && npm run lint && npm test && npm run build
```

## Working with the infrastructure

```bash
cd infrastructure/docker

docker compose ps                                   # status and health
docker compose logs -f kafka                        # follow logs
docker compose stop postgres                        # simulate a database outage
docker compose start postgres
docker compose down                                 # stop, keep data
docker compose down -v                              # stop and DELETE all data volumes

docker compose exec postgres psql -U logistics -d logistics_dispatch
docker compose exec redis redis-cli
```

Kafka CLI tools live in `/opt/kafka/bin` inside the container:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:29092 --list
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server kafka:29092 --topic <topic> --from-beginning
```

Topic auto-creation is disabled; create topics explicitly.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `docker: command not found` right after installing Docker | Terminal started before `PATH` changed | Restart the terminal/IDE |
| `failed to connect to the docker API … docker_engine` | Docker Desktop is not running | Start Docker Desktop, wait for "Engine running" |
| `exec: "C:/Program Files/Git/opt/kafka/..."` in Git Bash | MSYS converts absolute paths | Prefix with `MSYS_NO_PATHCONV=1` or use PowerShell |
| `Set POSTGRES_DB in infrastructure/docker/.env` | `.env` missing | Copy `.env.example` to `.env` |
| PostgreSQL container restarts after upgrading the image | Data volume from an incompatible major version | `docker compose down -v` (deletes local data) |
| Restore fails with `NU1903` | A package has a known vulnerability (warnings are errors) | Upgrade the package in `Directory.Packages.props` |
| Frontend shows "Unavailable" | API not running on :5140 | Start the API, or set `VITE_API_PROXY_TARGET` |
| App on host cannot reach Kafka | Using the internal listener | From the host use `localhost:9092`; from containers use `kafka:29092` |
