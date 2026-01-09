# Homepage Implementation - Coursera-Style E-Learning Platform

## ✨ Features Implemented

### 🎨 Animations
- **Hero Section**: Fade-in animations for title, subtitle, and CTA buttons
- **Course Cards**: Smooth entrance animations with hover effects (lift and scale)
- **Category Cards**: Staggered fade-in animations with hover interactions
- **Statistics**: Animated counters with entrance effects
- **Scroll Animations**: Elements animate when they come into viewport
- **Responsive**: All animations adapt to mobile devices

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Breakpoints**: 
  - Mobile: 1 column layout
  - Tablet: 2 columns
  - Desktop: 3-4 columns
- **Touch-Friendly**: Hover effects adjusted for mobile devices

### 🎯 Components

#### Hero Section
- Gradient background with pattern overlay
- Animated hero title and subtitle
- CTA buttons with hover effects
- Real-time statistics counters
- Floating animation for hero image

#### Stats Section
- 4 key metrics with icons
- Animated numbers on scroll
- Responsive grid layout

#### Categories Section
- 8 different course categories
- Colorful icon badges
- Hover lift effect
- Course count display

#### Featured Courses
- API-driven course cards
- Course thumbnails with zoom effect
- Rating and student count
- Price display with badges
- Difficulty level indicators

#### Features Section
- 3 key platform benefits
- Icon-based presentation
- Staggered entrance animations

#### How It Works
- 3-step process visualization
- Numbered steps with pulse animation
- Clear call-to-action flow

#### CTA Section
- Gradient background
- Scale-up animation
- Final conversion point

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- React (v18+)
- Backend API running on port 5145

### Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Ensure Backend is Running**
   ```bash
   cd backend
   dotnet run
   ```

## 📂 File Structure

```
frontend/src/
├── pages/
│   └── HomePage.jsx          # Main homepage component
├── api/
│   ├── client.js             # API client configuration
│   ├── courses.js            # Courses API calls
│   ├── departments.js        # Departments API calls
│   └── universities.js       # Universities API calls
├── hooks/
│   └── useAnimations.js      # Custom animation hooks
├── styles/
│   └── animations.css        # Animation definitions
└── index.css                 # Global styles with animation import
```

## 🎨 Animation Classes

### Entrance Animations
- `.animate-fade-in-up` - Fade in from bottom
- `.animate-fade-in-down` - Fade in from top
- `.animate-fade-in-left` - Fade in from left
- `.animate-fade-in-right` - Fade in from right
- `.animate-scale-up` - Scale up with fade
- `.animate-zoom-in` - Zoom in effect

### Loop Animations
- `.animate-pulse` - Pulsing effect
- `.animate-bounce` - Bouncing effect
- `.animate-float` - Floating effect

### Hover Effects
- `.hover-lift` - Lift on hover with shadow
- `.hover-scale` - Scale up on hover
- `.hover-glow` - Glow effect on hover
- `.card-hover` - Complete card hover effect

### Delays
- `.delay-100` through `.delay-800` - Stagger animations

## 🔌 API Integration

### Courses API
```javascript
GET /api/courses
Response: { courses: [...], totalCount: number }
```

### Departments API
```javascript
GET /api/departments
Response: { departments: [...] }
```

### Universities API
```javascript
GET /api/universities
Response: { data: [...] }
```

## 🎯 Key Features

### 1. Intersection Observer
- Automatically triggers animations when elements enter viewport
- Optimized performance with threshold settings
- Prevents re-animation with once flag

### 2. Performance Optimizations
- Lazy loading for images
- Debounced scroll listeners
- CSS-based animations (GPU accelerated)
- Conditional rendering for loading states

### 3. Accessibility
- `prefers-reduced-motion` support
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation friendly

### 4. Visual Polish
- Gradient backgrounds
- Consistent spacing
- Professional color scheme (purple theme)
- Smooth transitions (0.3s cubic-bezier)

## 🛠️ Customization

### Change Theme Colors
Edit the color values in HomePage.jsx:
```jsx
bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
// Change to your gradient
```

### Adjust Animation Speed
Edit animations.css:
```css
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
  /* Change 0.6s to your preferred duration */
}
```

### Modify Card Hover Effects
```css
.course-card:hover {
  transform: translateY(-12px);
  /* Adjust values as needed */
}
```

## 📊 Backend Requirements

Ensure your backend returns data in this format:

### Courses Response
```json
{
  "courses": [
    {
      "id": 1,
      "title": "Course Title",
      "description": "Course description",
      "thumbnailUrl": "url",
      "isFree": true,
      "price": 49.99,
      "difficulty": "Beginner",
      "averageRating": 4.5,
      "enrollmentCount": 1234,
      "departmentName": "Technology"
    }
  ]
}
```

### Departments Response
```json
{
  "departments": [
    {
      "id": 1,
      "name": "Computer Science",
      "description": "Department description"
    }
  ]
}
```

## 🐛 Troubleshooting

### Animations Not Working
1. Check if animations.css is imported in index.css
2. Verify browser supports CSS animations
3. Check for `prefers-reduced-motion` setting

### API Data Not Loading
1. Verify backend is running on correct port
2. Check CORS settings in backend
3. Inspect browser console for errors
4. Verify API_BASE_URL in client.js

### Performance Issues
1. Reduce number of animated elements
2. Increase intersection observer threshold
3. Use CSS animations instead of JS
4. Optimize images (use WebP format)

## 🌟 Future Enhancements

- [ ] Add skeleton loading states
- [ ] Implement infinite scroll for courses
- [ ] Add filter/search animations
- [ ] Create course preview modal
- [ ] Add testimonials carousel
- [ ] Implement dark mode
- [ ] Add micro-interactions
- [ ] Create loading placeholders

## 📝 Notes

- All animations use CSS for better performance
- Intersection Observer ensures animations only trigger when visible
- Responsive design tested on multiple devices
- Accessibility features included
- Clean, maintainable code structure

## 🤝 Contributing

When adding new animations:
1. Define keyframes in animations.css
2. Create utility classes
3. Add delays if needed
4. Test on mobile devices
5. Ensure accessibility

## 📄 License

This project is part of the E-Learning platform.

---

**Built with ❤️ using React, Chakra UI, and modern CSS animations**
