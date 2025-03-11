'use client';

import TimesheetApprovalReviewWrapper from '@/components/timesheets-approval/review/TimesheetApprovalReviewWrapper';
import { useAuth } from '@/contexts/AuthContext';

export default function TimesheetApprovalReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <TimesheetApprovalReviewWrapper timesheetId={params.id} userId={user.id} />
  );
}
