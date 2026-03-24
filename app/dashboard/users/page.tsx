"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosClient from "@/lib/axiosClient";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import Image from "next/image";
import {
  Trash2,
  Shield,
  ShieldCheck,
  Loader2,
  Users,
  Pencil,
  Search,
  X,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

type UserStatus = "pending" | "active" | "rejected";

interface UserProfile {
  id: string;
  nama: string;
  email: string;
  role: "admin" | "client";
  avatar_url: string | null;
  status: UserStatus;
  created_at: string;
}

type FilterTab = "all" | UserStatus;

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // State untuk edit user
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editNama, setEditNama] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "client">("client");
  const [newStatus, setNewStatus] = useState<UserStatus>("pending");
  const [editLoading, setEditLoading] = useState(false);

  // State untuk delete
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setCurrentUserId(user.id);
      fetchUsers();
    };
    init();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Gagal memuat daftar user");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setEditNama(user.nama);
    setNewRole(user.role);
    setNewStatus(user.status);
    setEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    setEditLoading(true);
    try {
      await axiosClient.patch(`/users/${selectedUser.id}`, {
        nama: editNama,
        role: newRole,
        status: newStatus,
      });
      toast.success(`User ${editNama} berhasil diperbarui`);
      setEditDialog(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Gagal memperbarui user";
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteDialog = (user: UserProfile) => {
    setUserToDelete(user);
    setDeleteDialog(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await axiosClient.delete(`/users/${userToDelete.id}`);
      toast.success(`User ${userToDelete.nama} berhasil dihapus`);
      setDeleteDialog(false);
      fetchUsers();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data
          ?.error || "Gagal menghapus user";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge
            className="bg-green-500/15 text-green-600 border-green-500/30 hover:bg-green-500/20 gap-1"
            variant="outline"
          >
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        );
      case "pending":
        return (
          <Badge
            className="bg-amber-500/15 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 gap-1"
            variant="outline"
          >
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20 gap-1"
            variant="outline"
          >
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
    }
  };

  const filteredUsers =
    activeTab === "all" ? users : users.filter((u) => u.status === activeTab);
  const pendingCount = users.filter((u) => u.status === "pending").length;

  const columns: ColumnDef<UserProfile>[] = [
    {
      accessorKey: "nama",
      header: "Nama",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {u.avatar_url ? (
                <Image
                  src={u.avatar_url}
                  alt={u.nama}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {u.nama?.charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-foreground truncate">
                {u.nama}
              </span>
              {u.id === currentUserId && (
                <Badge variant="outline" className="text-xs shrink-0">
                  Anda
                </Badge>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.getValue("email")}
        </span>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <Badge
            className={
              role === "admin"
                ? "bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
                : "bg-muted text-muted-foreground border-border hover:bg-muted"
            }
            variant="outline"
          >
            {role === "admin" ? (
              <ShieldCheck className="h-3 w-3 mr-1" />
            ) : (
              <Shield className="h-3 w-3 mr-1" />
            )}
            {role}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("status") as UserStatus),
    },
    {
      accessorKey: "created_at",
      header: "Bergabung",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {formatDate(row.getValue("created_at"))}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Aksi</div>,
      size: 100,
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentUserId;
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditDialog(u)}
              disabled={isSelf}
              className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openDeleteDialog(u)}
              disabled={isSelf}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter },
    defaultColumn: {
      minSize: 0,
      size: Number.MAX_SAFE_INTEGER,
      maxSize: Number.MAX_SAFE_INTEGER,
    },
  });

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Pending" },
    { key: "active", label: "Active" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-2 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Users
          </h1>
          <p className="text-muted-foreground">
            Kelola semua pengguna yang terdaftar di sistem
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total User</p>
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.status === "active").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-destructive">
            {users.filter((u) => u.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="space-y-3">
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
                activeTab === tab.key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.key === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex p-4 bg-card border border-border rounded-lg shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 pr-10 h-10 bg-input border-border focus:border-primary focus:ring-primary/20"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 bg-card border border-border rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Memuat data...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-4">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="border-b-2 border-border bg-muted/30 hover:bg-muted/30"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-foreground/80 font-semibold h-14 text-xs uppercase tracking-wider"
                          style={{
                            width:
                              header.getSize() !== Number.MAX_SAFE_INTEGER
                                ? header.getSize()
                                : undefined,
                          }}
                        >
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
                        className="border-b border-border hover:bg-muted/30 transition-colors duration-150"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="py-4"
                            style={{
                              width:
                                cell.column.getSize() !==
                                Number.MAX_SAFE_INTEGER
                                  ? cell.column.getSize()
                                  : undefined,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-base font-medium">
                            Tidak ada user ditemukan.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
              Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
              {table.getPageCount()}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 px-4 border-border hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 px-4 border-border hover:bg-primary/10 hover:text-primary hover:border-primary transition-colors"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Edit User */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="sm:max-w-[500px] border-border shadow-2xl bg-card">
          <DialogHeader className="space-y-2 pb-4">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Edit User
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Perbarui data pengguna
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateUser();
            }}
          >
            <div className="space-y-4 py-4">
              {/* Email - readonly */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Email
                </Label>
                <Input
                  value={selectedUser?.email || ""}
                  disabled
                  className="w-full h-11 px-3 py-2 bg-muted border-border text-muted-foreground leading-normal"
                />
              </div>

              {/* Nama */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-nama"
                  className="text-sm font-medium text-foreground"
                >
                  Nama <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-nama"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  required
                  className="w-full h-11 px-3 py-2 bg-input border-border focus:border-primary focus:ring-primary/20 leading-normal"
                  placeholder="Masukkan nama"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-role"
                  className="text-sm font-medium text-foreground"
                >
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newRole}
                  onValueChange={(v) => setNewRole(v as "admin" | "client")}
                >
                  <SelectTrigger
                    id="edit-role"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Client
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Admin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label
                  htmlFor="edit-status"
                  className="text-sm font-medium text-foreground"
                >
                  Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={newStatus}
                  onValueChange={(v) => setNewStatus(v as UserStatus)}
                >
                  <SelectTrigger
                    id="edit-status"
                    className="w-full h-11 px-3 py-2 bg-input border-border leading-normal"
                  >
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" /> Pending
                      </div>
                    </SelectItem>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />{" "}
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />{" "}
                        Rejected
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialog(false)}
                className="flex-1 h-11 border-border hover:bg-secondary"
                disabled={editLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="flex-1 h-11 bg-primary hover:bg-primary/90 text-white font-medium shadow-md"
              >
                {editLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </div>
                ) : (
                  "Simpan"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-muted-foreground text-sm">
              Apakah Anda yakin ingin menghapus user ini? Semua data milik user
              akan ikut terhapus dan <strong>tidak bisa dikembalikan</strong>.
            </p>
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="font-medium text-foreground">
                {userToDelete?.nama}
              </p>
              <p className="text-sm text-muted-foreground">
                {userToDelete?.email}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleteLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
