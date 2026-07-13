/**
 * ProtectedContent — wraps any video or PDF viewer with:
 *  1. A transparent overlay that blocks right-click context menu
 *  2. CSS user-select: none to prevent text selection
 *  3. A dynamic diagonal watermark showing the student's name + ID
 *  4. Keyboard shortcut blocking (PrintScreen, Ctrl+P, Ctrl+S, Ctrl+U)
 *  5. Visibility change detection (tab switch / screen share attempt)
 *
 * NOTE: These measures significantly raise the cost of casual recording.
 * They are NOT a cryptographic DRM solution — determined users with
 * dedicated capture hardware can still record. For maximum protection,
 * combine with server-side signed URLs (short-lived) and watermarked
 * video transcoding.
 */

import { useEffect, useRef, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Shield } from "lucide-react";

interface ProtectedContentProps {
  children: ReactNode;
  /** Show a visible "protected" badge in the corner */
  showBadge?: boolean;
}

export default function ProtectedContent({ children, showBadge = true }: ProtectedContentProps) {
  const { user } = useAuth();
  const { data: studentData } = trpc.students.getMyProfile.useQuery(undefined, { staleTime: 60_000 });
  const overlayRef = useRef<HTMLDivElement>(null);

  const watermarkText = studentData?.nameAr
    ? `${studentData.nameAr} · ID:${studentData.id}`
    : user?.name ?? "طالب";

  useEffect(() => {
    // ── Block keyboard shortcuts ──────────────────────────────────────────
    const blockKeys = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard?.writeText("").catch(() => {});
      }
      // Ctrl+P (print), Ctrl+S (save), Ctrl+U (view source), Ctrl+Shift+I (devtools)
      if (e.ctrlKey && ["p", "s", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    // ── Block context menu (right-click) ──────────────────────────────────
    const blockContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // ── Visibility change — blur overlay when tab is hidden ───────────────
    const handleVisibilityChange = () => {
      if (document.hidden && overlayRef.current) {
        overlayRef.current.style.backdropFilter = "blur(20px)";
        overlayRef.current.style.backgroundColor = "rgba(0,0,0,0.7)";
      } else if (overlayRef.current) {
        overlayRef.current.style.backdropFilter = "";
        overlayRef.current.style.backgroundColor = "transparent";
      }
    };

    document.addEventListener("keydown", blockKeys);
    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      className="relative select-none"
      style={{ WebkitUserSelect: "none", MozUserSelect: "none", userSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Actual content */}
      <div className="relative">{children}</div>

      {/* Transparent interaction-blocking overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ transition: "background-color 0.3s, backdrop-filter 0.3s" }}
      />

      {/* Diagonal watermark grid */}
      <div
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Generate a 4×6 grid of watermark stamps */}
        {Array.from({ length: 24 }).map((_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          return (
            <div
              key={i}
              className="absolute text-white/[0.07] font-bold text-xs whitespace-nowrap"
              style={{
                top: `${row * 17 + 5}%`,
                left: `${col * 26 - 5}%`,
                transform: "rotate(-35deg)",
                fontSize: "11px",
                letterSpacing: "0.05em",
                fontFamily: "Cairo, sans-serif",
              }}
            >
              {watermarkText}
            </div>
          );
        })}
      </div>

      {/* Protection badge */}
      {showBadge && (
        <div className="absolute top-2 left-2 z-30 pointer-events-none">
          <div className="flex items-center gap-1 bg-black/40 text-white/80 rounded-full px-2 py-0.5 text-[10px] backdrop-blur-sm">
            <Shield className="w-2.5 h-2.5" />
            محتوى محمي
          </div>
        </div>
      )}
    </div>
  );
}
