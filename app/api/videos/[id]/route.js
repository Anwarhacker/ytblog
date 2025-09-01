import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://anwar:malekaanwar8088331188@cluster0.urmugpa.mongodb.net/youtube-videos?retryWrites=true&w=majority&appName=Cluster0";

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    videoId: { type: String, required: true },
    thumbnail: { type: String, required: true },
  },
  { timestamps: true }
);

const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);

async function dbConnect() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const videoData = await request.json();

    const video = await Video.findByIdAndUpdate(id, videoData, { new: true });

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: video });
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete video" },
      { status: 500 }
    );
  }
}