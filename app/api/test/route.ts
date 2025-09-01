import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function GET() {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    await dbConnect();
    console.log('Database connected successfully');
    
    const count = await Video.countDocuments();
    console.log('Video count:', count);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      videoCount: count,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      mongoUri: process.env.MONGODB_URI ? 'Set' : 'Not set'
    }, { status: 500 });
  }
}