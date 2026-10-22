# inventory-api

A REST API for managing product inventory, built as a portfolio project to demonstrate backend development and DevOps practices.

## Overview

This project covers both sides of the stack: a production-style REST API (authentication, validation, rate limiting, structured logging) and the infrastructure around it (containerization, CI/CD, HTTPS deployment, observability).

It's part of a larger portfolio that includes a full observability stack with Prometheus, Grafana, Loki, and Alertmanager.

## Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat&logo=hono&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)

## Features

**API**: REST endpoints for authentication and product management, built with Hono.

**Authentication**: JWT-based, with access tokens issued on login.

**Validation**: request input is validated before it reaches the database layer.

**Rate limiting**: Redis-backed, IP-based on auth endpoints, user-based on product endpoints.

**Logging**: structured logs via Pino, shipped to the monitoring stack through Grafana Alloy.

**Database**: PostgreSQL, with versioned SQL migrations.

## Infrastructure

Multi-stage Docker builds, Docker Compose for local development and production, automated CI/CD with GitHub Actions, HTTPS on a VPS via Nginx and Certbot, and application metrics exposed for Prometheus.

## Live

The API is running at https://api.olegkapy.com

## Getting started

You need Docker and Docker Compose installed.

```bash
git clone https://github.com/OKapirulya/inventory-api.git
cd inventory-api
cp .env.example .env
docker compose up --build
```

Run database migrations:

```bash
docker compose exec api npm run migrate
```

The API runs on port 3000:

```bash
curl http://localhost:3000
```

### Environment variables

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `7d`) |

## API endpoints

Authentication is handled with JWT. Register, log in, then pass the token as a Bearer header on all product endpoints.

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

```bash
npm test
```

## CI/CD pipeline

Every push to `main` lints the code, checks TypeScript types, runs the test suite against a PostgreSQL service container, compiles the project, builds the production Docker image, and deploys automatically to the VPS via SSH.

## Observability

Metrics are exposed at `/metrics` and scraped by Prometheus. Logs are collected by Grafana Alloy and stored in Loki. Both are visualized in Grafana alongside system metrics from Node Exporter, and Alertmanager routes alerts to email.

## Related

[monitoring-stack](https://github.com/OKapirulya/monitoring-stack)

## Project status

Infrastructure as Code with Terraform and Ansible: environment provisioning (hardening, Docker, Nginx, TLS) is automated; application deployment is still CI/CD-driven.