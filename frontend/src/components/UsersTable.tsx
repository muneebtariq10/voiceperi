import { useState, useMemo } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronsUpDown, Pencil, Trash } from "lucide-react";
import { Popup } from "./updateuser.tsx";
import { toast } from "sonner";
import { Input } from "./ui/input.tsx";
import TooltipWrapper from "./TooltipWrapper.tsx";
import { AppUser } from "@/AppContext.tsx";
import type { UserData } from "@/dashboard/Users.tsx";
import { FilterDropdown } from "./ui/filterdropdown.tsx";

export function UsersTable({
  userData,
  setUsers,
}: {
  userData: UserData[];
  setUsers: React.Dispatch<React.SetStateAction<UserData[]>>;
}) {
  const { user } = AppUser();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<UserData | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedRow, setSelectedRow] = useState<UserData | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  // const [userNameFilter, setUserNameFilter] = useState("");
  const [agentNameFilter, setAgentNameFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState(""); // ""
  const [statusFilter, setStatusFilter] = useState("");

  // const uniqueUserNames = useMemo(() => {
  //   const names = new Set<string>();
  //   userData.forEach((u) =>
  //     names.add(`${u.firstname || ""} ${u.lastname || ""}`.trim())
  //   );
  //   return Array.from(names);
  // }, [userData]);

  const uniqueAgentNames = useMemo(() => {
    const names = new Set<string>();
    userData.forEach((u) => u.agent?.forEach((a) => names.add(a.agent_name)));
    return Array.from(names);
  }, [userData]);

  const pageSize = 17;

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");

  const handleLoginAs = async (userId: string | number) => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}api/auth/login-as`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to login as user");
      }

      const loginUrl = data.url;
      window.open(loginUrl, "_blank");
    } catch (err) {
      console.error("Login As failed:", err);
      toast.error("Login As failed");
    }
  };

  // const filteredUserData = useMemo(() => {
  //   if (!globalFilter) return userData;

  //   const search = globalFilter.toLowerCase();

  //   return userData.filter((user) => {
  //     const { firstname, lastname, email, status, verified, agent, info } =
  //       user;

  //     const agentNames =
  //       agent?.map((a) => a.agent_name.toLowerCase()).join(" ") ?? "";
  //     const infoNames = info?.map((i) => i.name.toLowerCase()).join(" ") ?? "";

  //     return (
  //       (firstname?.toLowerCase() ?? "").includes(search) ||
  //       (lastname?.toLowerCase() ?? "").includes(search) ||
  //       (email?.toLowerCase() ?? "").includes(search) ||
  //       (status === 1 ? "active" : "inactive").includes(search) ||
  //       (verified === 1 ? "verified" : "not verified").includes(search) ||
  //       agentNames.includes(search) ||
  //       infoNames.includes(search)
  //     );
  //   });
  // }, [userData, globalFilter]);
  const filteredUserData = useMemo(() => {
    let filtered = userData;

    const search = globalFilter.toLowerCase();

    if (globalFilter) {
      filtered = filtered.filter((user) => {
        const { firstname, lastname, email, status, verified, agent, info } =
          user;

        const agentNames =
          agent?.map((a) => a.agent_name.toLowerCase()).join(" ") ?? "";
        const infoNames =
          info?.map((i) => i.name.toLowerCase()).join(" ") ?? "";

        return (
          (firstname?.toLowerCase() ?? "").includes(search) ||
          (lastname?.toLowerCase() ?? "").includes(search) ||
          (email?.toLowerCase() ?? "").includes(search) ||
          (status === 1 ? "active" : "inactive").includes(search) ||
          (verified === 1 ? "verified" : "not verified").includes(search) ||
          agentNames.includes(search) ||
          infoNames.includes(search)
        );
      });
    }

    // if (userNameFilter) {
    //   filtered = filtered.filter(
    //     (u) =>
    //       `${u.firstname || ""} ${u.lastname || ""}`.trim() === userNameFilter
    //   );
    // }

    if (agentNameFilter) {
      filtered = filtered.filter((u) =>
        u.agent?.some((a) => a.agent_name === agentNameFilter)
      );
    }
    if (verifiedFilter) {
      const isVerified = verifiedFilter === "verified";
      filtered = filtered.filter((u) => u.verified === (isVerified ? 1 : 0));
    }
    if (statusFilter) {
      const isActive = statusFilter === "active";
      filtered = filtered.filter((u) => u.status === (isActive ? 1 : 0));
    }
    return filtered;
  }, [userData, globalFilter, agentNameFilter, verifiedFilter, statusFilter]);
  // userNameFilter,

  const columns: ColumnDef<UserData>[] = [
    {
      id: "rowNumber",
      header: "#No",
      cell: ({ row }) => (
        <div className="text-[16px] font-[500]">
          {row.index + 1 + pageIndex * pageSize}
        </div>
      ),
    },
    ...[
      "firstname",
      "lastname",
      "email",
      "status",
      "verified",
      "createdAt",
    ].map((key) => ({
      accessorKey: key,
      header: ({ column }: any) => (
        <div
          className="w-full flex items-center justify-between cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <span className="text-lg font-medium">
            {key.charAt(0).toUpperCase() +
              key.slice(1).replace(/([A-Z])/g, " $1")}
          </span>
          <ChevronsUpDown className="h-[13px] w-[13px] ml-1" />
        </div>
      ),
      cell: ({ row }: any) => {
        const value = row.getValue(key);
        if (key === "status")
          return (
            <div className="text-[16px] font-[500]">
              {value === 1 ? "Active" : "Inactive"}
            </div>
          );
        if (key === "verified")
          return (
            <div className="text-[16px] font-[500]">
              {value === 1 ? "Verified" : "Not Verified"}
            </div>
          );
        if (key === "createdAt") {
          const formatted = new Date(value).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
          return <div className="text-[16px] font-[500]">{formatted}</div>;
        }
        return <div className="text-[16px] font-[500]">{value}</div>;
      },
    })),
    {
      id: "agentName",
      header: "Agent Name",
      cell: ({ row }) => {
        const agentNames = row.original.agent
          .map((a) => a.agent_name)
          .join(", ");
        return (
          <div className="text-[16px] font-[500]">{agentNames || "N/A"}</div>
        );
      },
    },
    {
      id: "infoName",
      header: "Business Info Name",
      cell: ({ row }) => {
        const infoNames = row.original.info.map((i) => i.name).join(", ");
        const truncated =
          infoNames.length > 30 ? `${infoNames.slice(0, 30)}...` : infoNames;
        return (
          <TooltipWrapper tooltipText={infoNames}>
            <div className="text-[16px] font-[500] truncate max-w-[200px] cursor-pointer">
              {truncated || "N/A"}
            </div>
          </TooltipWrapper>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Pencil
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRow(row.original);
              setPopupOpen(true);
            }}
            className="w-[40px] h-[30px] py-[5px] rounded-[5px] hover:bg-blue-200 text-blue-600 hover:underline cursor-pointer"
          />
          {user?.id !== String(row?.original?.id) && (
            <Trash
              onClick={(e) => {
                e.stopPropagation();
                setRowToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
              className="w-[40px] h-[30px] py-[5px] rounded-[5px] hover:bg-red-200 text-red-600 hover:underline cursor-pointer"
            />
          )}
        </div>
      ),
    },
    {
      id: "loginas",
      header: "LogIn As",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {/* Edit Button */}

          {/* Delete Button */}

          {/* ✅ Login As Button (admin only) */}
          {user?.role === "admin" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLoginAs(row.original.id);
              }}
              className="text-sm px-3 py-1 bg-[#bfe2e3] text-[#46a79d] rounded hover:bg-[#bfe2e3]-200 font-semibold"
            >
              Login As
            </button>
          )}
        </div>
      ),
    },
  ];

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredUserData.slice(start, start + pageSize);
  }, [filteredUserData, pageIndex, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: Math.ceil(filteredUserData.length / pageSize),
    state: { sorting },
  });

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}api/users/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to delete user with id ${id}`);

      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  }

  return (
    <div className="flex flex-col px-[16px] md:px-7 bg-[#fafafb] col-7">
      <div className="flex flex-col md:flex-row justify-between items-center py-6 gap-x-2 md:row-gap-4">
        <div className="w-full flex flex-row md:flex-col justify-between md:justify-center items-start mb-[10px] md:mb-0 gap-y-3">
          <h3 className="text-2xl font-semibold text-primary">Users</h3>
          <p className="text-sm font-medium text-default-gray">
            Details of all the Users
          </p>
        </div>

        <Input
          placeholder="Search email , name, status or agent..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            setPageIndex(0); // ⬅️ reset to first page
          }}
          className="max-w-sm"
        />
        {/* <FilterDropdown
          options={uniqueUserNames}
          selectedValue={userNameFilter}
          setSelectedValue={(val) => {
            setUserNameFilter(val);
            setPageIndex(0);
          }}
          placeholder="Filter by user..."
        /> */}
        <FilterDropdown
          options={["verified", "not verified"]}
          selectedValue={verifiedFilter}
          setSelectedValue={(val) => {
            setVerifiedFilter(val);
            setPageIndex(0); // reset to first page
          }}
          placeholder="Filter by verification..."
        />
        <FilterDropdown
          options={["active", "inactive"]}
          selectedValue={statusFilter}
          setSelectedValue={(val) => {
            setStatusFilter(val);
            setPageIndex(0); // reset to first page
          }}
          placeholder="Filter by status..."
        />
        <FilterDropdown
          options={uniqueAgentNames}
          selectedValue={agentNameFilter}
          setSelectedValue={(val) => {
            setAgentNameFilter(val);
            setPageIndex(0);
          }}
          placeholder="Filter by agent..."
        />
      </div>

      <div className="border rounded-[12px] mb-[90px] ">
        <Table className="overflow-x-auto w-full">
          <TableHeader>
            <TableRow className="whitespace-nowrap w-full">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer pl-4 py-2 text-left whitespace-nowrap text-lg text-primary font-medium"
                  >
                    <span>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                  </TableHead>
                ))
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-[18.5px] py-[14px] text-left text-default-gray text-lg font-medium"
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
                  className="text-center py-4"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {rowToDelete && (
          <AlertDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete user{" "}
                  <strong>{rowToDelete.email}</strong>?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    handleDelete(rowToDelete.id, e);
                    setDeleteDialogOpen(false);
                  }}
                >
                  Yes, Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <div className="flex justify-between items-center p-5 border-y border-[#E0E1E4]">
          <span className="text-sm font-medium text-primary">
            Page {pageIndex + 1}
          </span>
          <div className="flex items-center justify-between space-x-2">
            <button
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
              className="px-2 py-1 text-2xl text-primary disabled:text-gray-400"
            >
              &lt;
            </button>
            <div className="flex space-x-2">
              {Array.from({
                length: Math.ceil(filteredUserData.length / pageSize),
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPageIndex(index)}
                  className={`px-3 py-1.5 font-semibold text-sm rounded-[8px] transition-all duration-200 ${
                    index === pageIndex
                      ? "border border-[#46a79d] text-[#46a79d] font-bold"
                      : "text-primary"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setPageIndex((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredUserData.length / pageSize) - 1
                  )
                )
              }
              disabled={
                pageIndex === Math.ceil(filteredUserData.length / pageSize) - 1
              }
              className="px-2 py-1 text-2xl text-primary disabled:text-gray-400"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {selectedRow && (
        <Popup
          isOpen={isPopupOpen}
          onClose={() => setPopupOpen(false)}
          selectedRow={{
            ...selectedRow!,
            id: String(selectedRow!.id),
          }}
          onSubmit={(updatedUser: UserData) => {
            setPopupOpen(false);
            setUsers((prev) => {
              const withoutUpdated = prev.filter(
                (u) => u.id !== updatedUser.id
              );
              return [updatedUser, ...withoutUpdated];
            });
          }}
        />
      )}
    </div>
  );
}
