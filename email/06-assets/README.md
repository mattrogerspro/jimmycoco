# Sunless Email Asset System

This folder defines how email-specific assets are organised, approved, transformed, exported and governed for Sunless by Jimmy Coco.

## Purpose

The asset system ensures that every email uses the correct source files, approved crops, current product imagery, valid rights, accessible exports and traceable production records.

## Core rule

Email assets are channel-specific derivatives of approved source assets. They do not become a separate source of truth.

Product, celebrity, customer-result, logo and brand assets must remain faithful to their approved originals. Any email crop, resize, compression, background treatment or composite must be documented and reviewed.

## Scope

- asset folder architecture;
- asset inventory and manifest;
- naming and versioning;
- product-image handling;
- celebrity and customer-result protection;
- campaign and lifecycle crops;
- responsive exports;
- file formats and performance;
- accessibility metadata;
- rights, expiry and approval;
- archive and deprecation;
- final asset QA.

## Files

- `00-asset-architecture-and-taxonomy.md`
- `01-asset-manifest-and-metadata.md`
- `02-file-naming-and-versioning.md`
- `03-product-image-library.md`
- `04-celebrity-customer-and-proof-assets.md`
- `05-campaign-lifecycle-and-template-assets.md`
- `06-responsive-crops-and-export-specifications.md`
- `07-file-formats-compression-and-performance.md`
- `08-alt-text-accessibility-and-content-fallbacks.md`
- `09-rights-approval-expiry-and-usage-controls.md`
- `10-archive-deprecation-and-replacement.md`
- `11-asset-qa-checklist.md`

## Relationship to other systems

Use this folder with:

- `../../shared/` for universal brand and asset rules;
- `../01-design-system/` for email visual standards;
- `../02-template-system/` for module dimensions and rendering constraints;
- `../03-sequences/` for lifecycle-specific requirements;
- `../05-ai-production/` for protected-asset and AI-assisted workflows;
- `../07-resend-integration/` for hosting, URLs, caching and production delivery.

## Production standard

No asset may be referenced in a production email unless its manifest state is `APPROVED`, its rights are valid for the intended use, its export has passed responsive and accessibility QA, and its source can be traced.