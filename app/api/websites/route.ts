import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Website from '@/lib/models/Website';
import { CreateWebsiteDto } from '@/types';

// GET - Fetch all websites for a user
export async function GET(request: NextRequest) {
  try {
    console.log('🔵 GET /api/websites - Fetching websites...');
    
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const websites = await Website.find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    console.log(`✅ Found ${websites.length} websites for user ${userId}`);

    return NextResponse.json({
      success: true,
      data: websites,
    });
  } catch (error: any) {
    console.error('❌ Error fetching websites:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch websites. Please make sure MongoDB is running.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Create a new website
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 POST /api/websites - Creating website...');
    
    await connectDB();

    const body: CreateWebsiteDto = await request.json();
    console.log('📦 Request body:', body);

    const { title, url, note, userId, tags = [], isPublic = false } = body;

    // Validation
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!url?.trim()) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // URL validation
    const isValidUrl = (urlString: string) => {
      try {
        let urlToCheck = urlString.trim();
        if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
          urlToCheck = 'https://' + urlToCheck;
        }
        new URL(urlToCheck);
        return true;
      } catch {
        return false;
      }
    };

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid URL' },
        { status: 400 }
      );
    }

    // Ensure URL has protocol
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    const website = new Website({
      title: title.trim(),
      url: finalUrl,
      note: (note || '').trim(),
      userId: userId || 'user-1',
      tags: Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      isPublic: Boolean(isPublic),
    });

    await website.save();
    console.log('✅ Website saved successfully. ID:', website._id);

    return NextResponse.json({
      success: true,
      data: website.toObject(),
      message: 'Website added successfully!'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error creating website:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'A website with this URL already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: `Failed to create website: ${error.message}` },
      { status: 500 }
    );
  }
}