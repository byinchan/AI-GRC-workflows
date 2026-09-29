# AI-Assisted GRC Risk Management Workflow

I built this independent portfolio project around a practical GRC question: where can AI reduce administrative effort without taking over human judgment, methodology, and accountability?

In risk work, a polished answer is not the same thing as a defensible one. I wanted to explore a workflow that helps people document what is known, what is uncertain, and what still needs a GRC decision - rather than performing certainty where it does not exist.

**Business Intake → AI-Assisted Structuring → GRC Review → Human Risk Decision → Deterministic Scoring → Risk Register → Heat Map → Executive Reporting**

This is a workflow and governance prototype, not a commercial GRC platform or an enterprise-ready product.

## What This Demonstrates

The project starts with familiar GRC work: listening to stakeholders, translating concerns into structured risk information, assessing exposure, planning treatment, and communicating the portfolio. It asks how that work can be clearer and more consistent without weakening the analyst’s role.

It brings together:

- Stakeholder engagement without asking business users to assign risk scores.
- Analyst review, documented rationale, treatment planning, and executive communication.
- AI assistance for drafting and synthesis, with clear limits on what it can decide.
- Deterministic methodology and session-level source-to-record traceability.
- A portfolio view built from approved risks rather than AI-generated conclusions.

<!-- [SCREENSHOT: Business Stakeholder Intake] -->

*Business stakeholders provide plain-language context rather than being asked to make GRC scoring decisions.*

The point is not to make risk assessment look automated. It is to make sound assessment work easier to follow, review, and communicate.

## Where AI Helps - and Where It Stops

I kept the authority boundary visible: AI can organize information and surface patterns, but it should not quietly become the source of truth for a risk decision.

| AI-Assisted | Analyst-Owned | Deterministic Application Logic |
| --- | --- | --- |
| Structure stakeholder input into a GRC assessment draft | Review and edit the assessment | Risk Score calculation |
| Surface missing information, assumptions, and uncertainties | Final Likelihood and Impact | Risk Rating thresholds |
| Suggest Likelihood, Impact, and rationale | Treatment strategy and action plan | Heat Map placement |
| Identify potentially similar stakeholder submissions | Approval into the Risk Register | Risk ID sequence |
| Suggest a treatment-plan draft | Review of executive analysis | Target-date guidance by rating |
| Synthesize executive-level risk analysis |  |  |

AI recommendations stay advisory. An analyst can agree, change the value, or reject the suggestion. Final Likelihood and Impact require explicit confirmation before a risk can enter the register. The application then calculates the score and rating from confirmed values.

<!-- [SCREENSHOT: GRC Review and AI-Structured Draft] -->

*The analyst sees stakeholder source information beside the AI-structured draft, including explicit gaps, assumptions, and uncertainties.*

<!-- [SCREENSHOT: AI Recommendation and Final Analyst Assessment] -->

*The separation between AI recommendation, analyst confirmation, and calculated result is deliberate.*

## End-to-End Workflow and Key Capabilities

### Start with the business context

Stakeholders can complete guided questions or paste prepared findings. Before a submission is finalized, the workflow checks for an exact match and can use AI to flag substantial conceptual overlap. The warning is advisory: a person can review the overlap and submit anyway when appropriate.

### Turn context into an analyst decision

The GRC Review workspace presents the original stakeholder context beside an AI-structured draft. Controlled values are used for asset type, criticality, CIA considerations, and suggested Likelihood and Impact. Missing information, assumptions, and uncertainties remain visible instead of being silently filled in.

The analyst can edit the assessment, confirm final Likelihood and Impact, and see the resulting deterministic score and rating. They can then select a treatment strategy, review or edit an AI treatment draft, assign an owner and target date, and add the completed record to the Risk Register. A further duplicate check helps prevent an already registered risk from being added again.

<!-- [SCREENSHOT: Potential Similar Risk Warning] -->

*A potential-similarity warning supports careful submission review without silently blocking a human decision.*

### Look across the portfolio

