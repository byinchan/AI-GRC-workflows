# AI-Assisted GRC Risk Management Workflow

I built this independent portfolio project around a practical GRC question: where can AI reduce administrative effort without taking over human judgment, methodology, and accountability?

In risk work, a polished answer is not the same thing as a defensible one. I wanted a workflow that documents what is known, uncertain, and still needs a GRC decision - rather than performing certainty.

**Business Intake → AI-Assisted Structuring → GRC Review → Human Risk Decision → Deterministic Scoring → Risk Register → Heat Map → Executive Reporting**

This is a workflow and governance prototype, not a commercial GRC platform or an enterprise-ready product.

## What This Demonstrates

The project starts with familiar GRC work: listening to stakeholders, translating concerns into structured risk information, assessing exposure, planning treatment, and communicating the portfolio. It asks how that work can be clearer without weakening the analyst’s role.

<!-- [SCREENSHOT: Business Stakeholder Intake] -->

*Business stakeholders provide plain-language context rather than being asked to make GRC scoring decisions.*

The point is not to make risk assessment look automated. It is to make sound assessment work easier to follow and communicate.

## Where AI Helps - and Where It Stops

AI can organize information and surface patterns, but it should not quietly become the source of truth for a risk decision.

**AI assists with:** structuring stakeholder input, surfacing missing information, assumptions, and uncertainties, suggesting Likelihood and Impact with rationale, identifying potentially similar submissions, drafting treatment actions, and synthesizing executive-level analysis.

**The GRC analyst owns:** reviewing and editing the assessment, final Likelihood and Impact, treatment strategy and action planning, approval into the Risk Register, and review of the executive analysis.

**Deterministic logic handles:** Risk Score calculation, Risk Rating thresholds, Heat Map placement, risk ID sequence, and target-date guidance by rating.

AI recommendations stay advisory. Final Likelihood and Impact require explicit analyst confirmation before a risk can enter the register. The application calculates the score and rating from those confirmed values.

<!-- [SCREENSHOT: GRC Review and AI-Structured Draft] -->

*The analyst sees stakeholder source information beside the AI-structured draft, including explicit gaps, assumptions, and uncertainties.*

<!-- [SCREENSHOT: AI Recommendation and Final Analyst Assessment] -->

*The separation between AI recommendation, analyst confirmation, and calculated result is deliberate.*

## End-to-End Workflow and Key Capabilities

Stakeholders can complete guided questions or paste prepared findings. Before finalization, the workflow checks for an exact match and can use AI to flag substantial conceptual overlap. The warning is advisory: a person can submit anyway when appropriate.

The GRC Review workspace presents the original stakeholder context beside an AI-structured draft. Controlled values are used for asset type, criticality, CIA considerations, and suggested Likelihood and Impact. Gaps, assumptions, and uncertainties remain visible rather than being silently filled in.

The analyst can edit the assessment, confirm final Likelihood and Impact, and see the deterministic score and rating. They can select a treatment strategy, review or edit an AI treatment draft, assign an owner and target date, and add the record to the Risk Register. A further duplicate check protects against re-adding a registered risk.

<!-- [SCREENSHOT: Potential Similar Risk Warning] -->

*A potential-similarity warning supports careful submission review without silently blocking a human decision.*

Approved records feed a session-level Risk Register and a 3×3 Risk Heat Map based on final analyst-approved Likelihood and Impact values. The Heat Map can also be exported as a PNG image.

<!-- [SCREENSHOT: Populated Risk Register] -->

*The Risk Register brings the approved assessment, ownership, treatment, status, and rationale together in one record.*

<!-- [SCREENSHOT: Risk Heat Map] -->

*The portfolio Heat Map uses deterministic placement and rating treatment derived from approved records.*

## Executive Reporting

Executive reporting is where a workflow can easily overstate what it knows. I wanted the report to distinguish between portfolio facts and narrative interpretation.

Portfolio counts, scores, ratings, and Heat Map positions come from approved Risk Register records. AI helps synthesize supported themes, interdependencies, uncertainties, priorities, and next steps.

The Executive Analysis prompt is grounded in approved risk and treatment information. It instructs the model not to introduce unsupported actions or capabilities. When the records do not support a conclusion, it should document the uncertainty or validation need. The narrative remains subject to human review before download.

The downloadable Executive Risk Report PDF combines the approved portfolio snapshot, visual Heat Map, AI-assisted analysis, and a governance note describing the boundary between deterministic risk information and narrative synthesis.

<!-- [SCREENSHOT: Executive Risk Report] -->

*The Executive Risk Report combines approved portfolio data with human-reviewed, AI-assisted analysis for management discussion.*

## Architecture, Governance and Prototype Scope

I kept the implementation small and focused on the workflow rather than recreating an enterprise platform. It uses Next.js 16 App Router, TypeScript, React, and Tailwind CSS, with server-side routes calling the OpenAI Responses API. `OPENAI_API_KEY` remains server-side, and requests use `store: false`.

Structured output for the GRC draft, similarity check, and executive analysis is runtime-validated; treatment suggestions are advisory. Deterministic logic under `lib/grc/` covers score/rating thresholds, register creation, Heat Map placement, risk IDs, and target-date guidance. Validated browser `sessionStorage` preserves current-tab state through an accidental reload. Client-side PDF generation and Node-based tests support reporting and workflow safeguards.

The design reflects six governance principles:

1. **Human-Owned GRC Logic** - analysts make assessment and treatment decisions.
2. **Human Approval Before Authoritative Records** - only confirmed values create records.
3. **Traceability and Auditability** - the current tab retains source-to-record traceability; it is not a durable audit trail.
4. **Transparency About Uncertainty** - gaps, assumptions, and uncertainties remain explicit.
5. **Deterministic Over Generative Where Possible** - methodology calculations are code-based, not model-generated.
6. **Data Minimization by Design** - no database or server-side workflow store.

### Intentional prototype boundaries

These boundaries are part of the design scope. The project does not include authentication or real role enforcement, an enterprise database, durable persistence, production audit history, enterprise integrations, organizational taxonomies, a tenant model, or production security hardening.

In an enterprise environment, these concepts could be implemented through an existing GRC platform such as ServiceNow IRM, with integrations to enterprise data sources, identity and access management, workflow approvals, audit logging, and organizational risk taxonomies. ServiceNow is not integrated in this project.

## Closing reflection

I built this to move beyond describing what a GRC process should look like and explore how I would improve one in practice. The biggest takeaway was not simply how much AI can accelerate, but getting clearer about what analysts need to own and what the methodology should continue to calculate on its own.
