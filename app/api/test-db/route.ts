import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('🧪 Testing database connection...');
    
    await connectDB();
    
    const connectionState = mongoose.connection.readyState;
    const stateMap = {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Try to list collections to verify database access
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: '✅ Database connection successful!',
      connection: {
        state: stateMap[connectionState as keyof typeof stateMap] || 'unknown',
        readyState: connectionState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        collections: collections.map(c => c.name)
      }
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: `Database connection failed: ${error.message}`,
      suggestion: 'Make sure MongoDB is running on localhost:27017'
    }, { status: 500 });
  }
}