import pino from "pino";
import path from "path";

const logger = (fileName: string) =>
  pino({
    name: "autoapply-attendance",
    prettyPrint: {
      colorize: true,
      messageFormat: "{filename}: {msg}",
      translateTime: "yyyy-mm-dd HH:MM:ss",
      ignore: "pid,hostname"
    }
  }).child({ filename: path.basename(fileName) });

export default logger;
