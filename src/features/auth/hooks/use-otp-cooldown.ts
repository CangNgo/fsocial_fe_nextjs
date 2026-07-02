"use client";

import { useEffect, useRef, useState } from "react";

const COOLDOWN_SECONDS = 30;

export function useOtpCooldown(canRequest: boolean) {
  const [disableResendOTP, setDisableResendOTP] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!cooldownRef.current) setDisableResendOTP(!canRequest);
  }, [canRequest]);

  const startCooldown = () => {
    if (!canRequest || disableResendOTP || cooldownRef.current) return false;

    setCooldownSeconds(COOLDOWN_SECONDS);
    setDisableResendOTP(true);

    let time = COOLDOWN_SECONDS - 1;
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds(time);
      if (time <= 0) {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = null;
        setCooldownSeconds(0);
        setDisableResendOTP(!canRequest);
      }
      time -= 1;
    }, 1000);

    return true;
  };

  return { disableResendOTP, cooldownSeconds, startCooldown };
}
