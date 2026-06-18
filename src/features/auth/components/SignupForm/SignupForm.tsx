"use client";
import { AtSign, ChevronDown, Eye, EyeOff, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { ArrowLeftIcon, LoadingIcon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/input";
import { JumpingSelect } from "@/components/atoms/JumpingInput";
import { OtpInputGroup } from "@/components/molecules/OtpInputGroup";
import { dayOptions, monthOptions, yearOptions } from "@/config/globalVariables";
import { regexEmail, regexName, regexPassword } from "@/config/regex";
import {
  checkDuplicate,
  requestOTP,
  sendingCreateAccount,
  validOTP,
} from "@/lib/api/auth/signupApi";
import { cn } from "@/lib/utils";
import { removeVietnameseAccents } from "@/utils/removeSpecialWord";

interface Step1FormData {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  gender: string;
}

interface Step2FormData {
  username: string;
  email: string;
  password: string;
  rePassword: string;
}

type ApiResponse = {
  statusCode?: number;
  message?: string;
  data?: Record<string, string>;
};

export function SignupForm() {
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

    const stepHeight = currentStepEl.offsetHeight;
    stepsWrapper.current.style.height = `${stepHeight + 4}px`;

    const parent = formContainer.current;
    if (!parent) return;

    const resizeObserver = new ResizeObserver(() => {
      const el = stepsRef.current[currentStep];
      if (!el?.offsetHeight || !stepsWrapper.current || !formContainer.current) return;
      const parentWidth = parent.offsetWidth;
      stepsWrapper.current.style.gridTemplateColumns = `repeat(4, ${parentWidth}px)`;
      stepsWrapper.current.style.height = `${el.offsetHeight + 4}px`;
      stepsWrapper.current.style.transform = `translateX(-${
        formContainer.current.offsetWidth * (currentStep - 1)
      }px)`;
    });

    resizeObserver.observe(parent);
    return () => resizeObserver.disconnect();
  }, [currentStep]);

  // ─── Step 1 ───────────────────────────────────────────────────────────────
  const {
    register: registerStep1,
    trigger: triggerValidStep1,
    formState: { errors: errorsStep1, isValid: isValidStep1 },
    getValues: getValuesStep1,
  } = useForm<Step1FormData>({ mode: "all" });

  const handleStep1 = async () => {
    await triggerValidStep1();
    if (!isValidStep1) return;

    const data = getValuesStep1();
    setValueStep2(
      "username",
      removeVietnameseAccents(data.firstName) +
        removeVietnameseAccents(data.lastName) +
        (Math.floor(Math.random() * 9000) + 10000),
    );
    setCurrentStep(2);
  };

  const backToStep1 = () => setCurrentStep(1);

  // ─── Step 2 ───────────────────────────────────────────────────────────────
  const [checkDuplicateClicked, setCheckDuplicateClicked] = useState(false);
  const [step2Err, setStep2Err] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowRePassword, setIsShowRePassword] = useState(false);

  const {
    register: registerStep2,
    watch: watchStep2,
    trigger: triggerValidateStep2,
    formState: { errors: errorsStep2, isValid: isValidStep2 },
    setError: setErrorStep2,
    setValue: setValueStep2,
    getValues: getValuesStep2,
  } = useForm<Step2FormData>({ mode: "all" });

  const password = watchStep2("password");

  const handleStep2 = async () => {
    await triggerValidateStep2();
    const dataStep2 = getValuesStep2();
    if (!isValidStep2) return;

    setCheckDuplicateClicked(true);

    const respCheckDuplicate = (await checkDuplicate({
      username: dataStep2.username,
      email: dataStep2.email,
    })) as ApiResponse;

    setCheckDuplicateClicked(false);

    if (!respCheckDuplicate) {
      setStep2Err("Đã có lỗi phía máy chủ, FSocial đang cố gắng khắc phục nha");
      return;
    }

    if (respCheckDuplicate.statusCode !== 200) {
      const errorMessages = respCheckDuplicate.data ?? {};
      if (errorMessages.username)
        setErrorStep2("username", { type: "server", message: errorMessages.username });
      if (errorMessages.email)
        setErrorStep2("email", { type: "server", message: errorMessages.email });
      return;
    }

    toast.success("Gửi yêu cầu xác thực thành công, vui lòng kiểm tra email để nhận mã xác minh");

    setCurrentStep(3);
    requestOTP({
      email: dataStep2.email,
      userName: dataStep2.username,
      type: "REGISTER",
    });
  };

  const backToStep2 = () => setCurrentStep(2);

  // ─── Step 3 ───────────────────────────────────────────────────────────────
  const [otpValue, setOtpValue] = useState("");
  const [validOTPClicked, setValidOTPClicked] = useState(false);
  const [step3Err, setStep3Err] = useState("");

  const handleStep3 = async () => {
    setValidOTPClicked(true);
    const dataStep1 = getValuesStep1();
    const dataStep2 = getValuesStep2();

    const sendingOTP = {
      email: dataStep2.email,
      otp: otpValue,
      type: "REGISTER",
    };

    const respValidOTP = (await validOTP(sendingOTP)) as ApiResponse;
    if (respValidOTP?.statusCode !== 200) {
      setValidOTPClicked(false);
      setStep3Err(respValidOTP?.message ?? "Mã OTP không hợp lệ");
      return;
    }

    const sending = {
      username: dataStep2.username,
      password: dataStep2.password,
      email: dataStep2.email,
      firstName: dataStep1.firstName,
      lastName: dataStep1.lastName,
      dob: `${dataStep1.year}-${dataStep1.month
        .toString()
        .padStart(2, "0")}-${dataStep1.day.toString().padStart(2, "0")}`,
      gender: dataStep1.gender,
    };

    const responseCreateAccount = (await sendingCreateAccount(sending)) as ApiResponse;
    setValidOTPClicked(false);

    if (responseCreateAccount?.statusCode === 200) {
      setCurrentStep(4);
      toast.success("Tạo tài khoản thành công, đang chuyển hướng về trang đăng nhập");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } else {
      setStep3Err(responseCreateAccount?.message ?? "Đã xảy ra lỗi trong quá trình tạo tài khoản");
    }
  };

  // ─── Google signup ────────────────────────────────────────────────────────
  const handleGoogleSignup = () => {
    const googleLoginUrl = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL;
    if (googleLoginUrl) {
      window.location.href = googleLoginUrl;
    } else {
      toast.error("Không thể đăng ký bằng Google, vui lòng thử lại sau");
    }
  };

  // ─── Progress bar helpers ─────────────────────────────────────────────────
  const stepCircleClass = (step: number) =>
    currentStep >= step
      ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
      : "bg-secondary text-foreground";

  const connectorClass = (threshold: number) =>
    `col-span-3 relative h-[1px] bg-gradient-to-r from-transparent from-50% to-muted to-50% bg-[length:20px_100%]
     before:absolute before:left-0 before:h-full ${
       currentStep >= threshold ? "before:w-full" : "before:w-0"
} before:bg-gradient-to-r before:from-transparent before:from-50% before:to-pink-500 before:to-50% before:bg-[length:20px_100%]
     before:transition-all before:duration-700 before:ease-out`;

  return (
    <div className="lg:w-[min(85%,1440px)] md:h-fit h-[100dvh] mx-auto relative bg-background xl:px-20 lg:px-12 lg:my-4 md:px-4 py-6 rounded-md">
      <img
        className="w-[max(72px,8%)] absolute bottom-0 left-0"
        src="/decor/form_decor.svg"
        alt=""
      />

      {/* ── Step progress bar ── */}
      <div className="md:w-10/12 md:mx-auto mx-6 md:mb-2 grid grid-cols-[repeat(15,minmax(0,1fr))] grid-rows-2 items-center">
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
        <div className={connectorClass(4)} />
        <h3
          className={`z-0 justify-self-center font-semibold md:w-12 w-10 aspect-square rounded-full grid place-content-center transition-all duration-300 ease-in ${stepCircleClass(4)}`}
        >
          4
        </h3>
        <div />
        <span className="col-span-3 fs-sm font-light text-center">Thông tin cơ bản</span>
        <div />
        <span className="col-span-3 fs-sm font-light text-center">Thông tin đăng nhập</span>
        <div />
        <span className="col-span-3 fs-sm font-light text-center">Xác minh tài khoản</span>
        <div />
        <span className="col-span-3 fs-sm font-light text-center">Hoàn tất tạo tài khoản</span>
      </div>

      <div className="flex md:gap-x-[5%] w-full justify-center">
        {/* ── Sliding form container ── */}
        <div
          ref={formContainer}
          className={`md:py-8 py-4 overflow-hidden xl:basis-5/12 lg:basis-6/12 md:basis-7/12 basis-full md:border rounded-lg w-14 ${
            currentStep === 4 ? "hidden" : ""
          }`}
        >
          <div
            ref={stepsWrapper}
            className="grid"
            style={{ transition: "transform 0.3s, height 0.2s" }}
          >
            {/* ── Step 1 ── */}
            <div
              ref={setStepsRef(1)}
              className={`md:px-8 px-6 h-fit ${currentStep === 1 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>Thông tin cơ bản</h2>
                <p className="text-muted-foreground">
                  Hãy điền vào form bên dưới để hoàn tất quá trình đăng ký nhé
                </p>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                  <div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder=""
                        className={cn(
                          "peer custom-input",
                          errorsStep1.firstName && "custom-input-error",
                        )}
                        tabIndex={0}
                        {...registerStep1("firstName", {
                          required: "Tên không được để trống",
                          pattern: {
                            value: regexName,
                            message: "Tên tối đa 13 kí tự, không chứa số và ký tự đặc biệt",
                          },
                        })}
                      />
                      <span
                        className={cn(
                          "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                          "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                          errorsStep1.firstName
                            ? "text-red-500"
                            : "peer-hover:text-foreground peer-focus:text-foreground",
                        )}
                      >
                        Tên
                      </span>
                    </div>
                    {errorsStep1.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {String(errorsStep1.firstName?.message ?? "")}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder=""
                        className={cn(
                          "peer custom-input",
                          errorsStep1.lastName && "custom-input-error",
                        )}
                        tabIndex={0}
                        {...registerStep1("lastName", {
                          required: "Họ không được để trống",
                          pattern: {
                            value: regexName,
                            message: "Họ tối đa 13 kí tự, không chứa số và ký tự đặc biệt",
                          },
                        })}
                      />
                      <span
                        className={cn(
                          "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                          "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                          errorsStep1.lastName
                            ? "text-red-500"
                            : "peer-hover:text-foreground peer-focus:text-foreground",
                        )}
                      >
                        Họ
                      </span>
                    </div>
                    {errorsStep1.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {String(errorsStep1.lastName?.message ?? "")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <JumpingSelect
                    label="Ngày"
                    name="day"
                    register={registerStep1 as never}
                    errors={errorsStep1 as never}
                    options={dayOptions}
                    icon={<ChevronDown />}
                  />
                  <JumpingSelect
                    label="Tháng"
                    name="month"
                    register={registerStep1 as never}
                    errors={errorsStep1 as never}
                    options={monthOptions}
                    icon={<ChevronDown />}
                  />
                  <JumpingSelect
                    label="Năm"
                    name="year"
                    register={registerStep1 as never}
                    errors={errorsStep1 as never}
                    options={yearOptions}
                    icon={<ChevronDown />}
                  />
                </div>
                <JumpingSelect
                  label="Giới tính"
                  name="gender"
                  register={registerStep1 as never}
                  errors={errorsStep1 as never}
                  options={{ 0: "Nam", 1: "Nữ", 2: "Khác", 3: "Không muốn tiết lộ" }}
                  icon={<ChevronDown />}
                />
                <Button
                  type="button"
                  className="btn-primary py-3"
                  onClick={handleStep1}
                  tabIndex={isValidStep1 && currentStep === 1 ? 0 : -1}
                >
                  Tiếp theo
                </Button>
              </div>
            </div>

            {/* ── Step 2 ── */}
            <div
              ref={setStepsRef(2)}
              className={`md:px-8 px-6 h-fit ${currentStep === 2 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>Thông tin đăng nhập</h2>
                <p className="text-muted-foreground">
                  Đây là thông tin quan trọng. Hãy luôn giữ bảo mật nhé!
                </p>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder=""
                      className={cn(
                        "peer custom-input",
                        errorsStep2.username && "custom-input-error",
                      )}
                      tabIndex={0}
                      {...registerStep2("username", {
                        required: "Tên đăng nhập không được để trống",
                      })}
                    />
                    <span
                      className={cn(
                        "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                        "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                        errorsStep2.username
                          ? "text-red-500"
                          : "peer-hover:text-foreground peer-focus:text-foreground",
                      )}
                    >
                      Tên đăng nhập
                    </span>
                    <div
                      className={cn(
                        "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                        errorsStep2.username ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      <UserRoundIcon className="size-5" />
                    </div>
                  </div>
                  {errorsStep2.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errorsStep2.username?.message ?? "")}
                    </p>
                  )}
                </div>
                <div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder=""
                      className={cn("peer custom-input", errorsStep2.email && "custom-input-error")}
                      tabIndex={0}
                      {...registerStep2("email", {
                        required: "Email không được để trống",
                        pattern: { value: regexEmail, message: "Email không hợp lệ" },
                      })}
                    />
                    <span
                      className={cn(
                        "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                        "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                        errorsStep2.email
                          ? "text-red-500"
                          : "peer-hover:text-foreground peer-focus:text-foreground",
                      )}
                    >
                      Email
                    </span>
                    <div
                      className={cn(
                        "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                        errorsStep2.email ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      <AtSign className="size-5" />
                    </div>
                  </div>
                  {errorsStep2.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errorsStep2.email?.message ?? "")}
                    </p>
                  )}
                </div>
                <div>
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
                        required: "Mật khẩu không được để trống",
                        pattern: {
                          value: regexPassword,
                          message: "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số",
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
                      Mật khẩu
                    </span>
                    <div
                      className={cn(
                        "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                        errorsStep2.password ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      {!isShowPassword ? (
                        <Eye
                          className="size-5 cursor-pointer"
                          onClick={() => setIsShowPassword(true)}
                        />
                      ) : (
                        <EyeOff
                          className="size-5 cursor-pointer"
                          onClick={() => setIsShowPassword(false)}
                        />
                      )}
                    </div>
                  </div>
                  {errorsStep2.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errorsStep2.password?.message ?? "")}
                    </p>
                  )}
                </div>
                <div>
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
                        required: "Mật khẩu nhập lại không được để trống",
                        pattern: {
                          value: regexPassword,
                          message: "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số",
                        },
                        validate: (value) => value === password || "Mật khẩu nhập lại không khớp",
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
                      Nhập lại Mật khẩu
                    </span>
                    <div
                      className={cn(
                        "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                        errorsStep2.rePassword ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      {!isShowRePassword ? (
                        <Eye
                          className="size-5 cursor-pointer"
                          onClick={() => setIsShowRePassword(true)}
                        />
                      ) : (
                        <EyeOff
                          className="size-5 cursor-pointer"
                          onClick={() => setIsShowRePassword(false)}
                        />
                      )}
                    </div>
                  </div>
                  {errorsStep2.rePassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errorsStep2.rePassword?.message ?? "")}
                    </p>
                  )}
                </div>
                {step2Err && <p className="text-red-500 text-sm">{step2Err}</p>}
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="ghost"
                    className="btn-primary py-3 w-full flex items-center justify-center"
                    onClick={handleStep2}
                  >
                    {checkDuplicateClicked ? <LoadingIcon /> : "Tiếp theo"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="btn-outline py-3 w-full flex items-center justify-center gap-2"
                    onClick={backToStep1}
                  >
                    <ArrowLeftIcon className="size-5" /> Quay lại
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Step 3 ── */}
            <div
              ref={setStepsRef(3)}
              className={`space-y-5 md:px-8 px-6 h-fit ${currentStep === 3 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>Xác minh tài khoản</h2>
                <p className="text-muted-foreground">Yeah! Chỉ còn một bước cuối cùng thôi</p>
              </div>
              <p>Hãy kiểm tra email để nhận mã xác minh gồm 4 số và điền vào bên dưới nhé</p>
              <div className="flex justify-center">
                <OtpInputGroup
                  value={otpValue}
                  setValue={setOtpValue}
                  autoFocus={currentStep === 3}
                />
              </div>
              <div className="space-y-4">
                <div>
                  {step3Err && <p className="text-red-600 mb-1">{step3Err}</p>}
                  <Button
                    type="button"
                    variant="ghost"
                    className="btn-primary py-3 w-full flex items-center justify-center"
                    onClick={handleStep3}
                  >
                    {validOTPClicked ? <LoadingIcon /> : "Xác nhận"}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="btn-outline py-3 w-full flex items-center justify-center gap-2"
                  onClick={backToStep2}
                >
                  <ArrowLeftIcon className="size-5" /> Quay lại
                </Button>
              </div>
            </div>

            {/* ── Step 4 placeholder (hidden via parent) ── */}
            <div ref={setStepsRef(4)} className="md:px-8 px-6 h-fit invisible" />
          </div>

          {/* ── "Or" divider + Google button ── */}
          <div className="relative md:px-8 px-6 bg-background pt-3 border-x">
            <div className="flex items-center my-6">
              <div className="border-t flex-grow" />
              <span className="px-4 text-muted-foreground text-sm">Hoặc</span>
              <div className="border-t flex-grow" />
            </div>
            <div>
              <Button
                type="button"
                className="btn-outline mb-5 gap-3 py-3 w-full flex items-center justify-center"
                onClick={handleGoogleSignup}
              >
                <img className="size-6" src="/decor/google_icon.svg" alt="" />
                Đăng ký với Google
              </Button>
              <p className="text-muted-foreground text-center text-sm">
                Bạn đã có tài khoản?{" "}
                <Link href="/login" className="underline font-semibold">
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* ── Decorative side panel ── */}
        <div className="relative overflow-hidden flex-grow">
          <img
            className={`absolute w-full left-0 mt-20 transition duration-300 ${
              currentStep === 1
                ? "translate-y-0 opacity-100"
                : "translate-y-1/4 opacity-0 invisible"
            }`}
            src="/decor/signup_step_1_decor.svg"
            alt=""
          />
          <img
            className={`absolute w-11/12 left-1/2 -translate-x-1/2 transition duration-300 ${
              currentStep === 2
                ? "translate-y-0 opacity-100"
                : "translate-y-1/4 opacity-0 invisible"
            }`}
            src="/decor/signup_step_2_decor.svg"
            alt=""
          />
          <img
            className={`absolute w-11/12 left-1/2 -translate-x-1/2 mt-12 ${
              currentStep === 3
                ? "translate-y-0 opacity-100 transition duration-300"
                : "translate-y-1/4 opacity-0 invisible"
            }`}
            src="/decor/signup_step_3_decor.svg"
            alt=""
          />
          <div
            className={
              currentStep === 4 ? "flex flex-col items-center text-center mt-4 px-4" : "hidden"
            }
          >
            <h1 className="lg:text-4xl md:text-3xl text-2xl bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent mb-2">
              Đã tạo tài khoản thành công
              <br />
              🎉🎉🎉
            </h1>
            <h3 className="text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</h3>
            <img src="/decor/signup_step_4_decor.svg" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}
