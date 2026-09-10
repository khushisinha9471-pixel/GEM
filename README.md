# GEM — Customer Approvals (CSM Prototype)

A high-fidelity, clickable prototype of the CSM-side **Customer Approvals** screen for the GEM platform, built within the context of a single Work Order (`WO-2026-00125`, CFM56-7B, ESN 897300).

The approval is modeled as a **living record and conversation thread** — not a simple approve/reject form — spanning three communication layers: the customer-visible conversation, a private internal engineering discussion, and explicitly shared internal responses.

## Stack

React + TypeScript + Vite + Tailwind CSS. All state is in-memory (`useReducer`), seeded with 20 realistic approvals (15 Open / 5 Closed) covering every approval type/subtype combination and outcome scenario described in the spec.

## Running locally

```bash
npm install
npm run dev
```

## What's included

- **Overview table** — search, filters (customer / status / type / dynamic subtype), summary cards, latest CSM/Customer response snapshot per row.
- **Create Approval** — mandatory Approval Type & Requirement, everything else optional, with Reports Library linking and external attachment upload.
- **Approval Detail** — full chronological customer conversation, private Internal Discussion, Attachments (Reports Library vs. External vs. Email-captured), and a complete Audit Trail.
- **Forward to Internal Member** — sends a (simulated) Gmail/Outlook email; a "Simulate Test Mailbox Reply" control demonstrates end-to-end automatic capture of the reply against the correct Approval ID, preserving the respondent's identity.
- **Share with Customer / Keep Internal** — the CSM's explicit choice for whether an internal response becomes customer-visible; shared responses keep the original author's identity with a "Shared by CSM" badge.
- **Notify Customer** — a notification distinct from Access or Share, referencing a specific approval.
- **Access management** — per-approval access, independent of Work Order access.
- **Close Approval** — records one of the defined Final Outcomes; only the CSM can change Status.

Two "(Test)" affordances (simulate customer reply, simulate mailbox reply) stand in for the customer portal and live email integration so the full workflow can be exercised end-to-end inside the prototype.
