# Resend MCP Integration Plan

## Purpose

Define how the Resend MCP may be connected later without allowing tool access to bypass the approved email strategy, consent rules, template system or production safeguards.

## Intended uses

The MCP may assist with:

- inspecting verified domains and sender configuration;
- reviewing recent sends and delivery outcomes;
- validating test messages;
- inspecting inbound email metadata;
- diagnosing bounce, complaint or webhook issues;
- creating or sending explicitly approved test messages;
- supporting implementation and operational QA.

## Non-goals

The MCP must not become the source of truth for:

- customer consent;
- audience segmentation;
- sequence eligibility;
- product or order data;
- template approval;
- suppression policy;
- business analytics.

## Access model

- Use least-privilege credentials.
- Separate development and production access where supported.
- Never expose Resend credentials in repository files, prompts, client code or screenshots.
- Require explicit user approval before any production send or destructive configuration change.
- Prefer read operations during initial connection and validation.

## Connection checklist

When the MCP is connected:

1. Confirm the connected Resend account and environment.
2. Inventory domains, senders, inbound routes and webhook endpoints.
3. Compare live configuration with this documentation.
4. Confirm no secrets are committed to GitHub.
5. Validate one internal test email through the approved template shell.
6. Confirm provider message ID storage.
7. Verify webhook receipt, signature validation, deduplication and state updates.
8. Test inbound routing using a controlled message.
9. Document any differences between expected and actual MCP capabilities.
10. Keep production sending disabled until the full approval gate passes.

## Operational rule

MCP actions are operational tools, not creative authority. All sent content must still originate from an approved template, approved copy and validated application data.

## Future documentation update

After connection, replace assumptions with an implementation record covering:

- available MCP operations;
- connected account and environment boundaries;
- verified domains and sender identities;
- webhook event coverage;
- inbound-email capabilities;
- known limitations;
- approved production procedures.
