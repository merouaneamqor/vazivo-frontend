"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, Flag, EyeOff } from "lucide-react";
import { useAdminReview, adminService } from "@/features/admin";
import { queryKeys } from "@/lib/query-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/modal";

export default function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const reviewId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmHide, setConfirmHide] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [moderationNotes, setModerationNotes] = useState("");
  const [showModerateDialog, setShowModerateDialog] = useState(false);
  const [moderateAction, setModerateAction] = useState<"approved" | "rejected">("approved");

  const { data, isLoading, error } = useAdminReview(reviewId);

  const updateReview = useMutation({
    mutationFn: (payload: { rating?: number; comment?: string; moderation_status?: string; moderation_notes?: string }) => adminService.updateReview(reviewId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.review(reviewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews() });
      setEditing(false);
      setShowModerateDialog(false);
      setModerationNotes("");
    },
  });

  const deleteReview = useMutation({
    mutationFn: () => adminService.deleteReview(reviewId),
    onSuccess: () => {
      setConfirmDelete(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews() });
      router.push("/admin/reviews");
    },
  });

  const hideReview = useMutation({
    mutationFn: () => adminService.hideReview(reviewId),
    onSuccess: () => {
      setConfirmHide(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.review(reviewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews() });
    },
  });

  const flagReview = useMutation({
    mutationFn: (reason: string) => adminService.flagReview(reviewId, reason),
    onSuccess: () => {
      setShowFlagDialog(false);
      setFlagReason("");
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.review(reviewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reviews() });
    },
  });

  const handleModerate = (status: "approved" | "rejected") => {
    setModerateAction(status);
    setModerationNotes(data?.review?.moderation_notes || "");
    setShowModerateDialog(true);
  };

  const submitModeration = () => {
    updateReview.mutate({ 
      moderation_status: moderateAction,
      moderation_notes: moderationNotes 
    });
  };

  if (Number.isNaN(reviewId) || error) {
    return (
      <div className="space-y-6">
        <p className="text-red-600">Review not found.</p>
        <Link href="/admin/reviews">
          <Button variant="outline">Back to reviews</Button>
        </Link>
      </div>
    );
  }

  const review = data?.review;
  if (isLoading || !review) {
    return (
      <div className="space-y-6">
        <p>Loading…</p>
      </div>
    );
  }

  const comment = (review as { comment?: string }).comment ?? "";
  const startEdit = () => {
    setEditRating(review.rating);
    setEditComment(comment);
    setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/reviews">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-bold text-neutral-900">Review #{review.id}</h1>
        <span className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          {review.rating}
        </span>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          review.moderation_status === "approved" ? "bg-green-100 text-green-800" :
          review.moderation_status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {review.moderation_status}
        </span>
        <div className="ml-auto flex gap-2">
          {review.moderation_status !== "approved" && (
            <Button variant="outline" size="sm" onClick={() => handleModerate("approved")}>
              Approve
            </Button>
          )}
          {review.moderation_status !== "rejected" && (
            <Button variant="outline" size="sm" onClick={() => handleModerate("rejected")}>
              Reject
            </Button>
          )}
          {!review.hidden_at && (
            <Button variant="outline" size="sm" onClick={() => setConfirmHide(true)}>
              <EyeOff className="h-4 w-4 mr-1" />
              Hide
            </Button>
          )}
          {!review.flagged_at && (
            <Button variant="outline" size="sm" onClick={() => setShowFlagDialog(true)}>
              <Flag className="h-4 w-4 mr-1" />
              Flag
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={startEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)} disabled={deleteReview.isPending}>
            Delete
          </Button>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardHeader><CardTitle>Edit review</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
              <Label>Comment</Label>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm min-h-[80px]"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => updateReview.mutate({ rating: editRating, comment: editComment })} disabled={updateReview.isPending}>
                {updateReview.isPending ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p><span className="text-neutral-500">Customer:</span> {review.user_name ?? "—"}</p>
              <p><span className="text-neutral-500">Business:</span> {review.business_name ?? "—"}</p>
              <p><span className="text-neutral-500">Overall Rating:</span> {review.rating}</p>
              <p><span className="text-neutral-500">Status:</span> <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                review.moderation_status === "approved" ? "bg-green-100 text-green-800" :
                review.moderation_status === "rejected" ? "bg-red-100 text-red-800" :
                "bg-yellow-100 text-yellow-800"
              }`}>{review.moderation_status}</span></p>
              {review.hidden_at && <p><span className="text-neutral-500">Hidden:</span> {new Date(review.hidden_at).toLocaleString()}</p>}
              {review.flagged_at && (
                <>
                  <p><span className="text-neutral-500">Flagged:</span> {new Date(review.flagged_at).toLocaleString()}</p>
                  {review.flag_reason && <p><span className="text-neutral-500">Flag Reason:</span> {review.flag_reason}</p>}
                </>
              )}
              {comment && <p><span className="text-neutral-500">Comment:</span> {comment}</p>}
              {review.moderation_notes && <p><span className="text-neutral-500">Moderation Notes:</span> {review.moderation_notes}</p>}
              <p><span className="text-neutral-500">Date:</span> {new Date(review.created_at).toLocaleString()}</p>
              {review.edited_at && <p><span className="text-neutral-500">Edited:</span> {new Date(review.edited_at).toLocaleString()}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Rating Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Service Quality</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{review.service_quality_rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Cleanliness</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{review.cleanliness_rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Professionalism</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{review.professionalism_rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Punctuality</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{review.punctuality_rating}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Hygiene</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{review.hygiene_rating}</span>
                  </div>
                </div>
                {review.ambiance_rating && (
                  <div>
                    <p className="text-sm text-neutral-500">Ambiance</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{review.ambiance_rating}</span>
                    </div>
                  </div>
                )}
                {review.staff_friendliness_rating && (
                  <div>
                    <p className="text-sm text-neutral-500">Staff Friendliness</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{review.staff_friendliness_rating}</span>
                    </div>
                  </div>
                )}
                {review.waiting_time_rating && (
                  <div>
                    <p className="text-sm text-neutral-500">Waiting Time</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{review.waiting_time_rating}</span>
                    </div>
                  </div>
                )}
                {review.value_rating && (
                  <div>
                    <p className="text-sm text-neutral-500">Value</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{review.value_rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {review.photos && review.photos.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {review.photos.map((photo, idx) => (
                    <img key={idx} src={photo} alt={`Review photo ${idx + 1}`} className="rounded-lg w-full h-32 object-cover" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog open={showModerateDialog} onOpenChange={setShowModerateDialog}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>{moderateAction === "approved" ? "Approve" : "Reject"} Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Moderation Notes (optional)</Label>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm min-h-[80px]"
                rows={3}
                placeholder="Add internal notes about this moderation decision..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModerateDialog(false)}>Cancel</Button>
            <Button onClick={submitModeration} disabled={updateReview.isPending}>
              {updateReview.isPending ? "Saving…" : `${moderateAction === "approved" ? "Approve" : "Reject"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent size="sm" showClose>
          <DialogHeader>
            <DialogTitle>Flag Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason</Label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm min-h-[80px]"
                rows={3}
                placeholder="Why are you flagging this review?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFlagDialog(false)}>Cancel</Button>
            <Button onClick={() => flagReview.mutate(flagReason)} disabled={flagReview.isPending}>
              {flagReview.isPending ? "Flagging…" : "Flag Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmHide}
        onOpenChange={setConfirmHide}
        title="Hide this review?"
        description="This will hide the review from public view but keep it in the system."
        confirmLabel="Yes, hide"
        onConfirm={() => hideReview.mutate()}
        loading={hideReview.isPending}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this review?"
        description="This will permanently remove the review."
        confirmLabel="Yes, delete"
        variant="destructive"
        onConfirm={() => deleteReview.mutate()}
        loading={deleteReview.isPending}
      />
    </div>
  );
}
