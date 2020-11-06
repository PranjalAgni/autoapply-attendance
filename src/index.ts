import { Timeoutable } from "puppeteer";
import config from "./config/index";

import CrawlDarwinbox from "./services/attendance";

const main = async () => {
  const crawlDarwinBox = new CrawlDarwinbox(
    config.credentials.email,
    config.credentials.password
  );

  await crawlDarwinBox.applyAttendance();
};

main();
