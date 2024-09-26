export interface Employee {
    staff_id: number;
    staff_fname: string;
    staff_lname: string;
    dept_id: number | null;
    position: string | null;
    email: string | null;
    reporting_manager: number | null;
  }
  
  export interface ApprovedDate {
    staff_id: number;
    request_id: number;
    date: string;
    users: Employee;
  }
  
  export interface DatabaseApprovedDate {
    staff_id: number;
    request_id: number;
    date: Date;
    users: Employee;
  }
  