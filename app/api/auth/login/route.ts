import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Get the admin password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Admin password not configured' },
        { status: 500 }
      );
    }
    
    // Check if the provided password matches the admin password
    if (password === adminPassword) {
      return NextResponse.json(
        { success: true, message: 'Login successful' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}