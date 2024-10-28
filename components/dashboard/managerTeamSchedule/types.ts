export interface User {
  staff_id: number;
  staff_fname: string;
  staff_lname: string;
  position: string;
  department: string;
  role_id: number;
  temp_replacement?: number;
}

export interface DelegationRequest {
  delegation_request: number;
  staff_id: number;
  delegated_to: number;
  status: string;
  created_at: string;
  users_delegation_requests_staff_idTousers: {
    staff_fname: string;
    staff_lname: string;
    department: string;
    position: string;
  };
}
