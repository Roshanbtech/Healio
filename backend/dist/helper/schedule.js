"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScheduleExpired = isScheduleExpired;
const rrule_1 = require("rrule");
function isScheduleExpired(schedule) {
    const now = new Date();
    if (!schedule.isRecurring) {
        return now > schedule.endTime;
    }
    else {
        if (!schedule.recurrenceRule)
            return false;
        try {
            const rule = rrule_1.RRule.fromString(schedule.recurrenceRule);
            const nextOccurrence = rule.after(now, true);
            return nextOccurrence === null;
        }
        catch (error) {
            console.error("Error parsing recurrence rule:", error);
            return false;
        }
    }
}
