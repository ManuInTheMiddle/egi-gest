// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Check if user is authenticated and is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID do utilizador é obrigatório' },
        { status: 400 }
      );
    }

    const SCADA_BASE_URL = process.env.SCADA_BASE_URL || 'http://192.168.1.251:8080';

    const response = await fetch(`${SCADA_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Utilizador não encontrado' },
          { status: 404 }
        );
      }
      throw new Error(`SCADA API error: ${response.status}`);
    }

    const user = await response.json();
    return NextResponse.json(user);

  } catch (error) {
    console.error(`API /users/${params.id} GET error:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Check if user is authenticated and is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID do utilizador é obrigatório' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role, email, fullName, active } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role é obrigatório' },
        { status: 400 }
      );
    }

    const SCADA_BASE_URL = process.env.SCADA_BASE_URL || 'http://DESKTOP-74D6VT2:8080';

    const response = await fetch(`${SCADA_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role,
        email,
        fullName,
        active,
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Utilizador não encontrado' },
          { status: 404 }
        );
      }
      throw new Error(`SCADA API error: ${response.status}`);
    }

    const updatedUser = await response.json();
    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error(`API /users/${params.id} PUT error:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Check if user is authenticated and is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { error: 'ID do utilizador é obrigatório' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Não pode eliminar a sua própria conta' },
        { status: 400 }
      );
    }

    const SCADA_BASE_URL = process.env.SCADA_BASE_URL || 'http://DESKTOP-74D6VT2:8080';

    const response = await fetch(`${SCADA_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Utilizador não encontrado' },
          { status: 404 }
        );
      }
      throw new Error(`SCADA API error: ${response.status}`);
    }

    return NextResponse.json(
      { message: 'Utilizador eliminado com sucesso' }
    );

  } catch (error) {
    console.error(`API /users/${params.id} DELETE error:`, error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}