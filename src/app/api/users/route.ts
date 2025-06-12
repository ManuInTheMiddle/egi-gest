// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';  // ← Fixed import

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 401 }
      );
    }

    const SCADA_BASE_URL = process.env.SCADA_BASE_URL || 'http://192.168.1.251:8080';

    // Get all users
    const response = await fetch(`${SCADA_BASE_URL}/api/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SCADA API error: ${response.status}`);
    }

    const users = await response.json();
    return NextResponse.json(users);

  } catch (error) {
    console.error('API /users GET error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, password, role, email, fullName, active } = body;

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password e role são obrigatórios' },
        { status: 400 }
      );
    }

    const SCADA_BASE_URL = process.env.SCADA_BASE_URL || 'http://DESKTOP-74D6VT2:8080';

    const response = await fetch(`${SCADA_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        role,
        email: email || `${username.toLowerCase()}@egiquimica.pt`,
        fullName: fullName || username,
        active: active !== undefined ? active : true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || 'Falha ao criar utilizador' },
        { status: response.status }
      );
    }

    const newUser = await response.json();
    return NextResponse.json(newUser, { status: 201 });

  } catch (error) {
    console.error('API /users POST error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}