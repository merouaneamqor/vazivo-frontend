# Next.js Knowledge Guide for Agents

This document serves as a comprehensive reference guide for Next.js best practices, patterns, and conventions used in this project.

## Project Overview
- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: Detected from lock files (pnpm/npm/yarn/bun)
- **Git Integration**: Connected to Vercel (auto-deploy on push)

## Core Architecture

### 1. App Router Structure (Next.js 16)
```
app/
├── layout.tsx              # Root layout with fonts and metadata
├── page.tsx                # Home page
├── sitemap.ts              # Dynamic sitemap generation
├── api/                    # API routes
│   └── v1/[...path]/      # API proxy to backend
└── [segment]/              # Dynamic routes
```

### 2. Key Conventions
- **Server Components** are default (use async/await directly)
- **Client Components** require `'use client'` directive at top
- **Dynamic Routes** use `[param]` or `[...path]` brackets
- **Route Handlers** are in `route.ts` files

## Async/Await Patterns in Next.js 16

### Server Components (Async by Default)
```tsx
// app/page.tsx
export default async function Page() {
  const data = await fetch('...')
  return <div>{data}</div>
}
```

### Route Handlers (Async Functions)
```tsx
// app/api/route.ts
export async function GET(request: Request) {
  return Response.json({ data: ... })
}
```

### Important: params, searchParams, headers, cookies
In Next.js 16, these are **NO LONGER synchronous** and MUST be awaited:

```tsx
// ❌ WRONG - Will cause errors
export default function Page({ params }) {
  const slug = params.slug; // Error!
}

// ✅ CORRECT - Always await
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // Correct!
}

// ✅ Also correct in route handlers
export async function GET(request: Request) {
  const searchParams = await request.nextUrl.searchParams // Await if needed
}
```

## Caching & Revalidation

### API Response Caching
```tsx
// Cache for 1 hour
fetch(url, { next: { revalidate: 3600 } })

// No cache (dynamic)
fetch(url, { cache: 'no-store' })

// Revalidate with cache life profile
revalidateTag('key', 'max') // 'max', 'days', 'hours'
```

### Tag-Based Revalidation
```tsx
// Revalidate specific tags
import { revalidateTag } from 'next/cache'
revalidateTag('businesses', 'max')

// Update tags (Server Actions only)
import { updateTag } from 'next/cache'
updateTag(`user-${userId}`)

// Refresh uncached data only
import { refresh } from 'next/cache'
refresh()
```

## Data Fetching Patterns

### RSC (React Server Component) - Recommended
```tsx
// app/page.tsx
async function getData() {
  const res = await fetch(`${apiUrl}/data`)
  return res.json()
}

export default async function Page() {
  const data = await getData()
  return <DataComponent data={data} />
}
```

### Client-Side with SWR
```tsx
'use client'
import useSWR from 'swr'

export default function Component() {
  const { data, isLoading } = useSWR('/api/data', fetcher)
  return <div>{data?.message}</div>
}
```

### Server Actions
```tsx
'use server'
export async function updateUser(formData: FormData) {
  const name = formData.get('name')
  // Database operation
  return { success: true }
}
```

## Internationalization (i18n)

### Using Translations
```tsx
'use client'
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('namespace')
  return <h1>{t('key')}</h1>
}
```

### Translation Files Location
```
messages/
├── en.json
├── fr.json
└── ar.json
```

### Adding New Translation Keys
1. Add the key to **ALL** three language files (en.json, fr.json, ar.json)
2. Use consistent key naming (camelCase or snake_case)
3. Group related keys under namespaces in the JSON

**Example in component:**
```tsx
const t = useTranslations('home')
<h1>{t('searchLabel')}</h1>
<input placeholder={t('serviceCategory')} />
```

## Styling with Tailwind CSS

### Design Token System
All colors defined in:
- `tailwind.config.ts` - Color definitions
- `globals.css` - CSS variables

**DO NOT use direct colors like `text-white` or `bg-black`. Always use design tokens:**
```tsx
// ❌ Wrong
<div className="bg-white text-black"></div>

// ✅ Correct
<div className="bg-background text-foreground"></div>
```

### Common Design Tokens
- **Backgrounds**: `bg-background`, `bg-neutral-50`
- **Text**: `text-foreground`, `text-neutral-900`, `text-neutral-500`
- **Borders**: `border-neutral-200`, `border-neutral-100`
- **Accents**: `text-accent-500`, `bg-primary-500`

### Layout Patterns
```tsx
// Flexbox (Primary - use most of the time)
<div className="flex items-center justify-between gap-4">

// Grid (For 2D layouts)
<div className="grid grid-cols-3 gap-4 md:grid-cols-2 lg:grid-cols-4">

// Spacing (Use Tailwind scale, not arbitrary)
<div className="p-4 mx-2 py-6"> // ✅ Good
<div className="p-[16px] mx-[8px]"> // ❌ Avoid arbitrary values
```

## Component Architecture

### Single Responsibility
- One component per file (when possible)
- Break large pages into smaller components
- Import components into main page

### Example Structure
```
app/
├── page.tsx               # Main page, imports components
└── components/
    ├── HeroSection.tsx    # Hero area
    ├── SearchBar.tsx      # Search functionality
    └── Features.tsx       # Features section
```

