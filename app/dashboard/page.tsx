'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  // Enhanced logout function that clears cookies manually
  const handleSignOut = async () => {
    try {
      // Clear NextAuth cookies manually
      document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = '__Secure-next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;'
      document.cookie = '__Host-next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;'
      
      // Clear any other potential session storage
      localStorage.clear()
      sessionStorage.clear()
      
      // Sign out with NextAuth
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/'
    }
  }

  const liveScores = [
    { sport: 'NBA', game: 'Lakers 108 - Warriors 112', status: 'FINAL' },
    { sport: 'MLB', game: 'Yankees 7 - Red Sox 4', status: 'TOP 9th' },
    { sport: 'UFC', game: 'Main Event: Jones vs. Aspinall', status: 'LIVE' },
    { sport: 'NFL', game: 'Chiefs 24 - Bills 21', status: 'Q4 2:15' },
    { sport: 'Boxing', game: 'Canelo vs. Benavidez', status: 'Rd 8' },
    { sport: 'NBA', game: 'Celtics 95 - Heat 89', status: 'FINAL' },
    { sport: 'MLB', game: 'Dodgers 5 - Giants 3', status: 'BOT 7th' },
    { sport: 'UFC', game: 'Co-Main: Oliveira vs. Chandler', status: 'Next' }
  ]

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Game<span className="text-red-500">Watchr</span> Dashboard
              </h1>
              <p className="text-gray-400">Welcome back, {session?.user?.email}!</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Live Scores Grid */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></span>
            Live Scores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveScores.map((score, index) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-red-500/50 transition-colors duration-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-red-400 font-semibold text-sm">{score.sport}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    score.status === 'LIVE' ? 'bg-red-500 text-white' :
                    score.status === 'FINAL' ? 'bg-gray-600 text-gray-300' :
                    'bg-green-500 text-white'
                  }`}>
                    {score.status}
                  </span>
                </div>
                <p className="text-white font-medium">{score.game}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Upcoming Events</h3>
            <p className="text-3xl font-bold text-red-500">12</p>
            <p className="text-gray-400 text-sm">This week</p>
          </div>
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Followed Fighters</h3>
            <p className="text-3xl font-bold text-red-500">8</p>
            <p className="text-gray-400 text-sm">Active notifications</p>
          </div>
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Predictions</h3>
            <p className="text-3xl font-bold text-red-500">85%</p>
            <p className="text-gray-400 text-sm">Accuracy rate</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Your MMA Command Center</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🥊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Track Fighters</h3>
              <p className="text-gray-400 text-sm">Follow your favorite fighters and get notified about their upcoming fights</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Event Calendar</h3>
              <p className="text-gray-400 text-sm">Never miss an important fight with our comprehensive event calendar</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🔔</div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Notifications</h3>
              <p className="text-gray-400 text-sm">Get personalized alerts for fights, weigh-ins, and breaking news</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}