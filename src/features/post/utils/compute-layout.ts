import {
  type AspectType,
  type GridLayout,
  type LayoutSlot,
  type MediaResponse,
  MediaType,
} from "@/shared/types/media";

// ─────────────────────────────────────────────────────────────────────────────
// BƯỚC 1: Phân loại từng ảnh theo aspect ratio
// Đây là nền tảng của toàn bộ hệ thống — mọi quyết định layout
// đều bắt đầu từ việc biết "loại" của từng ảnh
// ─────────────────────────────────────────────────────────────────────────────

export function classifyAspect(width: number, height: number): AspectType {
  const ratio = width / height;

  // Các ngưỡng này dựa trên patent Facebook + quan sát thực tế
  // ratio < 0.8  → portrait  (ảnh dọc rõ rệt,  vd 270x360 = 0.75)
  // 0.8 – 1.2   → square    (gần vuông,         vd 100x100 = 1.0)
  // 1.2 – 2.0   → landscape (ảnh ngang,          vd 1920x1080 = 1.78)
  // > 2.0       → panorama  (cực rộng,            vd 2400x900 = 2.67)

  if (ratio > 2.0) return "panorama";
  if (ratio > 1.2) return "landscape";
  if (ratio < 0.8) return "portrait";
  return "square";
}

// ─────────────────────────────────────────────────────────────────────────────
// BƯỚC 2: Tính pixel height cho cell
//
// Không còn maxHeight — height luôn theo đúng tỉ lệ ảnh gốc (chỉ chặn minH
// để tránh cell quá thấp). Những ảnh nằm cùng một "hàng" (cùng rowSpan, hiển
// thị cạnh nhau) phải bằng chiều cao nhau, nên dùng chiều cao trung bình của
// cả nhóm thay vì tính riêng từng ảnh.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_WIDTH = 500; // px — chiều rộng container tham chiếu

function naturalHeight(
  media: MediaResponse,
  colSpan: number,
  totalCols: number,
  gap: number,
): number {
  // Chiều rộng thực tế của cell = (BASE_WIDTH - gaps) * tỉ lệ cột
  const totalGapWidth = gap * (totalCols - 1);
  const cellWidth = ((BASE_WIDTH - totalGapWidth) * colSpan) / totalCols;

  // Height theo đúng tỉ lệ ảnh gốc, không clamp trần
  return cellWidth * (media.height / media.width);
}

function calcHeight(
  media: MediaResponse,
  colSpan: number,
  totalCols: number,
  gap: number,
  minH = 120,
): number {
  return Math.round(Math.max(minH, naturalHeight(media, colSpan, totalCols, gap)));
}

// Chiều cao dùng chung cho các ảnh cùng hàng — lấy trung bình height tự nhiên
// của cả nhóm để không ảnh nào bị méo quá nhiều, đồng thời đảm bảo bằng nhau
function calcSharedHeight(
  items: MediaResponse[],
  colSpan: number,
  totalCols: number,
  gap: number,
  minH = 120,
): number {
  const avg =
    items.reduce((sum, m) => sum + naturalHeight(m, colSpan, totalCols, gap), 0) / items.length;
  return Math.round(Math.max(minH, avg));
}

const GAP = 1; // px gap giữa các ô
function layout1(items: MediaResponse[]): GridLayout {
  const m = items[0];
  const type = classifyAspect(m.width, m.height);

  return {
    totalCols: 1,
    gap: GAP,
    debugLabel: `1 ảnh [${type}]`,
    slots: [
      {
        media: m,
        colSpan: 1,
        rowSpan: 1,
        height: calcHeight(m, 1, 1, GAP),
      },
    ],
  };
}

function layout2(items: MediaResponse[]): GridLayout {
  const types = items.map((m) => classifyAspect(m.width, m.height));
  const allLandscape = types.every((t) => t === "landscape");
  const allPortrait = types.every((t) => t === "portrait");

  if (allLandscape) {
    // 2 landscape → stack dọc (2 landscape cạnh nhau sẽ quá rẹt)
    const h = calcSharedHeight(items, 1, 1, GAP);
    return {
      totalCols: 1,
      gap: GAP,
      debugLabel: "2 landscape → stack dọc",
      slots: items.map((m) => ({
        media: m,
        colSpan: 1,
        rowSpan: 1,
        height: h,
      })),
    };
  }

  if (allPortrait) {
    // 2 portrait → 2 cột, cùng hàng nên phải bằng chiều cao nhau
    const h = calcSharedHeight(items, 1, 2, GAP);
    return {
      totalCols: 2,
      gap: GAP,
      debugLabel: "2 portrait → 2 cột cao",
      slots: items.map((m) => ({
        media: m,
        colSpan: 1,
        rowSpan: 1,
        height: h,
      })),
    };
  }

  // Mixed (1 portrait + 1 landscape, hoặc có square) → 2 cột đều, cùng hàng
  const h = calcSharedHeight(items, 1, 2, GAP, 160);
  return {
    totalCols: 2,
    gap: GAP,
    debugLabel: "2 ảnh mixed → 2 cột",
    slots: items.map((m) => ({
      media: m,
      colSpan: 1,
      rowSpan: 1,
      height: h,
    })),
  };
}

