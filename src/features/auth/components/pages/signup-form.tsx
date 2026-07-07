"use client";
import { AtSign, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { ArrowLeftIcon, LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { Image } from "@/shared/components/atoms/image";
import { FormInput } from "@/shared/components/molecules/form-input";
import { OtpInputGroup } from "@/shared/components/molecules/otp-input-group";
import { Button } from "@/shared/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { dayOptions, monthOptions, yearOptions } from "@/shared/config/global-variables";
import { ROUTES } from "@/shared/config/routes";
import { useSignupWizard } from "../../hooks/use-signup-wizard";
import { genderOptions } from "../../utils/signup-constants";

export default function SignupForm() {
  const {
    currentStep,
    formContainer,
    stepsWrapper,
    setStepsRef,
    step1Form,
    step2Form,
    checkDuplicateClicked,
    step2Err,
    otpValue,
    setOtpValue,
    validOTPClicked,
    step3Err,
    handleStep1,
    backToStep1,
    handleStep2,
    backToStep2,
    handleStep3,
    handleGoogleSignup,
  } = useSignupWizard();

  const {
    register: registerStep1,
    formState: { errors: errorsStep1, isValid: isValidStep1 },
  } = step1Form;

  const {
    register: registerStep2,
    formState: { errors: errorsStep2 },
  } = step2Form;

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-2 grid-cols-1 overflow-hidden rounded-xl border bg-background">
        <div ref={formContainer} className="relative overflow-hidden">
          <div
            ref={stepsWrapper}
            className="grid transition duration-300"
            style={{ gridTemplateColumns: "repeat(4, 100%)" }}
          >
            <div
              ref={setStepsRef(1)}
              className={`md:px-8 px-6 h-fit ${currentStep === 1 ? "" : "invisible"}`}
            >
              <div className="mb-4">
                <h2>Thông tin cá nhân</h2>
                <p className="text-muted-foreground">Điền đầy đủ thông tin để bắt đầu nhé</p>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    type="text"
                    label="Tên"
                    error={String(errorsStep1.firstName?.message ?? "")}
                    {...registerStep1("firstName")}
                  />
                  <FormInput
                    type="text"
                    label="Họ"
                    error={String(errorsStep1.lastName?.message ?? "")}
                    {...registerStep1("lastName")}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "day", label: "Ngày", options: dayOptions },
                    { name: "month", label: "Tháng", options: monthOptions },
                    { name: "year", label: "Năm", options: yearOptions },
                  ].map((item) => (
                    <label key={item.name} className="block" htmlFor={`signup-${item.name}`}>
                      <span className="block mb-2 font-medium">{item.label}</span>
                      <NativeSelect
                        id={`signup-${item.name}`}
                        className="custom-input w-full"
                        {...registerStep1(item.name as "day" | "month" | "year")}
                      >
                        {Object.entries(item.options).map(([key, value]) => (
                          <NativeSelectOption key={key} value={key}>
                            {String(value)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </label>
                  ))}
                </div>
                <label className="block" htmlFor="signup-gender">
                  <span className="block mb-2 font-medium">Giới tính</span>
                  <NativeSelect
                    id="signup-gender"
                    className="custom-input w-full"
                    {...registerStep1("gender")}
                  >
                    {Object.entries(genderOptions).map(([key, value]) => (
                      <NativeSelectOption key={key} value={key}>
                        {value}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </label>
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
                <FormInput
                  type="text"
                  label="Tên đăng nhập"
                  icon={<UserRoundIcon className="size-5" />}
                  error={String(errorsStep2.username?.message ?? "")}
                  {...registerStep2("username")}
                />
                <FormInput
                  type="text"
                  label="Email"
                  icon={<AtSign className="size-5" />}
                  error={String(errorsStep2.email?.message ?? "")}
                  {...registerStep2("email")}
                />
                <FormInput
                  type="password"
                  label="Mật khẩu"
                  error={String(errorsStep2.password?.message ?? "")}
                  {...registerStep2("password")}
                />
                <FormInput
                  type="password"
                  label="Nhập lại Mật khẩu"
                  error={String(errorsStep2.rePassword?.message ?? "")}
                  {...registerStep2("rePassword")}
                />
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

            <div ref={setStepsRef(4)} className="md:px-8 px-6 h-fit invisible" />
          </div>

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
                <Image
                  className="size-6"
                  src="/decor/google_icon.svg"
                  alt=""
                  width={24}
                  height={24}
                />
                Đăng ký với Google
              </Button>
              <p className="text-muted-foreground text-center text-sm">
                Bạn đã có tài khoản?{" "}
                <Link href={ROUTES.LOGIN} className="underline font-semibold">
                  Quay lại đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden flex-grow">
          <Image
            className={`absolute w-full h-auto left-0 mt-20 transition duration-300 ${
              currentStep === 1
                ? "translate-y-0 opacity-100"
                : "translate-y-1/4 opacity-0 invisible"
            }`}
            src="/decor/signup_step_1_decor.svg"
            alt=""
            width={0}
            height={0}
            sizes="50vw"
          />
          <Image
            className={`absolute w-11/12 h-auto left-1/2 -translate-x-1/2 transition duration-300 ${
              currentStep === 2
                ? "translate-y-0 opacity-100"
                : "translate-y-1/4 opacity-0 invisible"
            }`}
            src="/decor/signup_step_2_decor.svg"
            alt=""
            width={0}
            height={0}
            sizes="50vw"
          />
          <Image
            className={`absolute w-11/12 h-auto left-1/2 -translate-x-1/2 mt-12 ${
              currentStep === 3
                ? "translate-y-0 opacity-100 transition duration-300"
                : "translate-y-1/4 opacity-0 invisible"
            }`}
            src="/decor/signup_step_3_decor.svg"
            alt=""
            width={0}
            height={0}
            sizes="50vw"
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
