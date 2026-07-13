# Sunless Email Template System

This folder defines the reusable email architecture used across campaigns, lifecycle automation, transactional messages and customer-service communication.

The system is designed for rendering and delivery through Resend while remaining portable, testable and independent of any single visual editor.

## Core documents

- `00-master-template-architecture.md` — global template anatomy and layout contract
- `01-component-and-data-contracts.md` — reusable modules, required props and content rules
- `02-rendering-and-delivery-workflow.md` — preview, test, render, send and approval workflow

## Governing principle

Templates are assembled from approved modules. Sequences should not invent a new visual system for every message.

Every email must remain:

- recognisably Sunless;
- readable without images;
- responsive on narrow screens;
- accessible and keyboard-safe;
- resilient across major email clients;
- measurable through a controlled event model;
- compatible with Resend sending, receiving and webhook workflows.
