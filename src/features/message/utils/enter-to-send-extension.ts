import { Extension } from "@tiptap/core";
import type { RefObject } from "react";

export function createEnterToSendExtension(onSendRef: RefObject<() => void>) {
  return Extension.create({
    name: "enterToSend",
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          onSendRef.current?.();
          return true;
        },
      };
    },
  });
}
