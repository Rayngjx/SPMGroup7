'use client';

import * as React from 'react';
import { MoreHorizontal, UserPlus, Trash2, Search } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';
import { role } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

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

export default function Component_Roles({ dataRoles }: { dataRoles: any }) {
  const [newRole, setNewRole] = React.useState({ name: '' });
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [roleToDelete, setRoleToDelete] = React.useState<role | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [roleToEdit, setRoleToEdit] = React.useState<role | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const router = useRouter();

  React.useEffect(() => {
    if (roleToEdit) {
      setNewRole({ name: roleToEdit.role_title }); // Prefill the role name
    } else {
      setNewRole({ name: '' }); // Reset the field when adding a new role
    }
  }, [roleToEdit]);

  const handleAddRole = async () => {
    if (newRole.name) {
      try {
        const res = await fetch('https://spm-group7.vercel.app/api/roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role_title: newRole.name })
        });

        // const data = await res.json();
        // console.log('Response:', data);

        if (res.ok) {
          setNewRole({ name: '' });
          setIsAddUserDialogOpen(false);
          toast.success('Role has been added', {
            icon: <AnimatedIcon icon={UserPlus} color="text-green-500" />
          });
        } else {
          toast.error('Failed to create role', {
            icon: <AnimatedIcon icon={UserPlus} color="text-red-500" />
          });
        }
      } catch (error) {
        toast.success('Error occurred while creating roled', {
          icon: <AnimatedIcon icon={UserPlus} color="text-green-500" />
        });
      } finally {
        router.refresh();
      }
    }
  };

  const handleEditRole = async () => {
    if (newRole.name && roleToEdit) {
      try {
        console.log('Role to edit:', newRole.name);
        const res = await fetch(`/api/roles`, {
          method: 'PUT', // PUT method for updating an existing role
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role_id: roleToEdit.role_id,
            role_title: newRole.name
          })
        });

        // const data = await res.json();
        // console.log('Response:', data);

        if (res.ok) {
          setNewRole({ name: '' });
          setRoleToEdit(null); // Clear the edit state
          setIsEditDialogOpen(false); // Close the dialog
          toast.success('Role has been updated', {
            icon: <AnimatedIcon icon={UserPlus} color="text-green-500" />
          });
        } else {
          toast.error('Failed to update role', {
            icon: <AnimatedIcon icon={UserPlus} color="text-red-500" />
          });
        }
      } catch (error) {
        toast.error('Error occurred while updating role', {
          icon: <AnimatedIcon icon={UserPlus} color="text-red-500" />
        });
      } finally {
        router.refresh(); // Refresh data after editing
      }
    }
  };

  const handleDeleteRole = (role: role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (roleToDelete) {
      try {
        const res = await fetch(`/api/roles?role_id=${roleToDelete.role_id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          setIsDeleteDialogOpen(false);
          toast.success(
            `${roleToDelete.role_title} has been removed from the workspace.`,
            {
              icon: <AnimatedIcon icon={Trash2} color="text-red-500" />
            }
          );
        } else {
          toast.error('Failed to delete role', {
            icon: <AnimatedIcon icon={Trash2} color="text-red-500" />
          });
        }
      } catch (error) {
        toast.error('Error occurred while deleting role', {
          icon: <AnimatedIcon icon={Trash2} color="text-red-500" />
        });
      } finally {
        router.refresh();
      }
    }
  };

  const filteredRoles = dataRoles.filter(
    (role: role) =>
      role.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.role_id.toString().includes(searchQuery)
  );

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="mb-4">
          {/* <TabsTrigger value="general">General</TabsTrigger> */}
          {/* <TabsTrigger value="billing">Billing & Usage</TabsTrigger> */}
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="roles">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                {/* <h1 className="text-3xl font-bold">Team Members</h1>
                <p className="text-muted-foreground mt-1">Add or remove team members to collaborate.</p> */}
              </div>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setIsAddUserDialogOpen(true);
                }}
              >
                <UserPlus className="mr-2 h-4 w-4" /> {'Add Roles'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Role List</h2>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[250px] pl-8"
                />
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role: role) => (
                    <TableRow key={role.role_id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="mr-2 h-8 w-8">
                            <AvatarFallback>{role.role_id}</AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Badge
                            variant="outline"
                            className={cn('px-2 py-1 text-sm font-normal')}
                          >
                            {role.role_title}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setRoleToEdit(role);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteRole(role)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete user
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* CREATE AND EDIT DIALOG */}
      <Dialog
        open={isAddUserDialogOpen || isEditDialogOpen}
        onOpenChange={() => {
          setIsAddUserDialogOpen(false);
          setIsEditDialogOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {roleToEdit ? 'Edit Role' : 'Add new role'}
            </DialogTitle>
            <DialogDescription>
              {roleToEdit ? 'Edit the role name' : 'Enter the name of the role'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={roleToEdit ? handleEditRole : handleAddRole}>
              {roleToEdit ? 'Update role' : 'Add role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be
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
            <Button variant="destructive" onClick={confirmDeleteRole}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster toastOptions={{}} richColors />
    </div>
  );
}
