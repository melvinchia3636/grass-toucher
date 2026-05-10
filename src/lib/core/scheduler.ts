import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { LockdownConfig } from "../shared/config";

dayjs.extend(customParseFormat);

export function isInLockdownWindow(config: LockdownConfig): boolean {
  const now = dayjs();
  const start = dayjs(config.startTime, "HH:mm");
  const end = dayjs(config.endTime, "HH:mm");

  if (!start.isValid() || !end.isValid()) {
    return false;
  }

  if (start.isSame(end)) {
    return false;
  }

  // If end > start: normal window (e.g. 09:00-17:00), lock when now is between them.
  // If end <= start: crosses midnight (e.g. 22:00-06:00), lock when now is after start OR before end.
  if (end.isAfter(start)) {
    return now.isAfter(start) && now.isBefore(end);
  } else {
    return now.isAfter(start) || now.isBefore(end);
  }
}
