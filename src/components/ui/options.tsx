"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ClipboardList,
  Factory,
  Warehouse,
  Boxes,
  FlaskConical,
  Truck,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Options() {
  const currentPathname = usePathname();

  const links = [
    {
      label: "dashboard",
      href: "/dashboard",
    },
    {
      label: "chegadaMP",
      href: "/chegadaMateriaPrima",
    },
    {
      label: "receitas",
      href: "/receitas",
    },
    {
      label: "formulação",
      href: "/producao",
    },
    {
      label: "produção",
      href: "/producaoAcabado",
    },
    {
      label: "expedição",
      href: "/expedicao",
    },
    {
      label: "maisPrafrente",
      href: "/maisPrafrente",
    },
  ];

  return (
    <div className="grid grid-flow-col auto-cols-max w-full mt-10 justify-evenly gap-x-4">
      <a href="chegadaMateriaPrima">
        <Card
          className={`${
            links[1].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <Boxes />
          </CardContent>
          <CardFooter>
            <p>Receção MP</p>
          </CardFooter>
        </Card>
      </a>
      <a href="receitas">
        <Card
          className={`${
            links[2].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center text-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <ClipboardList />
          </CardContent>
          <CardFooter>
            <p>Receitas</p>
          </CardFooter>
        </Card>
      </a>
      <a href="producao">
        <Card
          className={`${
            links[3].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <FlaskConical />
          </CardContent>
          <CardFooter>
            <p>Formulação</p>
          </CardFooter>
        </Card>
      </a>
      <a href="producaoAcabado">
        <Card
          className={`${
            links[4].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <Factory />
          </CardContent>
          <CardFooter>
            <p>Produção</p>
          </CardFooter>
        </Card>
      </a>
      <a href="expedicao">
        <Card
          className={`${
            links[5].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <Truck />
          </CardContent>
          <CardFooter>
            <p>Expedição</p>
          </CardFooter>
        </Card>
      </a>
      <a href="maisPrafrente">
        <Card
          className={`${
            links[6].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <Warehouse />
          </CardContent>
          <CardFooter>
            <p>opçao a adicionar</p>
          </CardFooter>
        </Card>
      </a>
    </div>
  );
}
