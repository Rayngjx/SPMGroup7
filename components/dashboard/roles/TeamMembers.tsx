'use client';

import * as React from 'react';
import {
  ChevronsUpDown,
  UserPlus,
  Trash2,
  Search,
  Shield,
  CreditCard,
  Code,
  Eye,
  Bell,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast, Toaster } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  avatarUrl: string;
}

const roles = [
  {
    value: 'owner',
    label: 'Owner',
    description: 'Admin-level access to all resources.',
    icon: Shield,
    color: 'bg-red-100 text-red-800'
  },
  {
    value: 'billing',
    label: 'Billing',
    description: 'Can view, comment and manage billing.',
    icon: CreditCard,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    value: 'developer',
    label: 'Developer',
    description: 'Can view, comment and edit.',
    icon: Code,
    color: 'bg-green-100 text-green-800'
  },
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can view and comment.',
    icon: Eye,
    color: 'bg-blue-100 text-blue-800'
  }
];

// Extended dummy data to simulate 30 users
const databaseUsers: User[] = Array(30)
  .fill(null)
  .map((_, index) => ({
    id: `${index + 1}`,
    name: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)].value,
    initials: `U${index + 1}`,
    avatarUrl: `https://i.pravatar.cc/150?img=${index + 1}`
  }));

const AnimatedIcon = ({
  icon: Icon,
  color
}: {
  icon: React.ElementType;
  color: string;
}) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{
      type: 'spring',
      stiffness: 260,
      damping: 20
    }}
  >
    <Icon className={`h-5 w-5 ${color}`} />
  </motion.div>
);

