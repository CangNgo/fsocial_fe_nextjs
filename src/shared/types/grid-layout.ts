// ─── Khớp chính xác với API response ─────────────────────────────────────────
// API đã tính sẵn ratio và mediaType → tận dụng luôn, không tính lại

import { MediaResponse } from "./post";

export type MediaLayoutType = "PORTRAIT" | "LANDSCAPE" | "SQUARE" | "PANORAMA";

// ─── 1 ô trong grid ──────────────────────────────────────────────────────────

export interface LayoutSlot {
  media: MediaResponse;
  colSpan: number;   // chiếm bao nhiêu cột trong totalCols
  rowSpan: number;   // chiếm bao nhiêu hàng
  height: number;    // height px — tính từ containerWidth
  showMore?: number; // > 0 → overlay "+N" ở ô cuối
}

// ─── Grid hoàn chỉnh ─────────────────────────────────────────────────────────

export interface GridLayout {
  totalCols: number;
  gap: number;
  slots: LayoutSlot[];
  label: string; // debug label
}

// ─── Config cho PhotoGrid — thay đổi để dùng ở nhiều context ────────────────

export interface PhotoGridConfig {
  /**
   * Chiều rộng container tính bằng px.
   * Engine dùng giá trị này để tính height các ô sao cho tỉ lệ ảnh không bị vỡ.
   *
   * - Feed post:    500px (default)
   * - Modal/Dialog: 680px
   * - Sidebar:      320px
   * - Story card:   280px
   */
  containerWidth?: number;

  /** Gap giữa các ô — default 3px */
  gap?: number;

  /**
   * Tối đa bao nhiêu ảnh hiển thị trước khi dùng "+N" overlay.
   * Default 5 (giống Facebook).
   * Dùng Infinity để hiển thị tất cả.
   */
  maxImages?: number;

  /** border-radius cho toàn bộ grid — default 12px */
  rounded?: number;

  /** Callback khi click vào ảnh — dùng để mở lightbox */
  onImageClick?: (media: MediaResponse, index: number) => void;
}