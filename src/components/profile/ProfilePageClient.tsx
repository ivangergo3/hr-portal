"use client";

import { User } from "@/types/database.types";
import { ProfileForm } from "./ProfileForm";

interface ProfilePageClientProps {
  user: User;
  initialProfile: User;
}

export default function ProfilePageClient({
  user,
  initialProfile,
}: ProfilePageClientProps) {
  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <ProfileForm
      user={user}
      initialProfile={initialProfile}
      onSuccess={handleSuccess}
    />
  );
}