export function TeamMembers() {
  const [users, setUsers] = React.useState<User[]>(databaseUsers);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
  const [userToEdit, setUserToEdit] = React.useState<User | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [addUserSearch, setAddUserSearch] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<string>('viewer');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof User;
    direction: 'ascending' | 'descending';
  } | null>(null);
  const [roleFilter, setRoleFilter] = React.useState<string[]>([]);

  const roleCount = React.useMemo(() => {
    return roles.reduce(
      (acc, role) => {
        acc[role.value] = users.filter((u) => u.role === role.value).length;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [users]);

  const handleAddUser = () => {
    if (selectedUser) {
      const newUser = { ...selectedUser, role: selectedRole };
      if (!users.some((u) => u.id === newUser.id)) {
        setUsers([...users, newUser]);
        setIsAddUserDialogOpen(false);
        setSelectedUser(null);
        setSelectedRole('viewer');
        toast.success(
          `${newUser.name} has been added to the team as ${roles.find(
            (r) => r.value === selectedRole
          )?.label}.`,
          {
            icon: <AnimatedIcon icon={UserPlus} color="text-green-500" />
          }
        );
      } else {
        toast.error(`${newUser.name} is already in the team.`, {
          icon: <AnimatedIcon icon={UserPlus} color="text-red-500" />
        });
      }
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setIsDeleteDialogOpen(false);
      toast.success(`${userToDelete.name} has been removed from the team.`, {
        icon: <AnimatedIcon icon={Trash2} color="text-red-500" />
      });
    }
  };

  const handleEditRole = (user: User) => {
    setUserToEdit(user);
    setSelectedRole(user.role);
    setIsEditRoleDialogOpen(true);
  };

  const confirmEditRole = () => {
    if (userToEdit) {
      setUsers(
        users.map((user) =>
          user.id === userToEdit.id ? { ...user, role: selectedRole } : user
        )
      );
      setIsEditRoleDialogOpen(false);
      toast.success(
        `${userToEdit.name}'s role has been updated to ${roles.find(
          (r) => r.value === selectedRole
        )?.label}.`,
        {
          icon: <AnimatedIcon icon={Bell} color="text-blue-500" />
        }
      );
    }
  };

  const handleSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  const filteredUsers = sortedUsers.filter(
    (user) =>
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (roleFilter.length === 0 || roleFilter.includes(user.role))
  );

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  const totalPages = Math.ceil(filteredUsers.length / 10);

  const filteredDatabaseUsers = databaseUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(addUserSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(addUserSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your team members and their roles.
          </p>
        </div>
        <Dialog
          open={isAddUserDialogOpen}
          onOpenChange={setIsAddUserDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="mr-2 h-4 w-4" /> Add user
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add user to team</DialogTitle>
              <DialogDescription>
                Search and select a user to add to your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!selectedUser ? (
                <Command className="rounded-lg border shadow-md">
                  <CommandInput
                    placeholder="Search users..."
                    value={addUserSearch}
                    onValueChange={setAddUserSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup heading="Users">
                      {filteredDatabaseUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => setSelectedUser(user)}
                          className="flex items-center space-x-2 py-2"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p>{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              ) : (
                <div className="flex items-center justify-between rounded-md bg-secondary p-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedUser.avatarUrl}
                        alt={selectedUser.name}
                      />
                      <AvatarFallback>{selectedUser.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedUser.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {selectedUser && (
                <div className="space-y-2">
                  <Label htmlFor="role-select">Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger id="role-select" className="w-full">
                      <SelectValue>
                        {selectedRole && (
                          <div className="flex items-center">
                            {React.createElement(
                              roles.find((r) => r.value === selectedRole)
                                ?.icon || 'div',
                              { className: 'mr-2 h-4 w-4' }
                            )}
                            <span>
                              {
                                roles.find((r) => r.value === selectedRole)
                                  ?.label
                              }
                            </span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center">
                            <role.icon className="mr-2 h-4 w-4" />
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-sm text-muted-foreground">
                                {role.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddUserDialogOpen(false);
                  setSelectedUser(null);
                  setSelectedRole('viewer');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={!selectedUser}>
                Add user
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger disabled>
              <Badge
                variant="outline"
                className="px-2 py-1 text-base font-semibold"
              >
                <Users className="mr-1 inline-block h-4 w-4" />
                Total Users: {users.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Total number of users in the team</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {roles.map((role) => (
          <TooltipProvider key={role.value}>
            <Tooltip>
              <TooltipTrigger>
                <Badge
                  variant="outline"
                  className={cn('px-2 py-1 text-sm font-normal', role.color)}
                >
                  <role.icon className="mr-1 inline-block h-4 w-4" />
                  {role.label}: {roleCount[role.value]}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{role.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start justify-between space-y-2 pb-2 sm:flex-row sm:items-center sm:space-y-0">
          <CardTitle className="text-xl font-semibold">User List</CardTitle>
          <div className="flex w-full flex-col space-y-2 sm:w-auto sm:flex-row sm:space-x-2 sm:space-y-0">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {roleFilter.length > 0 && (
                    <Badge variant="secondary" className="ml-2 px-1 py-0.5">
                      {roleFilter.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roles.map((role) => (
                  <DropdownMenuCheckboxItem
                    key={role.value}
                    checked={roleFilter.includes(role.value)}
                    onCheckedChange={(checked) => {
                      setRoleFilter(
                        checked
                          ? [...roleFilter, role.value]
                          : roleFilter.filter((item) => item !== role.value)
                      );
                    }}
                  >
                    {role.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    User{' '}
                    {sortConfig?.key === 'name' &&
                      (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    Role{' '}
                    {sortConfig?.key === 'role' &&
                      (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'px-2 py-1 text-xs font-normal',
                            roles.find((r) => r.value === user.role)?.color
                          )}
                        >
                          {/* <user.role.icon className="inline-block w-4 h-4 mr-1" /> */}
                          {React.createElement(
                            roles.find((r) => r.value === user.role)?.icon ||
                              'div',
                            { className: 'inline-block w-4 h-4 mr-1' }
                          )}

                          {roles.find((r) => r.value === user.role)?.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRole(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user role</DialogTitle>
            <DialogDescription>
              Change the role for {userToEdit?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full">
                <SelectValue>
                  {selectedRole && (
                    <div className="flex items-center">
                      {React.createElement(
                        roles.find((r) => r.value === selectedRole)?.icon ||
                          'div',
                        { className: 'mr-2 h-4 w-4' }
                      )}
                      <span>
                        {roles.find((r) => r.value === selectedRole)?.label}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center">
                      <role.icon className="mr-2 h-4 w-4" />
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {role.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmEditRole}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
