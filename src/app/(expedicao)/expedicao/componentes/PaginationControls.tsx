import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { PAGE_SIZE } from "../constantsAndTypes/expedicaoConstants";

interface PaginationControlsProps {
  numeroPagina: number;
  onPaginaAnterior: () => void;
  onPaginaSeguinte: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  numeroPagina,
  onPaginaAnterior,
  onPaginaSeguinte,
}) => {
  return (
    <div
      className="mt-6 flex items-center justify-center sm:mt-8"
      aria-label="Page navigation"
    >
      <div className="mt-2 gap-x-2 flex flex-col">
        <div className="flex flex-row items-center mt-2 gap-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onPaginaAnterior}
            disabled={numeroPagina === 0}
            aria-label="Página anterior"
          >
            <ArrowLeftCircle color="#84CC27" size={30} strokeWidth={1.5} />
          </Button>
          <h2>Página</h2>
          <Label className="text-lg">{numeroPagina / PAGE_SIZE}</Label>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onPaginaSeguinte}
            aria-label="Próxima página"
          >
            <ArrowRightCircle color="#84CC27" size={30} strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;
