// hooks/useSports.ts
import { useState, useEffect, useCallback } from 'react'
import { sportsService, Team, SportCategory, SPORT_CATEGORIES } from '@/lib/services/sportsService'

interface UseSportsReturn {
  // Data
  teams: Team[]
  teamsByCategory: { [category: string]: { [league: string]: Team[] } }
  availableSports: SportCategory[]
  
  // Loading states
  loading: boolean
  loadingSpecific: { [sport: string]: boolean }
  
  // Error states
  error: string | null
  errors: { [sport: string]: string }
  
  // Actions
  fetchTeamsForSport: (sport: string) => Promise<void>
  fetchTeamsForMultipleSports: (sports: string[]) => Promise<void>
  searchTeams: (query: string) => Promise<Team[]>
  clearError: () => void
  
  // Utils
  getLeagueName: (leagueId: string) => string
}

export function useSports(): UseSportsReturn {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsByCategory, setTeamsByCategory] = useState<{ [category: string]: { [league: string]: Team[] } }>({})
  const [loading, setLoading] = useState(false)
  const [loadingSpecific, setLoadingSpecific] = useState<{ [sport: string]: boolean }>({})
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ [sport: string]: string }>({})

  const clearError = useCallback(() => {
    setError(null)
    setErrors({})
  }, [])

  const fetchTeamsForSport = useCallback(async (sport: string) => {
    setLoadingSpecific(prev => ({ ...prev, [sport]: true }))
    setError(null)
    
    try {
      const sportTeams = await sportsService.getTeamsForSport(sport)
      setTeams(prev => {
        // Remove existing teams from this sport and add new ones
        const filteredTeams = prev.filter(team => team.sport !== sport)
        return [...filteredTeams, ...sportTeams]
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teams'
      setErrors(prev => ({ ...prev, [sport]: errorMessage }))
      setError(errorMessage)
    } finally {
      setLoadingSpecific(prev => ({ ...prev, [sport]: false }))
    }
  }, [])

  const fetchTeamsForMultipleSports = useCallback(async (sports: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await sportsService.getTeamsForMultipleSports(sports)
      
      // Flatten all teams
      const allTeams = Object.values(result).flat()
      setTeams(allTeams)
      
      // Update loading states
      const newLoadingStates: { [sport: string]: boolean } = {}
      sports.forEach(sport => {
        newLoadingStates[sport] = false
      })
      setLoadingSpecific(newLoadingStates)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teams'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const searchTeams = useCallback(async (query: string): Promise<Team[]> => {
    if (!query.trim()) {
      return []
    }
    
    try {
      return await sportsService.searchTeams(query)
    } catch (err) {
      console.error('Search error:', err)
      return []
    }
  }, [])

  const getLeagueName = useCallback((leagueId: string) => {
    return sportsService.getLeagueName(leagueId)
  }, [])

  return {
    // Data
    teams,
    teamsByCategory,
    availableSports: SPORT_CATEGORIES,
    
    // Loading states
    loading,
    loadingSpecific,
    
    // Error states
    error,
    errors,
    
    // Actions
    fetchTeamsForSport,
    fetchTeamsForMultipleSports,
    searchTeams,
    clearError,
    
    // Utils
    getLeagueName
  }
}

// Lightweight hook for just getting available sports
export function useAvailableSports() {
  return {
    sports: SPORT_CATEGORIES,
    getLeagueName: (leagueId: string) => sportsService.getLeagueName(leagueId)
  }
}

// Hook for searching teams
export function useTeamSearch() {
  const [searchResults, setSearchResults] = useState<Team[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    setSearchError(null)
    
    try {
      const results = await sportsService.searchTeams(query)
      setSearchResults(results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setSearchError(errorMessage)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setSearchError(null)
  }, [])

  return {
    searchResults,
    searching,
    searchError,
    search,
    clearSearch
  }
}