import { computeLayout } from "../../utils/compute-layout";
import type { LayoutSlot, MediaResponse } from "@/shared/types/media";
import { Image } from "@/shared/components/atoms/image";

// ─────────────────────────────────────────────────────────────────────────────
// PhotoCell — render 1 ô ảnh trong grid
// Tách thành component riêng để dễ add onClick, lazy load, skeleton...
// ─────────────────────────────────────────────────────────────────────────────

interface PhotoCellProps {
  slot: LayoutSlot;
  index: number;
  onImageClick?: (media: MediaResponse, index: number) => void;
}

function PhotoCell({ slot, index, onImageClick }: PhotoCellProps) {
  const { media, colSpan, rowSpan, height, showMore } = slot;

  return (
    // biome-ignore lint/a11y/useSemanticElements: kept as a div to preserve the dynamic grid sizing; exposed as a button via role for assistive tech
    <div
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        height: `${height}px`,
      }}
      className="relative overflow-hidden cursor-pointer group"
      onClick={() => onImageClick?.(media, index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onImageClick?.(media, index);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Image
        src={media.url}
        alt="Image"
        fill
        sizes="(max-width: 640px) 100vw, 640px"
        quality={100}
        className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
      />

      {/* Overlay "+N more" — chỉ render ở ô cuối cùng khi có ảnh ẩn */}
      {showMore && showMore > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white text-2xl font-semibold">+{showMore}</span>
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
  onImageClick?: (media: MediaResponse, index: number) => void;
  className?: string;
}

export function PhotoGrid({ media, onImageClick, className = "" }: PhotoGridProps) {
  // Tính layout một lần khi media thay đổi
  // computeLayout trả về null nếu không có ảnh
  const layout = computeLayout(media);
  if (!layout) return null;

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.totalCols}, 1fr)`,
          gap: `${layout.gap}px`,
        }}
      >
        {layout.slots.map((slot, index) => (
          <PhotoCell
            // biome-ignore lint/suspicious/noArrayIndexKey: slots are a fixed-size layout computed per render, never reordered
            key={`${slot.media.url}-${index}`}
            slot={slot}
            index={index}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
}
