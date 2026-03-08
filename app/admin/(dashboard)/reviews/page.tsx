"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Eye, Edit, Plus, EyeOff, Flag, X, MoreVertical, LayoutGrid, List } from "lucide-react";
import { useAdminReviews, adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";
import type { AdminReviewListItem } from "@/types/admin";

export default function AdminReviewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [businessId, setBusinessId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [showHidden, setShowHidden] = useState<string>("");
  const [showFlagged, setShowFlagged] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [editingReview, setEditingReview] = useState<AdminReviewListItem | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editStatus, setEditStatus] = useState<"pending" | "approved" | "rejected">("approved");
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: number } | null>(null);
  
  const { data, isLoading } = useAdminReviews({ 
    page, 
    per_page: 20, 
    rating: rating ? Number(rating) : undefined,
    status: status || undefined,
    business_id: businessId ? Number(businessId) : undefined,
    user_id: userId ? Number(userId) : undefined,
  });

  const updateReview = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => 
      adminService.updateReview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews() });
      setEditingReview(null);
    },
  });

  const hideReview = useMutation({
    mutationFn: (id: number) => adminService.hideReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.reviews() });
      const previous = queryClient.getQueryData(queryKeys.admin.reviews({ page, per_page: 20 }));
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), (old: any) => ({
        ...old,
        reviews: old?.reviews?.map((r: AdminReviewListItem) => 
          r.id === id ? { ...r, hidden_at: new Date().toISOString() } : r
        ),
      }));
      return { previous };
    },
    onError: (err, id, context: any) => {
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), context.previous);
    },
  });

  const unhideReview = useMutation({
    mutationFn: (id: number) => adminService.unhideReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.reviews() });
      const previous = queryClient.getQueryData(queryKeys.admin.reviews({ page, per_page: 20 }));
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), (old: any) => ({
        ...old,
        reviews: old?.reviews?.map((r: AdminReviewListItem) => 
          r.id === id ? { ...r, hidden_at: null } : r
        ),
      }));
      return { previous };
    },
    onError: (err, id, context: any) => {
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), context.previous);
    },
  });

  const flagReview = useMutation({
    mutationFn: (id: number) => adminService.flagReview(id, "Flagged by admin"),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.reviews() });
      const previous = queryClient.getQueryData(queryKeys.admin.reviews({ page, per_page: 20 }));
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), (old: any) => ({
        ...old,
        reviews: old?.reviews?.map((r: AdminReviewListItem) => 
          r.id === id ? { ...r, flagged_at: new Date().toISOString(), flag_reason: "Flagged by admin" } : r
        ),
      }));
      return { previous };
    },
    onError: (err, id, context: any) => {
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), context.previous);
    },
  });

  const unflagReview = useMutation({
    mutationFn: (id: number) => adminService.unflagReview(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.reviews() });
      const previous = queryClient.getQueryData(queryKeys.admin.reviews({ page, per_page: 20 }));
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), (old: any) => ({
        ...old,
        reviews: old?.reviews?.map((r: AdminReviewListItem) => 
          r.id === id ? { ...r, flagged_at: null, flag_reason: null } : r
        ),
      }));
      return { previous };
    },
    onError: (err, id, context: any) => {
      queryClient.setQueryData(queryKeys.admin.reviews({ page, per_page: 20 }), context.previous);
    },
  });

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    
    if (type === "hide") hideReview.mutate(id);
    else if (type === "unhide") unhideReview.mutate(id);
    else if (type === "flag") flagReview.mutate(id);
    else if (type === "unflag") unflagReview.mutate(id);
    
    setConfirmAction(null);
  };

  const getConfirmConfig = () => {
    if (!confirmAction) return { title: "", description: "" };
    const { type } = confirmAction;
    
    if (type === "hide") return { title: "Hide Review?", description: "This review will be hidden from public view." };
    if (type === "unhide") return { title: "Unhide Review?", description: "This review will be visible to the public." };
    if (type === "flag") return { title: "Flag Review?", description: "This review will be marked for moderation." };
    if (type === "unflag") return { title: "Unflag Review?", description: "This review will be unmarked." };
    
    return { title: "", description: "" };
  };

  const startEdit = (review: AdminReviewListItem) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditStatus(review.moderation_status);
    setEditComment("");
  };

  const handleUpdate = () => {
    if (!editingReview) return;
    updateReview.mutate({
      id: editingReview.id,
      payload: {
        rating: editRating,
        moderation_status: editStatus,
        comment: editComment || undefined,
      },
    });
  };

  const columns: Column<AdminReviewListItem>[] = [
    { key: "id", header: "ID", render: (r) => `#${r.id}` },
    { 
      key: "user_name", 
      header: "Customer",
      render: (r) => (
        <div className="flex items-center gap-2">
          <span>{r.user_name || "N/A"}</span>
          {r.hidden_at && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Hidden</span>}
          {r.flagged_at && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Flagged</span>}
        </div>
      ),
    },
    { key: "business_name", header: "Business" },
    {
      key: "rating",
      header: "Rating",
      render: (r) => (
        <span className={`flex items-center gap-1 ${r.rating < 3 ? 'text-red-600 font-semibold' : ''}`}>
          <Star className={`h-4 w-4 ${r.rating < 3 ? 'fill-red-500 text-red-500' : 'fill-amber-400 text-amber-400'}`} />
          {r.rating}
        </span>
      ),
    },
    {
      key: "moderation_status",
      header: "Status",
      render: (r) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          r.moderation_status === "approved" ? "bg-green-100 text-green-800" :
          r.moderation_status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {r.moderation_status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (r) => new Date(r.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (r) => (
        <div className="relative group">
          <Button variant="ghost" size="sm" className="gap-1">
            <span className="text-sm">Actions</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
          <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <Link href={`/admin/reviews/${r.id}`}>
              <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-3">
                <Eye className="h-4 w-4 text-neutral-600" />
                <span>View Details</span>
              </button>
            </Link>
            <button
              onClick={() => startEdit(r)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-3"
            >
              <Edit className="h-4 w-4 text-neutral-600" />
              <span>Edit</span>
            </button>
            <div className="border-t border-neutral-100 my-1" />
            {r.hidden_at ? (
              <button
                onClick={() => setConfirmAction({ type: "unhide", id: r.id })}
                className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-700"
              >
                <Eye className="h-4 w-4" />
                <span>Unhide</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmAction({ type: "hide", id: r.id })}
                className="w-full px-4 py-2 text-left text-sm hover:bg-amber-50 flex items-center gap-3 text-amber-700"
              >
                <EyeOff className="h-4 w-4" />
                <span>Hide</span>
              </button>
            )}
            {r.flagged_at ? (
              <button
                onClick={() => setConfirmAction({ type: "unflag", id: r.id })}
                className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-700"
              >
                <X className="h-4 w-4" />
                <span>Unflag</span>
              </button>
            ) : (
              <button
                onClick={() => setConfirmAction({ type: "flag", id: r.id })}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-700"
              >
                <Flag className="h-4 w-4" />
                <span>Flag</span>
              </button>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-neutral-900">Reviews</h1>
          <p className="text-sm text-neutral-600 mt-1">Manage and moderate customer reviews</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "table" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "cards" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-700 mb-1.5 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-700 mb-1.5 block">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} star{r !== 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-700 mb-1.5 block">Hidden</label>
            <select
              value={showHidden}
              onChange={(e) => setShowHidden(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="yes">Hidden only</option>
              <option value="no">Visible only</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-700 mb-1.5 block">Flagged</label>
            <select
              value={showFlagged}
              onChange={(e) => setShowFlagged(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All</option>
              <option value="yes">Flagged only</option>
              <option value="no">Not flagged</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-700 mb-1.5 block">Business ID</label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder="Filter by business ID"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-neutral-700 mb-1.5 block">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Filter by user ID"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          {(status || rating || showHidden || showFlagged || businessId || userId) && (
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatus("");
                  setRating("");
                  setShowHidden("");
                  setShowFlagged("");
                  setBusinessId("");
                  setUserId("");
                }}
                className="w-full"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Mobile view */}
        <div className="block lg:hidden divide-y divide-neutral-200">
          {isLoading ? (
            <div className="p-6 text-center text-neutral-600">Loading…</div>
          ) : data?.reviews?.length === 0 ? (
            <div className="p-6 text-center text-neutral-600">No reviews found</div>
          ) : (
            data?.reviews?.map((r) => (
              <div key={r.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-neutral-900">#{r.id}</span>
                      {r.hidden_at && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Hidden</span>}
                      {r.flagged_at && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Flagged</span>}
                    </div>
                    <div className="text-sm text-neutral-600 truncate">{r.user_name || "N/A"}</div>
                    <div className="text-xs text-neutral-500 truncate">{r.business_name}</div>
                  </div>
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <Link href={`/admin/reviews/${r.id}`}>
                        <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-3">
                          <Eye className="h-4 w-4 text-neutral-600" />
                          <span>View Details</span>
                        </button>
                      </Link>
                      <button
                        onClick={() => startEdit(r)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-3"
                      >
                        <Edit className="h-4 w-4 text-neutral-600" />
                        <span>Edit</span>
                      </button>
                      <div className="border-t border-neutral-100 my-1" />
                      {r.hidden_at ? (
                        <button
                          onClick={() => setConfirmAction({ type: "unhide", id: r.id })}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-700"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Unhide</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmAction({ type: "hide", id: r.id })}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-amber-50 flex items-center gap-3 text-amber-700"
                        >
                          <EyeOff className="h-4 w-4" />
                          <span>Hide</span>
                        </button>
                      )}
                      {r.flagged_at ? (
                        <button
                          onClick={() => setConfirmAction({ type: "unflag", id: r.id })}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-700"
                        >
                          <X className="h-4 w-4" />
                          <span>Unflag</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmAction({ type: "flag", id: r.id })}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-700"
                        >
                          <Flag className="h-4 w-4" />
                          <span>Flag</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className={`flex items-center gap-1 ${r.rating < 3 ? 'text-red-600 font-semibold' : ''}`}>
                    <Star className={`h-4 w-4 ${r.rating < 3 ? 'fill-red-500 text-red-500' : 'fill-amber-400 text-amber-400'}`} />
                    <span className="font-medium">{r.rating}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    r.moderation_status === "approved" ? "bg-green-100 text-green-800" :
                    r.moderation_status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {r.moderation_status}
                  </span>
                  <span className="text-xs text-neutral-500">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table view */}
        {viewMode === "table" && (
          <div className="hidden lg:block">
            <DataTable
              columns={columns}
              data={data?.reviews ?? []}
              keyExtractor={(r) => r.id}
              emptyMessage={isLoading ? "Loading…" : "No reviews found"}
            />
          </div>
        )}

        {/* Desktop cards view */}
        {viewMode === "cards" && (
          <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {isLoading ? (
              <div className="col-span-full p-6 text-center text-neutral-600">Loading…</div>
            ) : data?.reviews?.length === 0 ? (
              <div className="col-span-full p-6 text-center text-neutral-600">No reviews found</div>
            ) : (
              data?.reviews?.map((r) => (
                <div key={r.id} className="border border-neutral-200 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-neutral-900">#{r.id}</span>
                        {r.hidden_at && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Hidden</span>}
                        {r.flagged_at && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Flagged</span>}
                      </div>
                      <div className="text-sm text-neutral-900 font-medium truncate">{r.user_name || "N/A"}</div>
                      <div className="text-xs text-neutral-500 truncate">{r.business_name}</div>
                    </div>
                    <div className="relative group">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      <div className="absolute right-0 top-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <Link href={`/admin/reviews/${r.id}`}>
                          <button className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-3">
                            <Eye className="h-4 w-4 text-neutral-600" />
                            <span>View Details</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => startEdit(r)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-3"
                        >
                          <Edit className="h-4 w-4 text-neutral-600" />
                          <span>Edit</span>
                        </button>
                        <div className="border-t border-neutral-100 my-1" />
                        {r.hidden_at ? (
                          <button
                            onClick={() => setConfirmAction({ type: "unhide", id: r.id })}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-700"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Unhide</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmAction({ type: "hide", id: r.id })}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-amber-50 flex items-center gap-3 text-amber-700"
                          >
                            <EyeOff className="h-4 w-4" />
                            <span>Hide</span>
                          </button>
                        )}
                        {r.flagged_at ? (
                          <button
                            onClick={() => setConfirmAction({ type: "unflag", id: r.id })}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-green-50 flex items-center gap-3 text-green-700"
                          >
                            <X className="h-4 w-4" />
                            <span>Unflag</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmAction({ type: "flag", id: r.id })}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-700"
                          >
                            <Flag className="h-4 w-4" />
                            <span>Flag</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <div className={`flex items-center gap-1 ${r.rating < 3 ? 'text-red-600 font-semibold' : ''}`}>
                      <Star className={`h-4 w-4 ${r.rating < 3 ? 'fill-red-500 text-red-500' : 'fill-amber-400 text-amber-400'}`} />
                      <span className="font-medium">{r.rating}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      r.moderation_status === "approved" ? "bg-green-100 text-green-800" :
                      r.moderation_status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {r.moderation_status}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500">{new Date(r.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {data?.meta && data.meta.total_pages > 1 && (
        <Pagination
          currentPage={data.meta.current_page}
          totalPages={data.meta.total_pages}
          onPageChange={setPage}
        />
      )}

      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>Edit Review #{editingReview?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <select
                value={editRating}
                onChange={(e) => setEditRating(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>{r} star{r !== 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Status</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <Label>Comment (optional)</Label>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm min-h-[80px]"
                rows={3}
                placeholder="Update comment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReview(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateReview.isPending}>
              {updateReview.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
        title={getConfirmConfig().title}
        description={getConfirmConfig().description}
        onConfirm={handleConfirm}
        confirmLabel="Confirm"
      />
    </div>
  );
}
