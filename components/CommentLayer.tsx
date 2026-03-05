"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { usePathname } from "next/navigation";
import {
  supabase,
  buildCommentTree,
  COMMENTS_TABLE,
  COMMENT_IMAGES_BUCKET,
  AUTHOR_STORAGE_KEY,
  type Comment,
} from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "Ukendt dato";
  return d.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AVATAR_COLORS = [
  "bg-coral/10 text-coral",
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const px = size === "sm" ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs";
  return (
    <div
      className={`${px} ${avatarColor(name)} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const ImageIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="2"
      width="12"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
    <path
      d="M2 11l3-3 2 2 3-3 4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M3 3h12a1 1 0 011 1v8a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Image upload
// ---------------------------------------------------------------------------

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

async function uploadImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  if (file.size > MAX_IMAGE_SIZE)
    throw new Error("Billedet er for stort (maks 5 MB)");
  if (!file.type.startsWith("image/"))
    throw new Error("Kun billedfiler er tilladt");
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await supabase.storage
    .from(COMMENT_IMAGES_BUCKET)
    .upload(fileName, file);
  if (error) throw new Error(`Upload fejlede: ${error.message}`);
  const { data } = supabase.storage
    .from(COMMENT_IMAGES_BUCKET)
    .getPublicUrl(fileName);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// useObjectUrl — derive preview URL from File, auto-revoke on change/unmount
// ---------------------------------------------------------------------------

function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ImagePreview({
  src,
  onRemove,
  maxH = "max-h-40",
}: {
  src: string;
  onRemove: () => void;
  maxH?: string;
}) {
  return (
    <div className="relative">
      <img
        src={src}
        alt="Preview"
        className={`w-full rounded-lg ${maxH} object-cover`}
      />
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80"
      >
        ✕
      </button>
    </div>
  );
}

function CommentBubble({ comment }: { comment: Comment }) {
  const isPending = comment.id.startsWith("temp-");
  return (
    <div className={`space-y-2 ${isPending ? "opacity-60" : ""}`}>
      <div className="flex items-center gap-2">
        <Avatar name={comment.author} />
        <span className="text-sm font-medium text-text-primary">
          {comment.author}
        </span>
        <span className="text-xs text-text-muted">
          {isPending ? "Gemmer..." : formatDate(comment.created_at)}
        </span>
      </div>
      <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
        {comment.text}
      </p>
      {comment.image_url && (
        <a href={comment.image_url} target="_blank" rel="noopener noreferrer">
          <img
            src={comment.image_url}
            alt="Billede"
            className="rounded-lg max-h-48 object-cover hover:opacity-90 transition-opacity cursor-pointer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </a>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommentForm — shared between new comments and replies
// ---------------------------------------------------------------------------

interface CommentFormProps {
  text: string;
  onTextChange: (text: string) => void;
  image: File | null;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  placeholder: string;
  imageButtonLabel: string;
  error?: string | null;
  imageIconSize?: number;
  maxPreviewH?: string;
  rows?: number;
  autoFocus?: boolean;
  onCancel?: () => void;
  authorInput?: ReactNode;
}

function CommentForm({
  text,
  onTextChange,
  image,
  onImageChange,
  onSubmit,
  submitting,
  submitLabel,
  submittingLabel,
  placeholder,
  imageButtonLabel,
  error,
  imageIconSize = 16,
  maxPreviewH = "max-h-40",
  rows = 3,
  autoFocus = false,
  onCancel,
  authorInput,
}: CommentFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preview = useObjectUrl(image);

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageChange(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      {authorInput}
      <textarea
        placeholder={placeholder}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={rows}
        autoFocus={autoFocus}
        className="w-full text-sm border border-border-light rounded-lg px-3 py-2
          resize-none focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
      />
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {preview && (
        <ImagePreview
          src={preview}
          onRemove={() => onImageChange(null)}
          maxH={maxPreviewH}
        />
      )}
      <div className="flex items-center justify-between">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-text-secondary hover:text-coral transition-colors flex items-center gap-1.5"
        >
          <ImageIcon size={imageIconSize} />
          {imageButtonLabel}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
        />
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-text-secondary hover:text-text-primary px-3 py-1.5"
            >
              Annuller
            </button>
          )}
          <button
            onClick={onSubmit}
            disabled={!text.trim() || submitting}
            className="text-sm bg-coral text-white px-3 py-1.5 rounded-lg font-medium
              hover:bg-coral-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Anchor-based positioning helpers
// ---------------------------------------------------------------------------

function relativeOffset(clickX: number, clickY: number, rect: DOMRect) {
  return {
    x: rect.width > 0 ? ((clickX - rect.left) / rect.width) * 100 : 0,
    y: rect.height > 0 ? ((clickY - rect.top) / rect.height) * 100 : 0,
  };
}

interface AnchorPosition {
  anchorSelector: string | null;
  anchorOffsetX: number;
  anchorOffsetY: number;
  fallbackX: number;
  fallbackY: number;
}

function findNearestAnchor(
  target: HTMLElement,
  clickX: number,
  clickY: number,
  container: HTMLElement,
): AnchorPosition {
  const rect = container.getBoundingClientRect();
  const containerDocTop = rect.top + window.scrollY;
  const fallbackX = ((clickX - rect.left) / rect.width) * 100;
  const fallbackY =
    ((clickY + window.scrollY - containerDocTop) / container.scrollHeight) *
    100;

  const makeResult = (el: HTMLElement): AnchorPosition => {
    const offset = relativeOffset(clickX, clickY, el.getBoundingClientRect());
    return {
      anchorSelector: el.getAttribute("data-comment-anchor"),
      anchorOffsetX: offset.x,
      anchorOffsetY: offset.y,
      fallbackX,
      fallbackY,
    };
  };

  // Walk up from click target to find the nearest anchor
  const ancestor = target.closest?.("[data-comment-anchor]") as HTMLElement | null;
  if (ancestor && container.contains(ancestor)) {
    return makeResult(ancestor);
  }

  // No ancestor anchor — scan nearby anchors by proximity
  let best: { el: HTMLElement; dist: number } | null = null;
  for (const a of container.querySelectorAll<HTMLElement>("[data-comment-anchor]")) {
    const r = a.getBoundingClientRect();
    const dist = Math.hypot(clickX - (r.left + r.width / 2), clickY - (r.top + r.height / 2));
    if (!best || dist < best.dist) best = { el: a, dist };
  }

  if (best && best.dist < 300) return makeResult(best.el);

  return { anchorSelector: null, anchorOffsetX: 0, anchorOffsetY: 0, fallbackX, fallbackY };
}

function buildAnchorMap(container: HTMLElement): Map<string, HTMLElement> {
  const map = new Map<string, HTMLElement>();
  for (const el of container.querySelectorAll<HTMLElement>("[data-comment-anchor]")) {
    const key = el.getAttribute("data-comment-anchor");
    if (key) map.set(key, el);
  }
  return map;
}

function resolvePosition(
  comment: Comment,
  anchorMap: Map<string, HTMLElement>,
  containerRect: DOMRect,
  containerDocTop: number,
  containerScrollHeight: number,
): { left: string; top: string } {
  if (comment.anchor_selector) {
    const anchor = anchorMap.get(comment.anchor_selector);
    if (anchor) {
      const anchorRect = anchor.getBoundingClientRect();

      const absX = anchorRect.left + (comment.anchor_offset_x / 100) * anchorRect.width;
      const absY =
        anchorRect.top +
        window.scrollY +
        (comment.anchor_offset_y / 100) * anchorRect.height;

      const pctX = ((absX - containerRect.left) / containerRect.width) * 100;
      const pctY = ((absY - containerDocTop) / containerScrollHeight) * 100;

      return { left: `${pctX}%`, top: `${pctY}%` };
    }
  }
  return { left: `${comment.x_percent}%`, top: `${comment.y_percent}%` };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CommentLayer({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentMode, setCommentMode] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newPinPos, setNewPinPos] = useState<{
    x: number;
    y: number;
    anchorSelector: string | null;
    anchorOffsetX: number;
    anchorOffsetY: number;
  } | null>(null);

  // New comment form
  const [author, setAuthor] = useState("");
  const [formText, setFormText] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reply form
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Error feedback
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Optimistic UI: track temp IDs and confirmed real IDs
  const confirmedIds = useRef(new Set<string>());

  // -- Init author from localStorage --
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTHOR_STORAGE_KEY);
      if (saved) setAuthor(saved);
    } catch {
      // localStorage unavailable (private browsing, storage disabled)
    }
  }, []);

  const persistAuthor = useCallback(() => {
    if (author.trim()) {
      try {
        localStorage.setItem(AUTHOR_STORAGE_KEY, author.trim());
      } catch {
        // localStorage unavailable
      }
    }
  }, [author]);

  // -- Fetch comments for current page --
  const fetchComments = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from(COMMENTS_TABLE)
      .select("*")
      .eq("page_path", pathname)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Failed to load comments:", error);
      return;
    }
    setComments(buildCommentTree(data));
  }, [pathname]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // -- Real-time subscription --
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`comments:${pathname}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: COMMENTS_TABLE,
          filter: `page_path=eq.${pathname}`,
        },
        (payload) => {
          const incoming = payload.new as Comment;
          // Skip if we already added this via optimistic confirm
          if (confirmedIds.current.has(incoming.id)) {
            confirmedIds.current.delete(incoming.id);
            return;
          }
          setComments((prev) => {
            if (incoming.parent_id) {
              return prev.map((c) => {
                if (c.id !== incoming.parent_id) return c;
                if (c.replies?.some((r) => r.id === incoming.id)) return c;
                return { ...c, replies: [...(c.replies || []), incoming] };
              });
            }
            if (prev.some((c) => c.id === incoming.id)) return prev;
            return [...prev, { ...incoming, replies: [] }];
          });
        },
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, [pathname]);

  // -- Keyboard shortcuts --
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (newPinPos) setNewPinPos(null);
      else if (activeThreadId) setActiveThreadId(null);
      else if (commentMode) setCommentMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commentMode, activeThreadId, newPinPos]);

  // -- Click to place pin --
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!commentMode || !containerRef.current) return;

      const target = e.target as HTMLElement;
      if (
        target.closest(
          'a, button, input, textarea, select, [role="button"], .comment-ui',
        )
      )
        return;

      const container = containerRef.current;
      const pos = findNearestAnchor(target, e.clientX, e.clientY, container);

      setNewPinPos({
        x: pos.fallbackX,
        y: pos.fallbackY,
        anchorSelector: pos.anchorSelector,
        anchorOffsetX: pos.anchorOffsetX,
        anchorOffsetY: pos.anchorOffsetY,
      });
      setActiveThreadId(null);
      setFormText("");
      setFormImage(null);
    },
    [commentMode],
  );

  // -- Optimistic submit (new comment or reply) --
  const submitComment = async (opts: {
    parentId?: string;
    x: number;
    y: number;
    anchorSelector?: string | null;
    anchorOffsetX?: number;
    anchorOffsetY?: number;
    text: string;
    image: File | null;
    imagePreviewUrl?: string | null;
  }) => {
    if (!supabase || !opts.text.trim()) return;
    setSubmitError(null);

    const commentAuthor = author.trim() || "Anonym";
    persistAuthor();

    // 1. Create optimistic comment and add to state immediately
    const tempId = `temp-${Date.now()}`;
    const optimistic: Comment = {
      id: tempId,
      parent_id: opts.parentId || null,
      page_path: pathname,
      x_percent: opts.x,
      y_percent: opts.y,
      anchor_selector: opts.anchorSelector ?? null,
      anchor_offset_x: opts.anchorOffsetX ?? 0,
      anchor_offset_y: opts.anchorOffsetY ?? 0,
      text: opts.text.trim(),
      image_url: opts.imagePreviewUrl ?? null,
      author: commentAuthor,
      created_at: new Date().toISOString(),
    };

    setComments((prev) => {
      if (opts.parentId) {
        return prev.map((c) => {
          if (c.id !== opts.parentId) return c;
          return { ...c, replies: [...(c.replies || []), optimistic] };
        });
      }
      return [...prev, { ...optimistic, replies: [] }];
    });

    // 2. Upload image + insert in background
    try {
      let imageUrl: string | null = null;
      if (opts.image) imageUrl = await uploadImage(opts.image);

      const { data, error: insertError } = await supabase
        .from(COMMENTS_TABLE)
        .insert({
          parent_id: opts.parentId || null,
          page_path: pathname,
          x_percent: opts.x,
          y_percent: opts.y,
          anchor_selector: opts.anchorSelector ?? null,
          anchor_offset_x: opts.anchorOffsetX ?? 0,
          anchor_offset_y: opts.anchorOffsetY ?? 0,
          text: opts.text.trim(),
          image_url: imageUrl,
          author: commentAuthor,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Replace temp with real data, mark as confirmed for real-time dedup
      confirmedIds.current.add(data.id);
      setComments((prev) => {
        if (opts.parentId) {
          return prev.map((c) => {
            if (c.id !== opts.parentId) return c;
            return {
              ...c,
              replies: (c.replies || []).map((r) =>
                r.id === tempId ? data : r,
              ),
            };
          });
        }
        return prev.map((c) =>
          c.id === tempId ? { ...data, replies: c.replies } : c,
        );
      });
    } catch (err) {
      // 4. Remove optimistic comment on failure
      setComments((prev) => {
        if (opts.parentId) {
          return prev.map((c) => {
            if (c.id !== opts.parentId) return c;
            return {
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== tempId),
            };
          });
        }
        return prev.filter((c) => c.id !== tempId);
      });
      const message =
        err instanceof Error
          ? err.message
          : "Noget gik galt. Pr\u00f8v igen.";
      console.error("Failed to save comment:", err);
      setSubmitError(message);
    }
  };

  const handleSubmit = () => {
    if (!newPinPos) return;
    const imagePreviewUrl = formImage
      ? URL.createObjectURL(formImage)
      : null;
    submitComment({
      x: newPinPos.x,
      y: newPinPos.y,
      anchorSelector: newPinPos.anchorSelector,
      anchorOffsetX: newPinPos.anchorOffsetX,
      anchorOffsetY: newPinPos.anchorOffsetY,
      text: formText,
      image: formImage,
      imagePreviewUrl,
    }).finally(() => { if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); });
    // Clear form immediately (optimistic)
    setNewPinPos(null);
    setFormText("");
    setFormImage(null);
    setCommentMode(false);
  };

  const handleReply = () => {
    const parent = comments.find((c) => c.id === activeThreadId);
    if (!parent) return;
    const imagePreviewUrl = replyImage
      ? URL.createObjectURL(replyImage)
      : null;
    submitComment({
      parentId: activeThreadId!,
      x: parent.x_percent,
      y: parent.y_percent,
      anchorSelector: parent.anchor_selector,
      anchorOffsetX: parent.anchor_offset_x,
      anchorOffsetY: parent.anchor_offset_y,
      text: replyText,
      image: replyImage,
      imagePreviewUrl,
    }).finally(() => { if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl); });
    // Clear reply form immediately (optimistic)
    setReplyText("");
    setReplyImage(null);
  };

  // -- Debounced re-render on resize so anchor positions recalculate --
  const [, setResizeTick] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setResizeTick((t) => t + 1), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // -- Derived --
  const { activeThread, activeThreadIdx } = useMemo(() => {
    if (!activeThreadId) return { activeThread: null, activeThreadIdx: -1 };
    const idx = comments.findIndex((c) => c.id === activeThreadId);
    return {
      activeThread: idx >= 0 ? comments[idx] : null,
      activeThreadIdx: idx,
    };
  }, [comments, activeThreadId]);

  // If Supabase is not configured, just render children
  if (!supabase) return <>{children}</>;

  return (
    <>
      {/* Content container with pin positioning */}
      <div
        ref={containerRef}
        className={`relative min-h-screen ${commentMode ? "cursor-crosshair" : ""}`}
        onClick={handleContainerClick}
      >
        {commentMode && (
          <div className="fixed inset-0 bg-blue-500/[0.03] pointer-events-none z-20" />
        )}

        {children}

        {/* Existing pins */}
        {(() => {
          const container = containerRef.current;
          const anchorMap = container ? buildAnchorMap(container) : new Map<string, HTMLElement>();
          const cRect = container?.getBoundingClientRect();
          const cDocTop = cRect ? cRect.top + window.scrollY : 0;
          const cScrollH = container?.scrollHeight ?? 1;

          return comments.map((comment, idx) => {
          const isPending = comment.id.startsWith("temp-");
          const pos = cRect
            ? resolvePosition(comment, anchorMap, cRect, cDocTop, cScrollH)
            : { left: `${comment.x_percent}%`, top: `${comment.y_percent}%` };
          return (
          <div
            key={comment.id}
            className={`comment-ui absolute z-30 -translate-x-1/2 -translate-y-1/2
              w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              shadow-md cursor-pointer transition-all duration-150 hover:scale-110
              ${isPending ? "animate-pulse opacity-70" : ""}
              ${
                activeThreadId === comment.id
                  ? "bg-coral text-white ring-2 ring-coral/30 ring-offset-2 scale-110"
                  : "bg-coral/90 text-white hover:bg-coral"
              }`}
            style={pos}
            onClick={(e) => {
              e.stopPropagation();
              setActiveThreadId(
                activeThreadId === comment.id ? null : comment.id,
              );
              setNewPinPos(null);
              setReplyText("");
              setReplyImage(null);
            }}
            title={`${comment.author}: ${comment.text.substring(0, 60)}`}
          >
            {idx + 1}
            {(comment.replies?.length ?? 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-coral text-[9px] font-bold flex items-center justify-center shadow-sm">
                {comment.replies!.length}
              </span>
            )}
          </div>
          );
        });
        })()}

        {/* New pin being placed */}
        {newPinPos && (
          <div
            className="comment-ui absolute z-30 -translate-x-1/2 -translate-y-1/2
              w-7 h-7 rounded-full bg-coral text-white flex items-center justify-center
              text-xs font-bold shadow-md animate-bounce"
            style={{
              left: `${newPinPos.x}%`,
              top: `${newPinPos.y}%`,
            }}
          >
            +
          </div>
        )}
      </div>

      {/* ---- New comment form ---- */}
      {newPinPos && (
        <div className="comment-ui fixed bottom-20 right-6 z-[60] w-80 bg-white rounded-xl shadow-2xl border border-border-light overflow-hidden">
          <div className="px-4 py-3 bg-cream-dark/50 border-b border-border-light">
            <h3 className="text-sm font-semibold text-text-primary">
              Ny kommentar
            </h3>
          </div>
          <div className="p-4">
            <CommentForm
              text={formText}
              onTextChange={setFormText}
              image={formImage}
              onImageChange={setFormImage}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="Gem"
              submittingLabel="Gemmer..."
              placeholder="Skriv din kommentar..."
              imageButtonLabel="Tilføj billede"
              error={submitError}
              autoFocus
              onCancel={() => {
                setNewPinPos(null);
                setCommentMode(false);
              }}
              authorInput={
                <input
                  type="text"
                  placeholder="Dit navn"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  onBlur={persistAuthor}
                  className="w-full text-sm border border-border-light rounded-lg px-3 py-2
                    focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral"
                />
              }
            />
          </div>
        </div>
      )}

      {/* ---- Thread panel ---- */}
      {activeThread && (
        <div className="comment-ui fixed top-0 right-0 bottom-0 z-[55] w-full sm:w-96 bg-white shadow-2xl border-l border-border-light flex flex-col">
          <div className="px-4 py-3 bg-cream-dark/50 border-b border-border-light flex items-center justify-between shrink-0">
            <h3 className="text-sm font-semibold text-text-primary">
              Kommentar #{activeThreadIdx + 1}
            </h3>
            <button
              onClick={() => setActiveThreadId(null)}
              className="w-7 h-7 rounded-full hover:bg-cream-dark flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <CommentBubble comment={activeThread} />
            {activeThread.replies && activeThread.replies.length > 0 && (
              <div className="border-l-2 border-border-light pl-4 space-y-4">
                {activeThread.replies.map((reply) => (
                  <CommentBubble key={reply.id} comment={reply} />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border-light p-4 shrink-0">
            <CommentForm
              text={replyText}
              onTextChange={setReplyText}
              image={replyImage}
              onImageChange={setReplyImage}
              onSubmit={handleReply}
              submitting={replySubmitting}
              submitLabel="Svar"
              submittingLabel="..."
              placeholder="Skriv et svar..."
              imageButtonLabel="Billede"
              error={submitError}
              imageIconSize={14}
              maxPreviewH="max-h-32"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* ---- Toggle button ---- */}
      <button
        onClick={() => {
          setCommentMode(!commentMode);
          if (commentMode) setNewPinPos(null);
          setActiveThreadId(null);
        }}
        className={`comment-ui fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-full shadow-lg
          font-medium text-sm transition-all duration-200 flex items-center gap-2 no-print
          ${
            commentMode
              ? "bg-coral text-white shadow-coral/30"
              : "bg-white text-text-primary hover:shadow-xl border border-border-light"
          }`}
      >
        <ChatIcon />
        {commentMode
          ? "Klik for at placere"
          : `Kommentar${comments.length > 0 ? ` (${comments.length})` : ""}`}
      </button>

      {commentMode && !newPinPos && (
        <div className="comment-ui fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-coral text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          Klik hvor du vil placere din kommentar
        </div>
      )}

      {/* Error toast (shown when form is already closed) */}
      {submitError && !newPinPos && (
        <div className="comment-ui fixed bottom-20 right-6 z-[60] w-80 bg-red-50 border border-red-200 rounded-xl shadow-lg p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg shrink-0">!</span>
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">
              Kommentar ikke gemt
            </p>
            <p className="text-xs text-red-600 mt-1">{submitError}</p>
          </div>
          <button
            onClick={() => setSubmitError(null)}
            className="text-red-400 hover:text-red-600 text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
