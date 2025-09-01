import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function POST() {
  try {
    await dbConnect();
    
    const testVideo = {
      title: "Test Video",
      description: "This is a test video",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoId: "dQw4w9WgXcQ",
      thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    };
    
    const video = new Video(testVideo);
    await video.save();
    
    return NextResponse.json({
      success: true,
      message: 'Test video added',
      data: video
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}