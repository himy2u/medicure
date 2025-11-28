# Typography Standardization - Medicure App

## Font Size System

### Headers
- **H1 (Main Titles)**: 28-32px
  - Landing page title: 32px
  - Screen titles: 28px
  
### Section Titles
- **H2 (Section Headers)**: 18px
  - Emergency symptoms section
  - Find Doctor sections
  
- **H3 (Subsections)**: 16px
  - Form sections
  - Card titles
  - Doctor names

### Body Text
- **Primary Body**: 16px
  - Button text (important actions)
  - Input labels
  - Navigation text
  
- **Secondary Body**: 14px
  - Descriptions
  - Helper text
  - Secondary buttons
  - Form labels

### Small Text
- **Captions**: 12-14px
  - Date labels
  - Distance indicators
  - Metadata

## Screen-Specific Sizes

### LandingScreen
```
App Title: 32px
Emergency Button: 20px
Primary Buttons: 18px
Secondary Buttons: 18px
Subtitle: 18px
Helper Text: 14px
```

### EmergencyScreen
```
Title: 28px
Section Titles: 18px
Symptom Cards: 14px
Doctor Names: 16px
Button Text: 16px
Helper Text: 14px
```

### FindDoctorScreen
```
Section Titles: 16px
Date Numbers: 20px
Doctor Names: 16px
Results Title: 18px
Button Text: 16px
Metadata: 12-14px
```

### MedicalStaffSignupScreen
```
Title: 28px
Subtitle: 16px
Section Titles: 18px
Role Labels: 16px
Role Descriptions: 14px
Button Text: 16px
Helper Text: 14px
```

### SignupScreen (Patient/Caregiver)
```
Header Title: 20px
Section Titles: 16px
Form Labels: 14px
Button Text: 16px
Helper Text: 14px
```

## Design Principles

1. **Hierarchy**: Larger text = more important
2. **Readability**: Minimum 14px for body text
3. **Consistency**: Same element types use same sizes
4. **Accessibility**: High contrast, readable sizes
5. **Scalability**: Works in both English and Spanish

## Implementation

All font sizes are defined in `frontend/theme/typography.ts`:

```typescript
export const typography = {
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  button: 16,
  buttonSmall: 14,
  label: 14,
  caption: 12,
  input: 16,
  inputLabel: 14,
};
```

## Testing Checklist

- [x] All screens have consistent font sizes
- [x] Text is readable on all screen sizes
- [x] Spanish translations don't break layout
- [x] Buttons maintain size regardless of language
- [x] Headers are clearly distinguishable
- [x] Body text is comfortable to read
- [x] Small text is still legible

## Future Improvements

1. Use typography constants instead of hardcoded values
2. Add responsive font scaling for different devices
3. Support for accessibility font size preferences
4. Dark mode font adjustments
