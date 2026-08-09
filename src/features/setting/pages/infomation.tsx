"use client";

import { PencilChangeImageIcon } from "@/shared/components/atoms/icon/icon";
import { Image } from "@/shared/components/atoms/image";
import { Loading } from "@/shared/components/molecules/loading";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { Calendar } from "@/shared/components/ui/calendar";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useAccountBasicForm } from "../hooks/use-account-basic-form";
import { genderOptions } from "../types/profile";

export default function Infomation() {
  const {
    user,
    form,
    isEditing,
    handleStartEditing,
    handleSelectBanner,
    handleSelectAvatar,
    onSubmit,
    isLoading,
  } = useAccountBasicForm();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
  } = form;

  const [dobOpen, setDobOpen] = useState(false);

  return (
    <div className="mb-5">
      <div className="mb-5 space-y-3">
        <div
          className={cn(
            "relative aspect-[3/1] overflow-hidden lg:rounded-lg border",
            !user.background && "border-field",
          )}
        >
          {user.background ? (
            <Image
              src={user.background}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 630px"
              className="object-cover"
            />
          ) : (
            <div className="size-full grid place-content-center">
              <p>Cập nhật ảnh bìa của bạn</p>
            </div>
          )}
          {isEditing && (
            <label
              htmlFor="banner-upload"
              className="btn-secondary w-fit absolute bottom-2 right-2 py-1 ps-2.5 pe-4 border cursor-pointer flex items-center gap-1"
            >
              <PencilChangeImageIcon />
              Đổi ảnh bìa
              <Input
                id="banner-upload"
                type="file"
                hidden
                onChange={handleSelectBanner}
                onClick={(event) => {
                  (event.target as HTMLInputElement).value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-5 mb-5 space-y-3">
        <div className="relative bg-background border-4 rounded-full p-1 w-fit h-fit transition">
          <UserAvatar src={user.avatar} displayName={user.displayName} className="w-40 h-40" />
          {isEditing && (
            <label
              htmlFor="avatar-upload"
              className="btn-secondary w-fit absolute bottom-0 right-0 p-1 rounded-full shadow border cursor-pointer"
            >
              <Input
                id="avatar-upload"
                type="file"
                hidden
                onChange={handleSelectAvatar}
                onClick={(event) => {
                  (event.target as HTMLInputElement).value = "";
                }}
              />
              <PencilChangeImageIcon />
            </label>
          )}
        </div>
        <div className="w-full bg-background rounded-lg p-5 border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className={dirtyFields.bio ? "border-bottom-faded" : undefined}>
              <span className="block mb-2 font-medium">Tiểu sử</span>
              <Textarea
                placeholder="Viết gì đó giới thiệu về bản thân"
                disabled={!isEditing}
                className={cn("custom-input min-h-17.5 resize-none", !isEditing && "opacity-65")}
                {...register("bio")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label
                htmlFor="firstName"
                className={cn(dirtyFields.firstName ? "border-bottom-faded" : undefined)}
              >
                <span className="block mb-2 font-medium">Tên</span>
                <div className={cn(!isEditing && "pointer-events-none opacity-65")}>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Nhập tên của bạn"
                    disabled={!isEditing}
                    className={cn(
                      "custom-input",
                      errors?.firstName && "custom-input-error",
                      !isEditing && "pointer-events-none",
                    )}
                    tabIndex={!isEditing ? -1 : 0}
                    {...register("firstName", { required: "Tên không được để trống" })}
                  />
                </div>
                {errors?.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.firstName?.message ?? "")}
                  </p>
                )}
              </label>
              <label
                htmlFor="lastName"
                className={cn(dirtyFields.lastName ? "border-bottom-faded" : undefined)}
              >
                <span className="block mb-2 font-medium">Họ</span>
                <div className={cn(!isEditing && "pointer-events-none opacity-65")}>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Nhập họ của bạn"
                    disabled={!isEditing}
                    className={cn("custom-input", errors?.lastName && "custom-input-error")}
                    tabIndex={!isEditing ? -1 : 0}
                    {...register("lastName", { required: "Họ không được để trống" })}
                  />
                </div>
                {errors?.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.lastName?.message ?? "")}
                  </p>
                )}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label
                htmlFor="gender"
                className={cn(dirtyFields.gender ? "border-bottom-faded" : undefined)}
              >
                <span className="block mb-2 font-medium">Giới tính</span>
                <NativeSelect
                  id="gender"
                  disabled={!isEditing}
                  className={cn(
                    "custom-input w-full",
                    errors?.gender && "custom-input-error",
                    !isEditing && "pointer-events-none opacity-65",
                  )}
                  {...register("gender")}
                >
                  {Object.entries(genderOptions).map(([key, value]) => (
                    <NativeSelectOption key={key} value={key}>
                      {value}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {errors?.gender && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.gender?.message ?? "")}
                  </p>
                )}
              </label>

              <div className={cn(dirtyFields.dob ? "border-bottom-faded" : undefined)}>
                <span className="block mb-2 font-medium">Ngày sinh</span>
                <Controller
                  control={control}
                  name="dob"
                  render={({ field }) => (
                    <Popover open={dobOpen} onOpenChange={setDobOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!isEditing}
                          className={cn(
                            "custom-input w-full justify-between border font-normal",
                            errors?.dob && "custom-input-error",
                          )}
                        >
                          {field.value ? field.value.toLocaleDateString("vi-VN") : "Chọn ngày sinh"}
                          <CalendarDays size={20} className="right-2" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          defaultMonth={field.value}
                          captionLayout="dropdown"
                          onSelect={(date) => {
                            field.onChange(date);
                            setDobOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors?.dob && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.dob?.message ?? "")}</p>
                )}
              </div>
            </div>

            <div>
              <p className="mb-4 font-medium">Địa chỉ</p>
              <div className="grid grid-cols-1 gap-4">
                <label
                  htmlFor="address"
                  className={cn(
                    "block",
                    !isEditing && "pointer-events-none opacity-65",
                    dirtyFields.address ? "border-bottom-faded" : undefined,
                  )}
                >
                  <span className="block mb-2 font-medium" />
                  <div className="relative">
                    <Input
                      id="address"
                      type="text"
                      placeholder="Nhập địa chỉ của bạn"
                      className={cn(
                        "custom-input",
                        errors?.address && "custom-input-error",
                        !isEditing && "pointer-events-none",
                      )}
                      tabIndex={!isEditing ? -1 : 0}
                      {...register("address")}
                    />
                  </div>
                  {errors?.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {String(errors.address?.message ?? "")}
                    </p>
                  )}
                </label>
              </div>
            </div>
            {!isEditing ? (
              <Button
                size="lg"
                type="button"
                className="btn-primary w-full text-base"
                onClick={handleStartEditing}
              >
                Thay đổi thông tin
              </Button>
            ) : (
              <Button
                size="lg"
                className={`btn-primary w-full text-base ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <Loading /> : "Cập nhật"}
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
