'use client'
import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Mock the sports service for the artifact - in your real app, import from your actual service file
const SPORT_CATEGORIES = [
  {
    id: 'football',
    name: 'Football',
    leagues: ['nfl', 'college-football']
  },
  {
    id: 'basketball',
    name: 'Basketball',
    leagues: ['nba', 'wnba', 'mens-college-basketball', 'womens-college-basketball']
  },
  {
    id: 'baseball',
    name: 'Baseball',
    leagues: ['mlb']
  },
  {
    id: 'hockey',
    name: 'Hockey',
    leagues: ['nhl']
  },
  {
    id: 'soccer',
    name: 'Soccer',
    leagues: ['mls', 'premier-league', 'la-liga', 'bundesliga', 'serie-a', 'ligue-1']
  }
]

const LEAGUE_NAMES: { [key: string]: string } = {
  'nfl': 'NFL',
  'college-football': 'College Football',
  'nba': 'NBA',
  'wnba': 'WNBA',
  'mens-college-basketball': "Men's College Basketball",
  'womens-college-basketball': "Women's College Basketball",
  'mlb': 'MLB',
  'nhl': 'NHL',
  'mls': 'MLS',
  'premier-league': 'Premier League',
  'la-liga': 'La Liga',
  'bundesliga': 'Bundesliga',
  'serie-a': 'Serie A',
  'ligue-1': 'Ligue 1'
}

