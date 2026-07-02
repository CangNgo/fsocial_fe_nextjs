"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";

const SCROLL_IGNORE_MS = 500;
const DRAG_SPEED_FACTOR = 2;

export function useTabNavigation() {
  const containerTabsRef = useRef<HTMLDivElement>(null);
  const wrapperTabsRef = useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = useState<number | null>(null);
  const ignoreIntersec = useRef(false);
  const [touched, setTouched] = useState(false);
  const startDragPos = useRef(0);
  const scrollLeftStart = useRef(0);

  const clickChangeTab = (index: number) => {
    const container = containerTabsRef.current;
    const wrapper = wrapperTabsRef.current;
    if (!container || !wrapper) return;
    const targetChild = wrapper.children[index] as HTMLElement;
    if (!targetChild) return;
    const targetLeft = targetChild.offsetLeft - container.offsetLeft;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
    ignoreIntersec.current = true;
    setCurrentTab(index);
    setTimeout(() => {
      if (ignoreIntersec.current) ignoreIntersec.current = false;
    }, SCROLL_IGNORE_MS);
  };

  const onPressDown = (event: React.MouseEvent | React.TouchEvent) => {
    setTouched(true);
    const clientX =
      "touches" in event ? event.touches[0]?.clientX : (event as React.MouseEvent).clientX;
    startDragPos.current = clientX ?? 0;
    scrollLeftStart.current = containerTabsRef.current?.scrollLeft ?? 0;
  };

  const onDrag = (event: React.MouseEvent | React.TouchEvent) => {
    if (!touched || !containerTabsRef.current) return;
    event.preventDefault();
    const clientX =
      "touches" in event ? event.touches[0]?.clientX : (event as React.MouseEvent).clientX;
    const diff = (clientX ?? 0) - startDragPos.current;
    containerTabsRef.current.scrollLeft = scrollLeftStart.current - diff * DRAG_SPEED_FACTOR;
  };

  const onEnd = () => setTouched(false);

  useEffect(() => {
    const wrapper = wrapperTabsRef.current;
    if (!wrapper) return;
    const interCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !ignoreIntersec.current) {
          const index = Array.from(wrapper.children).indexOf(entry.target as HTMLElement);
          setCurrentTab(index);
        }
      });
    };
    const observer = new IntersectionObserver(interCallback, {
      root: containerTabsRef.current,
      rootMargin: "0px",
      threshold: 0.6,
    });
    Array.from(wrapper.children).forEach((el) => {
      observer.observe(el as Element);
    });
    return () => observer.disconnect();
  }, []);

  return {
    containerTabsRef,
    wrapperTabsRef,
    currentTab,
    setCurrentTab,
    clickChangeTab,
    onPressDown,
    onDrag,
    onEnd,
  };
}
