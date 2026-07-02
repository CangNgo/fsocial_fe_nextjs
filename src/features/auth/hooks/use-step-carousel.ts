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
    const currentStepEl = stepsRef.current[currentStep];
    if (!currentStepEl?.offsetHeight || !stepsWrapper.current) return;

    stepsWrapper.current.style.height = `${currentStepEl.offsetHeight + 4}px`;

    const parent = formContainer.current;
    if (!parent) return;

    const resizeObserver = new ResizeObserver(() => {
      const el = stepsRef.current[currentStep];
      if (!el?.offsetHeight || !stepsWrapper.current || !formContainer.current) return;
      const parentWidth = parent.offsetWidth;
      stepsWrapper.current.style.gridTemplateColumns = `repeat(${totalSteps}, ${parentWidth}px)`;
      stepsWrapper.current.style.height = `${el.offsetHeight + 4}px`;
      stepsWrapper.current.style.transform = `translateX(-${
        formContainer.current.offsetWidth * (currentStep - 1)
      }px)`;
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [currentStep, totalSteps]);

  return { formContainer, stepsWrapper, setStepsRef };
}
