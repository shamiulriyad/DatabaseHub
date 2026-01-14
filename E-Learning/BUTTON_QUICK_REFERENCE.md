# Button Design System - Quick Reference

## Quick Usage

```jsx
import Button from './components/common/Button';

// Basic
<Button>Submit</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Confirm</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// States
<Button disabled>Disabled</Button>
<Button isLoading>Loading...</Button>
<Button fullWidth>Full Width</Button>

// Icons
<Button leftIcon={<Icon />}>With Icon</Button>
<Button rightIcon={<Icon />}>With Icon</Button>

// Form
<Button type="submit">Submit</Button>
<Button type="reset">Reset</Button>
```

## Variants At A Glance

| Variant | Use Case | Color |
|---------|----------|-------|
| `primary` | Main action | Purple (#7c3aed) |
| `secondary` | Alternative | Gray (#e5e7eb) |
| `danger` | Delete/Destructive | Red (#ef4444) |
| `success` | Confirm/Positive | Green (#10b981) |
| `outline` | Secondary emphasis | Purple outline |
| `ghost` | Minimal action | Transparent |
| `link` | Text link | Purple text |

## States

- **Normal**: Full color, subtle shadow
- **Hover**: Darker color, elevation effect
- **Active**: Darkest color, pressed appearance
- **Focus**: Outline (keyboard navigation)
- **Disabled**: Gray, no interaction
- **Loading**: Spinner animation

## Sizes

| Size | Height | Font | Padding |
|------|--------|------|---------|
| `sm` | 36px | 0.875rem | 6px 12px |
| `md` | 44px | 1rem | 10px 20px |
| `lg` | 48px | 1.125rem | 14px 28px |

## CSS Classes

```css
/* All buttons */
.btn

/* Variants */
.btn-primary, .btn-secondary, .btn-danger, .btn-success
.btn-outline, .btn-outline-secondary, .btn-ghost, .btn-link

/* Sizes */
.btn-sm, .btn-md, .btn-lg

/* States */
.btn:disabled, .btn-loading, .btn:focus-visible

/* Layout */
.btn-full-width, .btn-group, .btn-group-vertical
```

## Common Patterns

### Form Actions
```jsx
<div className="btn-group">
  <Button variant="secondary">Cancel</Button>
  <Button type="submit">Save</Button>
</div>
```

### Confirmation
```jsx
<div className="btn-group">
  <Button variant="outline" onClick={cancel}>
    No, Cancel
  </Button>
  <Button variant="danger" onClick={confirm}>
    Yes, Delete
  </Button>
</div>
```

### Loading Action
```jsx
<Button 
  isLoading={loading}
  onClick={submit}
>
  {loading ? 'Submitting...' : 'Submit'}
</Button>
```

### Full Width (Mobile)
```jsx
<Button fullWidth variant="primary">
  Enroll Now
</Button>
```

## Files Reference

- **Component**: `src/components/common/Button.jsx`
- **Styles**: `src/styles/buttons.css`
- **Full Guide**: `BUTTON_DESIGN_SYSTEM.md`

## Accessibility Notes

✅ Minimum 44px height (mobile touch)  
✅ WCAG AAA color contrast  
✅ Keyboard focus visible  
✅ Loading state with aria-busy  
✅ Disabled state semantic  

## Color Values

```
Primary Purple:     #7c3aed
Secondary Gray:     #e5e7eb
Danger Red:         #ef4444
Success Green:      #10b981
Disabled Gray:      #d1d5db
White:              #ffffff
Dark Text:          #374151
```

---

**For detailed documentation, see BUTTON_DESIGN_SYSTEM.md**
