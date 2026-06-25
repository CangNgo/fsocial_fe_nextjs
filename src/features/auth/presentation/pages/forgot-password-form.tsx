"use client";
import { AtSign, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeftIcon, LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { OtpInputGroup } from "@/shared/components/molecules/otp-input-group";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { regexEmail, regexPassword } from "@/shared/config/regex";
import { cn } from "@/shared/lib/utils";
import { requestOTP, resetPassword, validOTP } from "../../api/forgot-password-api";

interface Step1FormData {
  email: string;
}

interface Step2FormData {
  password: string;
  rePassword: string;
}

type ApiResponse = {
  statusCode?: number;
  message?: string;
};

export default function ForgotPasswordForm() {
  const router = useRouter();

  const formContainer = useRef<HTMLDivElement>(null);
  const stepsWrapper = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
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
      stepsWrapper.current.style.gridTemplateColumns = `repeat(3, ${parentWidth}px)`;
      stepsWrapper.current.style.height = `${el.offsetHeight + 4}px`;
      stepsWrapper.current.style.transform = `translateX(-${formContainer.current.offsetWidth * (currentStep - 1)
        }px)`;
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [currentStep]);

  // â”€â”€â”€ Step 1 â€” email + OTP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const {
    register: registerStep1,
    formState: { errors: errorsStep1, isValid: isValidStep1 },
    getValues: getValuesStep1,
  } = useForm<Step1FormData>({ mode: "all" });

  const [otpValue, setOtpValue] = useState("");
  const [otpErrMessage, setOtpErrMessage] = useState("");
  const [validOTPClicked, setValidOTPClicked] = useState(false);

  // Resend cooldown
  const [disableResendOTP, setDisableResendOTP] = useState(true);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!cooldownRef.current) setDisableResendOTP(!isValidStep1);
  }, [isValidStep1]);

  const handleRequireOTP = () => {
    if (!isValidStep1 || disableResendOTP || cooldownRef.current) return;

    const COOLDOWN = 30;
    setCooldownSeconds(COOLDOWN);
    setDisableResendOTP(true);

    let time = COOLDOWN - 1;
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds(time);
      if (time <= 0) {
        clearInterval(cooldownRef.current!);
        cooldownRef.current = null;
        setCooldownSeconds(0);
        setDisableResendOTP(!isValidStep1);
      }
      time -= 1;
    }, 1000);

    requestOTP({
      email: getValuesStep1("email"),
      type: "RESET",
    });
  };

  const handleSubmitOTP = async () => {
    if (otpValue === "") {
      setOtpErrMessage("MÃ£ OTP khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng");
      return;
    }
    setOtpErrMessage("");
    setValidOTPClicked(true);

    const resp = (await validOTP({
      email: getValuesStep1("email"),
      otp: otpValue,
      type: "RESET",
    })) as ApiResponse;

    setValidOTPClicked(false);

    if (resp?.statusCode === 200) {
      setCurrentStep(2);
    } else {
      setOtpErrMessage(resp?.message ?? "MÃ£ OTP khÃ´ng há»£p lá»‡");
    }
  };

  const backToStep1 = () => setCurrentStep(1);

  // â”€â”€â”€ Step 2 â€” new password â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [step2Err, setStep2Err] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowRePassword, setIsShowRePassword] = useState(false);
  const [step2Submitting, setStep2Submitting] = useState(false);

  const {
    register: registerStep2,
    formState: { errors: errorsStep2, isValid: isValidStep2 },
    getValues: getValuesStep2,
    watch: watchStep2,
  } = useForm<Step2FormData>({ mode: "all" });

  const password = watchStep2("password");

  const handleStep2 = async () => {
    if (!isValidStep2) return;
    setStep2Submitting(true);

    const resp = (await resetPassword({
      email: getValuesStep1("email"),
      newPassword: getValuesStep2("password"),
    })) as ApiResponse;

    setStep2Submitting(false);

    if (resp?.statusCode === 200) {
      setCurrentStep(3);
      toast.success("Äá»•i máº­t kháº©u thÃ nh cÃ´ng, Ä‘ang chuyá»ƒn hÆ°á»›ng...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } else {
      setStep2Err(resp?.message ?? "ÄÃ£ cÃ³ lá»—i xáº£y ra trong quÃ¡ trÃ¬nh reset máº­t kháº©u");
    }
  };

  // â”€â”€â”€ Progress bar helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const stepCircleClass = (step: number) =>
    currentStep >= step
      ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
      : "bg-secondary text-foreground";

  const connectorClass = (threshold: number) =>
    `col-span-2 relative h-[1px] bg-gradient-to-r from-transparent from-50% to-muted to-50% bg-[length:20px_100%]
     before:absolute before:left-0 before:h-full ${currentStep >= threshold ? "before:w-full" : "before:w-0"
    } before:bg-gradient-to-r before:from-transparent before:from-50% before:to-pink-500 before:to-50% before:bg-[length:20px_100%]
     before:transition-all before:duration-700 before:ease-out`;

  return (
    <div className="lg:w-[min(85%,1440px)] md:h-fit h-screen mx-auto relative bg-background xl:px-20 lg:px-12 lg:my-6 md:px-4 py-8 rounded-md">
      <img
        className="w-[max(72px,8%)] absolute bottom-0 left-0"
        src="/decor/form_decor.svg"
        alt=""
      />

      {/* â”€â”€ Step progress bar â”€â”€ */}
      <div className="md:w-10/12 md:mx-auto mx-4 md:mb-2 grid grid-cols-[repeat(9,minmax(0,1fr))] grid-rows-2 items-center">
        <h3
          className={`z-0 col-start-2 justify-self-center font-semibold md:w-12 w-10 aspect-square rounded-full grid place-content-center transition-all duration-300 ease-in ${stepCircleClass(1)}`}
        >
          1
        </h3>
        <div className={connectorClass(2)} />
        <h3
          className={`z-0 justify-self-center font-semibold md:w-12 w-10 aspect-square rounded-full grid place-content-center transition-all duration-300 ease-in ${stepCircleClass(2)}`}
        >
          2
        </h3>
        <div className={connectorClass(3)} />
        <h3
          className={`z-0 justify-self-center font-semibold md:w-12 w-10 aspect-square rounded-full grid place-content-center transition-all duration-300 ease-in ${stepCircleClass(3)}`}
        >
          3
        </h3>
        <span className="col-span-3 fs-sm font-light text-center">XÃ¡c minh</span>
        <span className="col-span-3 fs-sm font-light text-center">Äá»•i máº­t kháº©u</span>
        <span className="col-span-3 fs-sm font-light text-center">HoÃ n táº¥t</span>
      </div>

      <div className="flex md:gap-x-[5%] w-full justify-center">
        {/* â”€â”€ Sliding form container â”€â”€ */}
        <div
          ref={formContainer}
          className={`md:py-8 py-4 overflow-hidden xl:basis-5/12 lg:basis-6/12 md:basis-7/12 basis-full border rounded-lg w-14 ${currentStep === 3 ? "hidden" : ""
            }`}
        >
          <div
            ref={stepsWrapper}
            className="grid"
            style={{ transition: "transform 0.3s, height 0.2s" }}
          >
            {/* â”€â”€ Step 1 â”€â”€ */}
            <div
              ref={setStepsRef(1)}
              className={`md:px-8 px-4 h-fit ${currentStep === 1 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>XÃ¡c minh tÃ i khoáº£n</h2>
                <p className="text-muted-foreground">
                  HÃ£y Ä‘iá»n láº¡i email Ä‘Ã£ Ä‘Äƒng kÃ½ Ä‘á»ƒ khÃ´i phá»¥c láº¡i nhÃ©
                </p>
              </div>
              <div className="space-y-5">
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder=""
                        className={cn(
                          "peer custom-input",
                          errorsStep1.email && "custom-input-error",
                        )}
                        tabIndex={0}
                        {...registerStep1("email", {
                          required: "Email khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng",
                          pattern: { value: regexEmail, message: "Email khÃ´ng há»£p lá»‡" },
                        })}
                      />
                      <span
                        className={cn(
                          "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                          "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                          errorsStep1.email
                            ? "text-red-500"
                            : "peer-hover:text-foreground peer-focus:text-foreground",
                        )}
                      >
                        Email
                      </span>
                      <div
                        className={cn(
                          "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                          errorsStep1.email ? "text-red-500" : "text-muted-foreground",
                        )}
                      >
                        <AtSign className="size-5" />
                      </div>
                    </div>
                    {errorsStep1.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {String(errorsStep1.email?.message ?? "")}
                      </p>
                    )}
                  </div>
                  <div>
                    <Button
                      type="button"
                      className={cn(
                        "btn-primary px-6 md:py-3 py-3.5 text-nowrap",
                        disableResendOTP && "opacity-50 pointer-events-none",
                      )}
                      onClick={handleRequireOTP}
                      disabled={disableResendOTP}
                    >
                      {cooldownSeconds > 0 ? `Gá»­i láº¡i (${cooldownSeconds})` : "Gá»­i mÃ£"}
                    </Button>
                  </div>
                </div>
                <p>
                  Kiá»ƒm tra email Ä‘á»ƒ nháº­n mÃ£ xÃ¡c minh gá»“m 4 sá»‘ vÃ  nháº­p vÃ o Ã´ bÃªn
                  dÆ°á»›i
                </p>
                <div className="flex justify-center">
                  <OtpInputGroup
                    value={otpValue}
                    setValue={setOtpValue}
                    autoFocus={currentStep === 1}
                  />
                </div>
                <div>
                  {otpErrMessage && <p className="mb-1 text-red-600 text-sm">{otpErrMessage}</p>}
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "btn-primary px-8 py-3 w-full flex items-center justify-center",
                      validOTPClicked && "opacity-50 pointer-events-none",
                    )}
                    onClick={handleSubmitOTP}
                  >
                    {validOTPClicked ? <LoadingIcon /> : "XÃ¡c nháº­n"}
                  </Button>
                </div>
              </div>
            </div>

            {/* â”€â”€ Step 2 â”€â”€ */}
            <div
              ref={setStepsRef(2)}
              className={`md:px-8 px-4 h-fit ${currentStep === 2 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>Äá»•i máº­t kháº©u</h2>
                <p className="text-muted-foreground">LuÃ´n ghi nhá»› máº­t kháº©u má»›i</p>
              </div>
              <div className="space-y-5">
                <div className="flex-grow">
                  <div className="relative">
                    <Input
                      type={isShowPassword ? "text" : "password"}
                      placeholder=""
                      className={cn(
                        "peer custom-input",
                        errorsStep2.password && "custom-input-error",
                      )}
                      tabIndex={0}
                      {...registerStep2("password", {
                        required: "Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng",
                        pattern: {
                          value: regexPassword,
                          message: "Máº­t kháº©u tá»« 8-20 kÃ­ tá»±, bao gá»“m cáº£ chá»¯ vÃ  sá»‘",
                        },
                      })}
                    />
                    <span
                      className={cn(
                        "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                        "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                        errorsStep2.password
                          ? "text-red-500"
                          : "peer-hover:text-foreground peer-focus:text-foreground",
                      )}
                    >
                      Máº­t kháº©u má»›i
                    </span>
                    <div
                      className={cn(
                        "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                        errorsStep2.password ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      <Button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => setIsShowPassword(!isShowPassword)}
                      >
                        {!isShowPassword ? (
                          <Eye className="size-5" />
                        ) : (
                          <EyeOff className="size-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {errorsStep2.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errorsStep2.password?.message ?? "")}
                    </p>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="relative">
                    <Input
                      type={isShowRePassword ? "text" : "password"}
                      placeholder=""
                      className={cn(
                        "peer custom-input",
                        errorsStep2.rePassword && "custom-input-error",
                      )}
                      tabIndex={0}
                      {...registerStep2("rePassword", {
                        required: "Máº­t kháº©u nháº­p láº¡i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng",
                        pattern: {
                          value: regexPassword,
                          message: "Máº­t kháº©u tá»« 8-20 kÃ­ tá»±, bao gá»“m cáº£ chá»¯ vÃ  sá»‘",
                        },
                        validate: (value) =>
                          value === password || "Máº­t kháº©u nháº­p láº¡i khÃ´ng khá»›p",
                      })}
                    />
                    <span
                      className={cn(
                        "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                        "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                        errorsStep2.rePassword
                          ? "text-red-500"
                          : "peer-hover:text-foreground peer-focus:text-foreground",
                      )}
                    >
                      Nháº­p láº¡i Máº­t kháº©u
                    </span>
                    <div
                      className={cn(
                        "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                        errorsStep2.rePassword ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      <Button
                        type="button"
                        className="cursor-pointer"
                        onClick={() => setIsShowRePassword(!isShowRePassword)}
                      >
                        {!isShowRePassword ? (
                          <Eye className="size-5" />
                        ) : (
                          <EyeOff className="size-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {errorsStep2.rePassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errorsStep2.rePassword?.message ?? "")}
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="fs-sm text-muted-foreground mb-1">
                      *Sau khi Ä‘á»•i máº­t kháº©u, báº¡n sáº½ Ä‘Æ°á»£c chuyá»ƒn hÆ°á»›ng Ä‘á»ƒ
                      Ä‘Äƒng nháº­p láº¡i tÃ i khoáº£n báº±ng máº­t kháº©u má»›i nÃ y
                    </p>
                    {step2Err && <p className="mb-1 text-red-600 text-sm">{step2Err}</p>}
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "btn-primary px-8 py-3 w-full flex items-center justify-center",
                        (!isValidStep2 || step2Submitting) && "opacity-50 pointer-events-none",
                      )}
                      onClick={handleStep2}
                    >
                      {step2Submitting ? <LoadingIcon /> : "XÃ¡c nháº­n"}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="btn-outline px-8 py-3 w-full flex items-center justify-center gap-2"
                    onClick={backToStep1}
                  >
                    <ArrowLeftIcon className="size-5" /> Quay láº¡i
                  </Button>
                </div>
              </div>
            </div>

            {/* â”€â”€ Step 3 placeholder â”€â”€ */}
            <div ref={setStepsRef(3)} className="md:px-8 px-4 h-fit invisible" />
          </div>

          {/* â”€â”€ Back to login link â”€â”€ */}
          <div className="relative md:px-8 px-4 bg-background pt-3">
            <div className="flex items-center my-6">
              <div className="border-t flex-grow" />
              <span className="px-4 text-muted-foreground text-sm">Hoáº·c</span>
              <div className="border-t flex-grow" />
            </div>
            <Button
              asChild
              variant="ghost"
              className="btn-outline px-8 py-3 w-full flex items-center justify-center gap-2"
            >
              <Link href="/login">
                <ArrowLeftIcon className="size-5" /> Quay láº¡i Ä‘Äƒng nháº­p
              </Link>
            </Button>
          </div>
        </div>

        {/* â”€â”€ Decorative side panel â”€â”€ */}
        <div className="relative overflow-hidden flex-grow">
          <img
            className={cn(
              "absolute w-full left-0 mt-20 transition duration-300",
              [1, 2].includes(currentStep)
                ? "translate-y-0 opacity-100"
                : "translate-y-1/4 opacity-0 invisible",
            )}
            src="/decor/forgot-password_decor.svg"
            alt=""
          />
          <div
            className={
              currentStep === 3 ? "flex flex-col items-center text-center mt-4 px-4" : "hidden"
            }
          >
            <h1 className="lg:text-4xl md:text-3xl text-2xl bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
              ÄÃ£ Ä‘á»•i máº­t kháº©u thÃ nh cÃ´ng
              <br />
              ðŸŽ‰ðŸŽ‰ðŸŽ‰
            </h1>
            <h3 className="text-muted-foreground">
              Äang chuyá»ƒn hÆ°á»›ng vá» trang Ä‘Äƒng nháº­p...
            </h3>
            <img src="/decor/signup_step_4_decor.svg" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
