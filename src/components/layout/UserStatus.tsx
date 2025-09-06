// src/components/layout/UserStatus.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function UserStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-8 w-32" />;
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-4 p-4 border-t">
        <div className="flex-1">
          <p className="text-sm font-semibold">{session.user?.name}</p>
          <p className="text-xs text-gray-500">{session.user?.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut()}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return null;
}
