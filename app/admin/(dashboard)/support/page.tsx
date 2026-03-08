"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCog, Calendar } from "lucide-react";
import { adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { setImpersonation } from "@/lib/impersonation";

export default function AdminSupportPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");

  const impersonate = useMutation({
    mutationFn: async () => {
      const id = Number(userId);
      if (!id || Number.isNaN(id)) throw new Error("Enter a valid user ID");
      const json = await adminService.impersonate(id);
      if (json.access_token) {
        document.cookie = `access_token=${json.access_token}; path=/; max-age=${json.expires_in ?? 3600}; SameSite=Lax`;
      }
      return json;
    },
    onSuccess: () => {
      setImpersonation(`User #${userId}`);
      router.push("/");
    },
  });

  const { data: logData } = useQuery({
    queryKey: ["admin", "support", "activity_log"],
    queryFn: () => adminService.getActivityLog(),
  });
  const logs = (logData?.logs ?? []) as { id?: number; action?: string; created_at?: string }[];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-neutral-900">Support tools</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Impersonate user
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-neutral-600">
            Enter a user ID to log in as that user. You will be redirected to the home page with their session.
          </p>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <Label htmlFor="support-user-id">User ID</Label>
              <Input
                id="support-user-id"
                type="number"
                placeholder="e.g. 42"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-40 mt-1"
              />
            </div>
            <Button
              onClick={() => impersonate.mutate()}
              disabled={impersonate.isPending || !userId.trim()}
            >
              {impersonate.isPending ? "Redirecting…" : "Impersonate"}
            </Button>
          </div>
          {impersonate.isError && (
            <p className="text-sm text-red-600">{impersonate.error?.message ?? "Impersonate failed"}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create booking manually
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">Create a booking on behalf of a user. Available from booking or provider context when implemented.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity log</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {logs.map((log, i) => (
                <li key={log.id ?? i} className="flex justify-between text-neutral-600">
                  <span>{log.action ?? "—"}</span>
                  <span>{log.created_at ? new Date(log.created_at).toLocaleString() : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">No activity log entries yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
