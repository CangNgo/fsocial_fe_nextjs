"use client";

import { useState } from "react";
import { Switch } from "@/components/atoms/switch";

export function AccountPrivacyForm() {
  const [hideProfileChecked, setHideProfileChecked] = useState(false);
  const [postReactedChecked, setPostReactedChecked] = useState(false);

  return (
    <div className="space-y-5 pt-7">
      <div>
        <p className="mb-3 font-medium">Tài khoản riêng tư</p>
        <div className="border border-field rounded-3xl py-5 px-6 flex items-center justify-between sm:gap-32 gap-2">
          <p>
            Khi bật riêng tư, chỉ những người theo dõi bạn mới có thể nhìn thấy bài đăng, hình ảnh,
            video,... của bạn.
          </p>
          <Switch
            className="bg-gray-2light scale-[85%]"
            checked={hideProfileChecked}
            onCheckedChange={setHideProfileChecked}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 font-medium">Bài đăng đã tương tác</p>
        <div className="border border-field rounded-3xl py-5 px-6 flex items-center justify-between sm:gap-32 gap-2">
          <p>Cho phép người khác xem bài viết mà bạn đã tương tác khi xem trang cá nhân của bạn.</p>
          <Switch
            className="bg-gray-2light scale-[85%]"
            checked={postReactedChecked}
            onCheckedChange={setPostReactedChecked}
          />
        </div>
      </div>
    </div>
  );
}
