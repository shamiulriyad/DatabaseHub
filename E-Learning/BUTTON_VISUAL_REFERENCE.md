# Button Design System - Visual Reference Guide

## 📊 Visual Specifications

### Variant Colors

```
PRIMARY (Purple)
■ Base:       #7c3aed
■ Hover:      #6d28d9
■ Active:     #5b21b6
Text:         #ffffff

SECONDARY (Gray)
■ Base:       #e5e7eb
■ Hover:      #d1d5db
■ Active:     #9ca3af
Text:         #374151

DANGER (Red)
■ Base:       #ef4444
■ Hover:      #dc2626
■ Active:     #b91c1c
Text:         #ffffff

SUCCESS (Green)
■ Base:       #10b981
■ Hover:      #059669
■ Active:     #047857
Text:         #ffffff

DISABLED (Gray)
■ Background: #d1d5db
■ Text:       #9ca3af
```

---

## 🎯 Variant Showcase

### Primary Button - Main Call-to-Action
```
NORMAL STATE:
┌─────────────────────┐
│  Submit Form    →   │  Color: #7c3aed
└─────────────────────┘  Height: 44px
Shadow: 0 1px 3px       Weight: 600
Radius: 8px             Font: 1rem

HOVER STATE:
┌─────────────────────┐
│  Submit Form    →   │  Color: #6d28d9
└─────────────────────┘  Transform: -1px Y
Shadow: 0 4px 6px       Elevation ↑

ACTIVE STATE:
┌─────────────────────┐
│  Submit Form    →   │  Color: #5b21b6
└─────────────────────┘  Transform: 0px Y
Shadow: 0 2px 4px       Pressed down ↓

DISABLED STATE:
┌─────────────────────┐
│  Submit Form    →   │  Color: #d1d5db (#9ca3af text)
└─────────────────────┘  No interaction
Shadow: none            Cursor: not-allowed
```

### Secondary Button - Alternative Action
```
Similar structure to Primary, but:
- Base: #e5e7eb (light gray)
- Hover: #d1d5db (medium gray)
- Active: #9ca3af (dark gray)
- Text: #374151 (dark text)
- Best for: Cancel, back, less important actions
```

### Danger Button - Destructive Action
```
Similar structure to Primary, but:
- Base: #ef4444 (red)
- Hover: #dc2626 (darker red)
- Active: #b91c1c (darkest red)
- Text: #ffffff (white)
- Best for: Delete, remove, dangerous operations
```

### Success Button - Positive Action
```
Similar structure to Primary, but:
- Base: #10b981 (green)
- Hover: #059669 (darker green)
- Active: #047857 (darkest green)
- Text: #ffffff (white)
- Best for: Approve, confirm, positive actions
```

### Outline Button - Secondary Emphasis
```
NORMAL STATE:
┌─────────────────────┐
│  Learn More      ↗  │  Border: 2px #7c3aed
└─────────────────────┘  Background: transparent
Shadow: none            Text: #7c3aed
Radius: 8px             

HOVER STATE:
┌─────────────────────┐
│  Learn More      ↗  │  Border: 2px #6d28d9
└─────────────────────┘  Background: #f3e8ff
Shadow: 0 1px 3px       Text: #6d28d9

ACTIVE STATE:
┌─────────────────────┐
│  Learn More      ↗  │  Border: 2px #5b21b6
└─────────────────────┘  Background: #f3e8ff
Shadow: 0 1px 3px       Text: #5b21b6
```

### Ghost Button - Minimal Style
```
NORMAL STATE:
┌─────────────────────┐
│  Skip               │  Background: transparent
└─────────────────────┘  Text: #7c3aed
Shadow: none            Border: none

HOVER STATE:
┌─────────────────────┐
│  Skip               │  Background: rgba(124,58,237,0.1)
└─────────────────────┘  Text: #7c3aed
Shadow: none

ACTIVE STATE:
┌─────────────────────┐
│  Skip               │  Background: rgba(124,58,237,0.2)
└─────────────────────┘  Text: #7c3aed
```

