import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  LayoutDashboard,
  ClipboardList,
  Factory,
  Warehouse,
} from "lucide-react";

export default function Options() {
  return (
    <div className="grid grid-flow-col auto-cols-max mt-10 justify-evenly gap-x-4">
      <a href="/">
        <Card className="flex flex-col w-[190px] items-center justify-center pt-5 shadow-2xl hover:bg-lime-500 duration-500 ease-in hover:translate-y-1 hover:translate-x-1">
          <CardContent>
            <LayoutDashboard />
          </CardContent>
          <CardFooter>
            <p>DashBoard</p>
          </CardFooter>
        </Card>
      </a>
      <a href="ordemFabrico">
        <Card className="flex flex-col items-center w-[190px]  justify-center pt-5 shadow-2xl hover:bg-lime-500 duration-500 ease-in hover:translate-y-1 hover:translate-x-1">
          <CardContent>
            <ClipboardList />
          </CardContent>
          <CardFooter>
            <p>Ordens de Fabrico</p>
          </CardFooter>
        </Card>
      </a>
      <a href="producao">
        <Card className="flex flex-col items-center w-[190px]  justify-center pt-5 shadow-2xl hover:bg-lime-500 duration-500 ease-in hover:translate-y-1 hover:translate-x-1">
          <CardContent>
            <Factory />
          </CardContent>
          <CardFooter>
            <p>Produção</p>
          </CardFooter>
        </Card>
      </a>
      <a href="maisPrafrente">
        <Card className="flex flex-col items-center w-[190px] justify-center pt-5 shadow-2xl hover:bg-lime-500 duration-500 ease-in hover:translate-y-1 hover:translate-x-1">
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
