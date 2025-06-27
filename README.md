# GameWatchr 🥊

**A Masters Project in Software Engineering**

Your ultimate MMA and sports command center. Track your favorite fighters, teams, and never miss an event!

*This project demonstrates modern web development practices, real-time data integration, and user experience design for sports enthusiasts.*

## 🎓 Academic Project Overview

This is a comprehensive full-stack web application developed as part of a Masters in Software Engineering program. The project showcases:

- **Modern Web Architecture** with Next.js 14 and TypeScript
- **Real-time API Integration** with external sports data sources
- **Secure Authentication Systems** with industry-standard practices
- **Database Design** and ORM implementation
- **User Experience Design** with responsive interfaces
- **Progressive Web App** development principles

## 🚀 Current Features

### Authentication System
- **Secure Login/Signup** with NextAuth.js and bcrypt password hashing
- **Session Management** with JWT tokens
- **Protected Routes** with automatic redirects
- **Database Integration** with PostgreSQL via Prisma

### Sports & Teams Management
- **Real-time Sports Data** from ESPN API
- **Multi-sport Support**: NFL, NBA, MLB, NHL, Soccer leagues, and more
- **Team Selection** with logos, colors, and detailed information
- **User Preferences** saved to database with full CRUD operations

### User Experience
- **Welcome Modal** for first-time users with sport/team selection
- **Collapsible Interface** with expandable sport categories
- **Loading States** with spinners and progress indicators
- **Error Handling** with fallback to mock data
- **Responsive Design** optimized for all screen sizes

### Technical Implementation
- **TypeScript** for type safety and better development experience
- **Server-side Rendering** with Next.js 14 App Router
- **Database ORM** with Prisma for type-safe database operations
- **RESTful API Routes** for data fetching and user management
- **Modern UI** with Tailwind CSS utility framework

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript for better code quality
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - Modern state management and side effects

### Backend
- **NextAuth.js** - Authentication library with multiple providers
- **Prisma ORM** - Type-safe database toolkit
- **PostgreSQL** - Production-ready relational database
- **bcryptjs** - Secure password hashing

### External APIs
- **ESPN API** - Real sports data and team information
- **Custom API Routes** - User preferences and data management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Git

### Step-by-Step Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gamewatchr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/gamewatchr"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Architecture & Project Structure

```
gamewatchr/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   ├── signup/               # User registration endpoint
│   │   ├── sports/teams/         # ESPN API integration
│   │   └── user/preferences/     # User preferences CRUD
│   ├── dashboard/                # Protected dashboard page
│   └── page.tsx                  # Landing/login page
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Database client configuration
│   └── services/                 # Business logic services
├── hooks/                        # Custom React hooks
├── prisma/                       # Database schema and migrations
│   └── schema.prisma             # Database schema definition
└── components/                   # Reusable UI components
```

## 🎯 API Design

### Authentication Endpoints
- `POST /api/signup` - User registration with validation
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signout` - Session termination

### Sports Data Endpoints
- `GET /api/sports/teams?sport={league}` - Fetch teams for specific league
- `POST /api/sports/teams` - Batch fetch teams for multiple leagues

### User Management Endpoints
- `GET /api/user/preferences` - Retrieve user sports preferences
- `POST /api/user/preferences` - Create/save user preferences
- `PUT /api/user/preferences` - Update existing preferences
- `DELETE /api/user/preferences` - Remove user preferences

## 🗃️ Database Design

### Core Schema
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hashed
  preferences   Json?     // Flexible JSON for sports/teams data
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  // Additional relations for future features
}
```

### Supported Sports & Leagues
- **Football**: NFL, College Football (NCAA)
- **Basketball**: NBA, WNBA, Men's College, Women's College
- **Baseball**: MLB
- **Hockey**: NHL
- **Soccer**: MLS, Premier League, La Liga, Bundesliga, Serie A, Ligue 1

## 🎨 User Interface Design

### Landing Page Features
- **Octagon-shaped login form** inspired by MMA design
- **Animated sports ticker** with real-time data
- **Dual-mode authentication** (Sign In / Sign Up)
- **Form validation** with user-friendly error messages

### Dashboard Features
- **Authentication guards** with loading states
- **First-time user onboarding** with welcome modal
- **Collapsible sport categories** for better organization
- **Team selection interface** with ESPN logos and colors
- **Preferences management** with real-time updates

## 🧠 Planned Features (Future Development)

### UFC Fight Night Module
- **Live Fight Cards** with real-time event tracking
- **Fighter Profiles** with comprehensive stats and bios
- **AI Matchup Analysis** using machine learning for predictions
- **Post-Fight Recaps** with GPT-generated summaries

### AI & Machine Learning Integration
- **Smart Notifications** with natural language processing
- **Sentiment Analysis** of social media reactions
- **AI Power Rankings** with weekly algorithm updates
- **Natural Language Search** for intuitive data queries

### Enhanced User Experience
- **Interactive Data Visualizations** with Chart.js/D3.js
- **Event Timeline Views** for upcoming games and fights
- **Live Score Ticker** with WebSocket connections
- **Progressive Web App** features for mobile experience

### Advanced Features
- **Dark Mode Toggle** with system preference detection
- **Accessibility Compliance** (WCAG 2.1 AA standards)
- **Dashboard Customization** with drag-and-drop interface
- **Admin Panel** for content and user management

## 🔧 Technical Configuration

### ESPN API Integration
- **Rate Limiting** and error handling for external API calls
- **Data Normalization** for consistent team information
- **Caching Strategy** to minimize API requests
- **Fallback Mechanisms** with mock data for development

### Security Implementation
- **Password Security**: bcrypt hashing with 12 salt rounds
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **CSRF Protection**: Built-in NextAuth.js security
- **Session Security**: Secure JWT token management
- **Input Validation**: Client and server-side validation
- **Environment Security**: Sensitive data in environment variables

## 🎯 Learning Objectives Demonstrated

1. **Full-Stack Development**: End-to-end application development
2. **Modern JavaScript/TypeScript**: Advanced language features and typing
3. **Database Design**: Relational database modeling and optimization
4. **API Design**: RESTful API development and integration
5. **Authentication**: Secure user management and session handling
6. **User Experience**: Responsive design and accessibility
7. **Real-time Data**: External API integration and data processing
8. **Testing**: Unit and integration testing practices
9. **Deployment**: Production deployment and environment management
10. **Version Control**: Git workflow and project management

## 📊 Project Metrics

- **Languages**: TypeScript (primary), JavaScript, SQL
- **Lines of Code**: ~3,000+ (estimated)
- **Components**: 15+ React components
- **API Endpoints**: 8 custom endpoints
- **Database Tables**: 10+ models with relationships
- **External APIs**: ESPN Sports API integration
- **Testing Coverage**: Unit and integration tests

## 🛡️ Security & Best Practices

- **OWASP Security Guidelines** implementation
- **Data Privacy** compliance considerations
- **Input Sanitization** and validation
- **Secure Headers** and HTTPS enforcement
- **Rate Limiting** for API endpoints
- **Error Handling** without information disclosure

## 📚 Documentation & Resources

### Key Technologies Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Academic References
- Modern web development practices and architecture patterns
- Database design principles and normalization
- User experience design for web applications
- Security best practices for web applications

### Technical Acknowledgments
- **ESPN** for providing comprehensive sports data API
- **NextAuth.js** for robust authentication framework
- **Prisma** for type-safe database operations
- **Tailwind CSS** for utility-first styling approach
- **Vercel** for Next.js framework development

---

**Developed as part of Masters in Software Engineering coursework, demonstrating modern web development practices and real-world application design.**