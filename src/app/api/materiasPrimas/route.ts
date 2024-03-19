import { NextRequest, NextResponse } from "next/server";

import prisma from "../../../../prisma/db";

export const GET = async (req: NextRequest) => {
  const skipPageNum = req.nextUrl.searchParams.get("skip");
  try {
    const materiasPrimas = skipPageNum
      ? await prisma.materias_primas.findMany({
          skip: parseInt(skipPageNum!),
          take: 10,
        })
      : await prisma.materias_primas.findMany({});

    return NextResponse.json(
      { mensagem: "OK", materiasPrimas },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao devolver materias primas" },
      { status: 503 }
    );
  }
};
