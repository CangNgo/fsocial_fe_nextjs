import { computeLayout } from "@/features/home/hooks/compute-layout";
import { LayoutSlot, MediaResponse } from "@/features/home/types/post";
import { Image } from "@/shared/components/atoms/image";
import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PhotoCell — render 1 ô ảnh trong grid
// Tách thành component riêng để dễ add onClick, lazy load, skeleton...
// ─────────────────────────────────────────────────────────────────────────────

interface PhotoCellProps {
  slot: LayoutSlot;
  onImageClick?: (media: MediaResponse) => void;
}

function PhotoCell({ slot, onImageClick }: PhotoCellProps) {
  const { media, colSpan, rowSpan, height, showMore } = slot;

  return (
    <div
      // ── Grid placement ──────────────────────────────────────────────────
      // Dùng inline style vì Tailwind không support dynamic span values
      // (grid-column: span 3 không thể viết là col-span-{colSpan} dynamic)
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        height: `${height}px`,
      }}
      className="relative overflow-hidden rounded-sm cursor-pointer group"
      onClick={() => onImageClick?.(media)}
    >
      <Image
        src={media.url}
        alt="Image"
        loading="lazy"
        // object-cover: crop ảnh để fill cell mà không méo
        // object-position center top: ưu tiên giữ phần trên (mặt người)
        // khi bị crop bớt phần dưới — đây là trick quan trọng với portrait
        className="w-full h-full object-cover object-top
                   group-hover:scale-[1.03] transition-transform duration-300"
      />

      {/* Overlay "+N more" — chỉ render ở ô cuối cùng khi có ảnh ẩn */}
      {showMore && showMore > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white text-2xl font-semibold">
            +{showMore}
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PhotoGrid — component chính
// ─────────────────────────────────────────────────────────────────────────────

interface PhotoGridProps {
  media: MediaResponse[];
  onImageClick?: (media: MediaResponse) => void;
  // maxWidth: giới hạn chiều rộng container — nên khớp với BASE_WIDTH
  // trong computeLayout.ts để height tính ra chính xác
  maxWidth?: number;
  className?: string;
}

export function PhotoGrid({
  media,
  onImageClick,
  maxWidth = 500,
  className = "",
}: PhotoGridProps) {
  // Tính layout một lần khi media thay đổi
  // computeLayout trả về null nếu không có ảnh
  const layout = computeLayout(media);

  if (!layout) return null;

  return (
    <div
      className={`w-full overflow-hidden rounded-xl ${className}`}
      style={{ maxWidth }}
    >
      <div
        // ── CSS Grid container ────────────────────────────────────────────
        // grid-template-columns động theo totalCols từ layout engine
        // Ví dụ: totalCols=6 → "repeat(6, 1fr)" → 6 cột bằng nhau
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.totalCols}, 1fr)`,
          gap: `${layout.gap}px`,
        }}
      >
        {layout.slots.map((slot, index) => (
          <PhotoCell
            key={`${slot.media.url}-${index}`}
            slot={slot}
            onImageClick={onImageClick}
          />
        ))}
      </div>

      {/* Debug label — xóa trước khi production */}
      {process.env.NODE_ENV === "development" && (
        <p className="text-xs text-gray-400 mt-1 px-1">{layout.debugLabel}</p>
      )}
    </div>
  );
}