import { useState, ReactNode, useMemo } from "react";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";

type GenericTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  subtitle?: string;
  searchKeys?: (keyof TData)[];
  popupComponent?: (row: TData, onClose: () => void) => ReactNode;
};

export function GenericDataTable<TData>({
  data,
  columns,
  title = "Data Table",
  subtitle = "Detailed view",
  searchKeys,
  popupComponent,
}: GenericTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedRow, setSelectedRow] = useState<TData | null>(null);
  const [isPopupOpen, setPopupOpen] = useState(false);

  const pageSize = 17;

  const filteredData = useMemo(() => {
    if (!globalFilter || !searchKeys || searchKeys.length === 0) return data;

    const lower = globalFilter.toLowerCase();

    return data.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        return typeof value === "string" && value.toLowerCase().includes(lower);
      })
    );
  }, [data, globalFilter, searchKeys]);

  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleClose = () => {
    setSelectedRow(null);
    setPopupOpen(false);
  };

  return (
    <div className="flex flex-col px-[16px] md:px-7 bg-[#fafafb]">
      <div className="flex flex-col md:flex-row justify-between items-center py-6">
        <div className="w-full flex flex-row md:flex-col justify-between md:justify-center items-start mb-[10px] md:mb-0 gap-y-3">
          <h3 className="text-2xl font-semibold text-primary">{title}</h3>
          <p className="text-sm font-medium text-default-gray">{subtitle}</p>
        </div>

        {searchKeys && searchKeys.length > 0 && (
          <Input
            placeholder={`Search ${searchKeys.join(", ")}...`}
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setPageIndex(0); // Reset to page 1 when searching
            }}
            className="max-w-sm"
          />
        )}
      </div>

      <div className="border rounded-[12px] mb-[90px]">
        <Table>
          <TableHeader>
            <TableRow className="whitespace-nowrap w-full">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer pl-4 py-2 text-left whitespace-nowrap text-lg text-primary font-medium"
                    onClick={() =>
                      header.column.getCanSort() &&
                      header.column.toggleSorting(
                        header.column.getIsSorted() === "asc"
                      )
                    }
                  >
                    <div className="flex items-center justify-between">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <ChevronsUpDown className="h-[13px] w-[13px] ml-2" />
                    </div>
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
                  onClick={() => {
                    if (popupComponent) {
                      setSelectedRow(row.original);
                      setPopupOpen(true);
                    }
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

        {/* Pagination */}
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
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setPageIndex(index)}
                  className={`px-3 py-1.5 font-semibold text-sm rounded-[8px] transition-all duration-200 
                  ${
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
                setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))
              }
              disabled={pageIndex === totalPages - 1}
              className="px-2 py-1 text-2xl text-primary disabled:text-gray-400"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Optional Popup */}
      {isPopupOpen &&
        selectedRow &&
        popupComponent &&
        popupComponent(selectedRow, handleClose)}
    </div>
  );
}
