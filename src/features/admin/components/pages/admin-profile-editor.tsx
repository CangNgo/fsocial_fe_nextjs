"use client";

import { LogoNoBG } from "@/shared/components/atoms/icon/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { dayOptions, monthOptions, yearOptions } from "@/shared/config/global-variables";
import { cn } from "@/shared/lib/utils";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/shared/utils/combine-name";
import { AtSign, Eye, EyeOff, LoaderCircle, MapPin, UserRoundIcon } from "lucide-react";
import { genderOptions, useAdminProfileForm } from "../../hooks/use-admin-profile-form";

export default function AdminProfileEditor() {
  const {
    user,
    form,
    avatar,
    isLoading,
    isError,
    isSubmitting,
    isShowOldPassword,
    isShowNewPassword,
    isShowReNewPassword,
    handleImageUpload,
    handleUpdateProfile,
    toggleOldPasswordVisibility,
    toggleNewPasswordVisibility,
    toggleReNewPasswordVisibility,
    hours,
  } = useAdminProfileForm();

  const {
    register,
    formState: { errors },
  } = form;

  if (isLoading) {
    return (
      <div className="bg-background shadow border rounded-lg flex-grow p-10 grid place-items-center min-h-[420px]">
        <div className="flex items-center gap-3 text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
          <span>Đang tải thông tin hồ sơ</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-background shadow border rounded-lg flex-grow p-10 min-h-[420px] grid place-items-center">
        <div className="text-center space-y-3 max-w-md">
          <h5>Không tải được hồ sơ quản trị viên</h5>
          <p className="fs-sm text-gray">
            Kiểm tra lại kết nối hoặc phiên đăng nhập, sau đó tải lại trang để thử lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      className="relative overflow-hidden bg-background shadow border rounded-lg flex-grow p-10"
      onSubmit={handleUpdateProfile}
    >
      <LogoNoBG
        className="absolute left-0 bottom-0 translate-y-1/2 -rotate-12 size-56"
        fill="fill-gray-3light"
      />

      <div className="relative z-10 space-y-12">
        <div className="space-y-2">
          <h5>
            {hours < 12 && "Chào buổi sáng"}
            {hours >= 12 && hours <= 18 && "Chào buổi chiều"}
            {hours > 18 && "Chào buổi tối"},{" "}
            <span className="text-primary-gradient">
              {combineIntoDisplayName(user.firstName ?? "", user.lastName ?? "")}
            </span>{" "}
            👋
          </h5>
          <p className="text-gray fs-sm">
            Cập nhật thông tin quản trị của bạn tại đây. Chỉ thay đổi dữ liệu cần thiết để giữ hồ sơ
            đồng bộ trong toàn hệ thống.
          </p>
        </div>

        <div className="max-w-[1120px] mx-auto grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-8">
            <div className="space-y-5 rounded-lg border bg-background/80 p-6">
              <div>
                <p className="font-medium">Thông tin cá nhân</p>
                <p className="fs-sm text-gray mt-1">Các thông tin hiển thị trên hồ sơ quản trị viên.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
                <div className="flex justify-center">
                  <div className="ring-4 ring-offset-4 rounded-full ring-gray-2light">
                    <Avatar className="size-32">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>
                        {combineIntoAvatarName(user.firstName ?? "", user.lastName ?? "")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Ảnh đại diện</p>
                  <p className="fs-sm text-gray">
                    Ảnh đại diện dùng chung cho khu vực quản trị và các vị trí hiển thị tài khoản.
                  </p>
                  <label
                    htmlFor="admin-avatar-upload"
                    className={cn(
                      "btn-secondary w-fit px-8 py-3 cursor-pointer inline-flex items-center",
                      isSubmitting && "pointer-events-none opacity-65",
                    )}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Thay ảnh đại diện"}
                    <Input
                      id="admin-avatar-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      onClick={(event) => {
                        (event.target as HTMLInputElement).value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder=""
                      className={cn("peer custom-input", errors.firstName && "custom-input-error")}
                      tabIndex={0}
                      {...register("firstName")}
                    />
                    <span
                      className={cn(
                        "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                        "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                        errors.firstName
                          ? "text-red-500"
                          : "peer-hover:text-foreground peer-focus:text-foreground",
                      )}
                    >
                      Tên
                    </span>
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{String(errors.firstName.message ?? "")}</p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder=""
                      className={cn("peer custom-input", errors.lastName && "custom-input-error")}
                      tabIndex={0}
                      {...register("lastName")}
                    />
                    <span
                      className={cn(
                        "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                        "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                        errors.lastName
                          ? "text-red-500"
                          : "peer-hover:text-foreground peer-focus:text-foreground",
                      )}
                    >
                      Họ
                    </span>
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{String(errors.lastName.message ?? "")}</p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 font-medium">Ngày sinh</p>
                <div className="grid grid-cols-3 gap-3">
                  {(
                    [
                      { name: "day", label: "Ngày", options: dayOptions },
                      { name: "month", label: "Tháng", options: monthOptions },
                      { name: "year", label: "Năm", options: yearOptions },
                    ] as const
                  ).map((item) => (
                    <label key={item.name} className="block">
                      <span className="block mb-2 font-medium">{item.label}</span>
                      <NativeSelect
                        className={cn("custom-input w-full", errors[item.name] && "custom-input-error")}
                        {...register(item.name)}
                      >
                        <NativeSelectOption value="">Chọn {item.label.toLowerCase()}</NativeSelectOption>
                        {Object.entries(item.options).map(([key, value]) => (
                          <NativeSelectOption key={key} value={key}>
                            {String(value)}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </label>
                  ))}
                </div>
                {(errors.day || errors.month || errors.year) && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(
                      errors.day?.message ?? errors.month?.message ?? errors.year?.message ?? "",
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="block mb-2 font-medium">Giới tính</span>
                  <NativeSelect
                    className={cn("custom-input w-full", errors.gender && "custom-input-error")}
                    {...register("gender")}
                  >
                    {Object.entries(genderOptions).map(([key, value]) => (
                      <NativeSelectOption key={key} value={key}>
                        {value}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {errors.gender && (
                    <p className="text-red-500 text-sm mt-1">{String(errors.gender.message ?? "")}</p>
                  )}
                </label>

                <label className="block" htmlFor="address">
                  <span className="block mb-2 font-medium">Địa chỉ</span>
                  <div className="relative">
                    <Input
                      id="address"
                      type="text"
                      placeholder=""
                      className={cn("peer custom-input pr-12", errors.address && "custom-input-error")}
                      tabIndex={0}
                      {...register("address")}
                    />
                    <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground">
                      <MapPin className="size-5" />
                    </div>
                    <span className="fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none">
                      Địa chỉ
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="space-y-5 rounded-lg border bg-background/80 p-6">
              <div>
                <p className="font-medium">Thông tin đăng nhập</p>
                <p className="fs-sm text-gray mt-1">Các trường này lấy từ tài khoản hệ thống.</p>
              </div>

              <div>
                <div className="relative">
                  <Input
                    type="text"
                    readOnly
                    className="peer custom-input opacity-65 pr-12"
                    tabIndex={-1}
                    {...register("username")}
                  />
                  <span className="fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none">
                    Tên đăng nhập
                  </span>
                  <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground">
                    <UserRoundIcon className="size-5" />
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  <Input
                    type="text"
                    readOnly
                    className={cn("peer custom-input opacity-65 pr-12", errors.email && "custom-input-error")}
                    tabIndex={-1}
                    {...register("email")}
                  />
                  <span className="fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none">
                    Email
                  </span>
                  <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground">
                    <AtSign className="size-5" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.email.message ?? "")}</p>
                )}
              </div>
            </div>

            <div className="space-y-5 rounded-lg border bg-background/80 p-6">
              <div>
                <p className="font-medium">Bảo mật</p>
                <p className="fs-sm text-gray mt-1">Để trống nếu bạn chưa muốn đổi mật khẩu.</p>
              </div>

              <div>
                <div className="relative">
                  <Input
                    type={isShowOldPassword ? "text" : "password"}
                    placeholder=""
                    className={cn("peer custom-input", errors.oldPassword && "custom-input-error")}
                    tabIndex={0}
                    {...register("oldPassword")}
                  />
                  <span
                    className={cn(
                      "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                      "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                      errors.oldPassword
                        ? "text-red-500"
                        : "peer-hover:text-foreground peer-focus:text-foreground",
                    )}
                  >
                    Mật khẩu cũ
                  </span>
                  <div
                    className={cn(
                      "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                      errors.oldPassword ? "text-red-500" : "text-muted-foreground",
                    )}
                  >
                    <Button type="button" className="cursor-pointer" onClick={toggleOldPasswordVisibility}>
                      {isShowOldPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </Button>
                  </div>
                </div>
                {errors.oldPassword && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.oldPassword.message ?? "")}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input
                    type={isShowNewPassword ? "text" : "password"}
                    placeholder=""
                    className={cn("peer custom-input", errors.newPassword && "custom-input-error")}
                    tabIndex={0}
                    {...register("newPassword")}
                  />
                  <span
                    className={cn(
                      "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                      "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                      errors.newPassword
                        ? "text-red-500"
                        : "peer-hover:text-foreground peer-focus:text-foreground",
                    )}
                  >
                    Mật khẩu mới
                  </span>
                  <div
                    className={cn(
                      "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                      errors.newPassword ? "text-red-500" : "text-muted-foreground",
                    )}
                  >
                    <Button type="button" className="cursor-pointer" onClick={toggleNewPasswordVisibility}>
                      {isShowNewPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </Button>
                  </div>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.newPassword.message ?? "")}</p>
                )}
              </div>

              <div>
                <div className="relative">
                  <Input
                    type={isShowReNewPassword ? "text" : "password"}
                    placeholder=""
                    className={cn("peer custom-input", errors.reNewPassword && "custom-input-error")}
                    tabIndex={0}
                    {...register("reNewPassword")}
                  />
                  <span
                    className={cn(
                      "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                      "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                      errors.reNewPassword
                        ? "text-red-500"
                        : "peer-hover:text-foreground peer-focus:text-foreground",
                    )}
                  >
                    Nhập lại mật khẩu
                  </span>
                  <div
                    className={cn(
                      "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                      errors.reNewPassword ? "text-red-500" : "text-muted-foreground",
                    )}
                  >
                    <Button
                      type="button"
                      className="cursor-pointer"
                      onClick={toggleReNewPasswordVisibility}
                    >
                      {isShowReNewPassword ? (
                        <EyeOff className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </Button>
                  </div>
                </div>
                {errors.reNewPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.reNewPassword.message ?? "")}
                  </p>
                )}
              </div>
            </div>

            <Button className="btn-primary w-full py-3" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-5 animate-spin" />
                  Đang cập nhật
                </>
              ) : (
                "Cập nhật thông tin"
              )}
            </Button>
          </section>
        </div>
      </div>
    </form>
  );
}
