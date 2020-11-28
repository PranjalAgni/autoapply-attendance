export interface AttendanceAPIResponse {
  status: string;
  error?: string;
}

export interface ICredentials {
  emailId: string;
  password: string;
}

export interface IAttendanceDetails {
  message: string;
  startDate: string;
  endDate: string;
}
