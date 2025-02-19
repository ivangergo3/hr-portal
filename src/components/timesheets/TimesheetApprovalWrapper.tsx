"use client";

import { useState } from "react";
import { startOfWeek } from "date-fns";
import { TimesheetApprovalHeader } from "./TimesheetApprovalHeader";
import { TimesheetApprovalContent } from "./TimesheetApprovalContent";

interface TimesheetApprovalWrapperProps {
  userId: string;
}

export default function TimesheetApprovalWrapper({
  userId,
}: TimesheetApprovalWrapperProps) {
  const [selectedWeek, setSelectedWeek] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  return (
    <>
      <TimesheetApprovalHeader
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
      />
      <TimesheetApprovalContent
        userId={userId}
        selectedWeek={selectedWeek}
        onWeekChange={setSelectedWeek}
      />
    </>
  );
}
