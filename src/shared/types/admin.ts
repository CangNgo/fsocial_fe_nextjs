export interface ComplaintItem {
  id: string;
  displayName: string;
  userName: string;
  complaintType: string;
  profileId: string;
  termOfService: string;
  dateTime: string;
  readding?: boolean;
}

export interface ManageUserItem {
  id: string;
  displayName: string;
  userName: string;
  complaint: string;
  createDate: string;
  onlineLated: string;
  status: boolean;
}

export interface ReportStatItem {
  hour?: number;
  date?: string;
  count: number;
}
