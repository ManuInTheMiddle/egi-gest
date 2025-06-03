"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import { pt } from "date-fns/locale";
import { DateRange } from "react-day-picker";
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
  Calendar as CalendarIcon,
  CalendarMinus2,
  CalendarSearch,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

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
        <div className="flex flex-row items-center py-4 gap-x-2 ">
          <div className="flex flex-row gap-x-2">
            <Input
              placeholder="Filtrar Ordem ... "
              value={
                (table.getColumn("numOP")?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table.getColumn("numOP")?.setFilterValue(e.target.value)
              }
              className="max-w-sm"
            />
          </div>
        </div>
        <div className="flex mr-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: pt })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: pt })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: pt })
                  )
                ) : (
                  <span>Filtrar por Data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                locale={pt}
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="ml-2"
                  size={"icon"}
                  onClick={() => {
                    //console.log(table.getColumn("timestamp")?.getFilterValue());
                    //console.log(table.getColumn("timestamp")?.getFilterFn());
                    //console.log(table.getColumn("timestamp")?.getFilterValue());
                    //console.log(table.getColumn("timestamp"));
                    table.getColumn("timestamp")?.setFilterValue(date);
                  }}
                >
                  <CalendarSearch />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filtrar por Data</p>
                <p>Predefinido: ultimos 30 dias</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="ml-2"
                  size={"icon"}
                  onClick={() =>
                    setDate({
                      from: subDays(new Date(), 30),
                      to: new Date(),
                    })
                  }
                >
                  <CalendarMinus2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Definir para Predefinição</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
    </div>
  );
}
