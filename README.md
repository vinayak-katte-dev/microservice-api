# Microservice API

A Node.js/TypeScript REST API that I built to demonstrate production-ready microservice development. This project includes Docker containerization, API authentication, automated CI/CD pipelines, and production deployment on AWS ECS.

## How This Project Evolved

I built this in stages, each one adding more production-readiness. Here's the journey:

1. **Started with basics** - Express + TypeScript setup with a simple API
2. **Added Docker** - Containerized the app with multi-stage builds
3. **Added authentication** - API key middleware to protect endpoints
4. **Set up CI pipeline** - GitHub Actions for automated testing on PRs
5. **Expanded the API** - Full CRUD endpoints with validation
6. **Added CD pipeline** - Automated deployment to AWS ECS on every merge

Each commit tells this story if you look through the git history.

## What This Project Does

RESTful API microservice with full CRUD operations for user data. I focused on making it production-ready rather than feature-heavy:
- Clean TypeScript code with Express
- Docker containerization (multi-stage builds, ~217MB image)
- API key authentication
- Full CI/CD — PR validation + auto-deploy to AWS ECS
- Health checks for container orchestration
- 27 tests covering all endpoints

### Live Production URL

The API is deployed and running on AWS ECS:

```
http://52.66.205.92:3000
```

Try it out:
```bash
# Health check
curl http://52.66.205.92:3000/health

# Get users (needs API key)
curl -H "X-API-Key: VKMicro$er01BTs127df" http://52.66.205.92:3000/api/v1/users
```

## Tech Stack

**Backend:**
- Node.js 20.x
- TypeScript 5.9
- Express.js

**Security & Middleware:**
- Helmet (security headers)
- CORS
- Rate limiting (100 requests per 15 minutes)
- Custom API key authentication

**DevOps:**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- AWS ECS Fargate (production)
- AWS ECR (container registry)

**Testing:**
- Jest
- Supertest for API testing
- 27 tests, ~72% coverage

## Getting Started

### Prerequisites

You'll need these installed:
- Node.js 20.x or higher
- Docker Desktop
- Git

### Installation

1. Clone the repo:
```bash
git clone https://github.com/vinayak-katte-dev/microservice-api.git
cd microservice-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
NODE_ENV=development
PORT=3000
API_KEY=your-secret-key-here
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:3000
```

4. Build and run:
```bash
npm run build
npm start
```

The API should be running at `http://localhost:3000`

Test it:
```bash
curl http://localhost:3000/health
```

## Development

### Running in dev mode

I use nodemon for auto-reloading during development:

```bash
npm run dev
```

This watches for file changes and automatically restarts the server.

### Code quality

Before committing, I run:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix what can be fixed
npm test           # Run all tests
```

## Testing

I've set up Jest for unit and integration testing. Run tests with:

```bash
npm test                    # Run once
npm run test:watch          # Watch mode (reruns on changes)
npm test -- --coverage      # With coverage report
```

Currently at 27 tests covering:
- Authentication (API key validation, missing key, wrong key)
- All CRUD operations (create, read, update, delete)
- Search functionality
- Input validation and edge cases
- Error handling (404s, 400s, 409 conflicts)
- Health and readiness endpoints

## Docker

### Why multi-stage builds?

I'm using multi-stage Docker builds to keep the production image small (~217MB instead of ~500MB). The first stage builds the TypeScript, and the second stage only includes the compiled code and production dependencies.

### Running with Docker

Quick start with Docker Compose:

```bash
cd src
docker-compose up -d
```

Or manually:

```bash
# Build
docker build -f src/Dockerfile -t microservice-api .

# Run
docker run -d -p 3000:3000 \
  -e API_KEY=your-secret-key \
  --name microservice-api \
  microservice-api:latest
