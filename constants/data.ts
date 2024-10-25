import { NavItem } from '@/types';

export type UserRole = 1 | 2 | 3;
export type UserPosition =
  | 'MD'
  | 'Director'
  | 'Account Manager'
  | 'Sales Manager'
  | 'Senior Engineers'
  | 'Junior Engineers'
  | 'Call Centre'
  | 'Operation Planning Team'
  | 'HR Team'
  | 'LD Team'
  | 'Admin Team'
  | 'Finance Executive'
  | 'Finance Manager'
  | 'Counsultant'
  | 'Developers'
  | 'Support Team'
  | 'IT Team';

// Extended NavItem type to include role-based access
interface RoleBasedNavItem extends NavItem {
  allowedRoles: UserRole[];
  disallowedPositions: UserPosition[];
}

interface UserAccess {
  role: UserRole;
  position: UserPosition;
}

export const navItems: RoleBasedNavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'user',
    label: 'Dashboard',
    allowedRoles: [1, 2, 3],
    disallowedPositions: []
  },
  {
    title: 'Staff',
    href: '/dashboard/staff',
    icon: 'contact2',
    label: 'Staff',
    allowedRoles: [1, 3],
    disallowedPositions: []
  },
  {
    title: 'Overview',
    href: '/dashboard/overview',
    icon: 'dashboard',
    label: 'overview',
    allowedRoles: [1],
    disallowedPositions: []
  },
  {
    title: 'Team',
    href: '/dashboard/teamschedule',
    icon: 'users',
    label: 'TeamSchedule',
    allowedRoles: [1, 2, 3],
    disallowedPositions: []
  },
  {
    title: 'Manager',
    href: '/dashboard/manager-team-schedule',
    icon: 'laptop',
    label: 'ManagerTeamSchedule',
    allowedRoles: [1, 3],
    disallowedPositions: ['HR Team']
  },
  {
    title: 'Logs',
    href: '/dashboard/logs',
    icon: 'clipboardlist',
    label: 'logs',
    allowedRoles: [1],
    disallowedPositions: []
  }
];

export function getAuthorizedNavItems(userAccess: UserAccess): NavItem[] {
  return navItems.filter((item) => {
    // First check if user's position is in the disallowed positions
    // If the user's position is disallowed, return false immediately
    if (
      userAccess.position &&
      item.disallowedPositions.includes(userAccess.position)
    ) {
      return false;
    }
    // If position is not disallowed, check if user has an allowed role
    return item.allowedRoles.includes(userAccess.role);
  });
}
