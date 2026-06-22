export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+84|0)[3-9]\d{8}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
} as const;

export const regexName = /^[\p{L}\s]{1,13}$/u;
export const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;

export const regexImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
export const regexVideo = /\.(mp4|webm|ogg|mov|avi|mkv)(\?.*)?$/i;
export const regexInMessage = /^\/message/;
export const regexInSetting = /^\/setting/;
