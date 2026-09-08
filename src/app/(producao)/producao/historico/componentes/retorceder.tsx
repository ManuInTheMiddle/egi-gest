"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const Retorceder = () => {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-4 items-center">
      <Button
        size={"icon"}
        variant={"ghost"}
        onClick={() => {
          router.push("/producao");
        }}
      >
        <ArrowLeftCircle />
      </Button>
      <h1 className="text-lg">Histórico de Produção</h1>
    </div>
  );
};

export default Retorceder;
