export interface ApprovedDate {
  staff_id: number;
  request_id: number;
  date: Date;
}

export interface DelegationRequest {
  delegation_request: number;
  staff_id?: number;
  delegated_to?: number;
  approved?: string;
  date_range: Date[];
}

export interface Log {
  log_id: number;
  staff_id?: number;
  request_id: number;
  processor_id?: number;
  reason?: string;
  request_type: string;
  approved?: string;
}

export interface Request {
  request_id: number;
  staff_id?: number;
  timeslot?: string;
  dates: Date[];
  reason?: string;
  approved: string;
  document_url?: string;
}

export interface Role {
  role_id: number;
  role_title: string;
}

export interface User {
  staff_id: number;
  staff_fname: string;
  staff_lname: string;
  department: string;
  position: string;
  country: string;
  email?: string;
  reporting_manager?: number;
  role_id: number;
  temp_replacement?: number;
}

export interface WithdrawRequest {
  withdraw_request_id: number;
  staff_id?: number;
  timeslot?: string;
  date: Date;
  reason?: string;
  approved: string;
}

export interface WithdrawnDate {
  staff_id: number;
  withdraw_request_id: number;
  date: Date;
}
