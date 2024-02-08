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
        <Card className="flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in  hover:translate-y-1 hover:translate-x-1 hover:border-0">
          <CardContent>
            <LayoutDashboard />
          </CardContent>
          <CardFooter>
            <p>DashBoard</p>
          </CardFooter>
        </Card>
      </a>
      <a href="ordemFabrico">
        <Card className="flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in hover:translate-y-1 hover:translate-x-1 hover:border-0">
          <CardContent>
            <ClipboardList />
          </CardContent>
          <CardFooter>
            <p>Ordens de Fabrico</p>
          </CardFooter>
        </Card>
      </a>
      <a href="producao">
        <Card className="flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in hover:translate-y-1 hover:translate-x-1 hover:border-0">
          <CardContent>
            <Factory />
          </CardContent>
          <CardFooter>
            <p>Produção</p>
          </CardFooter>
        </Card>
      </a>
      <a href="maisPrafrente">
        <Card className="flex flex-col w-[190px] border-lime-500 items-center justify-center pt-5 drop-shadow-2xl hover:bg-gradient-to-br from-white to-lime-500 to-80% duration-275 ease-in hover:translate-y-1 hover:translate-x-1 hover:border-0">
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
