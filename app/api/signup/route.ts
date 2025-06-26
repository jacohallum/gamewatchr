// app/api/signup/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    // Hash password and create user in one step
    const hashedPassword = await hash(password, 12)
    
    const user = await prisma.user.create({
    data: {
        email,
        password: hashedPassword,
    } as any,
    select: {
        id: true,
        email: true,
        createdAt: true,
    }
    })

    return NextResponse.json({ 
      message: 'User created successfully',
      user 
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  }
}