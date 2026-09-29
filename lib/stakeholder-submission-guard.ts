export function createStakeholderSubmissionGuard() {
  let inProgress = false;
  let finalized = false;

  return {
    begin() {
      if (inProgress || finalized) return false;
      inProgress = true;
      return true;
    },
    release() {
      inProgress = false;
    },
    finalize() {
      if (finalized) return false;
      finalized = true;
      return true;
    },
    reset() {
      inProgress = false;
      finalized = false;
    },
  };
}
