import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Website from '@/lib/models/Website';

interface Params {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    console.log('🗑️ DELETE /api/websites/[id] - Deleting website:', params.id);
    
    await connectDB();

    // Validate the ID format
    if (!params.id || params.id.length !== 24) {
      return NextResponse.json(
        { success: false, error: 'Invalid website ID' },
        { status: 400 }
      );
    }

    const website = await Website.findByIdAndDelete(params.id);

    if (!website) {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }

    console.log('✅ Website deleted successfully:', params.id);

    return NextResponse.json({
      success: true,
      message: 'Website deleted successfully',
    });
  } catch (error: any) {
    console.error('❌ Error deleting website:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete website' },
      { status: 500 }
    );
  }
}