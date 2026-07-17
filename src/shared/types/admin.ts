export interface ComplaintItem {
  id: string;
  displayName: string;
  userName: string;
  complaintType: string;
  profileId: string;
  termOfService: string;
  dateTime: string;
  readding?: boolean;
  reportCount: number;
}

export interface ManageUserItem {
  id: string;
  username: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt: string | null;
  status: boolean;
}

export interface ReportStatItem {
  hour?: number;
  date?: string;
  count: number;
}
