import React from "react";
import {
  Table,
  TableRow,
  TableHeader,
  TableBody,
  TableCaption,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const PlanearOrdens = () => {
  return (
    <Table className="border ">
      <TableCaption>Ordens a fabricar (SAP)</TableCaption>
      <TableHeader className="space-x-1 ">
        <TableRow className="bg-slate-600 hover:bg-slate-600">
          <TableHead className="text-white">Ordem Fabrico</TableHead>
          <TableHead className="text-white">Produto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>100100</TableCell>
          <TableCell>ProdutoA</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>100200</TableCell>
          <TableCell>ProdutoB</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>100300</TableCell>
          <TableCell>ProdutoC</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default PlanearOrdens;
