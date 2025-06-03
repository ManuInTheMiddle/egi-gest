"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const Retorceder = ({ numeroOrdem } : {numeroOrdem : string | string[]}) => {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-4 items-center">
      <Button size={"icon"} variant={"ghost"}>
        <ArrowLeftCircle
          onClick={() => {
            //console.log("Voltar");
            router.push("/chegadaMateriaPrima");
          }}
        />
      </Button>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
        Detalhes da Ordem #{numeroOrdem}
      </h2>
    </div>
  );
};

export default Retorceder;
