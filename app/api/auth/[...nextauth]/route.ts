//app\api\auth\[...nextauth]\route.ts
import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔍 Authorize function called with:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }
       
        try {
          console.log('🔍 Looking for user in database...')
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          }) as any
          
          console.log('👤 User found:', user ? 'Yes' : 'No')
         
          if (user && user.password) {
            console.log('🔐 Comparing passwords...')
            const passwordMatch = await compare(credentials.password, user.password)
            console.log('🔐 Password match:', passwordMatch)
            
            if (passwordMatch) {
              // Return user without password for security
              const { password, ...userWithoutPassword } = user
              console.log('✅ Authentication successful')
              return userWithoutPassword
            }
          }
          
          console.log('❌ Authentication failed')
          return null
        } catch (error) {
          console.error('💥 Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  pages: {
    signIn: '/',
  },
  // Add debug logging
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }