// format -> route: [roles with access]

const routes = {
  // "/": [],

  // "/about": [],
  // "/events": [],
  // "/events/[id]": [],
  // "/clubs": [],
  // "/clubs/[id]": [],
  // "/calendar": [],
  // "/student-bodies": [],

  "/cc-recruitments": ["public", "cc"],
  "/cc-recruitments/all": ["cc"],
  "/cc-recruitments/all/:id": ["cc"],
  "/docs": ["cc", "slo", "club", "slc"],
  "/docs/:id": ["cc"],
  "/docs/new": ["cc"],

  "/manage/members": ["cc", "club"],
  "/manage/members/new": ["cc", "club"], // has to be higher to not conflict with :id
  "/manage/members/bulk-add": ["cc", "club"],
  "/manage/members/bulk-edit": ["cc", "club"],
  "/manage/members/:id": ["cc", "club"],
  "/manage/members/:id/edit": ["cc", "club"],
  "/manage/data-members": ["cc", "club", "slo"],

  "/manage/events": ["cc", "club", "slc", "slo"],
  "/manage/events/new": ["cc", "club"], // has to be higher to not conflict with :id
  "/manage/events/:id": ["cc", "club", "slc", "slo"],
  "/manage/events/:id/edit": ["cc", "club", "slo"],
  "/manage/events/:id/report": ["cc", "club", "slo"],
  "/manage/events/:id/report/new": ["cc", "club"],
  "/manage/data-events": ["cc", "club", "slc", "slo"],
  "/manage/finances": ["cc", "club", "slo"],
  "/manage/finances/:id": ["slo"],

  "/manage/clubs": ["cc"],
  "/manage/clubs/new": ["cc"], // has to be higher to not conflict with :id
  "/manage/clubs/~mine": ["club"], // has to be higher to not conflict with :id
  "/manage/clubs/~mine/edit": ["club"], // has to be higher to not conflict with :id
  "/manage/clubs/:id": ["cc"],
  "/manage/clubs/:id/edit": ["cc"],

  "/manage/holidays": ["cc", "slo"],
  "/manage/holidays/new": ["cc", "slo"], // has to be higher to not conflict with :id
  "/manage/holidays/:id": ["cc", "slo"],
};

export default routes;