Approved records feed a session-level Risk Register and a 3×3 Risk Heat Map based on final analyst-approved Likelihood and Impact values. The Heat Map can also be exported as a PNG image.

<!-- [SCREENSHOT: Populated Risk Register] -->

*The Risk Register brings the approved assessment, ownership, treatment, status, and rationale together in one record.*

<!-- [SCREENSHOT: Risk Heat Map] -->

*The portfolio Heat Map uses deterministic placement and rating treatment derived from approved records.*

## Executive Reporting

Executive reporting is where a workflow can easily overstate what it knows. I wanted the report to distinguish between portfolio facts and narrative interpretation.

Portfolio counts, scores, ratings, and Heat Map positions come from approved Risk Register records. AI helps synthesize supported themes, concentrations, interdependencies, uncertainties, management priorities, and next steps across those records.

The Executive Analysis prompt is grounded in approved risk and treatment information. It instructs the model not to introduce unsupported management actions, controls, programs, technologies, or capabilities. When the records do not support a conclusion, the intended response is to document the uncertainty or validation need rather than invent a recommendation. The narrative remains subject to human review before download.

The downloadable Executive Risk Report PDF combines the approved portfolio snapshot, visual Heat Map, AI-assisted analysis, and a governance note describing the boundary between deterministic risk information and narrative synthesis.

<!-- [SCREENSHOT: Executive Risk Report] -->

*The Executive Risk Report combines approved portfolio data with human-reviewed, AI-assisted analysis for management discussion.*

## Architecture, Governance and Prototype Scope

I kept the implementation small and focused on the workflow rather than recreating an enterprise platform.

- **Next.js 16 App Router, TypeScript, React, and Tailwind CSS** provide the web application.
- **Server-side Next.js API routes** call the OpenAI Responses API. `OPENAI_API_KEY` remains server-side, and requests use `store: false`.
- **Structured AI output** for the GRC draft, similarity check, and executive analysis is runtime-validated. Treatment suggestions are advisory plain text cleaned for the register.
- **Deterministic GRC logic** under `lib/grc/` covers score/rating thresholds, register creation, Heat Map placement, risk IDs, and target-date guidance.
- **Validated browser `sessionStorage`** preserves current-tab workflow state through an accidental reload; it is not durable persistence.
- **Client-side PDF generation** and **Node-based tests** support executive reporting, deterministic rules, validation, workflow safeguards, and PDF layout helpers.

The design reflects six governance principles:

1. **Human-Owned GRC Logic** - analysts make the authoritative assessment and treatment decisions.
2. **Human Approval Before Authoritative Records** - only analyst-confirmed values create Risk Register records.
3. **Traceability and Auditability** - the current tab retains source-to-record traceability; it is not a durable enterprise audit trail.
4. **Transparency About Uncertainty** - gaps, assumptions, and uncertainties are explicit draft fields.
5. **Deterministic Over Generative Where Possible** - methodology-driven calculations are code-based, not model-generated.
6. **Data Minimization by Design** - workflow state is limited to the browser tab session, with no database or server-side workflow store.

### Intentional prototype boundaries

These boundaries are part of the design scope. The project does not include authentication or real role enforcement, an enterprise database, durable persistence, production audit history, enterprise integrations, organizational risk taxonomies, a tenant model, or production security hardening.

In an enterprise environment, these concepts could be implemented through an existing GRC platform such as ServiceNow IRM, with integrations to enterprise data sources, identity and access management, workflow approvals, audit logging, and organizational risk taxonomies. ServiceNow is not integrated in this project.

## Run Locally and Portfolio Context

### Run locally

Requirements: Node.js and npm.

```bash
npm install
```

Configure the server-side OpenAI key before using AI-assisted features:

```bash
export OPENAI_API_KEY="your-key"
# Optional: defaults to gpt-4o-mini
export OPENAI_MODEL="your-model"
```

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Useful verification commands:

```bash
npm run test:risk
npm run typecheck
npm run build
```

### Portfolio context

I built this project to explore how practical GRC workflows can use AI and automation to reduce administrative effort while preserving human judgment, governance, and accountability.
