import { computeLayout } from "@/shared/hooks/compute-layout";
import { LayoutSlot, PhotoGridConfig } from "@/shared/types/grid-layout";
import { MediaResponse } from "@/shared/types/post";
import React, { useEffect, useRef, useState } from "react";
import { Image } from "../atoms/image";

// ─────────────────────────────────────────────────────────────────────────────
// useContainerWidth — đo chiều rộng thực tế của container
//
// Quan trọng: containerWidth trong config là "gợi ý" để engine tính layout.
// Hook này đo chiều rộng DOM thực để CSS grid render đúng.
// Hai giá trị này thường khác nhau (containerWidth = design intent,
// DOM width = thực tế sau responsive).
// ─────────────────────────────────────────────────────────────────────────────

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.round(entry.contentRect.width));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}

// ─────────────────────────────────────────────────────────────────────────────
// PhotoCell — render 1 ô ảnh
// ─────────────────────────────────────────────────────────────────────────────

interface CellProps {
  slot: LayoutSlot;
  index: number;
  gap: number;
  rounded: number;
  eager?: boolean;
  onImageClick?: (media: MediaResponse, index: number) => void;
}

function PhotoCell({ slot, index, gap, rounded, eager = false, onImageClick }: CellProps) {
  const { media, colSpan, rowSpan, height, showMore } = slot;
  const isClickable = !!onImageClick;

  return (
    <div
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        height: `${height}px`,
        position: "relative",
        overflow: "hidden",
        // Border-radius chỉ ở góc ngoài cùng của grid,
        // được xử lý bởi overflow:hidden trên container
        cursor: isClickable ? "pointer" : "default",
      }}
      onClick={() => onImageClick?.(media, index)}
    >
      <Image
        src={media.url}
        type={media.type}
        alt=""
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        width={0}
        height={0}
        sizes="(max-width: 640px) 100vw, 640px"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          justifyItems: "center",
          // object-position: center top → giữ khuôn mặt khi crop portrait
          objectPosition:
            media.layoutType === "PORTRAIT" ? "center top" : "center center",
          display: "block",
          transition: isClickable ? "transform 0.25s ease" : undefined,
        }}
        onMouseEnter={(e) => {
          if (isClickable)
            (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)";
        }}
        onMouseLeave={(e) => {
          if (isClickable)
            (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
        }}
      />

      {/* Overlay "+N" ở ô cuối khi có ảnh ẩn */}
      {showMore && showMore > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.48)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "clamp(18px, 4vw, 28px)",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          +{showMore}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PhotoGrid — component chính
//
// Props:
//   media          — array từ API (đã có ratio & mediaType)
//   containerWidth — chiều rộng "design intent" để tính layout
//                    Dùng giá trị này để điều chỉnh khi tái sử dụng:
//                    Feed: 500 | Modal: 680 | Sidebar: 320 | Card: 280
//   gap            — khoảng cách giữa các ô (px)
//   maxImages      — giới hạn ảnh hiển thị, phần còn lại → "+N"
//   rounded        — border-radius của toàn bộ grid (px)
//   onImageClick   — callback khi click ảnh (dùng để mở lightbox)
//   className      — Tailwind class hoặc custom CSS class
//   style          — inline style bổ sung
// ─────────────────────────────────────────────────────────────────────────────

interface PhotoGridProps extends PhotoGridConfig {
  media: MediaResponse[];
  className?: string;
  style?: React.CSSProperties;
  /** Above-the-fold grid (eg. first post in feed) — load images eagerly for LCP */
  priority?: boolean;
}

export function PhotoGrid({
  media,
  containerWidth = 500,
  gap = 3,
  maxImages = 5,
  rounded = 0,
  onImageClick,
  className,
  style,
  priority = false,
}: PhotoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const domWidth = useContainerWidth(containerRef);

  // Dùng DOM width để tính layout chính xác sau khi mount.
  // Trước khi đo được (domWidth = null), dùng containerWidth làm fallback
  // để tránh layout shift.
  const effectiveWidth = domWidth ?? containerWidth;

  const layout = computeLayout(media, effectiveWidth, gap, maxImages);

  if (!layout) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        borderRadius: `${rounded}px`,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.totalCols}, 1fr)`,
          gap: `${layout.gap}px`,
          background: "#e5e7eb",
        }}
      >
        {layout.slots.map((slot, i) => (
          <PhotoCell
            key={`${slot.media.url}-${i}`}
            slot={slot}
            index={i}
            gap={layout.gap}
            rounded={rounded}
            eager={priority}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </div>
  );
}