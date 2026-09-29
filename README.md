# AI-Assisted GRC Risk Management Workflow

An independent portfolio project exploring how AI can reduce administrative work in a GRC risk workflow while preserving human accountability, deterministic methodology, and traceability. It is designed around a practical question: where should AI assist GRC work, and where should analyst judgment or application logic remain authoritative?

This is a workflow and governance prototype, not a commercial GRC platform or an enterprise-ready product.

**Business Intake → AI-Assisted Structuring → GRC Review → Human Risk Decision → Deterministic Scoring → Risk Register → Heat Map → Executive Reporting**

## What This Demonstrates

The project brings together core GRC practice and workflow design:

- Translating stakeholder concerns into structured risk information without asking business users to assign risk scores.
- Assessing risk through analyst review, documented rationale, treatment planning, and executive communication.
- Designing AI assistance that supports analysis and synthesis without displacing GRC accountability.
- Applying deterministic rules where methodology needs to remain consistent and explainable.
- Preserving source-to-record traceability and turning approved risks into a portfolio view for management discussion.

<!-- [SCREENSHOT: Business Stakeholder Intake] -->

*Business stakeholders provide plain-language business context, rather than being asked to determine Likelihood, Impact, or a risk rating.*

The result is an end-to-end example of clearer, more consistent risk assessment and treatment while keeping GRC judgment at the center.

## Where AI Helps - and Where It Stops

| AI-Assisted | Analyst-Owned | Deterministic Application Logic |
| --- | --- | --- |
| Structure stakeholder input into a GRC assessment draft | Review and edit the assessment | Risk Score calculation |
| Surface missing information, assumptions, and uncertainties | Final Likelihood and Impact | Risk Rating thresholds |
| Suggest Likelihood, Impact, and rationale | Treatment strategy and action plan | Heat Map placement |
| Identify potentially similar stakeholder submissions | Approval into the Risk Register | Risk ID sequence |
| Suggest a treatment-plan draft | Review of executive analysis | Target-date guidance by rating |
| Synthesize executive-level risk analysis |  |  |

AI recommendations are advisory. The analyst can agree with an AI suggestion, change it, or reject it. Final Likelihood and Impact require explicit analyst confirmation before a risk can be added to the register. The application then calculates the resulting score and rating from those confirmed values rather than asking an LLM to determine the authoritative result.

<!-- [SCREENSHOT: GRC Review and AI-Structured Draft] -->

*The analyst workspace preserves stakeholder source information alongside the AI-generated draft, including explicit gaps, assumptions, and uncertainties.*

<!-- [SCREENSHOT: AI Recommendation and Final Analyst Assessment] -->

*AI recommendations remain distinct from the final analyst assessment and the calculated risk result.*

## End-to-End Workflow and Key Capabilities

### Business intake and submission review

Stakeholders can complete guided questions or paste prepared findings. Before a submission is finalized, the workflow checks for an exact match and can use AI to flag substantial conceptual overlap. These checks are advisory: the stakeholder can review the warning and intentionally submit anyway when appropriate.

### Analyst assessment and risk treatment

The GRC Review workflow presents original stakeholder context beside an AI-structured draft. The draft uses controlled values for asset type, criticality, CIA considerations, and suggested Likelihood and Impact. The analyst can edit the assessment, see gaps or uncertainty, and explicitly confirm final Likelihood and Impact.

Once confirmed, deterministic logic calculates the risk score and rating. The analyst then selects a treatment strategy, reviews or edits an optional AI treatment suggestion, assigns an owner and target date, and deliberately adds the completed record to the Risk Register. A further duplicate check helps prevent an already registered risk from being added again.

<!-- [SCREENSHOT: Potential Similar Risk Warning] -->

*A potential-similarity warning supports careful stakeholder submission review without silently blocking a human decision.*

### Portfolio reporting

Approved records feed a session-level Risk Register and a 3×3 Risk Heat Map based on final analyst-approved Likelihood and Impact values. The Heat Map can also be exported as a PNG image.

<!-- [SCREENSHOT: Populated Risk Register] -->

*The Risk Register presents the approved assessment, ownership, treatment, status, and rationale in one record.*

<!-- [SCREENSHOT: Risk Heat Map] -->

*The portfolio Heat Map uses deterministic placement and rating treatment derived from approved records.*

## Executive Reporting

The Executive Risk Summary separates deterministic portfolio information from AI-assisted narrative analysis. Portfolio counts, scores, ratings, and Heat Map positions come from approved Risk Register records. AI synthesizes supported themes, concentrations, interdependencies, uncertainties, management priorities, and next steps across those records.

The Executive Analysis prompt is grounded in approved risk and treatment information. It instructs the model not to introduce unsupported management actions, controls, programs, technologies, or capabilities. When the records do not support a conclusion, the intended response is to identify the uncertainty or validation need rather than invent a recommendation. The generated narrative remains subject to human review before download.

The downloadable Executive Risk Report PDF combines the approved portfolio snapshot, visual Heat Map, AI-assisted analysis, and a governance note describing the boundary between deterministic risk information and narrative synthesis.

<!-- [SCREENSHOT: Executive Risk Report] -->

*The Executive Risk Report combines approved portfolio data with human-reviewed, AI-assisted analysis for management discussion.*

## Architecture, Governance and Prototype Scope

The implementation is intentionally small and focused on the workflow:

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

The project focuses on GRC workflow design, AI assistance, decision points, and governance controls. It does not include authentication or real role enforcement, an enterprise database, durable persistence, production audit history, enterprise integrations, organizational risk taxonomies, a tenant model, or production security hardening.

This prototype demonstrates workflow and governance design rather than proposing a standalone replacement for enterprise GRC platforms. In an enterprise environment, these concepts could be implemented through an existing GRC platform such as ServiceNow IRM, with integrations to enterprise data sources, identity and access management, workflow approvals, audit logging, and organizational risk taxonomies. ServiceNow is not integrated in this project.

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

This independent project explores how practical GRC workflows can use AI and automation to reduce administrative effort while preserving human judgment, governance, and accountability.
