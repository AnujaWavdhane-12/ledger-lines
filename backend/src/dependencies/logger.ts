import { createLogger, format, transports, transport } from "winston";
import { TelemetryService } from "./telemetry";
import moment from "moment";

const customFormat = format.printf((info) => {
  const { level, message, timestamp } = info;
  const telemetryOperationId =
    TelemetryService.getInstance().getOperationId() || "-";
  const time = moment(timestamp);
  const time_format = time.format("L LTS");

  // Info might have extra metadata
  const filteredInfo = info as any;
  filteredInfo.level = undefined;
  filteredInfo.message = undefined;
  filteredInfo.timestamp = undefined;
  filteredInfo.label = undefined;

  let metadataAsJson = JSON.stringify(filteredInfo);
  const metadataEmpty = metadataAsJson === "{}";
  if (!metadataEmpty) {
    metadataAsJson = `\n\t${metadataAsJson}`;
  } else {
    metadataAsJson = ``;
  }

  return `${time_format} [${telemetryOperationId}] [${level}]: ${message} ${metadataAsJson}`;
});

const usedTransports: transport[] = [];
const runningInTests = process.env.NODE_ENV === "test";
if (runningInTests) {
  usedTransports.push(new transports.File({ filename: "combined.log" }));
} else {
  usedTransports.push(new transports.Console());
}

const CATEGORY = "Backend";

// Switch level to 'debug' for debugging.
export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.label({ label: CATEGORY }),
    format.timestamp(),
    customFormat
  ),
  transports: usedTransports,
});
