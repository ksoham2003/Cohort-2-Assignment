import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Website from '@/lib/models/Website';
import { UpdateWebsiteDto, isMongooseValidationError } from '@/types';

// Helper function to extract ID from URL
function extractIdFromUrl(url: string): string {
  const segments = url.split('/');
  return segments[segments.length - 1];
}

// PUT - Update a website
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const websiteId = extractIdFromUrl(url.pathname);
    
    await connectDB();

    if (!websiteId || websiteId === 'websites') {
      return NextResponse.json(
        { success: false, error: 'Website ID is required' },
        { status: 400 }
      );
    }

    const body: UpdateWebsiteDto = await request.json();

    const { title, url: websiteUrl, note, tags, isPublic } = body;

    // Find the website first
    const existingWebsite = await Website.findById(websiteId);

    if (!existingWebsite) {
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

    return NextResponse.json({
      success: true,
      data: existingWebsite.toObject(),
      message: 'Website updated successfully!'
    });

  } catch (error: unknown) {
    
    if (isMongooseValidationError(error)) {
      const errors = Object.values(error.errors).map((err: { message: string }) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: `Failed to update website: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete a website
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const websiteId = extractIdFromUrl(url.pathname);
    
    
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

    return NextResponse.json({
      success: true,
      message: 'Website deleted successfully'
    });
  } catch (error: unknown) {
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: `Failed to delete website: ${errorMessage}` },
      { status: 500 }
    );
  }
}