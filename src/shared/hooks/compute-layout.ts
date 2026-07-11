
// ─────────────────────────────────────────────────────────────────────────────
// calcHeight — tim chiều cao pixel của 1 ô
//
// Nguyên lý: dùng containerWidth làm chuẩn, tính ngược từ ratio gốc của ảnh
//
//   cellWidth = (containerWidth - tổng gaps) × (colSpan / totalCols)
//   height    = cellWidth / ratio   ← ratio = width/height từ API
//
// Kết quả được clamp vào [minH, maxH] để tránh ảnh quá cao hoặc quá thấp
// ─────────────────────────────────────────────────────────────────────────────

import { GridLayout, LayoutSlot } from "../types/grid-layout";
import { MediaLayoutType, MediaResponse } from "../types/post";

function calcHeight(
  ratio: number,
  colSpan: number,
  totalCols: number,
  containerWidth: number,
  gap: number,
  minH = 80,
  maxH = 600
): number {
  const totalGap = gap * (totalCols - 1);
  const cellWidth = ((containerWidth - totalGap) * colSpan) / totalCols;
  const natural = cellWidth / ratio; // ratio < 1 (portrait) → height lớn hơn width
  return Math.round(Math.min(maxH, Math.max(minH, natural)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout functions — mỗi hàm xử lý 1 trường hợp theo số ảnh
// Dùng mediaType từ API để chọn cấu trúc, không phải tự classify lại
// ─────────────────────────────────────────────────────────────────────────────

function layout1(
  imgs: MediaResponse[],
  containerWidth: number,
  gap: number
): GridLayout {
  const m = imgs[0];

  // Giới hạn height tùy loại ảnh:
  // - PANORAMA: giữ thấp, không để chiếm quá nhiều feed
  // - PORTRAIT: cho phép cao để tôn ảnh dọc
  const maxHMap = {
    PANORAMA: 220,
    LANDSCAPE: 400,
    SQUARE: 440,
    PORTRAIT: 580,
  };

  return {
    totalCols: 1,
    gap,
    label: `1 ảnh [${m.layoutType}]`,
    slots: [
      {
        media: m,
        colSpan: 1,
        rowSpan: 1,
        height: calcHeight(m.ratio, 1, 1, containerWidth, gap, 80, maxHMap[m.layoutType]),
      },
    ],
  };
}

function layout2(
  imgs: MediaResponse[],
  containerWidth: number,
  gap: number
): GridLayout {
  const types = imgs.map((m) => m.layoutType);
  const allLandscape = types.every((t) => t === MediaLayoutType.LANDSCAPE || t === MediaLayoutType.PANORAMA);
  const allPortrait = types.every((t) => t === MediaLayoutType.PORTRAIT);

  if (allLandscape) {
    // 2 landscape cạnh nhau quá dẹt → stack dọc (1 cột)
    return {
      totalCols: 1,
      gap,
      label: "2 landscape → stack dọc",
      slots: imgs.map((m) => ({
        media: m,
        colSpan: 1,
        rowSpan: 1,
        height: calcHeight(m.ratio, 1, 1, containerWidth, gap, 80, 280),
      })),
    };
  }

  // Portrait hoặc mixed → 2 cột
  const maxH = allPortrait ? 420 : 280;
  return {
    totalCols: 2,
    gap,
    label: allPortrait ? "2 portrait → 2 cột cao" : "2 mixed → 2 cột",
    slots: imgs.map((m) => ({
      media: m,
      colSpan: 1,
      rowSpan: 1,
      height: calcHeight(m.ratio, 1, 2, containerWidth, gap, 80, maxH),
    })),
  };
}

function layout3(
  imgs: MediaResponse[],
  containerWidth: number,
  gap: number
): GridLayout {
  const firstType = imgs[0].layoutType;

  if (firstType === MediaLayoutType.PORTRAIT) {
    // Ảnh portrait đầu → Big Left (chiếm cả cột trái)
    // bigH = smallH × 2 + gap → 2 ô nhỏ phải vừa khít ô lớn trái
    const smallH = calcHeight(imgs[1].ratio, 1, 2, containerWidth, gap, 80, 220);
    const bigH = smallH * 2 + gap;

    return {
      totalCols: 2,
      gap,
      label: "3 ảnh: portrait đầu → Big Left + 2 Right",
      slots: [
        { media: imgs[0], colSpan: 1, rowSpan: 2, height: bigH },
        { media: imgs[1], colSpan: 1, rowSpan: 1, height: smallH },
        { media: imgs[2], colSpan: 1, rowSpan: 1, height: smallH },
      ],
    };
  }

  // Landscape/Square/Panorama đầu → Full Top + 2 dưới
  return {
    totalCols: 2,
    gap,
    label: "3 ảnh: landscape/square đầu → Full Top + 2 dưới",
    slots: [
      {
        media: imgs[0],
        colSpan: 2,
        rowSpan: 1,
        height: calcHeight(imgs[0].ratio, 2, 2, containerWidth, gap, 80, 300),
      },
      {
        media: imgs[1],
        colSpan: 1,
        rowSpan: 1,
        height: calcHeight(imgs[1].ratio, 1, 2, containerWidth, gap, 80, 200),
      },
      {
        media: imgs[2],
        colSpan: 1,
        rowSpan: 1,
        height: calcHeight(imgs[2].ratio, 1, 2, containerWidth, gap, 80, 200),
      },
    ],
  };
}

function layout4(
  imgs: MediaResponse[],
  containerWidth: number,
  gap: number
): GridLayout {
  // 4 ảnh → luôn 2×2. Dùng cùng height để grid đều
  const h = calcHeight(imgs[0].ratio, 1, 2, containerWidth, gap, 80, 240);
  return {
    totalCols: 2,
    gap,
    label: "4 ảnh → 2×2 grid",
    slots: imgs.map((m) => ({ media: m, colSpan: 1, rowSpan: 1, height: h })),
  };
}

function layout5plus(
  imgs: MediaResponse[],
  maxImages: number,
  containerWidth: number,
  gap: number
): GridLayout {
  // Dùng 6 cột (LCM của 2 và 3):
  //   Hàng 1: 2 ảnh × col-span-3 = 6 ✓
  //   Hàng 2: 3 ảnh × col-span-2 = 6 ✓
  const visible = imgs.slice(0, maxImages);
  const remaining = imgs.length - maxImages;

  const topH = calcHeight(visible[0].ratio, 3, 6, containerWidth, gap, 80, 260);
  const botH = calcHeight(visible[2]?.ratio ?? 0.75, 2, 6, containerWidth, gap, 80, 200);

  const slots: LayoutSlot[] = [
    { media: visible[0], colSpan: 3, rowSpan: 1, height: topH },
    { media: visible[1], colSpan: 3, rowSpan: 1, height: topH },
    { media: visible[2], colSpan: 2, rowSpan: 1, height: botH },
    { media: visible[3], colSpan: 2, rowSpan: 1, height: botH },
    {
      media: visible[4],
      colSpan: 2,
      rowSpan: 1,
      height: botH,
      showMore: remaining > 0 ? remaining : undefined,
    },
  ];

  return {
    totalCols: 6,
    gap,
    label: `${imgs.length} ảnh → 2+3 layout (+${remaining} ẩn)`,
    slots,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// computeLayout — entry point duy nhất
//
// @param media         Array từ API
// @param containerWidth px width của container (default 500)
// @param gap           px gap giữa các ô (default 3)
// @param maxImages     Tối đa ảnh hiển thị trước +N (default 5)
// ─────────────────────────────────────────────────────────────────────────────

export function computeLayout(
  media: MediaResponse[],
  containerWidth = 500,
  gap = 3,
  maxImages = 5
): GridLayout | null {
  // Video cũng vào grid — PhotoCell render <video> dựa trên media.type
  const images = media;
  if (!images.length) return null;

  switch (images.length) {
    case 1: return layout1(images, containerWidth, gap);
    case 2: return layout2(images, containerWidth, gap);
    case 3: return layout3(images, containerWidth, gap);
    case 4: return layout4(images, containerWidth, gap);
    default: return layout5plus(images, maxImages, containerWidth, gap);
  }
}