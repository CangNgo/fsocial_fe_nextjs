"use client";

import { useEffect, useRef } from "react";

export function useStepCarousel(currentStep: number, totalSteps: number) {
  const formContainer = useRef<HTMLDivElement>(null);
  const stepsWrapper = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  const setStepsRef = (index: number) => (element: HTMLDivElement | null) => {
    stepsRef.current[index] = element;
  };

  useEffect(() => {
    const parent = formContainer.current;
    const wrapper = stepsWrapper.current;
    if (!parent || !wrapper) return;

    const syncWidth = () => {
      wrapper.style.gridTemplateColumns = `repeat(${totalSteps}, ${parent.offsetWidth}px)`;
      wrapper.style.transform = `translateX(-${parent.offsetWidth * (currentStep - 1)}px)`;
    };

    syncWidth();

    const resizeObserver = new ResizeObserver(syncWidth);
    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [currentStep, totalSteps]);

  return { formContainer, stepsWrapper, setStepsRef };
}
