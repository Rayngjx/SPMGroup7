import { NavItem } from '@/types';

export type UserRole = 1 | 2 | 3;
export type UserDepartment =
  | 'CEO'
  | 'Sales'
  | 'Solutioning'
  | 'Engineering'
  | 'HR'
  | 'Finance'
  | 'Consultancy'
  | 'IT';

// Extended NavItem type to include role-based access
interface RoleBasedNavItem extends NavItem {
  allowedRoles: UserRole[];
  allowedDepartments: UserDepartment[];
}

interface UserAccess {
  role: UserRole;
  department: UserDepartment;
}

export const navItems: RoleBasedNavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    label: 'Dashboard',
    allowedRoles: [1, 2, 3],
    allowedDepartments: [
      'CEO',
      'Sales',
      'Solutioning',
      'Engineering',
      'HR',
      'Finance',
      'Consultancy',
      'IT'
    ]
  },
  {
    title: 'Staff',
    href: '/dashboard/staff',
    icon: 'contact2',
    label: 'Staff',
    allowedRoles: [1, 3],
    allowedDepartments: [
      'CEO',
      'Sales',
      'Solutioning',
      'Engineering',
      'HR',
      'Finance',
      'Consultancy',
      'IT'
    ]
  },
  {
    title: 'User',
    href: '/dashboard/user',
    icon: 'user',
    label: 'user',
    allowedRoles: [1, 2, 3],
    allowedDepartments: [
      'CEO',
      'Sales',
      'Solutioning',
      'Engineering',
      'HR',
      'Finance',
      'Consultancy',
      'IT'
    ]
  },
  {
    title: 'Team',
    href: '/dashboard/teamschedule',
    icon: 'users',
    label: 'TeamSchedule',
    allowedRoles: [1, 2, 3],
    allowedDepartments: [
      'CEO',
      'Sales',
      'Solutioning',
      'Engineering',
      'HR',
      'Finance',
      'Consultancy',
      'IT'
    ]
  },
  {
    title: 'Manager',
    href: '/dashboard/manager-team-schedule',
    icon: 'laptop',
    label: 'ManagerTeamSchedule',
    allowedRoles: [1, 3],
    allowedDepartments: [
      'CEO',
      'Sales',
      'Solutioning',
      'Engineering',
      'HR',
      'Finance',
      'Consultancy',
      'IT'
    ]
  },
  {
    title: 'Logs',
    href: '/dashboard/logs',
    icon: 'clipboardlist',
    label: 'logs',
    allowedRoles: [1],
    allowedDepartments: ['HR']
  }
];

export function getAuthorizedNavItems(userAccess: UserAccess): NavItem[] {
  return navItems.filter((item) => {
    // Check if user has an allowed role
    const hasAllowedRole = item.allowedRoles.includes(userAccess.role);

    // Special case for HR department
    const isHR = userAccess.department === 'HR';
    const isHRAllowed = isHR && item.allowedDepartments.includes('HR');

    // For HR specific pages (like Logs), allow access if:
    // 1. User has the required role OR
    // 2. User is from HR department AND the page allows HR
    // For all other pages, only check role permissions
    const isHRRestrictedPage =
      item.allowedDepartments.length === 1 &&
      item.allowedDepartments.includes('HR');

    if (isHRRestrictedPage) {
      return hasAllowedRole || isHRAllowed;
    } else {
      return hasAllowedRole;
    }
  });
}

// import { NavItem } from '@/types';

// export type UserRole = 1 | 2 | 3;

// // Extended NavItem type to include role-based access
// interface RoleBasedNavItem extends NavItem {
//   allowedRoles: UserRole[];
// }

// export const navItems: RoleBasedNavItem[] = [
//   {
//     title: 'Dashboard',
//     href: '/dashboard',
//     icon: 'dashboard',
//     label: 'Dashboard',
//     allowedRoles: [1, 2, 3],
//   },
//   {
//     title: 'Staff',
//     href: '/dashboard/staff',
//     icon: 'contact2',
//     label: 'Staff',
//     allowedRoles: [1, 3],

//   },
//   {
//     title: 'User',
//     href: '/dashboard/user',
//     icon: 'user',
//     label: 'user',
//     allowedRoles: [1, 2, 3],

//   },
//   {
//     title: 'Team',
//     href: '/dashboard/teamschedule',
//     icon: 'users',
//     label: 'TeamSchedule',
//     allowedRoles: [1, 2, 3],

//   },
//   {
//     title: 'Manager',
//     href: '/dashboard/manager-team-schedule',
//     icon: 'laptop',
//     label: 'ManagerTeamSchedule',
//     allowedRoles: [1, 3],

//   },
//   {
//     title: 'Logs',
//     href: '/dashboard/logs',
//     icon: 'clipboardlist',
//     label: 'logs',
//     allowedRoles: [1],

//   },
//   {
//     title: 'Logout',
//     href: '/',
//     icon: 'login',
//     label: 'login',
//     allowedRoles: [1, 2, 3],
//   }
// ];

// export function getAuthorizedNavItems(userRole: UserRole): NavItem[] {
//   return navItems.filter((item) => item.allowedRoles.includes(userRole));
// }