function layout3(items: MediaResponse[]): GridLayout {
  const firstType = classifyAspect(items[0].width, items[0].height);

  if (firstType === "portrait") {
    // Ảnh 1 portrait → chiếm cột trái, cao = tổng 2 ảnh phải + gap
    // Đây là layout "big left + 2 small right" kiểu Facebook

    // 2 ảnh nhỏ bên phải cùng hàng với nhau → phải bằng chiều cao nhau
    const smallH = calcSharedHeight([items[1], items[2]], 1, 2, GAP, 180);
    // Ảnh lớn = 2 lần height nhỏ + 1 gap (để vừa khít)
    const bigH = smallH * 2 + GAP;

    return {
      totalCols: 2,
      gap: GAP,
      debugLabel: "3 ảnh: portrait đầu → big left + 2 right",
      slots: [
        { media: items[0], colSpan: 1, rowSpan: 2, height: bigH },
        { media: items[1], colSpan: 1, rowSpan: 1, height: smallH },
        { media: items[2], colSpan: 1, rowSpan: 1, height: smallH },
      ],
    };
  }

  // Landscape/Square/Panorama đầu → full top + 2 dưới
  // 2 ảnh hàng dưới cùng hàng với nhau → phải bằng chiều cao nhau
  const bottomH = calcSharedHeight([items[1], items[2]], 1, 2, GAP);

  return {
    totalCols: 2,
    gap: GAP,
    debugLabel: "3 ảnh: landscape/square đầu → full top + 2 dưới",
    slots: [
      {
        media: items[0],
        colSpan: 2,
        rowSpan: 1,
        height: calcHeight(items[0], 2, 2, GAP),
      },
      { media: items[1], colSpan: 1, rowSpan: 1, height: bottomH },
      { media: items[2], colSpan: 1, rowSpan: 1, height: bottomH },
    ],
  };
}

function layout4(items: MediaResponse[]): GridLayout {
  // 4 ảnh → luôn 2x2, đây là layout cân đối nhất cho 4 ảnh
  // Cả 4 cùng lưới nên phải bằng chiều cao nhau
  const h = calcSharedHeight(items, 1, 2, GAP, 190);

  return {
    totalCols: 2,
    gap: GAP,
    debugLabel: "4 ảnh → 2×2 grid",
    slots: items.map((m) => ({
      media: m,
      colSpan: 1,
      rowSpan: 1,
      height: h,
    })),
  };
}

function layout5plus(items: MediaResponse[]): GridLayout {
  // 5+ ảnh: hiển thị 5 cái đầu, badge "+N" cho phần còn lại
  // Dùng grid 6 cột — LCM của 2 và 3 — cho phép hàng 1 dùng col-span-3,
  // hàng 2 dùng col-span-2, và cả hai đều lấp đầy 100% chiều rộng

  const visible = items.slice(0, 5);
  const remaining = items.length - 5;

  // 2 ảnh hàng trên cùng hàng với nhau, 3 ảnh hàng dưới cùng hàng với nhau
  const topH = calcSharedHeight([visible[0], visible[1]], 3, 6, GAP, 200);
  const botH = calcSharedHeight([visible[2], visible[3], visible[4]], 2, 6, GAP, 150);

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
    gap: GAP,
    debugLabel: `${items.length} ảnh → 2 top + 3 bottom (+${remaining} ẩn)`,
    slots,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BƯỚC 4: Entry point — hàm duy nhất bạn cần gọi từ component
// ─────────────────────────────────────────────────────────────────────────────

export function computeLayout(media: MediaResponse[]): GridLayout | null {
  // Chỉ xử lý image, filter out video nếu cần logic riêng
  const images = media.filter((m) => m.type === MediaType.IMAGE);

  if (images.length === 0) return null;

  switch (images.length) {
    case 1:
      return layout1(images);
    case 2:
      return layout2(images);
    case 3:
      return layout3(images);
    case 4:
      return layout4(images);
    default:
      return layout5plus(images);
  }
}
