import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductionOrder } from "@/Services/OrdensProducao/fetchOrdensEnchimentoSAP";

const REACTORS = [
  { id: 1, nome: "Reator 1" }, { id: 2, nome: "Reator 2" }, { id: 3, nome: "Reator 3" },
  { id: 4, nome: "Reator 4" }, { id: 5, nome: "Reator 5" }, { id: 6, nome: "Reator 6" },
  { id: 7, nome: "Reator 7" }, { id: 8, nome: "Reator 8" },
];

const ORDER_STATES = [
  { id: 1, statusSAP: "boposPlanned", estado: "Planeada" },
  { id: 2, statusSAP: "boposReleased", estado: "Autorizada a Sair" },
  { id: 3, statusSAP: "boposClosed", estado: "Fechada" },
  { id: 4, statusSAP: "boposCancelled", estado: "Cancelada" },
];

interface OrderDetailsFormProps {
  ordemProducao: ProductionOrder;
  onStateChange: (newState: string, ordemProducao: ProductionOrder) => void;
  onReactorChange: (reactorName: string, ordemProducao: ProductionOrder) => void;
}

export const OrderDetailsForm: React.FC<OrderDetailsFormProps> = ({
  ordemProducao,
  onStateChange,
  onReactorChange,
}) => {
  return (
    <div className="space-y-5">
    <div className="grid grid-cols-3 gap-8">
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="numeroOP" className="text-right">Número OP</Label>
        <Input
          id="numeroOP"
          value={ordemProducao.AbsoluteEntry}
          disabled
          className="text-center"
        />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="receita" className="text-right">Receita</Label>
        <Input
          disabled
          id="receita"
          value={ordemProducao.ItemNo}
          className="text-center"
        />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="descricao" className="text-right">Descrição</Label>
        <Input
          disabled
          id="descricao"
          value={ordemProducao.ProductDescription}
          className="text-center"
        />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="quantidade" className="text-right">Quantidade</Label>
        <Input
          id="quantidade"
          value={ordemProducao.PlannedQuantity}
          disabled
          className="text-center"
        />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="estado" className="text-right">Estado</Label>
        <Select
          disabled={
            ordemProducao.ProductionOrderStatus === "boposClosed" ||
            ordemProducao.ProductionOrderStatus === "boposCancelled"
          }
          defaultValue={
            ORDER_STATES.find(
              (estado) => estado.statusSAP === ordemProducao.ProductionOrderStatus
            )?.estado
          }
          onValueChange={(value) => onStateChange(value, ordemProducao)}
        >
          <SelectTrigger className="text-center w-[120px]">
            <SelectValue placeholder="Escolher" />
          </SelectTrigger>
          <SelectContent className="text-center">
            <SelectGroup>
              {ORDER_STATES.map((estado) => (
                <SelectItem key={estado.id} value={estado.estado}>
                  {estado.estado}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="estadoReator" className="text-right">Estado Reator</Label>
        <Input
          id="estadoReator"
          value={ordemProducao.U_Reator ?? ""}
          disabled
          className="text-center"
        />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="tipoOrdem" className="text-right">Tipo de Ordem</Label>
        <Input
          id="tipoOrdem"
          value={ordemProducao.U_Tipo === "R" ? "Reator" : "---"}
          disabled
          className="text-center"
        />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="reator" className="text-right">Reator</Label>
        <Select
          disabled={
            ordemProducao.ProductionOrderStatus !== "boposPlanned" &&
            ordemProducao.ProductionOrderStatus !== "boposReleased"
          }
          onValueChange={(value) => onReactorChange(value, ordemProducao)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Reator..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {REACTORS.map((reator) => (
                <SelectItem key={reator.id} value={reator.nome}>
                  {reator.nome}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <Label htmlFor="dataCriacao" className="text-right">Data de Criação</Label>
        <Input
          id="dataCriacao"
          value={ordemProducao.CreationDate}
          disabled
          className="text-center"
        />
      </div>
    </div>
<div className="flex flex-col items-center gap-4 w-[300px]">
  <Label htmlFor="observacoes">Observações</Label>
  <Textarea
    id="observacoes"
    value={ordemProducao.Remarks || "Sem Observações"}
    disabled
    className={`w-full min-h-[100px] p-3 border rounded-md resize-none ${
      ordemProducao.Remarks 
        ? "text-center text-yellow-800 bg-yellow-100 border-yellow-300 font-medium" 
        : "text-center"
    }`}
  />
</div>
</div>

  );
};