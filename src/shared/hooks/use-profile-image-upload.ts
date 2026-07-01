"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

interface UploadImageOptions {
  /** API call that performs the actual upload (e.g. updateAvatar/updateBanner from the feature's API layer). */
  uploadFn: (file: File) => Promise<unknown>;
  /** Store field to optimistically set to the local preview URL before the API call resolves. */
  optimisticField: "avatar" | "banner" | "background";
  successMessage: string;
  errorMessage: string;
  /** Whether a falsy (non-2xx/null) response should also trigger the error toast. Defaults to true. */
  toastOnFalsyResponse?: boolean;
  /** Resolve a server-returned URL from the response to re-sync the store after upload. */
  resolveServerUrl?: (response: unknown) => string | undefined;
}

export function useProfileImageUpload() {
  const setUser = ownerAccountStore((state) => state.setUser);
  const [isUploading, setIsUploading] = useState(false);

  const selectImageFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return null;
    return { file, previewURL: URL.createObjectURL(file) };
  }, []);

  const uploadImage = useCallback(
    async (file: File, previewURL: string, options: UploadImageOptions) => {
      const {
        uploadFn,
        optimisticField,
        successMessage,
        errorMessage,
        toastOnFalsyResponse = true,
      } = options;

      setUser({ [optimisticField]: previewURL });
      setIsUploading(true);
      try {
        const resp = await uploadFn(file);

        if (resp) {
          const serverUrl = options.resolveServerUrl?.(resp);
          if (serverUrl) {
            setUser({ [optimisticField]: serverUrl });
          }
          toast.success(successMessage);
        } else if (toastOnFalsyResponse) {
          toast.error(errorMessage);
        }

        return resp;
      } catch {
        toast.error(errorMessage);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [setUser],
  );

  return { selectImageFile, uploadImage, isUploading };
}