```

Check the logs:
```bash
docker logs -f microservice-api
```

## API Documentation — Swagger UI

The API has interactive documentation built in with Swagger UI. You can test all endpoints directly from your browser — no Postman or curl needed!

- **Local:** http://localhost:3000/api-docs
- **Production:** http://52.66.205.92:3000/api-docs
- **OpenAPI JSON:** http://localhost:3000/api-docs.json

Just open the link, enter your API key using the "Authorize" button at the top, and you can try out any endpoint.

### Authentication

All `/api/v1/*` endpoints require an API key in the header:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:3000/api/v1/users
```

For PowerShell users:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/v1/users" `
  -Headers @{"X-API-Key"="your-api-key"} -UseBasicParsing
```

### Endpoints

**Public (no auth needed):**
- `GET /` - Welcome message
- `GET /health` - Health check (for Docker/K8s)
- `GET /ready` - Readiness probe

**Protected (API key required):**
- `GET /api/v1/info` - API information and endpoint list
- `GET /api/v1/status` - System status (uptime, memory, node version)
- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get a single user by ID
- `GET /api/v1/users/search?name=John` - Search users by name
- `POST /api/v1/users` - Create a user
- `PUT /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

### Example Requests

Get all users:
```bash
curl -H "X-API-Key: dev-api-key-12345" \
  http://localhost:3000/api/v1/users
```

Get a single user:
```bash
curl -H "X-API-Key: dev-api-key-12345" \
  http://localhost:3000/api/v1/users/1
```

Search users:
```bash
curl -H "X-API-Key: dev-api-key-12345" \
  "http://localhost:3000/api/v1/users/search?name=John"
```

Create a user:
```bash
curl -X POST \
  -H "X-API-Key: dev-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}' \
  http://localhost:3000/api/v1/users
```

Update a user:
```bash
curl -X PUT \
  -H "X-API-Key: dev-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}' \
  http://localhost:3000/api/v1/users/1
```

Delete a user:
```bash
curl -X DELETE \
  -H "X-API-Key: dev-api-key-12345" \
  http://localhost:3000/api/v1/users/3
```

## CI/CD Pipeline

This is where the DevOps side comes in. I set up a complete CI/CD pipeline that goes from code commit all the way to production deployment.

### How it works end-to-end

```
Developer pushes code
       │
       ▼
Create Pull Request to main
       │
       ▼
PR Validation runs automatically
(lint, test, build, Docker build, health check)
       │
       ▼ All checks pass → Merge PR
       │
       ▼
Main Deploy runs automatically
(test → build image → push to ECR → update ECS service)
       │
       ▼
New container is running in production!
```

### 1. PR Validation (`.github/workflows/pr-validation.yml`)

Runs automatically on pull requests to main. It:
- Runs the linter
- Executes all 27 tests
- Builds the TypeScript
- Builds a Docker image
- Starts a container and tests the health endpoint

This ensures nothing broken gets merged. If any step fails, you can't merge the PR.

### 2. Main Deploy (`.github/workflows/main-deploy.yml`)

Triggers when code is merged to main. This is the full CI/CD pipeline:

**CI part:**
- Runs all tests again (safety check)
- Builds the Docker image
- Tags it with the commit SHA and `latest`
- Pushes to AWS ECR

**CD part:**
- Downloads current ECS task definition
- Updates it with the new image
- Deploys to ECS using rolling update
- Waits for the service to stabilize

The rolling update means zero downtime — ECS starts the new container, waits for it to be healthy, then stops the old one.

### Setting up the pipeline

You need these secrets in GitHub repo settings (Settings → Secrets → Actions):

| Secret | What it is |
|--------|-----------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |

## AWS Deployment

I'm running this on AWS ECS Fargate. Here's the setup:

### Architecture

```
GitHub → ECR (image storage) → ECS Fargate (runs container) → Public IP
```

### AWS Services Used

- **ECR** - Stores Docker images (like a private Docker Hub)
- **ECS Fargate** - Runs the container without managing servers
- **CloudWatch** - Stores application logs
- **IAM** - Manages permissions and access

### Deployment details

- **Region:** ap-south-1 (Mumbai)
- **Launch type:** Fargate (serverless, no EC2 to manage)
- **CPU:** 0.25 vCPU
- **Memory:** 0.5 GB
- **Deployment strategy:** Rolling update (zero downtime)

### Updating production

When code is merged to main, the pipeline automatically:
1. Builds a new Docker image
2. Pushes it to ECR
3. Updates the ECS task definition
4. ECS performs a rolling update (new container starts → health check passes → old container stops)

For manual deployment:
```bash
# Build and push
docker build -f src/Dockerfile -t microservice-api .
docker tag microservice-api:latest <aws-account-id>.dkr.ecr.ap-south-1.amazonaws.com/microservice-api:latest
docker push <aws-account-id>.dkr.ecr.ap-south-1.amazonaws.com/microservice-api:latest

# Trigger new deployment
aws ecs update-service --cluster microservice-cluster --service microservice-api-service --force-new-deployment --region ap-south-1
```

## Project Structure

```
microservice-api/
├── src/
│   ├── __tests__/              # Jest tests (27 tests)
│   ├── config/                 # Config and logger setup
│   ├── middleware/             # Auth, logging, error handling
│   ├── routes/                 # API routes (CRUD + search)
│   ├── app.ts                  # Express app setup
│   ├── index.ts                # Entry point
│   ├── Dockerfile              # Multi-stage Docker build
│   └── docker-compose.yml      # Local Docker setup
├── .github/workflows/
│   ├── pr-validation.yml       # CI - runs on PRs
│   └── main-deploy.yml         # CI/CD - deploys on merge
├── dist/                       # Compiled JS (gitignored)
├── .env.example                # Environment template
└── package.json
```

## Environment Variables

Create a `.env` file:

```env
NODE_ENV=production
PORT=3000
API_KEY=your-super-secret-key
LOG_LEVEL=info
CORS_ORIGINS=https://yourapp.com
```

**Security note:** Never commit your `.env` file! Use strong, random API keys in production.

Generate a secure key:
```bash
# Linux/Mac
openssl rand -hex 32

# Or use any password generator
```

## Common Issues

**Port already in use?**
```bash
# Find what's using port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Or just use a different port
PORT=3001 npm start
```

**Docker build failing?**
```bash
# Clear cache and rebuild
docker build --no-cache -f src/Dockerfile -t microservice-api .
```

**Tests failing?**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm test
```

**ECS deployment stuck?**
```bash
# Check service events
aws ecs describe-services --cluster microservice-cluster --services <service-name> --region ap-south-1

# Check container logs
aws logs tail /ecs/microservice-api --follow --region ap-south-1
```

## What I Learned

Building this project taught me a lot about DevOps in practice:
- How to properly structure a TypeScript Node.js project
- Multi-stage Docker builds (saves a ton of space)
- Setting up CI/CD pipelines from scratch with GitHub Actions
- The difference between CI and CD — CI tests your code, CD deploys it
- API authentication patterns
- Writing testable code with good coverage
- AWS ECS Fargate — deploying containers without managing servers
- Rolling updates for zero-downtime deployments

The trickiest part was getting the CD pipeline working with ECS. Had to figure out the right IAM permissions, match the service names exactly, and understand how task definitions work. But once it clicked, it was really satisfying to see code go from commit to production automatically.

## Future Improvements

Things I'd add if I had more time:
- Database integration (PostgreSQL or MongoDB)
- JWT authentication instead of API keys
- Rate limiting per API key (not just per IP)
- Swagger/OpenAPI documentation
- Prometheus metrics endpoint
- HTTPS with a custom domain and SSL certificate
- Auto-scaling based on traffic

## Contact

If you have questions about this project, feel free to reach out!
