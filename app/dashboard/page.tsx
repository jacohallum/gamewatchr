// /app\dashboard\page.tsx
'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    console.log('Auth Status:', status)
    console.log('Session Data:', session)
    
    // Comment out redirect temporarily to break the loop
    // if (status === 'unauthenticated' && !isRedirecting) {
    //   setIsRedirecting(true)
    //   router.replace('/')
    // }
  }, [status, router, isRedirecting])

  // Clean logout function
  const handleSignOut = async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback redirect
      router.push('/')
    }
  }

  // Debug function to check session endpoint
  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      console.log('Session endpoint response:', sessionData)
    } catch (error) {
      console.error('Session check error:', error)
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // If no session, show the page anyway (temporarily)
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="text-lg mb-4">No active session detected</div>
          <div className="text-sm text-gray-400 mb-4">Status: {status}</div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded mr-3"
          >
            Go to Login Page
          </button>
          <button
            onClick={checkSession}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
          >
            Check Session
          </button>
        </div>
      </div>
    )
  }

  // Main dashboard content
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {session.user?.email || session.user?.name || 'User'}!
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={checkSession}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Debug Session
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          <div className="bg-gray-50 p-4 rounded border">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}