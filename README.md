# Inventory API

A REST API for managing product inventory, built as a portfolio project to demonstrate backend development and DevOps practices.

This project is actively being developed. New features and infrastructure components are added continuously.

## What this project covers

On the backend side: REST API design, JWT authentication, database migrations, input validation, structured logging, and error handling.

On the infrastructure side: multi-stage Docker builds, Docker Compose with multiple services, automated CI/CD with GitHub Actions, and Kubernetes deployment (planned).

## Tech stack

Node.js with Hono as the web framework, PostgreSQL as the database, Redis for caching and rate limiting, Docker and Docker Compose for containerization, and GitHub Actions for continuous integration.

## Getting started

You need Docker and Docker Compose installed on your machine.

Clone the repository and copy the environment file:

    git clone https://github.com/OKapirulya/inventory-api.git
    cd inventory-api
    cp .env.example .env

Start all services:

    docker compose up --build

Run database migrations:

    docker compose exec api npm run migrate

The API runs on port 3000. You can verify it is working by calling:

    curl http://localhost:3000

## API endpoints

Authentication is handled with JWT. Register a user, log in to receive a token, and pass the token as a Bearer header on all product endpoints.

    POST /auth/register
    POST /auth/login

    GET    /products
    GET    /products/:id
    POST   /products
    PUT    /products/:id
    DELETE /products/:id

## Running tests

Tests run against a real PostgreSQL database. Make sure Docker is running, then:

    npm test

## CI pipeline

Every push to main triggers a pipeline that lints the code, checks TypeScript types, runs the test suite against a PostgreSQL service container, compiles the project, and builds the production Docker image.

## Project status

Work in progress. The following is planned or in development:

Redis rate limiting and caching — in progress

Deployment to Hetzner VPS — planned

Monitoring with Prometheus and Grafana — planned

Log aggregation with Loki — planned

Kubernetes deployment — planned