interface Team {
  id: string
  name: string
  displayName: string
  abbreviation: string
  location: string
  logo: string
  colors: {
    primary: string
    secondary: string
  }
  sport: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false) // Start false, will be set based on user preferences
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedTeams, setSelectedTeams] = useState<{[sport: string]: Team[]}>({})
  const [availableTeams, setAvailableTeams] = useState<{[sport: string]: Team[]}>({})
  const [loadingTeams, setLoadingTeams] = useState<{[sport: string]: boolean}>({})
  const [apiErrors, setApiErrors] = useState<{[sport: string]: string}>({})
  const [expandedSports, setExpandedSports] = useState<{[sportId: string]: boolean}>({})
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [loadingPreferences, setLoadingPreferences] = useState(true)

  // Load user preferences on component mount
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    } else if (status === 'authenticated') {
      loadUserPreferences()
    }
  }, [status])

  const loadUserPreferences = async () => {
    try {
      setLoadingPreferences(true)
      const response = await fetch('/api/user/preferences')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.hasPreferences && data.preferences) {
          // User has existing preferences - load them
          const { sports, teams } = data.preferences
          setSelectedSports(sports || [])
          setSelectedTeams(teams || {})
          setShowWelcomeModal(false) // Don't show modal for existing users
          console.log('✅ Loaded existing user preferences')
        } else {
          // First-time user - show welcome modal
          setShowWelcomeModal(true)
          console.log('👋 First-time user - showing welcome modal')
        }
      } else if (response.status === 401) {
        // User not authenticated - handle appropriately
        console.log('🔐 User not authenticated')
        setShowWelcomeModal(false)
      } else {
        // Error loading preferences - show modal as fallback
        console.log('⚠️ Error loading preferences - showing welcome modal')
        setShowWelcomeModal(true)
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
      setShowWelcomeModal(true) // Show modal on error
    } finally {
      setLoadingPreferences(false)
    }
  }

  // Fetch teams when a sport is expanded
  const toggleSportExpansion = async (sportId: string) => {
    const isCurrentlyExpanded = expandedSports[sportId]
    
    setExpandedSports(prev => ({
      ...prev,
      [sportId]: !prev[sportId]
    }))

    // If expanding and sport is selected, fetch teams
    if (!isCurrentlyExpanded && selectedSports.includes(sportId)) {
      await fetchTeamsForSport(sportId)
    }
  }

  const fetchTeamsForSport = async (sportId: string) => {
    const category = SPORT_CATEGORIES.find(cat => cat.id === sportId)
    if (!category) return

    const newLoadingStates: {[sport: string]: boolean} = {}
    const newApiErrors: {[sport: string]: string} = {}
    const newTeamsData: {[sport: string]: Team[]} = {}

    // Set loading states for all leagues in this sport
    category.leagues.forEach(league => {
      newLoadingStates[league] = true
    })
    setLoadingTeams(prev => ({ ...prev, ...newLoadingStates }))

    // Fetch teams for each league in this sport
    for (const league of category.leagues) {
      try {
        const response = await fetch(`/api/sports/teams?sport=${league}`)
        if (response.ok) {
          const data = await response.json()
          newTeamsData[league] = data.teams || []
          delete newApiErrors[league]
        } else {
          console.error(`Failed to fetch ${league} teams:`, response.statusText)
          newApiErrors[league] = `Failed to load ${LEAGUE_NAMES[league]} teams`
          newTeamsData[league] = generateMockTeams(league)
        }
      } catch (error) {
        console.error(`Error fetching ${league} teams:`, error)
        newApiErrors[league] = `Error loading ${LEAGUE_NAMES[league]} teams`
        newTeamsData[league] = generateMockTeams(league)
      }
      
      // Update loading state for this league
      newLoadingStates[league] = false
      setLoadingTeams(prev => ({ ...prev, [league]: false }))
    }

    setAvailableTeams(prev => ({ ...prev, ...newTeamsData }))
    setApiErrors(prev => ({ ...prev, ...newApiErrors }))
  }

  const fetchTeamsForSelectedSports = async () => {
    const newLoadingStates: {[sport: string]: boolean} = {}
    
    // Set loading states
    selectedSports.forEach(sportCategory => {
      SPORT_CATEGORIES.find(cat => cat.id === sportCategory)?.leagues.forEach(league => {
        newLoadingStates[league] = true
      })
    })
    setLoadingTeams(newLoadingStates)

    // Fetch real data from ESPN API
    const realTeamsData: {[sport: string]: Team[]} = {}
    const newApiErrors: {[sport: string]: string} = {}
    
    try {
      for (const sportCategory of selectedSports) {
        const category = SPORT_CATEGORIES.find(cat => cat.id === sportCategory)
        if (category) {
          for (const league of category.leagues) {
            try {
              // Call your ESPN API endpoint
              const response = await fetch(`/api/sports/teams?sport=${league}`)
              if (response.ok) {
                const data = await response.json()
                realTeamsData[league] = data.teams || []
                delete newApiErrors[league] // Clear any previous errors
              } else {
                console.error(`Failed to fetch ${league} teams:`, response.statusText)
                newApiErrors[league] = `Failed to load ${LEAGUE_NAMES[league]} teams`
                realTeamsData[league] = generateMockTeams(league) // Fallback to mock data
              }
            } catch (error) {
              console.error(`Error fetching ${league} teams:`, error)
              newApiErrors[league] = `Error loading ${LEAGUE_NAMES[league]} teams`
              realTeamsData[league] = generateMockTeams(league) // Fallback to mock data
            }
            
            // Update loading state for this league
            newLoadingStates[league] = false
            setLoadingTeams({...newLoadingStates})
          }
        }
      }
      
      setAvailableTeams(realTeamsData)
      setApiErrors(newApiErrors)
    } catch (error) {
      console.error('Error fetching teams:', error)
      // If API fails completely, fall back to mock data
      const mockTeamsData: {[sport: string]: Team[]} = {}
      selectedSports.forEach(sportCategory => {
        const category = SPORT_CATEGORIES.find(cat => cat.id === sportCategory)
        if (category) {
          category.leagues.forEach(league => {
            mockTeamsData[league] = generateMockTeams(league)
            newLoadingStates[league] = false
            newApiErrors[league] = 'Using demo data - API unavailable'
          })
        }
      })
      setAvailableTeams(mockTeamsData)
      setApiErrors(newApiErrors)
    }
    
    setLoadingTeams(newLoadingStates)
  }

  // Mock team data generator - replace with actual API calls
  const generateMockTeams = (league: string): Team[] => {
    const mockTeams: {[key: string]: Team[]} = {
      'nfl': [
        { id: '1', name: 'Chiefs', displayName: 'Kansas City Chiefs', abbreviation: 'KC', location: 'Kansas City', logo: '', colors: { primary: '#E31837', secondary: '#FFB81C' }, sport: 'nfl' },
        { id: '2', name: 'Bills', displayName: 'Buffalo Bills', abbreviation: 'BUF', location: 'Buffalo', logo: '', colors: { primary: '#00338D', secondary: '#C60C30' }, sport: 'nfl' },
        { id: '3', name: 'Cowboys', displayName: 'Dallas Cowboys', abbreviation: 'DAL', location: 'Dallas', logo: '', colors: { primary: '#041E42', secondary: '#869397' }, sport: 'nfl' }
      ],
      'nba': [
        { id: '4', name: 'Lakers', displayName: 'Los Angeles Lakers', abbreviation: 'LAL', location: 'Los Angeles', logo: '', colors: { primary: '#552583', secondary: '#FDB927' }, sport: 'nba' },
        { id: '5', name: 'Warriors', displayName: 'Golden State Warriors', abbreviation: 'GSW', location: 'Golden State', logo: '', colors: { primary: '#1D428A', secondary: '#FFC72C' }, sport: 'nba' },
        { id: '6', name: 'Celtics', displayName: 'Boston Celtics', abbreviation: 'BOS', location: 'Boston', logo: '', colors: { primary: '#007A33', secondary: '#BA9653' }, sport: 'nba' }
      ],
      'mlb': [
        { id: '7', name: 'Yankees', displayName: 'New York Yankees', abbreviation: 'NYY', location: 'New York', logo: '', colors: { primary: '#132448', secondary: '#C4CED4' }, sport: 'mlb' },
        { id: '8', name: 'Dodgers', displayName: 'Los Angeles Dodgers', abbreviation: 'LAD', location: 'Los Angeles', logo: '', colors: { primary: '#005A9C', secondary: '#FFFFFF' }, sport: 'mlb' }
      ]
    }
    return mockTeams[league] || []
  }

  const handleSportToggle = async (sportId: string) => {
    const isCurrentlySelected = selectedSports.includes(sportId)
    
    if (isCurrentlySelected) {
      // Deselecting sport - remove from selected and collapse
      setSelectedSports(prev => prev.filter(s => s !== sportId))
      setExpandedSports(prev => ({ ...prev, [sportId]: false }))
      
      // Clear selected teams for this sport
      const category = SPORT_CATEGORIES.find(cat => cat.id === sportId)
      if (category) {
        const newSelectedTeams = { ...selectedTeams }
        category.leagues.forEach(league => {
          delete newSelectedTeams[league]
        })
        setSelectedTeams(newSelectedTeams)
      }
    } else {
      // Selecting sport - add to selected and auto-expand
      setSelectedSports(prev => [...prev, sportId])
      setExpandedSports(prev => ({ ...prev, [sportId]: true }))
      
      // Fetch teams for this sport
      await fetchTeamsForSport(sportId)
    }
  }

  const handleTeamToggle = (league: string, team: Team) => {
    setSelectedTeams(prev => ({
      ...prev,
      [league]: prev[league]?.some(t => t.id === team.id)
        ? prev[league].filter(t => t.id !== team.id)
        : [...(prev[league] || []), team]
    }))
  }

  const handleNext = () => {
    if (selectedSports.length === 0) {
      alert('Please select at least one sport')
      return
    }
    // No need to change steps anymore - everything is in one interface
  }

  const handleFinish = async () => {
    if (selectedSports.length === 0) {
      alert('Please select at least one sport before getting started!')
      return
    }

    try {
      setSavingPreferences(true)
      console.log('💾 Saving user preferences...')
      console.log('Selected Sports:', selectedSports)
      console.log('Selected Teams:', selectedTeams)

      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sports: selectedSports,
          teams: selectedTeams
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Preferences saved successfully!')
        console.log('Response:', data)
        
        // Close modal and show success
        setShowWelcomeModal(false)
        
        // Optional: Show success message
        // You could add a toast notification here
        
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to save preferences:', errorData)
        alert(`Failed to save preferences: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('💥 Error saving preferences:', error)
      alert('An error occurred while saving your preferences. Please try again.')
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleSkip = async () => {
    try {
      // Save empty preferences to mark user as not first-time
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sports: [],
          teams: {},
          skipped: true
        })
      })
      console.log('⏭️ User skipped preferences setup')
    } catch (error) {
      console.error('Error saving skip action:', error)
    }
    
    setShowWelcomeModal(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/',
        redirect: true
      })
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/')
    }
  }

  // Loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">
                Game<span className="text-red-500">Watchr</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {session.user?.email?.split('@')[0] || 'Fighter'}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingPreferences ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Loading Your Dashboard</h2>
              <p className="text-gray-400">Getting your preferences ready...</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-white">
            
            {/* Show user's preferences summary if they exist */}
            {selectedSports.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-4">Your Sports Preferences</h3>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {selectedSports.map(sportId => {
                    const sport = SPORT_CATEGORIES.find(s => s.id === sportId)
                    return sport ? (
                      <span key={sportId} className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                        {sport.name}
                      </span>
                    ) : null
                  })}
                </div>
                <p className="text-gray-400 text-sm">
                  {Object.values(selectedTeams).flat().length} teams selected
                </p>
                <button
                  onClick={() => setShowWelcomeModal(true)}
                  className="mt-4 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Update Preferences
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome to Game<span className="text-red-500">Watchr</span>!
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Select your favorite sports and teams
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {selectedSports.length} sport{selectedSports.length !== 1 ? 's' : ''} selected
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Which sports interest you?</h3>
                <p className="text-gray-400 text-sm mb-6">Click on a sport to select it and expand to choose your favorite teams.</p>
                
                <div className="space-y-3">
                  {SPORT_CATEGORIES.map((sport) => {
                    const isSelected = selectedSports.includes(sport.id)
                    const isExpanded = expandedSports[sport.id]
                    
                    return (
                      <div key={sport.id} className="bg-gray-700/30 rounded-lg overflow-hidden">
                        {/* Sport Header */}
                        <div className="flex">
                          {/* Select/Deselect Button */}
                          <button
                            onClick={() => handleSportToggle(sport.id)}
                            className={`flex-shrink-0 p-4 border-r border-gray-600 transition-all duration-200 ${
                              isSelected
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <div className="w-6 h-6 rounded border-2 flex items-center justify-center">
                              {isSelected && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </button>
                          
                          {/* Sport Info and Expand Button */}
                          <button
                            onClick={() => isSelected && toggleSportExpansion(sport.id)}
                            disabled={!isSelected}
                            className={`flex-1 p-4 text-left flex items-center justify-between transition-colors duration-200 ${
                              isSelected ? 'hover:bg-gray-600/30' : 'cursor-not-allowed opacity-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div>
                                <h4 className="text-lg font-medium text-white">{sport.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {sport.leagues.length} {sport.leagues.length === 1 ? 'league' : 'leagues'} available
                                </p>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="flex items-center space-x-2">
                                {/* Selected teams count */}
                                {Object.values(selectedTeams).flat().filter(team => 
                                  sport.leagues.includes(team.sport)
                                ).length > 0 && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                    {Object.values(selectedTeams).flat().filter(team => 
                                      sport.leagues.includes(team.sport)
                                    ).length} teams
                                  </span>
                                )}
                                
                                {/* Expand/Collapse Icon */}
                                <svg
                                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        </div>

                        {/* Teams Content - Only show if selected and expanded */}
                        {isSelected && isExpanded && (
                          <div className="px-4 pb-4 space-y-4 border-t border-gray-600">
                            {sport.leagues.map((league) => (
                              <div key={league}>
                                <h5 className="text-md font-medium text-gray-300 mb-2 mt-4">
                                  {LEAGUE_NAMES[league]}
                                  {apiErrors[league] && (
                                    <span className="ml-2 text-xs text-yellow-400">
                                      ⚠️ {apiErrors[league]}
                                    </span>
                                  )}
                                </h5>
                                {loadingTeams[league] ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                                    <span className="ml-2 text-gray-400">Loading teams...</span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {availableTeams[league]?.map((team) => (
                                      <button
                                        key={team.id}
                                        onClick={() => handleTeamToggle(league, team)}
                                        className={`p-3 rounded-lg text-sm transition-all duration-200 text-left flex items-center space-x-3 ${
                                          selectedTeams[league]?.some(t => t.id === team.id)
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                      >
                                        {/* Team Logo */}
                                        <div className="flex-shrink-0">
                                          {team.logo ? (
                                            <img 
                                              src={team.logo} 
                                              alt={`${team.name} logo`}
                                              className="w-8 h-8 object-contain"
                                              onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                              }}
                                            />
                                          ) : (
                                            <div 
                                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                              style={{ backgroundColor: team.colors.primary }}
                                            >
                                              {team.abbreviation.slice(0, 2)}
                                            </div>
                                          )}
                                        </div>
                                        
                                        {/* Team Info */}
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">{team.name}</div>
                                          <div className="text-xs opacity-75 truncate">{team.location}</div>
                                        </div>
                                      </button>
                                    )) || (
                                      <div className="col-span-full text-center text-gray-500 py-4">
                                        No teams available
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 flex justify-between">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                Skip for now
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={handleFinish}
                  disabled={selectedSports.length === 0 || savingPreferences}
                  className={`px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                    selectedSports.length === 0 || savingPreferences
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {savingPreferences ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Get Started</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}