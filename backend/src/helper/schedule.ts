import { RRule } from "rrule";
import { ISchedule } from "../model/slotModel";

export function isScheduleExpired(schedule: ISchedule): boolean {
  const now = new Date();
  if (!schedule.isRecurring) {
    return now > schedule.endTime;
  } else {
    if (!schedule.recurrenceRule) return false;
    try {
      const rule = RRule.fromString(schedule.recurrenceRule);
      const nextOccurrence = rule.after(now, true);
      return nextOccurrence === null;
    } catch (error) {
      console.error("Error parsing recurrence rule:", error);
      return false;
    }
  }
}