### Link Button - Text Style
```
NORMAL STATE:
Learn more →        Underlined
Text: #7c3aed
Background: transparent
Weight: 500

HOVER STATE:
Learn more →        No underline
Text: #6d28d9
Background: transparent

ACTIVE STATE:
Learn more →        No underline
Text: #5b21b6
Background: transparent
```

---

## 📐 Size Specifications

### Small Button (36px height)
```
┌────────────────┐
│ Add Item       │  Padding: 6px 12px
└────────────────┘  Font-size: 0.875rem (14px)
Height: 36px        Use: List actions, secondary
Radius: 6px         Example: Edit, Delete buttons
```

### Medium Button (44px height) - DEFAULT
```
┌──────────────────────┐
│ Submit Form          │  Padding: 10px 20px
└──────────────────────┘  Font-size: 1rem (16px)
Height: 44px               Use: General purpose
Radius: 8px                Example: Primary actions
Accessible: ✓ Touch target
```

### Large Button (48px height)
```
┌────────────────────────────┐
│ Enroll Now               →  │  Padding: 14px 28px
└────────────────────────────┘  Font-size: 1.125rem (18px)
Height: 48px                    Use: Hero sections, CTAs
Radius: 10px                    Example: Main CTAs
Accessible: ✓ Touch target
```

---

## 🎬 State Transitions

### Transition Timeline

```
User hovers over button:
0ms:    Normal state
50ms:   Color transition starts
100ms:  Shadow transition starts
150ms:  Transform animation starts
200ms:  ✓ Hover state complete

Total duration: 0.2s (200ms)
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Transform Effects

```
HOVER STATE:
Button moves UP 1px
translateY(-1px)
Shadow grows
Visual feedback: Button appears clickable

ACTIVE STATE:
Button returns to normal position
translateY(0)
Shadow reduces
Visual feedback: Button appears pressed
```

---

## 🔄 State Diagram

```
                ┌─ User clicks ─┐
                ↓               ↓
    ┌───────────────────────────────┐
    │      NORMAL STATE             │
    │                               │
    │  Color: Base color            │
    │  Shadow: 0 1px 3px            │
    │  Transform: none              │
    │  Cursor: pointer              │
    └───────────────────────────────┘
         ↑     ↓        ↑       ↓
    Mouse   Mouse   Focus    Blur
    enters  leaves  keyboard  focus
         ↓     ↑        ↓       ↑
    ┌───────────────────────────────┐
    │      HOVER STATE              │
    │                               │
    │  Color: Darker                │
    │  Shadow: 0 4px 6px            │
    │  Transform: translateY(-1px)  │
    │  Cursor: pointer              │
    └───────────────────────────────┘
         │                   │
    Click│                   │Keyboard
         └─────────┬─────────┘
                   ↓
    ┌───────────────────────────────┐
    │      ACTIVE STATE             │
    │                               │
    │  Color: Darkest               │
    │  Shadow: 0 2px 4px            │
    │  Transform: translateY(0)     │
    │  Cursor: pointer              │
    └───────────────────────────────┘
         │
    Release│
         ↓
    Return to NORMAL or FOCUS
