"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye } from "lucide-react";
import { useAdminUsers } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminCustomerListItem } from "@/types/admin";

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isLoading } = useAdminUsers({
    page,
    per_page: 20,
    q: debouncedQ || undefined,
    role: "customer",
  });

  const columns: Column<AdminCustomerListItem>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone", render: (r) => r.phone || "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
    { key: "total_bookings", header: "Bookings" },
    { key: "total_reviews", header: "Reviews" },
    {
      key: "last_login_at",
      header: "Last login",
      render: (r) =>
        r.last_login_at
          ? new Date(r.last_login_at).toLocaleDateString()
          : "—",
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <Link href={`/admin/customers/${r.id}`}>
          <Button variant="ghost" size="icon-sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Customers</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.users ?? []}
        keyExtractor={(r) => r.id}
        emptyMessage={isLoading ? "Loading…" : "No customers found"}
      />
      {data?.meta && data.meta.total_pages > 1 && (
        <Pagination
          currentPage={data.meta.current_page}
          totalPages={data.meta.total_pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
