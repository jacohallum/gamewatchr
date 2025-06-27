// lib/services/sportsService.ts

export interface Team {
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

export interface SportCategory {
  id: string
  name: string
  leagues: string[]
}

// Sports categories with their leagues
export const SPORT_CATEGORIES: SportCategory[] = [
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

// League display names
export const LEAGUE_NAMES: { [key: string]: string } = {
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

class SportsService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL || 'https://your-domain.com'
      : 'http://localhost:3000'
  }

  /**
   * Fetch teams for a specific sport/league
   */
  async getTeamsForSport(sport: string): Promise<Team[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sports/teams?sport=${sport}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch teams for ${sport}`)
      }

      const data = await response.json()
      return data.teams || []
    } catch (error) {
      console.error(`Error fetching teams for ${sport}:`, error)
      return []
    }
  }

  /**
   * Fetch teams for multiple sports at once
   */
  async getTeamsForMultipleSports(sports: string[]): Promise<{ [sport: string]: Team[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sports/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sports })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch teams for multiple sports')
      }

      const data = await response.json()
      return data.results || {}
    } catch (error) {
      console.error('Error fetching teams for multiple sports:', error)
      return {}
    }
  }

  /**
   * Get all available sports/leagues
   */
  getAvailableSports(): SportCategory[] {
    return SPORT_CATEGORIES
  }

  /**
   * Get league display name
   */
  getLeagueName(leagueId: string): string {
    return LEAGUE_NAMES[leagueId] || leagueId
  }

  /**
   * Search teams across all sports
   */
  async searchTeams(query: string): Promise<Team[]> {
    if (!query.trim()) {
      return []
    }

    try {
      // Get all sports
      const allSports = SPORT_CATEGORIES.flatMap(category => category.leagues)
      
      // Fetch teams for all sports
      const allTeams = await this.getTeamsForMultipleSports(allSports)
      
      // Flatten and search
      const teams = Object.values(allTeams).flat()
      
      return teams.filter(team => 
        team.name.toLowerCase().includes(query.toLowerCase()) ||
        team.displayName.toLowerCase().includes(query.toLowerCase()) ||
        team.location.toLowerCase().includes(query.toLowerCase()) ||
        team.abbreviation.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching teams:', error)
      return []
    }
  }

  /**
   * Get teams grouped by sport category
   */
  async getTeamsByCategory(): Promise<{ [category: string]: { [league: string]: Team[] } }> {
    const result: { [category: string]: { [league: string]: Team[] } } = {}

    for (const category of SPORT_CATEGORIES) {
      result[category.id] = {}
      
      for (const league of category.leagues) {
        const teams = await this.getTeamsForSport(league)
        result[category.id][league] = teams
      }
    }

    return result
  }
}

// Export singleton instance
export const sportsService = new SportsService()