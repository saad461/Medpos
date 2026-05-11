'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MoreHorizontal,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface TenantTableProps {
  data: any[]
}

export function TenantTable({ data }: TenantTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Store",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-white">{row.getValue("name")}</span>
          <span className="text-[10px] font-mono text-white/40">{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: "owner_email",
      header: "Owner",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-white/80">{row.getValue("owner_email")}</span>
          <span className="text-[10px] text-white/40">{row.original.owner_phone || 'No phone'}</span>
        </div>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      cell: ({ row }) => (
        <Badge className={cn(
          "uppercase text-[10px] h-5",
          row.getValue("plan") === 'business' ? "bg-success" :
          row.getValue("plan") === 'professional' ? "bg-accent" :
          "bg-white/10 text-white/60"
        )}>
          {row.getValue("plan")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              status === 'active' ? "bg-success" :
              status === 'pending_admin_approval' ? "bg-warning" :
              status === 'suspended' ? "bg-danger" : "bg-white/20"
            )} />
            <span className={cn(
              "text-xs font-medium",
              status === 'active' ? "text-success" :
              status === 'pending_admin_approval' ? "text-warning" :
              status === 'suspended' ? "text-danger" : "text-white/40"
            )}>
              {status.replace(/_/g, ' ')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => (
        <span className="text-xs text-white/40">
          {new Date(row.getValue("created_at")).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tenant = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/5">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-white/40" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1E293B] border-white/10 text-white">
              <DropdownMenuLabel className="text-white/40 text-[10px] uppercase tracking-widest">Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/admin/tenants/${tenant.id}`} className="flex items-center gap-2 cursor-pointer">
                  <Eye className="h-3.5 w-3.5" /> View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white/40 cursor-not-allowed opacity-50">
                 Impersonate
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem className="text-danger focus:bg-danger/10 focus:text-danger cursor-pointer">
                Delete Tenant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
       pagination: {
          pageSize: 25,
       }
    }
  })

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-white/5 overflow-hidden shadow-xl">
      <Table>
        <TableHeader className="bg-white/[0.02]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-white/5">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-white/40 font-bold uppercase text-[10px] tracking-widest h-12">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-white/[0.02] border-white/5 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-white/20 font-medium">
                No stores found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/[0.01] border-t border-white/5">
        <p className="text-xs text-white/20 font-medium">
          Showing <span className="text-white/40">{table.getRowModel().rows.length}</span> of {data.length} stores
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 bg-transparent border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-20"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 bg-transparent border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-20"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
