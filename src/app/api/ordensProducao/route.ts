import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/db";
export const GET = async (req: NextRequest) => {
  try {
    const ordensProducao = await prisma.ordens_producao.findMany({});
    return NextResponse.json(
      { message: "OK", ordensProducao },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao devolver ordens producao" },
      { status: 503 }
    );
  }
};
