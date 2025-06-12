"use client";
import Retorceder from "./componentes/retorceder";
import QrcodeComponent from "@/components/ui/qrcodeComponent";
import { Input } from "@/components/ui/input";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sapMP } from "@/lib/materiasPrimasSAP";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

const Page = () => {
  const [valor, setValue] = useState("");
  const [mp, setMP] = useState("");
  const [codigoPersonalizado, setCodigoPersonalizado] = useState("");
  //gera qr
  const [geraQrMp, setGeraMpQr] = useState(false);
  const [geraQr, setGeraQr] = useState(false);
  const [geraQrPer, setGeraQrPer] = useState(false);
  //gerar codigos Qr
  const generateQrCodeMP = () => {
    const infoAEnviar = `${mp}`;
    return <QrcodeComponent information={infoAEnviar} />;
  };
  const generateQrCode = () => {
    const infoAEnviar = `${valor}`;
    return <QrcodeComponent information={infoAEnviar} />;
  };
  const generateQrCodePersonalizado = () => {
    const infoAEnviar = `${codigoPersonalizado}`;
    return <QrcodeComponent information={infoAEnviar} />;
  };

  return (
    <div className="flex flex-col">
      <section className="border-2 border-slate-600 rounded-md p-5 shadow-2xl items-center min-h-screen justify-start h-full m-1">
        <Retorceder />
        <div className="flex flex-row mx-auto justify-center space-x-10">
          <div className="flex flex-col justify-center items-center">
            <h1 className="mt-10 mb-10 text-center">
              REATORES <br />
              <p className="items-center justify-center">QRS DOS REATORES</p>
            </h1>

            <div className="mb-5">
              <Select onValueChange={(e) => setValue(e as string)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Escolha um reator ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R1&C3:&C4:&C5:&C6:&">
                      Reator 1
                    </SelectItem>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R2&C3:&C4:&C5:&C6:&">
                      Reator 2
                    </SelectItem>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R3&C3:&C4:&C5:&C6:&">
                      Reator 3
                    </SelectItem>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R4&C3:&C4:&C5:&C6:&">
                      Reator 4
                    </SelectItem>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R5&C3:&C4:&C5:&C6:&">
                      Reator 5
                    </SelectItem>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R6&C3:&C4:&C5:&C6:&">
                      Reator 6
                    </SelectItem>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R7&C3:&C4:&C5:&C6:&">
                      Reator 7
                    </SelectItem>
                    <SelectItem value="F:Equipamento&C1:Reator&C2:R8&C3:&C4:&C5:&C6:&">
                      Reator 8
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setGeraQr(!geraQr)} className="mb-10">
              {geraQr ? `Não Mostrar` : `Gerar Código`}
            </Button>
            {geraQr ? generateQrCode() : <></>}
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="mt-10 mb-10 text-center">
              MATÉRIAS PRIMAS <br />
              <p className="items-center justify-center">QRS DAS MPs</p>
            </h1>

            <div className="mb-5">
              <Select onValueChange={(e) => setMP(e as string)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Escolha uma MP ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {sapMP.map((mp, index) => (
                      <SelectItem key={index} value={mp}>
                        {mp}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => setGeraMpQr(!geraQrMp)} className="mb-10">
              {geraQrMp ? `Não Mostrar` : `Gerar Código MP`}
            </Button>
            {geraQrMp ? generateQrCodeMP() : <></>}
          </div>
          <div className="flex flex-col justify-center items-center">
            <h1 className="mt-10 mb-10 text-center">
              CODIGO PERSONALIZADO <br />
              <p className="items-center justify-center">QRS Variados</p>
            </h1>

            <div className="mb-5">
              <Input
                onChange={(e) => {
                  e.preventDefault();
                  setCodigoPersonalizado(e.target.value);
                }}
              />
            </div>

            <Button onClick={() => setGeraQrPer(!geraQrPer)} className="mb-10">
              {geraQrPer ? `Não Mostrar` : `Gerar Código MP`}
            </Button>
            {geraQrPer ? generateQrCodePersonalizado() : <></>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