```

---

## 🎨 Color Usage Guide

### When to Use Each Color

```
PRIMARY PURPLE (#7c3aed)
├─ Main call-to-action buttons
├─ Form submissions
├─ Enrollment/Sign-up actions
├─ Continue/Next buttons
├─ Save/Update operations
└─ Primary variant and outline

SECONDARY GRAY (#e5e7eb)
├─ Cancel/Back buttons
├─ Alternative actions
├─ Less important operations
├─ Reset forms
├─ Dismiss dialogs
└─ Secondary variant

DANGER RED (#ef4444)
├─ Delete/Remove operations
├─ Account deletions
├─ Dangerous confirmations
├─ Destructive actions
├─ Irreversible operations
└─ Danger variant

SUCCESS GREEN (#10b981)
├─ Approval actions
├─ Positive confirmations
├─ Completed states
├─ Successful operations
└─ Success variant

DISABLED GRAY (#d1d5db)
├─ Inactive buttons
├─ Unavailable actions
├─ Form validation failures
├─ Permission restrictions
└─ All disabled states
```

---

## 📱 Responsive Behavior

### Desktop (> 1024px)
```
┌─────────────────────────┐
│ Cancel  │  Save Button  │  2 buttons side-by-side
└─────────────────────────┘  Normal sizes
Gap: 8px                     Optimal spacing
```

### Tablet (640px - 1024px)
```
┌─────────────────────────┐
│ Cancel  │  Save Button  │  2 buttons, slightly smaller
└─────────────────────────┘  or stack if needed
```

### Mobile (< 640px)
```
┌──────────────────────────┐
│     Cancel               │  Stack vertically
├──────────────────────────┤  Full width
│     Save Button          │  Single column
└──────────────────────────┘  Larger touch targets

OR horizontal if space:
┌──────────────┬──────────────┐
│    Cancel    │ Save Button  │
└──────────────┴──────────────┘
```

---

## ♿ Accessibility Visual Indicators

### Focus State (Keyboard)
```
┌─────────────────────────────┐
│ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐ │
│ │  Submit Button    →    │ │  Visible outline
│ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘ │  2px solid
│                             │  2px offset
└─────────────────────────────┘  

Only visible when using Tab key
Color: Same as button primary color
Offset: 2px from button edge
```

### Disabled State Visual
```
┌────────────────────────┐
│ Submit Button  →       │  All text/icons grayed
└────────────────────────┘  
Background: #d1d5db (light gray)
Text: #9ca3af (darker gray)
Cursor: not-allowed
No shadow or effects
Clearly inactive
```

### Loading State Visual
```
┌────────────────────────┐
│ ⟳ (Saving...)         │  Spinning animation
└────────────────────────┘  
Circular spinner
Centered in button
16px × 16px size
Text hidden
Button disabled
```

---

## 🎯 Button Group Layouts

### Horizontal Layout
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Cancel    │  │    Retry     │  │     Save     │
└──────────────┘  └──────────────┘  └──────────────┘
    8px gap           8px gap
Display: inline-flex
Gap: 8px
Wrap: yes
```

### Vertical Layout
```
┌──────────────────────────┐
│       Option 1           │
├──────────────────────────┤
│  8px gap                 │
├──────────────────────────┤
│       Option 2           │
├──────────────────────────┤
│  8px gap                 │
├──────────────────────────┤
│       Option 3           │
└──────────────────────────┘
Display: flex
Flex-direction: column
Gap: 8px
Width: 100%
```

### Full-Width Buttons
```
┌────────────────────────────────────────────────┐
│            Enroll Now                        →  │
├────────────────────────────────────────────────┤
│  Width: 100%                                    │
│  Padding: 14px 28px                            │
│  Height: 44px                                  │
│  Mobile optimized                              │
└────────────────────────────────────────────────┘
```

---

## 🖼️ Component Anatomy

### Button Structure
```
┌────────────────────────────────────┐
│  ┌─────┐  ┌────────────┐  ┌─────┐ │
│  │Icon │  │   Text    │  │Icon │ │
│  └─────┘  └────────────┘  └─────┘ │  Gap: 8px
└────────────────────────────────────┘

Padding: 10px 20px (md size)
Height: 44px minimum
Border-radius: 8px
Font-weight: 600
Text-align: center
Display: inline-flex
Align-items: center
Justify-content: center
```

### Icon Spacing
```
TEXT BUTTON:
[ text ]
10px gap

LEFT ICON:
[ icon ]  8px gap  [ text ]

RIGHT ICON:
[ text ]  8px gap  [ icon ]

ICON ONLY:
[ icon ]
Center aligned
Needs aria-label
```

---

## 📊 Touch Target Sizing

### Minimum Sizes (WCAG Compliance)
```
Small Button:
┌──────────────┐
│  Add Item    │  Width: 60px minimum
└──────────────┘  Height: 36px
                  Touch area adequate for small hands

Medium Button:
┌────────────────────┐
│  Submit Form       │  Width: 100px minimum
└────────────────────┘  Height: 44px ✓ OPTIMAL
                        Touch area: Excellent

Large Button:
┌──────────────────────┐
│  Enroll Now       →  │  Width: 120px minimum
└──────────────────────┘  Height: 48px ✓ OPTIMAL
                          Touch area: Excellent
```

### Spacing Between Buttons
```
DESKTOP:
┌──────┐  8px  ┌──────┐  8px  ┌──────┐

MOBILE:
┌────────────────┐
│   Button 1     │  Stack if width < 300px
├────────────────┤  8px gap between
│   Button 2     │
└────────────────┘
```

---

## 🎨 Visual Hierarchy

### Primary Emphasis
```
PRIMARY VARIANT - Maximum attention
┌─────────────────────┐
│  Submit Form    →   │  Solid fill
└─────────────────────┘  Strong color
Shadow + elevation     CTA focus
Use for: Main action only per page
```

### Secondary Emphasis
```
SECONDARY VARIANT - Medium attention
┌─────────────────────┐
│  Cancel             │  Solid fill
└─────────────────────┘  Medium color
Subtle shadow          Alternative action
Use for: Secondary/alternative actions
```

### Tertiary Emphasis
```
OUTLINE VARIANT - Lower attention
┌─────────────────────┐
│  Learn More     ↗   │  Outline only
└─────────────────────┘  No fill
Minimal shadow         De-emphasized
Use for: Learn more, additional info
```

### Minimal Emphasis
```
GHOST VARIANT - Lowest attention
  Skip                Text only
  Background: none    Ultra minimal
  Outline: none       Subtle interaction
Use for: Skip, dismiss, optional actions
```

---

## 🎯 Usage Scenarios

### Form Page
```
[Form fields...]

┌──────────────────────────────────────┐
│  Cancel Button  │  Submit Button   →  │
└──────────────────────────────────────┘
Secondary         Primary
variant          variant
```

### Confirmation Dialog
```
┌────────────────────────────────────┐
│  Delete Account?                    │
│  This action cannot be undone.      │
│                                     │
│  ┌──────────────┐  ┌──────────────┐│
│  │  Keep Account│  │ Delete Acct. ││
│  └──────────────┘  └──────────────┘│
│  Outline variant    Danger variant   │
└────────────────────────────────────┘
```

### Hero Section
```
┌──────────────────────────────────────┐
│  Welcome to Our Platform             │
│  Start learning amazing courses      │
│                                      │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Learn More   │  │ Start Free   │ │
│  └──────────────┘  └──────────────┘ │
│  Outline (lg)      Primary (lg)     │
└──────────────────────────────────────┘
```

---

## 📏 Measurements (Pixels)

```
SPACING:
- Gap between buttons: 8px
- Button to content: 16px
- Button group margin: 20px

SIZING:
- Small height: 36px
- Medium height: 44px (default)
- Large height: 48px
- Icon size (md): 19.2px (1.2em)
- Border radius: 8px

SHADOWS:
- Normal: 0 1px 3px rgba(0,0,0,0.1)
- Hover: 0 4px 6px rgba(0,0,0,0.12)
- Active: 0 2px 4px rgba(0,0,0,0.1)

ANIMATION:
- Duration: 200ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## ✅ Visual Checklist

When implementing buttons, verify:

- [ ] Correct variant color
- [ ] Appropriate size (sm/md/lg)
- [ ] Proper hover effect
- [ ] Active state visible
- [ ] Disabled state clear
- [ ] Focus outline visible (Tab key)
- [ ] Adequate spacing (8px gaps)
- [ ] Touch target sufficient (44px+)
- [ ] Icons aligned properly
- [ ] Loading spinner (if async)
- [ ] Text readable and clear
- [ ] Responsive on mobile

---

**This visual reference can be printed or bookmarked for quick design verification during implementation.**
