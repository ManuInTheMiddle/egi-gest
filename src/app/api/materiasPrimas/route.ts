import { NextResponse } from "next/server";
import prisma from "../../../../prisma/db";
export const GET = async (req: Request, res: Response) => {
  try {
    const materiasPrimas = await prisma.materias_primas.findMany({});
    return NextResponse.json(
      { mensagem: "OK", materiasPrimas },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao devolver dados" },
      { status: 503 }
    );
    console.error("Erro ao devolver MateriasPrimas");
  }
};
