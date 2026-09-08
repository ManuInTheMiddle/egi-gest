"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RetorcederProps {
  TextoExtra?: string;
}

const Retorceder = ({ TextoExtra }: RetorcederProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-4 items-center">
      <Button
        size={"icon"}
        variant={"ghost"}
        onClick={() => {
          router.push("/");
        }}
      >
        <ArrowLeftCircle />
      </Button>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
        Produto Acabado {TextoExtra && `${TextoExtra}`}
      </h2>
    </div>
  );
};

export default Retorceder;
