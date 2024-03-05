import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FormularioInformacao = () => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Referência
        </Label>
        <Input id="name" value="200A" disabled className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Lote de Fabrico
        </Label>
        <Input disabled id="username" value="200A10" className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Descrição
        </Label>
        <Input
          disabled
          id="username"
          value="Sabonete Liquido Azul"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Quantidade
        </Label>
        <Input id="username" value="1000" disabled className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Estado
        </Label>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Escolha um estado ..." />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="Planeada">Planeada</SelectItem>
              <SelectItem value="A Decorrer">A Decorrer</SelectItem>
              <SelectItem value="Finalizada">Finalizada</SelectItem>
              <SelectItem value="Cancelada">Cancelada</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Cliente
        </Label>
        <Input id="username" value="Cliente" disabled className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Reator
        </Label>
        <Input id="username" value="Reator A" disabled className="col-span-3" />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Data de Criação
        </Label>
        <Input
          id="username"
          value="03/01/2024 @ 10:36am"
          disabled
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="username" className="text-right">
          Detalhes Bom
        </Label>
        <Input
          id="username"
          value="quantidade MP gasta por BOM"
          disabled
          className="col-span-3"
        />
      </div>
    </div>
  );
};

export default FormularioInformacao;
