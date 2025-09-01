import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const videoData = await request.json();
    
    const video = await Video.findByIdAndUpdate(
      params.id,
      videoData,
      { new: true }
    );
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const video = await Video.findByIdAndDelete(params.id);
    
    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete video' },
      { status: 500 }
    );
  }
}