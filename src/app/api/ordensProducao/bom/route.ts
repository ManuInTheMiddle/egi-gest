import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";
export const GET = async (req: NextRequest) => {
  try {
    const productId = req.nextUrl.searchParams.get("product-id");
    const billOfMaterials = await prisma.bom.findMany({
      where: { produtos: { id_produto: parseInt(productId!) } },
      select: {
        materias_primas: true,
        lote: true,
        produtos: true,
        id_bom: true,
        percentagem: true,
      },
    });
    if (billOfMaterials.length === 0) {
      return NextResponse.json({ message: "Vazio", billOfMaterials });
    }
    return NextResponse.json(
      { message: "OK", billOfMaterials },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao devolver ordens producao" },
      { status: 503 }
    );
  }
};
