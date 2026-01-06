export const canEditReport = (event, eventReport, user) => {
  const REPORT_EDIT_ACCESS_TIME = 2 * 24 * 60 * 60 * 1000;
  const REPORT_EDIT_ACCESS_TIME_SLO = 14 * 24 * 60 * 60 * 1000;

  if (!eventReport?.submittedTime || !user?.role) return false;

  const timeElapsed =
    new Date().getTime() - new Date(eventReport.submittedTime).getTime();

  if (["club"].includes(user.role) && user.uid == event.clubid) {
    return timeElapsed < REPORT_EDIT_ACCESS_TIME;
  }

  if (["cc"].includes(user.role)) {
    return timeElapsed < REPORT_EDIT_ACCESS_TIME;
  }

  if (["slo"].includes(user.role)) {
    return timeElapsed < REPORT_EDIT_ACCESS_TIME_SLO;
  }

  return false;
};
