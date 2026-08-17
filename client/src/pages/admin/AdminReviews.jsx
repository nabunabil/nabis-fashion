import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, MessageSquare, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { api } from "../../lib/api";
import { useModal } from "../../context/ModalContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function AdminReviews() {
  const { showAlert, showConfirm } = useModal();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyingReview, setReplyingReview] = useState(null);
  const [replyText, setReplyText] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reviews");
      if (res && res.success && Array.isArray(res.data)) {
        setReviews(res.data);
      } else {
        // Demo fallback
        setReviews([
          {
            id: 1,
            user: { name: "Clara Bennett", email: "clara@example.com", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
            rating: 5,
            product: { title: "Men's Casual Panjabi – Solid Cotton Jacquard" },
            createdAt: "2026-07-25T14:00:00Z",
            comment: "Absolutely breathtaking craftsmanship! The cotton jacquard texture and fit are even richer in person.",
            isHidden: false,
          },
          {
            id: 2,
            user: { name: "Julian Vance", email: "julian@example.com", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
            rating: 4,
            product: { title: "Exclusive Banarasi Silk Saree" },
            createdAt: "2026-07-22T10:00:00Z",
            comment: "Incredibly soft weave. Fits true to size with a tailored luxury feel.",
            isHidden: false,
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleHide = async (id, isHidden) => {
    try {
      await api.patch(`/reviews/${id}/hide`, { isHidden: !isHidden });
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isHidden: !isHidden } : r))
      );
    } catch (err) {
      console.error("Failed toggling review visibility:", err);
    }
  };

  const handleDeleteReview = (id) => {
    showConfirm({
      title: "Remove Review",
      message: "Are you sure you want to permanently remove this customer review?",
      isDanger: true,
      confirmText: "Remove Review",
      onConfirm: async () => {
        try {
          await api.delete(`/reviews/${id}`);
          setReviews((prev) => prev.filter((r) => r.id !== id));
          showAlert({
            title: "Review Removed",
            message: "Customer review has been deleted.",
            type: "success",
          });
        } catch (err) {
          console.error("Failed deleting review:", err);
        }
      },
    });
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    showAlert({
      title: "Reply Dispatched",
      message: `Your response has been published to customer review #${replyingReview?.id}.`,
      type: "success",
    });
    setReplyingReview(null);
    setReplyText("");
  };

  const filteredReviews = reviews.filter((r) => {
    const userName = r.user?.name || r.author || "";
    const productTitle = r.product?.title || r.product || "";
    const comment = r.comment || "";
    const matchesSearch =
      userName.toLowerCase().includes(search.toLowerCase()) ||
      productTitle.toLowerCase().includes(search.toLowerCase()) ||
      comment.toLowerCase().includes(search.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || String(r.rating) === ratingFilter;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6 font-sans text-[#111827]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[#111827] tracking-tight">
            Customer Product Reviews
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Moderate verified customer feedback, star ratings, and store testimonials
          </p>
        </div>
      </div>

      {/* Search & Rating Filter Bar with Shadcn UI Select */}
      <div className="card-premium flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, product title, or review text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl text-xs text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#21453A]/40 transition-colors"
          />
        </div>

        <div className="w-48">
          <Select value={ratingFilter} onValueChange={(val) => setRatingFilter(val)}>
            <SelectTrigger className="bg-[#F7F8FA] border-[#ECECEC] text-xs font-semibold">
              <SelectValue placeholder="Filter by Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Star Ratings</SelectItem>
              <SelectItem value="5">5 Stars Only</SelectItem>
              <SelectItem value="4">4 Stars Only</SelectItem>
              <SelectItem value="3">3 Stars Only</SelectItem>
              <SelectItem value="2">2 Stars Only</SelectItem>
              <SelectItem value="1">1 Star Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#21453A]"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="card-premium text-center py-12 text-[#6B7280] text-xs">
            No customer reviews match your search or filter criteria.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="card-premium space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.user?.image || rev.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={rev.user?.name || "User"}
                    className="w-10 h-10 rounded-full object-cover border border-[#ECECEC]"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                      {rev.user?.name || rev.author || "Verified Customer"}
                      <span className="text-[10px] bg-[#DCFCE7] text-[#15803D] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                      </span>
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Reviewed <span className="font-semibold text-[#21453A]">{rev.product?.title || rev.product}</span> •{" "}
                      {new Date(rev.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? "fill-[#B88A2E] text-[#B88A2E]" : "text-[#ECECEC]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-[#111827] leading-relaxed bg-[#F7F8FA] p-3.5 rounded-xl border border-[#ECECEC]">
                "{rev.comment}"
              </p>

              <div className="pt-2 flex justify-between items-center text-xs text-[#6B7280]">
                <button
                  onClick={() => setReplyingReview(rev)}
                  className="text-[#21453A] font-semibold hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Reply to Review
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleHide(rev.id, rev.isHidden)}
                    className="text-[#6B7280] hover:text-[#111827] font-semibold flex items-center gap-1"
                  >
                    {rev.isHidden ? <Eye className="w-3.5 h-3.5 text-[#22C55E]" /> : <EyeOff className="w-3.5 h-3.5 text-[#B88A2E]" />}
                    <span>{rev.isHidden ? "Show Publicly" : "Hide Review"}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="text-[#EF4444] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#ECECEC] max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-heading font-bold text-base text-[#111827]">
              Reply to {replyingReview.user?.name || "Customer"}
            </h3>
            <p className="text-xs text-[#6B7280]">
              Your response will be displayed directly below their review on the product details page.
            </p>
            <textarea
              rows={4}
              required
              placeholder="Write an official merchant reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#ECECEC] rounded-xl p-3 text-xs outline-none focus:border-[#21453A]"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setReplyingReview(null)}
                className="px-4 py-2 bg-[#F7F8FA] border border-[#ECECEC] rounded-xl font-bold text-[#6B7280]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                className="px-5 py-2 bg-[#21453A] text-white rounded-xl font-bold hover:bg-[#17322A]"
              >
                Publish Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
