"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminSettings } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const { data, isLoading } = useAdminSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-neutral-900">System settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Platform config</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {isLoading ? (
            <p className="text-neutral-500">Loading…</p>
          ) : (
            <>
              <p><span className="text-neutral-500">Maintenance mode:</span> {data?.maintenance_mode ? "On" : "Off"}</p>
              <p><span className="text-neutral-500">Frontend URL:</span> {data?.frontend_url ?? "—"}</p>
              <p><span className="text-neutral-500">CORS origins:</span> {data?.cors_origins ?? "—"}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
