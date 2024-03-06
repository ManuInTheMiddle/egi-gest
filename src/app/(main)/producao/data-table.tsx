"use client";
import React, { useState } from "react";
import { ScrollText, ArrowLeft, ArrowRight } from "lucide-react";
import {
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center py-4 gap-x-2">
          <Input
            placeholder="Filtrar Status ... "
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("status")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filtrar Lote ... "
            value={
              (table.getColumn("loteFabrico")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("loteFabrico")?.setFilterValue(e.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="flex mr-3">
          <Button>
            <ScrollText />
          </Button>
        </div>
      </div>
      <div className="rounded-md border-2 border-lime-500">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Não Existem Ordens
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center mt-3 gap-x-2">
        <Button variant={"outline"} className="gap-x-1 max-w-[120] ">
          <ArrowLeft color="#475569" />
          Prev
        </Button>
        <Button variant={"outline"} className="gap-x-1 max-w-[120]">
          Next
          <ArrowRight color="#475569" />
        </Button>
      </div>
    </div>
  );
}
