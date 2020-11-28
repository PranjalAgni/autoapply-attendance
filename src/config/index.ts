import { config } from "dotenv";
import format from "date-fns/format";

config();

const todaysDate = format(new Date(), "dd-MM-yyyy");

export default {
  credentials: {
    email: process.env.USER_GMAIL_ID,
    password: process.env.USER_GMAIL_PASSWORD
  },
  attendance: {
    message:
      process.env.ATTEDANCE_MESSAGE || "Attendance not updated in Darwinbox",
    startDate: process.env.ATTENDANCE_START_DATE || todaysDate,
    endDate: process.env.ATTENDANCE_END_DATE || todaysDate
  }
};
