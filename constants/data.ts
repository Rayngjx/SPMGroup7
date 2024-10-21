import { NavItem } from '@/types';

export type UserRole = 1 | 2 | 3;

// Extended NavItem type to include role-based access
interface RoleBasedNavItem extends NavItem {
  allowedRoles: UserRole[];
}

export const navItems: RoleBasedNavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    allowedRoles: [1, 2, 3]
  },
  {
    title: 'Staff',
    href: '/dashboard/staff',
    icon: 'contact2',
    label: 'Staff',
    allowedRoles: [1, 3]
  },
  {
    title: 'User',
    href: '/dashboard/user',
    icon: 'user',
    label: 'user',
    allowedRoles: [1, 2, 3]
  },
  {
    title: 'Team',
    href: '/dashboard/teamschedule',
    icon: 'users',
    label: 'TeamSchedule',
    allowedRoles: [1, 2, 3]
  },
  {
    title: 'Manager',
    href: '/dashboard/manager-team-schedule',
    icon: 'laptop',
    label: 'ManagerTeamSchedule',
    allowedRoles: [1, 3]
  },
  {
    title: 'Logs',
    href: '/dashboard/logs',
    icon: 'clipboardlist',
    label: 'logs',
    allowedRoles: [1]
  },
  {
    title: 'Logout',
    href: '/',
    icon: 'login',
    label: 'login',
    allowedRoles: [1, 2, 3]
  }
];

export function getAuthorizedNavItems(userRole: UserRole): NavItem[] {
  return navItems.filter((item) => item.allowedRoles.includes(userRole));
}

// {
//   title: 'Employee',
//   href: '/dashboard/employee',
//   icon: 'employee',
//   label: 'employee'
// },
// {
//   title: 'Profile',
//   href: '/dashboard/profile',
//   icon: 'profile',
//   label: 'profile'
// },
// {
//   title: 'Kanban',
//   href: '/dashboard/kanban',
//   icon: 'kanban',
//   label: 'kanban'
// },

// export type User = {
//   id: number;
//   name: string;
//   company: string;
//   role: string;
//   verified: boolean;
//   status: string;
// };
// export const users: User[] = [
//   {
//     id: 1,
//     name: 'Candice Schiner',
//     company: 'Dell',
//     role: 'Frontend Developer',
//     verified: false,
//     status: 'Active'
//   },
//   {
//     id: 2,
//     name: 'John Doe',
//     company: 'TechCorp',
//     role: 'Backend Developer',
//     verified: true,
//     status: 'Active'
//   },
//   {
//     id: 3,
//     name: 'Alice Johnson',
//     company: 'WebTech',
//     role: 'UI Designer',
//     verified: true,
//     status: 'Active'
//   },
//   {
//     id: 4,
//     name: 'David Smith',
//     company: 'Innovate Inc.',
//     role: 'Fullstack Developer',
//     verified: false,
//     status: 'Inactive'
//   },
//   {
//     id: 5,
//     name: 'Emma Wilson',
//     company: 'TechGuru',
//     role: 'Product Manager',
//     verified: true,
//     status: 'Active'
//   },
//   {
//     id: 6,
//     name: 'James Brown',
//     company: 'CodeGenius',
//     role: 'QA Engineer',
//     verified: false,
//     status: 'Active'
//   },
//   {
//     id: 7,
//     name: 'Laura White',
//     company: 'SoftWorks',
//     role: 'UX Designer',
//     verified: true,
//     status: 'Active'
//   },
//   {
//     id: 8,
//     name: 'Michael Lee',
//     company: 'DevCraft',
//     role: 'DevOps Engineer',
//     verified: false,
//     status: 'Active'
//   },
//   {
//     id: 9,
//     name: 'Olivia Green',
//     company: 'WebSolutions',
//     role: 'Frontend Developer',
//     verified: true,
//     status: 'Active'
//   },
//   {
//     id: 10,
//     name: 'Robert Taylor',
//     company: 'DataTech',
//     role: 'Data Analyst',
//     verified: false,
//     status: 'Active'
//   }
// ];

// export type Employee = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
//   gender: string;
//   date_of_birth: string; // Consider using a proper date type if possible
//   street: string;
//   city: string;
//   state: string;
//   country: string;
//   zipcode: string;
//   longitude?: number; // Optional field
//   latitude?: number; // Optional field
//   job: string;
//   profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
// };
