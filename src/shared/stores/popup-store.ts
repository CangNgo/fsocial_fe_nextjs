import { create } from "zustand";

interface PopupNotificationState {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
}

export const popupNotificationtStore = create<PopupNotificationState>()((set) => ({
  isVisible: false,
  setIsVisible: (value) => set({ isVisible: value }),
}));

interface PopupExpandNoti3DotState {
  idNotiShowing: string | null;
  setIdNotiShowing: (value: string | null) => void;
}

export const popupExpandNoti3DotStore = create<PopupExpandNoti3DotState>()((set) => ({
  idNotiShowing: null,
  setIdNotiShowing: (value) => set({ idNotiShowing: value }),
}));

export const popupDeletePostStore = create<{
  id: string | null;
  isVisible: boolean;
  setId: (id: string | null) => void;
  setIsVisible: (value: boolean) => void;
}>()((set) => ({
  id: null,
  isVisible: false,
  setId: (id) => set({ id }),
  setIsVisible: (value) => set({ isVisible: value }),
}));

type PopupContent = React.ReactNode | (() => React.ReactNode);

interface PopupState {
  heading: string | null;
  isOpen: boolean;
  content: PopupContent | null;
  showPopup: (heading: string | null, content: PopupContent) => void;
  hidePopup: () => void;
}

export const usePopupStore = create<PopupState>()((set) => ({
  heading: null,
  isOpen: false,
  content: null,

  showPopup: (heading, content) => set({ isOpen: true, heading, content }),

  hidePopup: () => set({ isOpen: false }),
}));
