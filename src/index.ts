import { isSaturday, isSunday } from "date-fns";
import config from "./config/index";
import { ICredentials, IAttendanceDetails } from "./interfaces";
import CrawlDarwinbox from "./services/attendance";
import parentLogger from "./utils/logger";

const logger = parentLogger(__filename);

const stopIfWeekend = () => {
  const todaysDate = new Date();
  if (isSaturday(todaysDate) || isSunday(todaysDate)) {
    logger.info("Gracefully exiting as today is weekend 👋");
    process.exit();
  }
};
const validateCredentials = () => {
  if (!config.credentials.email || !config.credentials.password) {
    logger.error("Please provide correct credentials");
    process.exit(1);
  }
};

const getCredentialsAndFormDetails = () => {
  const credentials: ICredentials = {
    emailId: config.credentials.email,
    password: config.credentials.password
  };

  const attendanceDetails: IAttendanceDetails = {
    message: config.attendance.message,
    startDate: config.attendance.startDate,
    endDate: config.attendance.endDate
  };

  return {
    credentials,
    attendanceDetails
  };
};

const main = async () => {
  stopIfWeekend();
  validateCredentials();
  const { credentials, attendanceDetails } = getCredentialsAndFormDetails();
  const crawlDarwinBox = new CrawlDarwinbox(credentials, attendanceDetails);
  await crawlDarwinBox.applyAttendance();
};

main();
