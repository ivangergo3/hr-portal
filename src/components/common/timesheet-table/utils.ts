import { TimesheetEntry } from "./types";

// Calculate total hours for an entry
export const calculateEntryTotal = (entry: TimesheetEntry): number => {
    return (
        entry.monday_hours +
        entry.tuesday_hours +
        entry.wednesday_hours +
        entry.thursday_hours +
        entry.friday_hours +
        entry.saturday_hours +
        entry.sunday_hours
    );
};

// Calculate daily totals
export const calculateDailyTotal = (
    entries: TimesheetEntry[],
    day: string,
): number => {
    return entries.reduce(
        (total, entry) =>
            total +
            ((entry[`${day}_hours` as keyof typeof entry] as number) || 0),
        0,
    );
};

// Calculate grand total
export const calculateGrandTotal = (entries: TimesheetEntry[]): number => {
    return entries.reduce(
        (total, entry) => total + calculateEntryTotal(entry),
        0,
    );
};
