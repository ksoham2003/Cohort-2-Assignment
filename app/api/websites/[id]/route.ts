import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Website from '@/lib/models/Website';
import { UpdateWebsiteDto } from '@/types';

// Helper function to extract ID from URL
function extractIdFromUrl(url: string): string {
  const segments = url.split('/');
  return segments[segments.length - 1];
}

// PUT - Update a website
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const websiteId = extractIdFromUrl(url.pathname);
    
    console.log('✏️ PUT /api/websites/[id] - Updating website');
    console.log('📋 Full URL:', request.url);
    console.log('📋 Extracted ID:', websiteId);
    
    await connectDB();

    if (!websiteId || websiteId === 'websites') {
      console.log('❌ Invalid ID extracted');
      return NextResponse.json(
        { success: false, error: 'Website ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateWebsiteDto = await request.json();
    console.log('📦 Update request body:', body);

    const { title, url: websiteUrl, note, tags, isPublic } = body;

    // Find the website first
    const existingWebsite = await Website.findById(websiteId);

    if (!existingWebsite) {
      console.log('❌ Website not found:', websiteId);
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }

    // Update fields if provided
    if (title !== undefined) existingWebsite.title = title.trim();
    if (websiteUrl !== undefined) {
      // Validate URL if provided
      let finalUrl = websiteUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      try {
        new URL(finalUrl);
        existingWebsite.url = finalUrl;
      } catch {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid URL' },
          { status: 400 }
        );
      }
    }
    if (note !== undefined) existingWebsite.note = note.trim();
    if (tags !== undefined) existingWebsite.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
    if (isPublic !== undefined) existingWebsite.isPublic = isPublic;

    await existingWebsite.save();
    console.log('✅ Website updated successfully:', websiteId);

    return NextResponse.json({
      success: true,
      data: existingWebsite.toObject(),
      message: 'Website updated successfully!'
    });

  } catch (error: any) {
    console.error('❌ Error updating website:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to update website: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete a website
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const websiteId = extractIdFromUrl(url.pathname);
    
    console.log('🗑️ DELETE /api/websites/[id] - Deleting website');
    console.log('📋 Extracted ID:', websiteId);
    
    await connectDB();

    if (!websiteId || websiteId === 'websites') {
      return NextResponse.json(
        { success: false, error: 'Website ID is required' },
        { status: 400 }
      );
    }

    const website = await Website.findByIdAndDelete(websiteId);

    if (!website) {
      return NextResponse.json(
        { success: false, error: 'Website not found' },
        { status: 404 }
      );
    }

    console.log('✅ Website deleted successfully:', websiteId);

    return NextResponse.json({
      success: true,
      message: 'Website deleted successfully'
    });
  } catch (error: any) {
    console.error('❌ Error deleting website:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete website' },
      { status: 500 }
    );
  }
}