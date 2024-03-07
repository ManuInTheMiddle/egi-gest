import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";

export const GET = async (req: NextRequest, res: NextResponse) => {
  try {
    const id = req.nextUrl.pathname.split("materiasPrimas/")[1];

    const materiaPrima = await prisma.materias_primas.findUnique({
      where: {
        id_materia_prima: parseInt(id!),
      },

      select: {
        artigo: true,
        descricao: true,
      },
    });

    return NextResponse.json({ message: "OK", materiaPrima }, { status: 200 });
  } catch (error) {}
};
