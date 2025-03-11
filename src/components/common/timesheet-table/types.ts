// Define the timesheet entry type
export type TimesheetEntry = {
    id: string;
    monday_hours: number;
    tuesday_hours: number;
    wednesday_hours: number;
    thursday_hours: number;
    friday_hours: number;
    saturday_hours: number;
    sunday_hours: number;
    project: {
        id: string;
        name: string;
        client?: {
            id: string;
            name: string;
        };
    };
};

// Define props for the timesheet table
export interface TimesheetTableProps {
    entries: TimesheetEntry[];
    isLoading?: boolean;
    editable?: boolean;
    projects?: Array<{
        id: string;
        name: string;
        clients?: {
            id: string;
            name: string;
        };
    }>;
    onAddEntry?: (entry: Omit<TimesheetEntry, "id">) => void;
    onDeleteEntry?: (id: string) => void;
    onUpdateEntry?: (id: string, updatedEntry: Partial<TimesheetEntry>) => void;
}

// Day definitions
export const DAYS = [
    { key: "monday_hours", label: "Mon" },
    { key: "tuesday_hours", label: "Tue" },
    { key: "wednesday_hours", label: "Wed" },
    { key: "thursday_hours", label: "Thu" },
    { key: "friday_hours", label: "Fri" },
    { key: "saturday_hours", label: "Sat" },
    { key: "sunday_hours", label: "Sun" },
];
