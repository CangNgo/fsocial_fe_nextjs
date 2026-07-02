export interface MediaResponse {
  url: string;
  type: MediaType;
  width: number;
  height: number;
}

export interface LayoutSlot {
  media: MediaResponse;
  colSpan: number;
  rowSpan: number;
  height: number;
  showMore?: number;
}

export interface GridLayout {
  totalCols: number;
  gap: number;
  slots: LayoutSlot[];
  debugLabel: string;
}

export type AspectType = "portrait" | "square" | "landscape" | "panorama";

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}