### Component Patterns
```tsx
// Server Component (handles data, no interactivity)
async function DataFetcher() {
  const data = await fetch(...)
  return <Display data={data} />
}

// Client Component (handles interactivity)
'use client'
function Display({ data }) {
  const [state, setState] = useState()
  return <div>{state}</div>
}
```

## API Integration

### API Proxy Pattern
This project uses an API proxy at `/app/api/v1/[...path]/route.ts`:

```tsx
// Usage in components
const response = await fetch('/api/v1/public/businesses?page=1')
const data = await response.json()
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_URL=https://app.example.com
```

Access in code:
```tsx
const apiUrl = process.env.NEXT_PUBLIC_API_URL
const url = `${apiUrl}/public/businesses`
```

## Dynamic Content Generation

### Sitemap Generation
```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all dynamic URLs
  const businesses = await fetchAllBusinesses()
  
  return [
    { url: '/home', lastModified: new Date() },
    ...businesses.map(b => ({
      url: `/business/${b.slug}`,
      lastModified: new Date(b.updated_at),
      priority: 0.6,
    }))
  ]
}
```

### Key Patterns for Sitemap
1. **Pagination loops**: Use `while (hasMore)` with proper pagination logic
2. **Total pages check**: Compare `currentPage < totalPages` (not length check)
3. **Error handling**: Check response status before parsing JSON
4. **Logging**: Add console.logs for debugging pagination

## SEO & Metadata

### Layout Metadata
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Your App Name',
  description: 'Your description',
  openGraph: { ... }
}

export const viewport: Viewport = {
  themeColor: '#color',
  userScalable: true,
}
```

### Page-Specific Metadata
```tsx
// app/page.tsx
export const metadata: Metadata = {
  title: 'Home | App Name',
  description: 'Home page description',
}
```

## Performance Optimization

### React Compiler (Available in Next.js 16)
Enable in `next.config.js`:
```js
const nextConfig = {
  reactCompiler: true,
}
```

### Image Optimization
```tsx
import Image from 'next/image'

<Image 
  src="/image.jpg" 
  alt="description"
  width={800}
  height={600}
  priority={true}
/>
```

### Font Optimization
```tsx
// app/layout.tsx
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

// Apply via tailwind config
export default function RootLayout({ children }) {
  return <html className={geist.className}>{children}</html>
}
```

## Common Pitfalls & Solutions

### ❌ Fetching in useEffect (Client Components)
```tsx
// WRONG - Can cause race conditions
'use client'
useEffect(() => {
  fetch('/api/data').then(...)
}, [])
```

### ✅ Correct Approaches
1. **Use RSC** - Fetch in server component
2. **Use SWR** - Better caching and sync between tabs
3. **Use Route Handlers** - Server-side processing

### ❌ Not Awaiting params/searchParams
```tsx
// WRONG in Next.js 16
export default function Page({ params }) {
  const slug = params.slug // Will be undefined!
}

// CORRECT
export default async function Page({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
}
```

### ❌ Using localStorage Across Server/Client
```tsx
// WRONG - localStorage doesn't exist on server
const user = localStorage.getItem('user')

// CORRECT - Use useEffect to access after hydration
'use client'
useEffect(() => {
  const user = localStorage.getItem('user')
}, [])
```

## File Structure Best Practices

### `/app` Directory
- Main application code
- Routes follow file structure
- Server-rendered by default

### `/components`
- Reusable components
- Organized by feature/type
- Client or server components

### `/lib`
- Utility functions
- API helpers
- Shared logic

### `/public`
- Static assets
- Images, fonts, documents
- Directly accessible

### `/messages`
- Translation files
- en.json, fr.json, ar.json
- Namespace-organized

## Debugging Tips

### Adding Logs
```tsx
// Use descriptive logs for debugging
console.log("[v0] Component rendered:", { data, props })
console.log("[v0] API call result:", response.status)
console.log("[v0] State updated:", newState)
```

### Remember to Remove Debug Logs
Once debugging is complete, remove all `console.log("[v0]")` statements.

## Git & Deployment

### Branch Structure
- **Base Branch**: `master` (main production branch)
- **Head Branch**: `v0/` prefixed for v0 agent changes
- **Auto-deployment**: Changes push to branch and auto-deploy on Vercel

### Commit Guidelines
- Descriptive commit messages
- Reference related features/bugs
- Keep commits atomic

## Version & Compatibility Notes

### Next.js 16 Specific
- ✅ Turbopack is default (stable)
- ✅ React Compiler support
- ✅ `params`/`searchParams` are async promises
- ✅ New cache APIs with `cacheLife`
- ✅ `updateTag()` and `refresh()` for cache management

### TypeScript Configuration
- Strict mode enabled
- Path aliases configured in `tsconfig.json`
- Always use types for props

## Related Files to Check
- `app/layout.tsx` - Root layout and fonts
- `tailwind.config.ts` - Design tokens
- `globals.css` - CSS variables
- `next.config.mjs` - Next.js configuration
- `components/HeroSearchBar.tsx` - Multi-language search implementation example
- `app/sitemap.ts` - Pagination and dynamic generation example

---

**Last Updated**: March 1, 2026
**Project**: ollazen.com
**Contact**: Reference this guide when working with Next.js 16 patterns in this project.
