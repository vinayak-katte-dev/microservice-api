# Microservice API

A Node.js/TypeScript REST API that I built to demonstrate production-ready microservice development. This project includes Docker containerization, API authentication, automated CI/CD pipelines, and proper testing.

## What This Project Does

This is a RESTful API microservice that handles user data with proper authentication. I built it to showcase:
- Clean TypeScript code with Express
- Docker containerization (multi-stage builds for smaller images)
- API key authentication for security
- CI/CD automation with GitHub Actions
- Health checks for container orchestration
- Proper logging and error handling

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
- Multi-stage builds

**Testing:**
- Jest
- Supertest for API testing

## Getting Started

### Prerequisites

You'll need these installed:
- Node.js 20.x or higher
- Docker Desktop
- Git

### Installation

1. Clone the repo:
```bash
git clone https://github.com/YOUR_USERNAME/microservice-api.git
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

I've set up Jest for unit testing. Run tests with:

```bash
npm test                    # Run once
npm run test:watch          # Watch mode (reruns on changes)
npm test -- --coverage      # With coverage report
```

Tests are in `src/__tests__/`. Here's an example of testing the authentication:

```typescript
describe('API Authentication', () => {
  it('should reject requests without API key', async () => {
    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(401);
  });

  it('should allow requests with valid API key', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set('X-API-Key', 'dev-api-key-12345');
    expect(response.status).toBe(200);
  });
});
```

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

## API Documentation

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
- `GET /api/v1/info` - API information
- `GET /api/v1/users` - Get all users
- `POST /api/v1/users` - Create a user

### Example Requests

Get all users:
```bash
curl -H "X-API-Key: dev-api-key-12345" \
  http://localhost:3000/api/v1/users
```

Create a user:
```bash
curl -X POST \
  -H "X-API-Key: dev-api-key-12345" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}' \
  http://localhost:3000/api/v1/users
```

## CI/CD Pipeline

I've set up two GitHub Actions workflows:

### 1. PR Validation (`.github/workflows/pr-validation.yml`)

Runs automatically on pull requests to main. It:
- Runs the linter
- Executes all tests
- Builds the TypeScript
- Builds a Docker image
- Tests the container health endpoint

This ensures nothing broken gets merged.

### 2. Main Deploy (`.github/workflows/main-deploy.yml`)

Triggers when code is pushed to main. It:
- Runs tests again (just to be safe)
- Builds the Docker image
- Tags it with `latest` and the commit SHA
- Pushes to Docker Hub

### Setting up CI/CD

You'll need to add these secrets in your GitHub repo settings:

1. Go to Settings → Secrets and variables → Actions
2. Add:
   - `DOCKER_USERNAME` - Your Docker Hub username
   - `DOCKER_PASSWORD` - Docker Hub access token

Then just push to main and the pipeline handles the rest.

## Deployment

### Local (Docker Compose)

Easiest way for local testing:

```bash
cd src
docker-compose up -d
```

### Cloud Platforms

I've tested this on:

**Google Cloud Run** (my favorite for quick deploys):
```bash
gcloud run deploy microservice-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**AWS ECS:**
1. Push image to ECR
2. Create task definition
3. Deploy to ECS cluster

**Kubernetes:**
See `deployment.yaml` for a basic K8s deployment config.

## Project Structure

```
microservice-api/
├── src/
│   ├── __tests__/              # Jest tests
│   ├── config/                 # Config and logger setup
│   ├── middleware/             # Auth, logging, error handling
│   ├── routes/                 # API routes
│   ├── app.ts                  # Express app setup
│   ├── index.ts                # Entry point
│   ├── Dockerfile              # Multi-stage Docker build
│   └── docker-compose.yml      # Local Docker setup
├── .github/workflows/          # CI/CD pipelines
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

## What I Learned

Building this project taught me:
- How to properly structure a TypeScript Node.js project
- Multi-stage Docker builds (saves a ton of space)
- Setting up CI/CD pipelines from scratch
- API authentication patterns
- Writing testable code

The trickiest part was getting the Docker health checks working properly with the CI/CD pipeline. Had to make sure the container was fully ready before the health check ran.

## Future Improvements

Things I'd add if I had more time:
- Database integration (PostgreSQL or MongoDB)
- JWT authentication instead of API keys
- Rate limiting per API key (not just per IP)
- Swagger/OpenAPI documentation
- More comprehensive tests (currently at ~70% coverage)
- Prometheus metrics endpoint


## Contact

If you have questions about this project, feel free to reach out!
