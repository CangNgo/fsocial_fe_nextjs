export function removeVietnameseAccents(str: string): string {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "").toLowerCase();
}
