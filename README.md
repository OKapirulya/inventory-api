# Inventory API

A REST API for managing product inventory, built as a portfolio project to demonstrate backend development and DevOps practices.

This project is part of a larger portfolio that includes a full observability stack with Prometheus, Grafana, Loki, and Alertmanager.

## What this project covers

On the backend side: REST API design, JWT authentication, database migrations, input validation, structured logging with Pino, Redis rate limiting, and error handling.

On the infrastructure side: multi-stage Docker builds, Docker Compose with multiple services, automated CI/CD with GitHub Actions, HTTPS deployment on a VPS with Nginx, and application metrics via Prometheus.

## Tech stack

Node.js with Hono as the web framework, PostgreSQL as the database, Redis for rate limiting, Docker and Docker Compose for containerization, and GitHub Actions for continuous integration and deployment.

## Live

The API is running at https://api.olegkapy.com

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

Rate limiting is applied on all auth endpoints (IP-based) and product endpoints (user-based).

## Running tests

Tests run against a real PostgreSQL database. Make sure Docker is running, then:

    npm test

## CI/CD pipeline

Every push to main triggers a pipeline that lints the code, checks TypeScript types, runs the test suite against a PostgreSQL service container, compiles the project, builds the production Docker image, and deploys automatically to the VPS via SSH.

## Observability

Application metrics are exposed at /metrics and scraped by Prometheus. Logs are collected by Grafana Alloy and stored in Loki. Both are visualized in Grafana alongside system metrics from Node Exporter.

The monitoring stack lives in a separate repository at github.com/OKapirulya/monitoring-stack.

## Project status

Work in progress. The following is planned or in development:

Infrastructure as Code with Terraform and Ansible: development

Kubernetes deployment: planned