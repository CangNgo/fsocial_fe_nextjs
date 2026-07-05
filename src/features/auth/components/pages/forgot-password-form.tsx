"use client";
import { AtSign } from "lucide-react";
import Link from "next/link";
import { ArrowLeftIcon, LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { Image } from "@/shared/components/atoms/image";
import { FormInput } from "@/shared/components/molecules/form-input";
import { OtpInputGroup } from "@/shared/components/molecules/otp-input-group";
import { Button } from "@/shared/components/ui/button";
import { regexEmail, regexPassword } from "@/shared/config/regex";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { useForgotPassword } from "../../hooks/use-forgot-password";

export default function ForgotPasswordForm() {
  const {
    currentStep,
    formContainer,
    stepsWrapper,
    setStepsRef,
    step1Form,
    otpValue,
    setOtpValue,
    otpErrMessage,
    validOTPClicked,
    disableResendOTP,
    cooldownSeconds,
    handleRequireOTP,
    handleSubmitOTP,
    backToStep1,
    step2Form,
    password,
    isValidStep2,
    step2Err,
    step2Submitting,
    handleStep2,
    stepCircleClass,
    connectorClass,
  } = useForgotPassword();

  const {
    register: registerStep1,
    formState: { errors: errorsStep1 },
  } = step1Form;

  const {
    register: registerStep2,
    formState: { errors: errorsStep2 },
  } = step2Form;

  return (
    <div className="lg:w-[min(85%,1440px)] md:h-fit h-screen mx-auto relative bg-background xl:px-20 lg:px-12 lg:my-6 md:px-4 py-8 rounded-md">
      <Image
        className="w-[max(72px,8%)] absolute bottom-0 left-0"
        src="/decor/form_decor.svg"
        alt=""
      />

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
        <span className="col-span-3 fs-sm font-light text-center">Xác minh</span>
        <span className="col-span-3 fs-sm font-light text-center">Đổi mật khẩu</span>
        <span className="col-span-3 fs-sm font-light text-center">Hoàn tất</span>
      </div>

      <div className="flex md:gap-x-[5%] w-full justify-center">
        <div
          ref={formContainer}
          className={`md:py-8 py-4 overflow-hidden xl:basis-5/12 lg:basis-6/12 md:basis-7/12 basis-full border rounded-lg w-14 ${
            currentStep === 3 ? "hidden" : ""
          }`}
        >
          <div
            ref={stepsWrapper}
            className="grid"
            style={{ transition: "transform 0.3s, height 0.2s" }}
          >
            <div
              ref={setStepsRef(1)}
              className={`md:px-8 px-4 h-fit ${currentStep === 1 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>Xác minh tài khoản</h2>
                <p className="text-muted-foreground">
                  Hãy điền lại email đã đăng ký để khôi phục lại nhé
                </p>
              </div>
              <div className="space-y-5">
                <div className="flex gap-2">
                  <div className="flex-grow">
                    <FormInput
                      type="text"
                      label="Email"
                      icon={<AtSign className="size-5" />}
                      error={String(errorsStep1.email?.message ?? "")}
                      {...registerStep1("email", {
                        required: "Email không được để trống",
                        pattern: { value: regexEmail, message: "Email không hợp lệ" },
                      })}
                    />
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
                      {cooldownSeconds > 0 ? `Gửi lại (${cooldownSeconds})` : "Gửi mã"}
                    </Button>
                  </div>
                </div>
                <p>Kiểm tra email để nhận mã xác minh gồm 4 số và nhập vào ô bên dưới</p>
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
                    {validOTPClicked ? <LoadingIcon /> : "Xác nhận"}
                  </Button>
                </div>
              </div>
            </div>

            <div
              ref={setStepsRef(2)}
              className={`md:px-8 px-4 h-fit ${currentStep === 2 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>Đổi mật khẩu</h2>
                <p className="text-muted-foreground">Luôn ghi nhớ mật khẩu mới</p>
              </div>
              <div className="space-y-5">
                <div className="flex-grow">
                  <FormInput
                    type="password"
                    label="Mật khẩu mới"
                    error={String(errorsStep2.password?.message ?? "")}
                    {...registerStep2("password", {
                      required: "Mật khẩu không được để trống",
                      pattern: {
                        value: regexPassword,
                        message: "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số",
                      },
                    })}
                  />
                </div>
                <div className="flex-grow">
                  <FormInput
                    type="password"
                    label="Nhập lại Mật khẩu"
                    error={String(errorsStep2.rePassword?.message ?? "")}
                    {...registerStep2("rePassword", {
                      required: "Mật khẩu nhập lại không được để trống",
                      pattern: {
                        value: regexPassword,
                        message: "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số",
                      },
                      validate: (value) => value === password || "Mật khẩu nhập lại không khớp",
                    })}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="fs-sm text-muted-foreground mb-1">
                      *Sau khi đổi mật khẩu, bạn sẽ được chuyển hướng để đăng nhập lại tài khoản
                      bằng mật khẩu mới này
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
                      {step2Submitting ? <LoadingIcon /> : "Xác nhận"}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="btn-outline px-8 py-3 w-full flex items-center justify-center gap-2"
                    onClick={backToStep1}
                  >
                    <ArrowLeftIcon className="size-5" /> Quay lại
                  </Button>
                </div>
              </div>
            </div>

            <div ref={setStepsRef(3)} className="md:px-8 px-4 h-fit invisible" />
          </div>

          <div className="relative md:px-8 px-4 bg-background pt-3">
            <div className="flex items-center my-6">
              <div className="border-t flex-grow" />
              <span className="px-4 text-muted-foreground text-sm">Hoặc</span>
              <div className="border-t flex-grow" />
            </div>
            <Button
              asChild
              variant="ghost"
              className="btn-outline px-8 py-3 w-full flex items-center justify-center gap-2"
            >
              <Link href={ROUTES.LOGIN}>
                <ArrowLeftIcon className="size-5" /> Quay lại đăng nhập
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden flex-grow">
          <Image
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
              Đã đổi mật khẩu thành công
              <br />
              🎉🎉🎉
            </h1>
            <h3 className="text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</h3>
            <Image
              src="/decor/signup_step_4_decor.svg"
              alt=""
              width={0}
              height={0}
              sizes="50vw"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
