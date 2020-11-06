import { config } from "dotenv";

// config({ path: resolve(__dirname, "../../.env") });
config();

export default {
  credentials: {
    email: process.env.USER_GMAIL_ID,
    password: process.env.USER_GMAIL_PASSWORD
  }
};
