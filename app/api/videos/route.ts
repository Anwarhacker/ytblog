import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function GET() {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected, fetching videos...');
    const videos = await Video.find({}).sort({ createdAt: -1 });
    console.log('Videos fetched:', videos.length);
    
    return NextResponse.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch videos', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const videoData = await request.json();
    
    const video = new Video(videoData);
    await video.save();
    
    return NextResponse.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create video' },
      { status: 500 }
    );
  }
}