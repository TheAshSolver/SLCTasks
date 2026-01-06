const SITEMAP_HOSTNAME = "https://life.iiit.ac.in";

const fs = require("node:fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");

const APP_ROOT = "./src/app";
const PAGE_FILENAME = "page.jsx";
const SITEMAP_PATHS = [];
// const TODAYS_DATE_AS_ARRAY = new Date().toLocaleDateString().split("/");
const WRITE_FILE_PATH = "./public/sitemap.xml";
/**
 * Populates [SITEMAP_PATHS] with the fully qualified URLs for our pages to be contained
 * within our sitemap.xml file.
 *
 * @param {string} path The path we are currently searching.
 * @param {string} isRoot Flag that denotes whether or not we are processing our root path.
 * @return {void}
 */
const getAllUrlsForSitemap = (path, isRoot) => {
  // Get all files within our current directory
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    // Not using template strings due to article format on website.
    const dirPath = path + "/" + file;
    if (file.includes(PAGE_FILENAME) && !isRoot) {
      SITEMAP_PATHS.push(dirPath);
    } else {
      try {
        const stats = fs.statSync(dirPath);
        if (stats.isDirectory()) {
          // Continue searching until we exhaust all directories.
          getAllUrlsForSitemap(dirPath, false);
        }
      } catch (err) {
        console.error(err);
      }
    }
  });
};

const makeDate = (datetime) => {
  return new Date(datetime).toISOString();
};

/**
 * Returns an object containing the url and lastmod sitemap properties.
 *
 * @param {string} path The path we are currently searching.
 * @param {string} isRoot Flag that denotes whether or not we are processing our root path.
 * @return {Object} url: URL for page on website. lastmod: last modification date for our page.
 */
const mapToSitemapFormat = (path) => ({
  // Not using template strings due to article format on website.
  url: path.replace(APP_ROOT + "/", "").replace("/" + PAGE_FILENAME, ""),
  // lastmod: makeDate(fs.statSync(path).mtime.toLocaleString()),
  lastmod: require("child_process")
    .execSync(`git log -1 --pretty="format:%ci" ${path}`)
    .toString()
    .trim(),
});
/**
 * Returns a string representation of a date unit. e.g. dd, mm, yy
 *
 * @param {string} unit Date unit as a number in string format. e.g. month, day, year
 * @param {string} isRoot Flag that denotes whether or not we are processing our root path.
 * @return {Object} url: URL for page on website. lastmod: last modification date for our page.
 */
// const padDateUnit = (unit) => ("unit".length < 2 ? "0" + "unit" : unit);
(async () => {
  console.info("Generating sitemap...");
  // Create [SitemapStream] that will ultimately populate our sitemap.xml.
  const stream = new SitemapStream({
    hostname: SITEMAP_HOSTNAME,
  });
  // Populate [SITEMAP_PATHS] based on our [PAGE_FILENAME].
  getAllUrlsForSitemap(APP_ROOT, true);
  try {
    // Create our sitemap.xml contents.
    const ROOT_SITEMAP_ENTRY = {
      url: SITEMAP_HOSTNAME,
      lastmod: makeDate(
        fs.statSync(APP_ROOT + "/" + PAGE_FILENAME).mtime.toLocaleString(),
        // .split("/")
      ),
    };
    const content = await streamToPromise(
      Readable.from([
        ROOT_SITEMAP_ENTRY,
        ...SITEMAP_PATHS.map((url) => mapToSitemapFormat(url)),
      ]).pipe(stream),
    ).then((data) => data.toString());
    console.info("Successfully generated sitemap...");

    // Write our sitemap contents to [WRITE_FILE_PATH].
    fs.writeFileSync(WRITE_FILE_PATH, content);
  } catch (err) {
    console.error(err);
  }
})();
