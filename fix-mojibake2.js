const fs = require('fs');
const path = 'src/features/auth/hooks/use-forgot-password.ts';
let text = fs.readFileSync(path, 'utf8');

text = text.replace(/toast\.success\([^)]*\);/, 'toast.success("Đổi mật khẩu thành công, đang chuyển hướng...");');
text = text.replace(/setStep2Err\(resp\?\.message \?\? "[^"]*"\);/, 'setStep2Err(resp?.message ?? "Đã có lỗi xảy ra trong quá trình reset mật khẩu");');

fs.writeFileSync(path, text, 'utf8');
console.log('done');
