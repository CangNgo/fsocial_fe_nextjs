import DOMPurify from "dompurify";

export interface TextboxData {
  innerText: string | null;
  innerHTML: string | null;
}

export function getTextboxData(textbox: React.RefObject<HTMLElement>): TextboxData {
  if (!textbox.current) return { innerText: null, innerHTML: null };

  const childNodes = Array.from(textbox.current.childNodes);
  let start: number | null = null;
  let end: number | null = null;
  let index = 0;

  while (true) {
    if (index > childNodes.length - 1) {
      return { innerText: null, innerHTML: null };
    }

    const node = childNodes[index];
    if (!node) break;

    if (node.textContent?.trim() !== "") {
      if (start === null) {
        start = index;
        index = childNodes.length - 1;
        continue;
      } else {
        end = index;
        break;
      }
    }
    if (start !== null) {
      index -= 1;
    } else {
      index += 1;
    }
  }

  if (start === null || end === null) return { innerText: null, innerHTML: null };

  const processed = childNodes.slice(start, end + 1);
  const innerText = processed.map((el) => el.textContent).join("");
  let innerHTML = processed
    .map((el) => (el.nodeType === 3 ? el.textContent : (el as Element).outerHTML))
    .join("");
  innerHTML = DOMPurify.sanitize(innerHTML);
  return { innerText, innerHTML };
}
