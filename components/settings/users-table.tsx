'use client'

import { format } from 'date-fns'
import { MoreHorizontal, Shield, UserX, UserCheck, Key } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoleBadge } from './role-badge'
import { ChangeRoleDialog } from './change-role-dialog'
import { RemoveUserDialog } from './remove-user-dialog'
import { useState } from 'react'

interface UsersTableProps {
  users: any[]
  currentUser: any
}

export function UsersTable({ users, currentUser }: UsersTableProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)

  const canManage = (user: any) => {
    if (user.id === currentUser.id) return false
    if (user.role === 'owner') return false // No one can remove/change owner

    const myRole = currentUser.app_metadata.role
    if (myRole === 'owner' || myRole === 'super_admin') return true
    if (myRole === 'admin' && (user.role === 'pharmacist' || user.role === 'cashier')) return true

    return false
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name}</span>
                        {user.id === currentUser.id && (
                          <Badge variant="secondary" className="text-[10px] h-4">You</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <span className="flex items-center gap-1.5 text-xs text-success font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                      Inactive
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(user.created_at), 'PP')}
                </TableCell>
                <TableCell className="text-right">
                  {canManage(user) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setIsRoleOpen(true)
                        }}>
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsRemoveOpen(true)
                          }}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <>
          <ChangeRoleDialog
            user={selectedUser}
            isOpen={isRoleOpen}
            onOpenChange={setIsRoleOpen}
          />
          <RemoveUserDialog
            user={selectedUser}
            isOpen={isRemoveOpen}
            onOpenChange={setIsRemoveOpen}
          />
        </>
      )}
    </>
  )
}
