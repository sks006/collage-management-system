import pino from "pino";

export const logger = pino({
  name: "sms-worker",
  level: process.env.LOG_LEVEL || "info",
});
