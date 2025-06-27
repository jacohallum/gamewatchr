// app/api/user/preferences/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET - Fetch user preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        email: true, 
        preferences: true 
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      preferences: user.preferences,
      hasPreferences: !!user.preferences
    })

  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// POST - Save user preferences
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sports, teams } = await request.json()

    // Validate input
    if (!Array.isArray(sports) || typeof teams !== 'object') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      )
    }

    // Create preferences object
    const preferences = {
      sports,
      teams,
      updatedAt: new Date().toISOString()
    }

    // Save to database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { preferences },
      select: {
        id: true,
        email: true,
        preferences: true
      }
    })

    console.log(`✅ Preferences saved for user: ${session.user.email}`)
    console.log('Sports:', sports)
    console.log('Teams count:', Object.keys(teams).length)

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully',
      preferences: updatedUser.preferences
    })

  } catch (error) {
    console.error('Error saving user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    )
  }
}

// PUT - Update existing preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Get current preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { preferences: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Merge with existing preferences - Fix the type casting here
    const currentPreferences = (user.preferences as Record<string, any>) || {}
    const updatedPreferences = {
      ...currentPreferences,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    // Save updated preferences
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { preferences: updatedPreferences },
      select: {
        id: true,
        email: true,
        preferences: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: updatedUser.preferences
    })

  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}

// DELETE - Clear user preferences
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        preferences: undefined // Use undefined instead of null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Preferences cleared successfully'
    })

  } catch (error) {
    console.error('Error clearing user preferences:', error)
    return NextResponse.json(
      { error: 'Failed to clear preferences' },
      { status: 500 }
    )
  }
}