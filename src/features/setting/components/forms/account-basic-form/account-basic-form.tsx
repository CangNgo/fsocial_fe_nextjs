// @ts-nocheck
"use client";

import { ChevronDown } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type UpdateProfile,
  updateAvatar,
  updateBanner,
  updatePersonalInfo,
} from "@/features/profile/api/update-profile-info-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/atoms/avatar";
import { Button } from "@/shared/components/atoms/button";
import { PencilChangeImageIcon } from "@/shared/components/atoms/icon";
import { Input } from "@/shared/components/atoms/input";
import { JumpingSelect, TextBox } from "@/shared/components/atoms/jumping-input";
import { dayOptions, monthOptions, yearOptions } from "@/shared/config/global-variables";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";
import { getTextboxData } from "@/shared/utils/process-textbox-data";

export interface ProfileInfo {
  displayName: string;
  bio: string;
  gender: string;
  day: string;
  month: string;
  year: string;
  address: string;
}

const _GenderOptions: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
  "3": "Không muốn tiết lộ",
};

export function AccountBasicForm() {
  const { user, setUser } = ownerAccountStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bioHTML, setBioHTML] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    getValues,
    setValue,
    reset,
  } = useForm<ProfileInfo>({
    mode: "onChange",
    defaultValues: {
      displayName: "",
      bio: "",
      gender: "3",
      day: "1",
      month: "1",
      year: "2000",
      address: "",
    },
  });

  // Load data from store into form
  useEffect(() => {
    if (!user.userId) return;
    let day = "1",
      month = "1",
      year = "2000";
    if (user.dob) {
      try {
        const dobDate = new Date(user.dob);
        if (!Number.isNaN(dobDate.getTime())) {
          day = String(dobDate.getDate());
          month = String(dobDate.getMonth() + 1);
          year = String(dobDate.getFullYear());
        }
      } catch (_error) {}
    }

    reset({
      ...getValues(),
      displayName: user.displayName,
      bio: user.bio || "",
      day,
      month,
      year,
      address: user.address || "",
    });
    setBioHTML(user.bio || "");
    register("bio");
  }, [user, reset, register, getValues]);

  const bioRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bioRef.current && bioHTML !== undefined) {
      bioRef.current.innerHTML = bioHTML;
    }
  }, [bioHTML]);

  const handleOnInput = () => {
    if (!isEditing || !bioRef.current) return;
    const innerHTML = getTextboxData(bioRef as React.RefObject<HTMLDivElement>).innerHTML || "";
    setValue("bio", innerHTML, { shouldDirty: true });
  };

  const handleSelectBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    // No ModalCropImage in this project — update directly
    setUser({ banner: previewURL });
    updateBanner(file).then((resp) => {
      if (resp) toast.success("Đã cập nhật ảnh bìa");
    });
  };

  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    setUser({ avatar: previewURL });
    updateAvatar(file)
      .then((resp) => {
        if (resp) toast.success("Đã cập nhật ảnh đại diện");
      })
      .catch((_error) => {
        toast.error("Cập nhật ảnh đại diện thất bại");
      });
  };

  const onSubmit = async (data: ProfileInfo) => {
    if (!isEditing) return;

    const dobString = `${data.year}-${data.month.padStart(2, "0")}-${data.day.padStart(2, "0")}`;

    try {
      const updateData: UpdateProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        address: data.address,
        dob: dobString,
      };

      const resp = await updatePersonalInfo(updateData);
      if (resp) {
        toast.success("Đã cập nhật thông tin");
        reset(getValues());
        setIsEditing(false);
        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          dob: dobString,
          address: data.address,
        });
        setBioHTML(data.bio);
      } else {
        toast.error("Cập nhật thông tin thất bại");
      }
    } catch (_error) {
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  return (
    <div className="sm:mt-5 mt-2 mb-5">
      {/* Banner */}
      <div className="mb-5 space-y-3">
        <p className="font-medium">Ảnh bìa</p>
        <div
          className={cn(
            "relative aspect-[3/1] overflow-hidden lg:rounded-lg border",
            !user.banner && "border-field",
          )}
        >
          {user.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.banner} className="size-full" alt="" />
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
                onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      {/* Avatar */}
      <div className="mb-5 space-y-3">
        <p className="font-medium">Ảnh đại diện</p>
        <div className="relative bg-background border-4 rounded-full p-1 w-fit transition">
          <Avatar className="size-[120px]">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-[40px] transition">
              {getInitialsFromDisplayName(user.displayName)}
            </AvatarFallback>
          </Avatar>
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
                onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                  (e.target as HTMLInputElement).value = "";
                }}
              />
              <PencilChangeImageIcon />
            </label>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Bio */}
        <TextBox
          label="Tiểu sử"
          texboxRef={bioRef as React.RefObject<HTMLDivElement>}
          onInput={handleOnInput}
          placeholder="Viết gì đó giới thiệu về bản thân"
          innerHTML={bioHTML}
          contentEditable={isEditing}
          className={cn("custom-input min-h-[70px]", !isEditing && "opacity-65 cursor-not-allowed")}
          parentClassName={dirtyFields.bio ? "border-bottom-faded" : undefined}
        />

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <label
            htmlFor="firstName"
            className={cn(
              "block",
              !isEditing && "pointer-events-none opacity-65",
              dirtyFields.firstName ? "border-bottom-faded" : undefined,
            )}
          >
            <span className="block mb-2 font-medium">Tên</span>
            <div className="relative">
              <Input
                id="firstName"
                type="text"
                placeholder="Nhập tên của bạn"
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
              <p className="text-red-500 text-sm mt-1">{String(errors.firstName?.message ?? "")}</p>
            )}
          </label>
          <label
            htmlFor="lastName"
            className={cn(
              "block",
              !isEditing && "pointer-events-none opacity-65",
              dirtyFields.lastName ? "border-bottom-faded" : undefined,
            )}
          >
            <span className="block mb-2 font-medium">Họ</span>
            <div className="relative">
              <Input
                id="lastName"
                type="text"
                placeholder="Nhập họ của bạn"
                className={cn(
                  "custom-input",
                  errors?.lastName && "custom-input-error",
                  !isEditing && "pointer-events-none",
                )}
                tabIndex={!isEditing ? -1 : 0}
                {...register("lastName", { required: "Họ không được để trống" })}
              />
            </div>
            {errors?.lastName && (
              <p className="text-red-500 text-sm mt-1">{String(errors.lastName?.message ?? "")}</p>
            )}
          </label>
        </div>

        {/* Gender */}
        <label
          htmlFor="gender"
          className={cn(
            "block",
            !isEditing && "pointer-events-none opacity-65",
            dirtyFields.gender ? "border-bottom-faded" : undefined,
          )}
        >
          <span className="block mb-2 font-medium">Giới tính</span>
          <div className="relative">
            <Input
              id="gender"
              type="text"
              placeholder={undefined}
              className={cn(
                "custom-input",
                errors?.gender && "custom-input-error",
                !isEditing && "pointer-events-none",
              )}
              tabIndex={!isEditing ? -1 : 0}
              {...register("gender")}
            />
            <div
              className={cn(
                "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                errors?.gender ? "text-red-500" : "text-muted-foreground",
              )}
            >
              <ChevronDown />
            </div>
          </div>
          {errors?.gender && (
            <p className="text-red-500 text-sm mt-1">{String(errors.gender?.message ?? "")}</p>
          )}
        </label>

        {/* Date of birth */}
        <div>
          <p className="mb-4 font-medium">Ngày sinh</p>
          <div className="grid grid-cols-3 gap-4">
            <JumpingSelect
              label="Ngày"
              name="day"
              register={register as never}
              errors={errors as never}
              options={dayOptions}
              icon={<ChevronDown />}
              disabled={!isEditing}
              className={dirtyFields.day ? "border-bottom-faded" : undefined}
            />
            <JumpingSelect
              label="Tháng"
              name="month"
              register={register as never}
              errors={errors as never}
              options={monthOptions}
              icon={<ChevronDown />}
              disabled={!isEditing}
              className={dirtyFields.month ? "border-bottom-faded" : undefined}
            />
            <JumpingSelect
              label="Năm"
              name="year"
              register={register as never}
              errors={errors as never}
              options={yearOptions}
              icon={<ChevronDown />}
              disabled={!isEditing}
              className={dirtyFields.year ? "border-bottom-faded" : undefined}
            />
          </div>
        </div>

        {/* Address */}
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
                  {...register("address", {})}
                />
                <div
                  className={cn(
                    "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                    errors?.address ? "text-red-500" : "text-muted-foreground",
                  )}
                >
                  <ChevronDown />
                </div>
              </div>
              {errors?.address && (
                <p className="text-red-500 text-sm mt-1">{String(errors.address?.message ?? "")}</p>
              )}
            </label>
          </div>
        </div>

        {/* Controls */}
        {!isEditing ? (
          <Button
            type="button"
            className="btn-primary py-2.5 w-full"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            Thay đổi thông tin
          </Button>
        ) : (
          <Button className="btn-primary py-2.5 w-full" type="submit">
            Cập nhật
          </Button>
        )}
      </form>
    </div>
  );
}
