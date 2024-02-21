import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import Formulario from "./Formulario";

const LoginPage = () => {
  return (
    <div className="bg-slate-600 h-screen justify-center items-center flex">
      <Card className="border-2 border-lime-500 flex flex-col shadow-md ml-auto mr-auto ">
        <CardTitle className="text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Mediante o seu utilizador acede a respectiva area de trabalho
        </CardDescription>
        <CardContent>
          <Formulario />
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
