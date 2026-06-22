import { useState, useMemo } from "react";
import { Popup } from "./detailpopup.tsx";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "./ui/input.tsx";
import { ChevronsUpDown } from "lucide-react";
import { FilterDropdown } from "./ui/filterdropdown.tsx";
type Data = {
  id: number;
  time: string;
  duration: string;
  cost: string;
  reason: string;
  status: string;
  sentiment: string;
  success: boolean;
  latency: string;
  transcription: { role: string; content: string; duration: string }[];
  summary?: string;
  recording_url?: string;
  agentName?: string;
  userEmail?: string;
  userFirstName?: string;
  userLastName?: string;
};

const getColumns = (userRole?: string): ColumnDef<Data>[] => {
  const renderHeader = (title: string, column: any) => (
    <div
      className="flex items-center gap-1 cursor-pointer"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      <ChevronsUpDown className="h-[14px] w-[14px] text-muted-foreground" />
    </div>
  );

  const commonColumns: ColumnDef<Data>[] = [
    {
      accessorKey: "time",
      header: ({ column }) => renderHeader("Time", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("time")}</div>
      ),
    },
    {
      accessorKey: "duration",
      header: ({ column }) => renderHeader("Duration", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("duration")}</div>
      ),
    },
    {
      accessorKey: "cost",
      header: ({ column }) => renderHeader("Cost", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("cost")}</div>
      ),
    },
    {
      accessorKey: "reason",
      header: ({ column }) => renderHeader("Reason", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("reason")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => renderHeader("Status", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("status")}</div>
      ),
    },
    {
      accessorKey: "sentiment",
      header: ({ column }) => renderHeader("Sentiment", column),
      cell: ({ getValue }) => {
        const sentiment = getValue<string>();
        const classes: Record<string, string> = {
          Positive: "bg-[#edffed]",
          Negative: "bg-[#ffeded]",
          Neutral: "bg-[#f8ffd8]",
        };
        return (
          <span
            className={`px-3 py-0.5 rounded-[40px] font-normal ${
              classes[sentiment] || "bg-gray-200"
            }`}
          >
            {sentiment}
          </span>
        );
      },
    },
    {
      accessorKey: "success",
      header: ({ column }) => renderHeader("Success", column),
      cell: ({ row }) => (
        <span className="text-lg font-normal">
          {row.getValue("success") ? "Successful" : "Unsuccessful"}
        </span>
      ),
    },
    {
      accessorKey: "latency",
      header: ({ column }) => renderHeader("Latency", column),
      cell: ({ row }) => (
        <div className="text-lg font-normal">{row.getValue("latency")}</div>
      ),
    },
  ];

  const adminColumns: ColumnDef<Data>[] = [
    {
      accessorKey: "agentName",
      header: ({ column }) => renderHeader("Agent Name", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("agentName")}</div>
      ),
    },
    {
      accessorKey: "userEmail",
      header: ({ column }) => renderHeader("User Email", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">{row.getValue("userEmail")}</div>
      ),
    },
    {
      accessorKey: "userFirstName",
      header: ({ column }) => renderHeader("First Name", column),
      cell: ({ row }) => (
        <div className="text-lg font-medium">
          {row.getValue("userFirstName")}
        </div>
      ),
    },
  ];

  return userRole === "admin"
    ? [...adminColumns, ...commonColumns]
    : commonColumns;
};

