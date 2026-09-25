export const intakeFieldNames = [
  "assessmentSubject",
  "businessPurpose",
  "businessOwner",
  "identifiedConcern",
  "possibleOutcome",
  "affectedAreas",
  "existingSafeguards",
  "additionalContext",
] as const;

export type IntakeFieldName = (typeof intakeFieldNames)[number];
export type IntakeValues = Record<IntakeFieldName, string>;

export const blankIntakeValues: IntakeValues = Object.fromEntries(
  intakeFieldNames.map((name) => [name, ""]),
) as IntakeValues;

export const demoScenarios: Array<{ id: string; name: string; values: IntakeValues }> = [
  {
    id: "vendor-outage",
    name: "Vendor outage notifications",
    values: {
      assessmentSubject: "Third-party cloud outage notification platform",
      businessPurpose: "Pacific Utilities Corporation uses this platform to send customer outage notifications during service disruptions.",
      businessOwner: "Customer Operations",
      identifiedConcern: "Recent vendor outages delayed customer notifications, and the team has limited visibility into the vendor's disaster recovery capabilities.",
      possibleOutcome: "During a major utility outage, customers may not receive timely restoration updates, increasing call-centre volume and affecting customer trust.",
      affectedAreas: "Customer outage notifications, customer communications, call-centre operations, and customer trust.",
      existingSafeguards: "Vendor service-level agreements, service monitoring, and documented escalation procedures.",
      additionalContext: "Fictional demonstration data for Pacific Utilities Corporation.",
    },
  },
  {
    id: "access-control",
    name: "Privileged access review",
    values: {
      assessmentSubject: "Operational technology privileged-access process",
      businessPurpose: "Pacific Utilities Corporation uses this process to grant and review elevated access to systems supporting field operations.",
      businessOwner: "Technology Operations",
      identifiedConcern: "Access reviews are completed inconsistently, and accounts for departing contractors may remain active longer than intended.",
      possibleOutcome: "Unauthorized access could affect operational systems, expose sensitive information, or disrupt field operations.",
      affectedAreas: "Operational technology systems, contractor accounts, field operations, and security monitoring.",
      existingSafeguards: "Identity management, manager approvals, access logging, and periodic access reviews.",
      additionalContext: "Fictional demonstration data for Pacific Utilities Corporation.",
    },
  },
  {
    id: "third-party-ai",
    name: "Third-party AI use",
    values: {
      assessmentSubject: "Third-party AI assistant for customer-service knowledge search",
      businessPurpose: "Pacific Utilities Corporation is evaluating an AI assistant to help customer-service staff find approved answers more quickly.",
      businessOwner: "Customer Experience",
      identifiedConcern: "The vendor's handling of prompts, retained data, model updates, and response accuracy has not been fully assessed.",
      possibleOutcome: "Sensitive information could be handled inappropriately, or inaccurate guidance could be shared with customers.",
      affectedAreas: "Customer-service processes, customer information, knowledge content, and customer communications.",
      existingSafeguards: "Draft vendor due diligence questions, approved knowledge sources, and human review of customer responses.",
      additionalContext: "Fictional demonstration data for Pacific Utilities Corporation. No production AI deployment is implied.",
    },
  },
];
