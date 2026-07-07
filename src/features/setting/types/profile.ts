export interface ProfileInfo {
  firstName: string;
  lastName: string;
  bio: string;
  gender: string;
  day: string;
  month: string;
  year: string;
  address: string;
}

export const genderOptions: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
  "3": "Không muốn tiết lộ",
};
