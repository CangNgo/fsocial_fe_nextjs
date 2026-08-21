"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Editor } from "@tiptap/core";
import { SaveIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { EditorRoot } from "@/features/editor/components/organisms/editor-root";
import type { EditorContent } from "@/features/editor/hooks/use-app-editor";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import type { FaqPayload, FaqResponse, FaqType } from "@/shared/types/faq";
import { FAQ_TYPE_OPTIONS } from "../../config/faq-config";
import { faqSchema, type FaqFormValues } from "../../schemas/faq-schema";

interface FaqFormProps {
  defaultType: FaqType;
  faq?: FaqResponse | null;
  isSubmitting?: boolean;
  onSubmit: (payload: FaqPayload) => Promise<void> | void;
}

export function FaqForm({ defaultType, faq, isSubmitting = false, onSubmit }: FaqFormProps) {
  const editorRef = useRef<Editor | null>(null);
  const form = useForm<FaqFormValues>({
    mode: "all",
    resolver: zodResolver(faqSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
      type: defaultType,
      attachmentId: null,
    },
  });

  const { control, handleSubmit, reset, setValue, trigger, watch } = form;
  const content = watch("content");

  useEffect(() => {
    const nextValues = {
      name: faq?.name ?? "",
      description: faq?.description ?? "",
      content: faq?.content ?? "",
      type: faq?.type ?? defaultType,
      attachmentId: faq?.attachmentId ?? null,
    };

    reset(nextValues);
    editorRef.current?.commands.setContent(nextValues.content);
  }, [defaultType, faq, reset]);

  const handleEditorChange = ({ html }: EditorContent) => {
    setValue("content", html, { shouldDirty: true, shouldValidate: true });
  };

  const submitForm = handleSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: values.description?.trim() || null,
      content: values.content,
      type: values.type,
      attachmentId: values.attachmentId ?? null,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={submitForm} className="flex flex-col gap-5">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nhập tên FAQ" className="rounded-lg" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Nhập mô tả ngắn"
                  className="min-h-24 resize-none rounded-lg"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full rounded-lg">
                    <SelectValue placeholder="Chọn loại FAQ" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FAQ_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="content"
          render={() => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                <div className="min-h-52 rounded-lg border bg-background p-3 [&_.ProseMirror]:min-h-40 [&_.ProseMirror]:outline-none">
                  <EditorRoot
                    key={faq?.id ?? "create-faq-editor"}
                    variant="minimal"
                    initialContent={content}
                    onChange={handleEditorChange}
                    placeholder="Nhập nội dung chi tiết..."
                    debounceMs={100}
                    onEditorReady={(editor) => {
                      editorRef.current = editor;
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting} className="min-w-32" onClick={() => trigger()}>
            <SaveIcon className="size-4" />
            {isSubmitting ? "Đang lưu" : "Lưu"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
