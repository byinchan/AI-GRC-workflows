export type SubmissionStatus = "Awaiting Review" | "Registered";
export type ReviewSubmission = { id: string; source: Record<string, string>; status: SubmissionStatus; riskId?: string };
export function nextSubmissionId(submissions: Pick<ReviewSubmission, "id">[]) { return `SUB-${String(submissions.length + 1).padStart(3, "0")}`; }
export function createSubmission(source: Record<string, string>, submissions: ReviewSubmission[]): ReviewSubmission { return { id: nextSubmissionId(submissions), source, status: "Awaiting Review" }; }
export function markSubmissionRegistered(submissions: ReviewSubmission[], id: string, riskId: string) { return submissions.map((submission) => submission.id === id ? { ...submission, status: "Registered" as const, riskId } : submission); }
