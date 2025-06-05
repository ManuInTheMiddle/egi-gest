import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

interface OrderMaterialsTableProps {
  ordemProducao: ProductionOrder;
}

export const OrderMaterialsTable: React.FC<OrderMaterialsTableProps> = ({ ordemProducao }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Matéria Prima</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Percentagem</TableHead>
          <TableHead className="text-right">Quantidade</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ordemProducao.ProductionOrderLines.map((mp: any) => (
          <TableRow key={mp.LineNumber}>
            <TableCell className="font-medium">{mp.ItemNo}</TableCell>
            <TableCell>{mp.ItemName}</TableCell>
            <TableCell className="text-center">
              {((mp.PlannedQuantity * 100) / ordemProducao.PlannedQuantity).toFixed(3)}
            </TableCell>
            <TableCell className="text-right">{mp.PlannedQuantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};