export function DataTable({
  callHistoryData,
  userRole,
}: {
  callHistoryData: Data[];
  userRole?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Data | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 17,
  });
  const [userNameFilter, setUserNameFilter] = useState("");
  const [agentNameFilter, setAgentNameFilter] = useState("");

  const uniqueUserNames = useMemo(() => {
    const names = callHistoryData.map((row) =>
      `${row.userFirstName ?? ""} ${row.userLastName ?? ""}`.trim()
    );
    return Array.from(new Set(names.filter((n) => n)));
  }, [callHistoryData]);

  const uniqueAgentNames = useMemo(() => {
    const names = callHistoryData.map((row) => row.agentName ?? "");
    return Array.from(new Set(names.filter((n) => n)));
  }, [callHistoryData]);

  const columns = useMemo(() => getColumns(userRole), [userRole]);

  const handleClose = () => {
    setSelectedRow(null);
    setPopupOpen(false);
  };

  // const filteredData = useMemo(() => {
  //   if (!globalFilter) return callHistoryData;
  //   const search = globalFilter.toLowerCase();

  //   return callHistoryData.filter((row) =>
  //     [
  //       "time",
  //       "cost",
  //       "status",
  //       "sentiment",
  //       "success",
  //       "userFirstName",
  //       "userEmail",
  //       "agentName",
  //     ].some((key) => {
  //       const raw = row[key as keyof Data];
  //       if (key === "success") {
  //         return (raw ? "successful" : "unsuccessful").includes(search);
  //       }
  //       return String(raw ?? "")
  //         .toLowerCase()
  //         .includes(search);
  //     })
  //   );
  // }, [callHistoryData, globalFilter]);
  const filteredData = useMemo(() => {
    const search = globalFilter.toLowerCase();

    return callHistoryData.filter((row) => {
      const fullName = `${row.userFirstName ?? ""} ${
        row.userLastName ?? ""
      }`.toLowerCase();
      const agent = row.agentName?.toLowerCase() ?? "";

      const matchesSearch =
        !globalFilter ||
        [
          "time",
          "cost",
          "status",
          "sentiment",
          "success",
          "userFirstName",
          "userEmail",
          "agentName",
        ].some((key) => {
          const raw = row[key as keyof Data];
          if (key === "success") {
            return (raw ? "successful" : "unsuccessful").includes(search);
          }
          return String(raw ?? "")
            .toLowerCase()
            .includes(search);
        });

      const matchesUser =
        !userNameFilter || fullName === userNameFilter.toLowerCase();

      const matchesAgent =
        !agentNameFilter || agent === agentNameFilter.toLowerCase();

      return matchesSearch && matchesUser && matchesAgent;
    });
  }, [callHistoryData, globalFilter, userNameFilter, agentNameFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
  });

  const paginatedRows = table.getRowModel().rows;
  const totalPages = table.getPageCount();

  return (
    <div className="flex flex-col px-[16px] md:px-7 bg-[#fafafb]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-x-2 py-6">
        <div className="w-full flex flex-row md:flex-col justify-between md:justify-center items-start mb-[10px] md:mb-0 gap-y-3">
          <h3 className="text-2xl font-semibold text-primary">Call History</h3>
          <p className="text-sm font-medium text-default-gray">
            Details of all the calls
          </p>
        </div>

        {/* <Input
          placeholder={
            userRole === "admin"
              ? "Search email, agent, first name, time, cost, sentiment, status..."
              : "Search time, cost, reason, status, sentiment..."
          }
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        /> */}
        {/* <div className="flex flex-wrap gap-3 items-center">
          <div>
            <select
              value={userNameFilter}
              onChange={(e) => {
                setUserNameFilter(e.target.value);
                table.setPageIndex(0);
              }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">All Users</option>
              {uniqueUserNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={agentNameFilter}
              onChange={(e) => {
                setAgentNameFilter(e.target.value);
                table.setPageIndex(0);
              }}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="">All Agents</option>
              {uniqueAgentNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <Input
          placeholder={
            userRole === "admin"
              ? "Search email, agent, first name, time, cost, sentiment, status..."
              : "Search time, cost, reason, status, sentiment..."
          }
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        /> */}

        <Input
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => {
            setGlobalFilter(e.target.value);
            table.setPageIndex(0);
          }}
          className="max-w-sm"
        />

        {userRole === "admin" && (
          <>
            <FilterDropdown
              options={uniqueUserNames}
              selectedValue={userNameFilter}
              setSelectedValue={(val) => {
                setUserNameFilter(val);
                table.setPageIndex(0);
              }}
              placeholder="Filter by user..."
            />

            <FilterDropdown
              options={uniqueAgentNames}
              selectedValue={agentNameFilter}
              setSelectedValue={(val) => {
                setAgentNameFilter(val);
                table.setPageIndex(0);
              }}
              placeholder="Filter by agent..."
            />
          </>
        )}
      </div>

      <div className="w-full overflow-x-hidden">
        <div className="border overflow-x-auto rounded-[12px] mb-[90px]">
          <Table>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="cursor-pointer pl-4 py-2 text-left whitespace-nowrap text-lg text-primary font-medium"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, index) => (
                  <TableRow
                    key={index}
                    onClick={() => {
                      setSelectedRow(row.original);
                      setPopupOpen(true);
                    }}
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

          {/* Pagination Controls */}
          <div className="flex justify-between items-center p-5 border-y border-[#E0E1E4]">
            <span className="text-sm font-medium text-primary">
              Page {table.getState().pagination.pageIndex + 1}
            </span>
            <div className="flex items-center justify-between space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2 py-1 text-2xl text-primary disabled:text-gray-400"
              >
                &lt;
              </button>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => table.setPageIndex(index)}
                    className={`px-3 py-1.5 font-semibold text-sm rounded-[8px] transition-all duration-200 ${
                      index === table.getState().pagination.pageIndex
                        ? "border border-[#46a79d] text-[#46a79d] font-bold"
                        : "text-primary"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2 py-1 text-2xl text-primary disabled:text-gray-400"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedRow && (
        <Popup
          isOpen={isPopupOpen}
          onClose={handleClose}
          selectedRow={selectedRow}
        />
      )}
    </div>
  );
}
