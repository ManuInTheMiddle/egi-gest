"use client";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { Input } from "@/components/ui/input";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

function page() {
  const [valor, setValue] = useState("");
  const [geraQr, setGeraQr] = useState(false);
  const generateQrCode = () => {
    const infoAEnviar = `${valor}`;
    return <QrcodeComponent information={infoAEnviar} />;
  };
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="mt-10 mb-10">
        WORK IN PROGRESS <br />
        <p className="items-center justify-center">
          opçoes futuras a adicionar
        </p>
      </h1>

      <div className="mb-5">
        <Select onValueChange={(e) => setValue(e as string)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Escolha um reator ..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="R1">Reator 1</SelectItem>
              <SelectItem value="R2">Reator 2</SelectItem>
              <SelectItem value="R3">Reator 3</SelectItem>
              <SelectItem value="R4">Reator 4</SelectItem>
              <SelectItem value="R5">Reator 5</SelectItem>
              <SelectItem value="R6">Reator 6</SelectItem>
              <SelectItem value="R7">Reator 7</SelectItem>
              <SelectItem value="R8">Reator 8</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => setGeraQr(!geraQr)} className="mb-10">
        {geraQr ? `Não Mostrar` : `Gerar Código`}
      </Button>
      {geraQr ? generateQrCode() : <></>}
    </div>
  );
}

export default page;

/*

      <Input
        className="max-w-sm mb-5"
        onChange={(e) => setValue(e.target.value)}
      />

*/
