import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip";
import { ReactNode } from "react";

  interface componentPropI{
    children: ReactNode
    textoDoTooltip:string
  }

  export function TooltipCustomizado({children,textoDoTooltip}:componentPropI) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children}
          </TooltipTrigger>
          <TooltipContent>
            <p>{textoDoTooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }