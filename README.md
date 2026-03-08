# OllaZen - Beauty & Wellness Booking Platform

A premium, mobile-first booking platform for beauty and wellness services built with Next.js 16, React 19, and TailwindCSS.

## Features

### Customer Experience
- **Search & Discovery**: Find spas, salons, barbers, and nail studios
- **Smart Filters**: Filter by category, city, rating, price range, availability
- **Map & List Views**: Toggle between map and list views for search results
- **Real-time Availability**: See available time slots in real-time
- **Instant Booking**: Book appointments with a seamless multi-step flow
- **User Dashboard**: Manage bookings, reviews, and account settings

### Provider Experience
- **Business Dashboard**: Track KPIs, revenue, and bookings
- **Calendar Management**: Day/week/month views of appointments
- **Service Management**: Add, edit, and manage services
- **Booking Actions**: Confirm, cancel, or complete bookings

### Design System
- Premium Airbnb + Fresha + Glossier aesthetic
- Mobile-first responsive design
- Smooth Framer Motion animations
- Consistent component library using Radix UI primitives

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: TailwindCSS + Radix UI + shadcn/ui patterns
- **State**: Zustand for auth, React Query for server state
- **Animations**: Framer Motion
- **Forms**: React Hook Form patterns
- **Date Handling**: date-fns
- **HTTP Client**: Custom API wrapper with automatic JWT handling

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Landing page
│   ├── search/              # Search & discovery
│   ├── business/[id]/       # Business profile
│   ├── service/[id]/        # Service booking flow
│   ├── bookings/            # User bookings list
│   │   └── [id]/            # Booking detail & review
│   ├── dashboard/           # User dashboard
│   ├── provider/            # Provider dashboard
│   ├── login/               # Login page
│   └── register/            # Registration page
│
├── components/              # React components
│   ├── ui/                  # Base UI components (shadcn-style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── modal.tsx
│   │   ├── tabs.tsx
│   │   ├── calendar.tsx
│   │   ├── rating-stars.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   └── skeleton.tsx
│   │
│   ├── AuthModal.tsx        # Global auth modal
│   ├── Navbar.tsx           # Main navigation
│   ├── Footer.tsx           # Site footer
│   ├── MobileNav.tsx        # Bottom mobile navigation
│   ├── HeroSearchBar.tsx    # Hero search component
│   ├── CategoryCard.tsx     # Category display cards
│   ├── CityCard.tsx         # City display cards
│   ├── BusinessPreviewCard.tsx  # Business cards for listings
│   ├── PhotoGallery.tsx     # Business photo gallery with lightbox
│   ├── ServiceListItem.tsx  # Service display component
│   ├── SearchFilters.tsx    # Search filter sidebar
│   ├── SearchMapView.tsx    # Map view for search
│   ├── HoursTable.tsx       # Business hours display
│   └── StickyBookButton.tsx # Mobile sticky booking CTA
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useBookings.ts      # Bookings CRUD hook
│   ├── useBusinesses.ts    # Businesses CRUD hook
│   └── useServices.ts      # Services hook
│
├── lib/                     # Utilities
│   ├── api.ts              # API client wrapper
│   ├── query-client.tsx    # React Query setup
│   └── utils.ts            # Helper functions
│
├── store/                   # State management
│   └── auth.ts             # Zustand auth store
│
└── types/                   # TypeScript types
    └── index.ts            # All type definitions
```

## Pages Overview

### Landing Page (`/`)
- Hero section with search bar
- Category grid (Spa, Salon, Barber, Nails)
- Popular cities section
- Featured businesses carousel
- CTA section

### Search Page (`/search`)
- URL query params: `?city=&category=&min_rating=&min_price=&max_price=&sort=`
- Sidebar filters (desktop) / bottom sheet (mobile)
- List view / Grid view / Map view toggle
- Infinite scroll pagination
- Active filter chips display

### Business Profile (`/business/[id]`)
- Photo gallery with lightbox
- Business info (name, category, rating, hours)
- Tabbed content: Services, About, Reviews
- Service list with book buttons
- Sticky booking CTA on mobile
- Opening hours table
- Location map placeholder

### Booking Flow (`/service/[id]`)
1. Service details display
2. Calendar date selection
3. Time slot grid
4. Booking confirmation summary
5. Auth modal trigger if not logged in
6. Final confirmation

### User Dashboard (`/dashboard`)
Tabs:
- **Upcoming**: Current and future bookings
- **Past**: Completed bookings with review options
- **Reviews**: User's reviews (placeholder)
- **Settings**: Profile and password management

### Provider Dashboard (`/provider`)
Tabs:
- **Overview**: KPI cards, recent bookings, business list
- **Calendar**: Day schedule view
- **Services**: Service management (CRUD)
- **Settings**: Business settings

## Component Library

### Base Components
| Component | Description |
|-----------|-------------|
| `Button` | Primary, secondary, outline, ghost, destructive variants |
| `Input` | Text input with label support |
| `Card` | Container component with header, content, footer |
| `Badge` | Status and category badges |
| `Modal` | Dialog with Radix UI primitives |
| `Tabs` | Animated tab navigation |
| `Calendar` | Date picker using react-day-picker |
| `RatingStars` | Display and interactive rating |
| `Slider` | Single and range slider inputs |
| `Switch` | Toggle switch |
| `Skeleton` | Loading state placeholders |

### Feature Components
| Component | Usage |
|-----------|-------|
| `HeroSearchBar` | Landing page hero search |
| `CategoryCard/Grid` | Category navigation |
| `CityCard/Grid` | City navigation |
| `BusinessPreviewCard` | Business listings |
| `PhotoGallery` | Business images with lightbox |
| `ServiceListItem` | Service display with booking |
| `SearchFilters` | Search filter controls |
| `AuthModal` | Login/signup modal |

## API Integration

### API Client (`lib/api.ts`)
- Automatic JWT token attachment via cookies
- Request/response error handling
- Type-safe response parsing
- Pagination support

### Endpoints Used
```typescript
// Auth
POST /api/v1/auth/register
POST /api/v1/auth/login
DELETE /api/v1/auth/logout
GET /api/v1/auth/me
PATCH /api/v1/auth/password

// Businesses
GET /api/v1/businesses
GET /api/v1/businesses/:id
GET /api/v1/businesses/:id/stats
GET /api/v1/businesses/:id/bookings

// Services
GET /api/v1/services/:id
GET /api/v1/services/:id/availability

// Bookings
GET /api/v1/bookings
GET /api/v1/bookings/:id
POST /api/v1/bookings
POST /api/v1/bookings/:id/confirm
POST /api/v1/bookings/:id/cancel
POST /api/v1/bookings/:id/complete

// Reviews
GET /api/v1/businesses/:id/reviews
POST /api/v1/reviews
```

## Adding a New Page

1. Create the page file in `app/[route]/page.tsx`
2. Use the `"use client"` directive for client components
3. Import necessary hooks and components
4. Follow the existing patterns for data fetching with React Query
5. Apply consistent styling with TailwindCSS classes
6. Add mobile-responsive layouts

Example:
```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PageSpinner } from "@/components/ui/spinner";

export default function NewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["new-feature"],
    queryFn: () => api.getSomething(),
  });

  if (isLoading) return <PageSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page content */}
    </div>
  );
}
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs on `http://localhost:3001` by default.

### Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run lint:fix # Fix ESLint issues
```

## Styling Guide

### Colors
- **Primary**: Premium purple (`#8b5cf6`), black (`#0a0a0a`) for typography and premium CTAs
- **Accent**: Warm gold (`#f0a94a`)
- **Success**: Green (`#22c55e`)
- **Neutral**: Warm grays

### Typography
- **Display**: Playfair Display (headings)
- **Body**: Inter (UI text)

### Spacing
- Use Tailwind spacing scale (4px base)
- Standard page padding: `px-4 sm:px-6 lg:px-8`
- Max content width: `max-w-7xl`

### Animation
- Use Framer Motion for page transitions
- Apply `transition-all duration-200` for micro-interactions
- Use `shadow-soft` for hover states

## Mobile Considerations

- Bottom navigation bar for mobile
- Sticky booking buttons
- Touch-friendly tap targets (min 44px)
- Swipeable carousels and galleries
- Responsive grid layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari iOS 15+
- Chrome for Android
# OllaZen Frontend
