# Environments, Credentials and Configuration

## Purpose

Define the configuration model for local development, preview, staging and production without exposing credentials or allowing non-production systems to affect real customers.

## Environment model

Use explicit environments:

- `local` — developer workstation with mocked or restricted provider access;
- `preview` — ephemeral