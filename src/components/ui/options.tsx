"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { link } from "fs";
import {
  LayoutDashboard,
  ClipboardList,
  Factory,
  Warehouse,
  Boxes,
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
      label: "ordemFabrico",
      href: "/ordemFabrico",
    },
    {
      label: "producao",
      href: "/producao",
    },
    {
      label: "maisPrafrente",
      href: "/maisPrafrente",
    },
  ];

  return (
    <div className="grid grid-flow-col auto-cols-max mt-10 justify-evenly gap-x-4">
      <a href="dashboard">
        <Card
          className={`${
            links[0].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <LayoutDashboard />
          </CardContent>
          <CardFooter>
            <p>DashBoard</p>
          </CardFooter>
        </Card>
      </a>
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
            <p>Matéria Prima</p>
          </CardFooter>
        </Card>
      </a>
      <a href="ordemFabrico">
        <Card
          className={`${
            links[2].href.startsWith(currentPathname.toString())
              ? "bg-gradient-to-br from-white to-lime-500 border-none"
              : "bg-white"
          } flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0`}
        >
          <CardContent>
            <ClipboardList />
          </CardContent>
          <CardFooter>
            <p>Ordens de Fabrico</p>
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
            <Factory />
          </CardContent>
          <CardFooter>
            <p>Produção</p>
          </CardFooter>
        </Card>
      </a>
      <a href="maisPrafrente">
        <Card
          className={`${
            links[4].href.startsWith(currentPathname.toString())
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
