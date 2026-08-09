"use client";

import { useUpdatePersonalInfoMutation } from "@/features/profile/hooks/mutations/use-update-profile-mutations";
import type { UpdateProfile } from "@/services/profile/update-profile-api";
import { updateAvatar, updateBanner } from "@/services/profile/update-profile-api";
import { useProfileImageUpload } from "@/shared/hooks/use-profile-image-upload";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { format } from "date-fns";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ProfileInfo } from "../types/profile";

export const defaultValues: ProfileInfo = {
  firstName: "",
  lastName: "",
  bio: "",
  gender: "3",
  dob: undefined,
  address: "",
};

function parseDob(dob?: string | null) {
  if (!dob) return undefined;
  const dobDate = new Date(dob);
  return Number.isNaN(dobDate.getTime()) ? undefined : dobDate;
}

export function useAccountBasicForm() {
  const { user, setUser } = ownerAccountStore();
  const [isEditing, setIsEditing] = useState(false);
  const { selectImageFile, uploadImage } = useProfileImageUpload();
  const { mutateAsync: updatePersonalInfo } = useUpdatePersonalInfoMutation();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<ProfileInfo>({
    mode: "onChange",
    defaultValues,
  });

  const { getValues, reset } = form;

  useEffect(() => {
    if (!user.id) return;

    reset({
      ...getValues(),
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      gender: user.gender !== undefined ? String(user.gender) : "3",
      dob: parseDob(user.dob),
      address: user.address || "",
    });
  }, [user, reset, getValues]);

  const handleSelectBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(event);
    if (!selected) return;
    uploadImage(selected.file, selected.previewURL, {
      uploadFn: updateBanner,
      optimisticField: "banner",
      successMessage: "Đã cập nhật ảnh bìa",
      errorMessage: "Cập nhật ảnh bìa thất bại",
      toastOnFalsyResponse: false,
    });
  };

  const handleSelectAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(event);
    if (!selected) return;
    uploadImage(selected.file, selected.previewURL, {
      uploadFn: updateAvatar,
      optimisticField: "background",
      successMessage: "Đã cập nhật ảnh đại diện",
      errorMessage: "Cập nhật ảnh đại diện thất bại",
    });
  };

  const onSubmit = async (data: ProfileInfo) => {
    if (!isEditing) return;
    setIsLoading(true);
    if (!data.dob) {
      toast.error("Vui lòng chọn ngày sinh");
      return;
    }

    const dobString = format(data.dob, "yyyy-MM-dd");
    const updateData: UpdateProfile = {
      firstName: data.firstName,
      lastName: data.lastName,
      bio: data.bio,
      address: data.address,
      dob: dobString,
    };

    const resp = await updatePersonalInfo(updateData);
    setIsLoading(false);
    if (resp?.statusCode === 200) {
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
    } else {
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const handleStartEditing = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsEditing(true);
  };

  return {
    user,
    form,
    isEditing,
    handleStartEditing,
    handleSelectBanner,
    handleSelectAvatar,
    onSubmit,
    isLoading,
  };
}
