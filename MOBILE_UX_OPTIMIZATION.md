# Mobile UX & Performance Optimization Guide

## Overview
This guide outlines best practices implemented to improve mobile performance and user experience on Ollazen.

## Core Web Vitals Optimization

### LCP (Largest Contentful Paint) - Target: < 2.5s
- **Implemented**:
  - Image optimization with Cloudinary integration
  - Lazy loading for below-the-fold images
  - Web font optimization with `display: swap`
  - Critical resource preconnection in layout

### FID/INP (First Input Delay / Interaction to Next Paint) - Target: < 100ms
- **Implemented**:
  - Code splitting with React.lazy() and Suspense
  - Efficient event handlers with useCallback
  - Debounced search input
  - Minimized JavaScript bundle

### CLS (Cumulative Layout Shift) - Target: < 0.1
- **Implemented**:
  - Fixed image dimensions (width/height)
  - Aspect ratio containers
  - Reserve space for dynamic content
  - Optimized font loading

## Image Optimization Strategy

### Use OptimizedImage Component
```tsx
import { OptimizedImage } from "@/components/OptimizedImage";

<OptimizedImage
  src={imageUrl}
  alt="Description"
  width={400}
  height={300}
  priority={isAboveTheFold}
  context="card" // card, hero, thumbnail, profile
  aspectRatio="video" // square, video, golden
/>
```

### Cloudinary URL Optimization
- Automatic WebP conversion for supporting browsers
- Responsive sizing based on device
- Quality adjustment (80 for high, 75 for medium, 70 for low)
- Gravity-based smart cropping

### Image Loading Strategy
1. **Critical Images (above fold)**:
   - Use `priority={true}` on OptimizedImage
   - Preload with `rel="preload"` in head

2. **Secondary Images**:
   - Use default lazy loading
   - Implement blur placeholder

3. **Background Images**:
   - Use CSS background-attachment: fixed sparingly
   - Use `image-set()` for responsive images

## Mobile-Specific Improvements

### Touch Targets
- **Standard**: 48px × 48px minimum (WCAG)
- **Implemented**: Buttons have minimum 44px height on mobile

### Viewport Optimization
```tsx
viewport: {
  themeColor: "#ff5c7c",
  width: "device-width",
  initialScale: 1,
  userScalable: "yes" // Allow user zoom
}
```

### Font Loading Strategy
```tsx
const inter = Inter({
  display: "swap", // Show fallback while loading
  preload: true,
  weight: ["400", "500", "600", "700"],
});
```

### Mobile Navigation
- Sticky header with smooth scroll
- Touch-friendly hamburger menu
- Expandable search with proper spacing
- Bottom navigation for common actions

## Performance Metrics Tracking

### Web Vitals Tracking
- Automatically tracks LCP, FID, CLS, FCP, TTFB
- Sends data to `/api/vitals` endpoint
- Available in browser DevTools Lighthouse

### Monitoring
1. **Manual Testing**:
   ```bash
   # Run Lighthouse audit
   # Chrome DevTools → Lighthouse → Analyze page load
   ```

2. **Continuous Monitoring**:
   - Check `/api/vitals` logs
   - Use Google Search Console for Core Web Vitals
   - Monitor Vercel Analytics dashboard

## Bundle Size Optimization

### Code Splitting
- `next/dynamic` for large components
- Route-based splitting (automatic with App Router)
- React Suspense for gradual loading

### Dependency Management
- Tree-shakeable dependencies
- Minimal third-party libraries
- Remove unused styles with PurgeCSS (Tailwind)

## SEO & Performance Connection

### Technical SEO
- Proper meta tags (title, description, OG)
- Structured data (Schema.org JSON-LD)
- Mobile-friendly design
- Fast page load
- Valid HTML/CSS

### Mobile Indexing
- Mobile-first design (implemented)
- Responsive images
- Touch-friendly interactions
- No mobile JavaScript errors

## Testing Checklist

### Performance
- [ ] Run Lighthouse audit (target > 80 mobile)
- [ ] Test on throttled 4G connection
- [ ] Monitor Core Web Vitals
- [ ] Check bundle size with `npm run build`

### Mobile UX
- [ ] Test on iPhone SE (smallest screen)
- [ ] Test on iPhone 14 Pro Max (largest screen)
- [ ] Verify touch targets are ≥ 44px
- [ ] Check landscape orientation
- [ ] Test with keyboard navigation

### Network
- [ ] Test on WiFi (baseline)
- [ ] Test on 4G LTE (realistic)
- [ ] Test on 3G (stress test)
- [ ] Verify images don't block rendering

## Monitoring Tools

### Built-in
- Web Vitals API (`useReportWebVitals`)
- Next.js Analytics (Vercel)
- Browser DevTools

### External
- Google Search Console
- Lighthouse API
- Sentry (errors)
- Vercel Analytics

## Future Improvements

1. **Service Worker**: Offline support & caching strategy
2. **WebP Images**: Format negotiation for older browsers
3. **Prerender**: Static generation for category pages
4. **CDN**: Distribute content geographically
5. **Compression**: Brotli compression for all responses

## Common Mobile Pitfalls to Avoid

1. ❌ Large unoptimized images → Use OptimizedImage component
2. ❌ Render-blocking JavaScript → Code splitting with dynamic imports
3. ❌ Uncontrolled font loading → Use display: swap
4. ❌ Excessive third-party scripts → Load analytics async
5. ❌ Small touch targets → Minimum 44px on mobile
6. ❌ Layout shifts → Fixed image dimensions
7. ❌ Non-responsive design → Mobile-first approach
8. ❌ Heavy fonts → Use subset weights, system fallback

## Resources

- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Mobile Optimization Guide](https://web.dev/mobile/)
- [Image Optimization](https://web.dev/serve-images-webp/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/metrics/)
