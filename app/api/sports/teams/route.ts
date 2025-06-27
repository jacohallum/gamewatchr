// app/api/sports/teams/route.ts
import { NextRequest, NextResponse } from 'next/server'

// ESPN API endpoints mapping
const ESPN_ENDPOINTS = {
  'nfl': 'http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams',
  'college-football': 'http://site.api.espn.com/apis/site/v2/sports/football/college-football/teams',
  'nba': 'http://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams',
  'wnba': 'http://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams',
  'mens-college-basketball': 'http://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/teams',
  'womens-college-basketball': 'http://site.api.espn.com/apis/site/v2/sports/basketball/womens-college-basketball/teams',
  'mlb': 'http://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams',
  'nhl': 'http://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams',
  // Soccer leagues
  'mls': 'http://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/teams',
  'premier-league': 'http://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/teams',
  'la-liga': 'http://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/teams',
  'bundesliga': 'http://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/teams',
  'serie-a': 'http://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/teams',
  'ligue-1': 'http://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/teams',
}

interface ESPNTeam {
  id: string
  uid: string
  slug: string
  abbreviation: string
  displayName: string
  shortDisplayName: string
  name: string
  nickname: string
  location: string
  color: string
  alternateColor: string
  isActive: boolean
  logos: Array<{
    href: string
    alt: string
    rel: string[]
    width: number
    height: number
  }>
}

interface ProcessedTeam {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const league = searchParams.get('league')
    
    // If no sport specified, return available sports
    if (!sport) {
      return NextResponse.json({
        availableSports: Object.keys(ESPN_ENDPOINTS),
        message: 'Specify a sport parameter to get teams'
      })
    }

    // Check if sport/league exists in our endpoints
    const endpoint = ESPN_ENDPOINTS[sport as keyof typeof ESPN_ENDPOINTS]
    if (!endpoint) {
      return NextResponse.json(
        { 
          error: 'Sport not found', 
          availableSports: Object.keys(ESPN_ENDPOINTS) 
        },
        { status: 400 }
      )
    }

    console.log(`Fetching teams for ${sport} from: ${endpoint}`)

    // Fetch data from ESPN API
    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'GameWatchr/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`ESPN API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Process and normalize the team data
    const teams: ProcessedTeam[] = data.sports?.[0]?.leagues?.[0]?.teams?.map((teamData: any) => {
      const team: ESPNTeam = teamData.team
      
      // Find best logo (prefer larger logos)
      const bestLogo = team.logos?.sort((a, b) => (b.width || 0) - (a.width || 0))?.[0]?.href || ''
      
      return {
        id: team.id,
        name: team.name,
        displayName: team.displayName,
        abbreviation: team.abbreviation,
        location: team.location,
        logo: bestLogo,
        colors: {
          primary: team.color ? `#${team.color}` : '#000000',
          secondary: team.alternateColor ? `#${team.alternateColor}` : '#FFFFFF'
        },
        sport: sport
      }
    }) || []

    return NextResponse.json({
      sport,
      teamCount: teams.length,
      teams,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch teams',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Optional: Add a POST endpoint to fetch multiple sports at once
export async function POST(request: NextRequest) {
  try {
    const { sports } = await request.json()
    
    if (!Array.isArray(sports)) {
      return NextResponse.json(
        { error: 'Sports parameter must be an array' },
        { status: 400 }
      )
    }

    const results: { [key: string]: ProcessedTeam[] } = {}
    const errors: { [key: string]: string } = {}

    // Fetch teams for each sport concurrently
    await Promise.allSettled(
      sports.map(async (sport) => {
        const endpoint = ESPN_ENDPOINTS[sport as keyof typeof ESPN_ENDPOINTS]
        if (!endpoint) {
          errors[sport] = 'Sport not found'
          return
        }

        try {
          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': 'GameWatchr/1.0'
            }
          })

          if (!response.ok) {
            throw new Error(`ESPN API responded with status: ${response.status}`)
          }

          const data = await response.json()
          
          const teams: ProcessedTeam[] = data.sports?.[0]?.leagues?.[0]?.teams?.map((teamData: any) => {
            const team: ESPNTeam = teamData.team
            const bestLogo = team.logos?.sort((a, b) => (b.width || 0) - (a.width || 0))?.[0]?.href || ''
            
            return {
              id: team.id,
              name: team.name,
              displayName: team.displayName,
              abbreviation: team.abbreviation,
              location: team.location,
              logo: bestLogo,
              colors: {
                primary: team.color ? `#${team.color}` : '#000000',
                secondary: team.alternateColor ? `#${team.alternateColor}` : '#FFFFFF'
              },
              sport: sport
            }
          }) || []

          results[sport] = teams
        } catch (error) {
          errors[sport] = error instanceof Error ? error.message : 'Unknown error'
        }
      })
    )

    return NextResponse.json({
      results,
      errors,
      totalSports: sports.length,
      successfulSports: Object.keys(results).length,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in batch fetch:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch teams',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}