"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

interface componetePaginasInterface {}

const ComponeteBotaoPaginas = () => {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size={"icon"}
        className="h-8 w-8 p-0"
        onClick={() => {
          console.log("pagina anterior rotulagem");
        }}
        disabled={true}
      >
        <span className="sr-only">Página Anterior</span>
        <ArrowLeftCircle color="#84CC27" size={30} strokeWidth={1.5} />
      </Button>
      <Button
        variant="ghost"
        size={"icon"}
        className="h-8 w-8 p-0"
        onClick={() => {
          console.log("pagina seguinte rotulagem");
        }}
        disabled={true}
      >
        <span className="sr-only">Próxima Página</span>
        <ArrowRightCircle color="#84CC27" size={30} strokeWidth={1.5} />
      </Button>
    </div>
  );
};

export default ComponeteBotaoPaginas;
