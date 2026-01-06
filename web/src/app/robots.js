export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/manage/",
        "/*.json$",
        "/*_buildManifest.js$",
        "/*_middlewareManifest.js$",
        "/*_ssgManifest.js$",
        "/*.js$",
        "/events?*club=*",
      ],
    },
  };
}
