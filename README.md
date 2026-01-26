# Construction Saarthi Frontend

A large-scale React application with **400+ pages** and support for **14 Indian languages**. Built with React, Vite, Tailwind CSS, and i18next for enterprise-level multilingual support.

## 📋 Project Overview

#

- **Total Pages**: 400+ screens
- **Supported Languages**: 14 languages
- **Architecture**: Feature-based modular architecture
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Internationalization**: i18next with react-i18next
- **Routing**: React Router v7 with lazy loading

## 🌐 Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `gu` | Gujarati | ગુજરાતી |
| `bn` | Bengali | বাংলা |
| `ta` | Tamil | தமிழ் |
| `mr` | Marathi | मराठी |
| `te` | Telugu | తెలుగు |
| `kn` | Kannada | ಕನ್ನಡ |
| `ml` | Malayalam | മലയാളം |
| `ur` | Urdu | اردو |
| `raj` | Rajasthani | राजस्थानी |
| `bho` | Bhojpuri | भोजपुरी |
| `as` | Assamese | অসমীয়া |
| `hry` | Haryanvi | हरियाणवी |

**Total: 14 Languages**

Language preference is stored in `localStorage` with key `"lang"` and defaults to `"en"`.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components (FormInput, FormSelect, etc.)
│   ├── layout/         # Layout components (Layout, Navbar, Sidebar)
│   ├── shared/         # Shared components (EmptyState, ErrorBoundary)
│   └── ui/             # UI primitives (Button, Input, Modal, etc.)
│
├── features/           # Feature-based modules (main organization)
│   └── auth/           # Authentication feature
│       ├── api/        # API calls for this feature
│       ├── components/ # Feature-specific components
│       ├── layouts/    # Feature-specific layouts
│       ├── pages/      # Feature pages (Login, Register, etc.)
│       └── store/      # Feature-specific state management
│
├── locales/            # Translation files (14 languages)
│   ├── en/             # English translations
│   ├── hi/             # Hindi translations
│   └── ...             # Other languages
│
├── routes/             # Route configuration
│   ├── AppRoutes.jsx   # Main routing file (lazy loaded)
│   └── ProtectedRoute.jsx
│
├── constants/          # App constants
│   ├── routes.js       # Route definitions
│   ├── endpoints.js    # API endpoints
│   └── roles.js        # User roles
│
├── context/            # React contexts
│   └── LanguageContext.jsx
│
├── hooks/              # Custom React hooks
│   ├── useAuth.js
│   ├── useTranslation.js
│   └── ...
│
├── services/           # API service layer
│   ├── authService.js
│   ├── http.js
│   └── ...
│
├── utils/              # Utility functions
│   ├── validation.js
│   ├── format.js
│   └── ...
│
└── lib/                # Library configurations
    └── i18n.js         # i18next configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📄 Adding New Pages

### Step 1: Create Page Component

Create your page in the appropriate feature folder:

```javascript
// src/features/[feature-name]/pages/YourPage.jsx
import { useTranslation } from '../../../hooks/useTranslation';

const YourPage = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('yourPage.title')}</h1>
      {/* Your page content */}
    </div>
  );
};

export default YourPage;
```

### Step 2: Add Route Constant

Add your route to `src/constants/routes.js`:

```javascript
export const ROUTES = {
  // ... existing routes
  YOUR_PAGE: '/your-page',
};
```

### Step 3: Register Route in AppRoutes

Add lazy-loaded route in `src/routes/AppRoutes.jsx`:

```javascript
// Lazy load the component
const YourPage = lazy(() => import('../features/[feature-name]/pages/YourPage'));

// Add route in Routes component
<Route 
  path={ROUTES.YOUR_PAGE} 
  element={
    <ProtectedRoute>
      <YourPage />
    </ProtectedRoute>
  } 
/>
```

### Step 4: Add Translations

Add translations for all 14 languages in `src/locales/[lang]/common.json`:

```json
{
  "yourPage": {
    "title": "Your Page Title",
    "description": "Page description"
  }
}
```

**Important**: Add translations to ALL language files:
- `en/common.json`
- `hi/common.json`
- `gu/common.json`
- `bn/common.json`
- `ta/common.json`
- `mr/common.json`
- `te/common.json`
- `kn/common.json`
- `ml/common.json`
- `ur/common.json`
- `raj/common.json`
- `bho/common.json`
- `as/common.json`
- `hry/common.json`

## 🎨 Styling Conventions

- **Use Tailwind CSS utility classes** instead of inline styles
- Example: `border-b border-[#cccccc] border-solid` instead of inline `boxShadow`
- Custom colors can be defined in `theme.css` or used with Tailwind's color system

## 🌍 Internationalization (i18n)

### Using Translations in Components

```javascript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.description')}</p>
    </div>
  );
};
```

### Changing Language

```javascript
import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { changeLanguage, currentLanguage } = useLanguage();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      {/* ... other languages */}
    </select>
  );
};
```

### Translation File Structure

All translations are stored in `src/locales/[lang]/common.json`:

```json
{
  "common": {
    "welcome": "Welcome",
    "login": "Login",
    "register": "Register"
  },
  "auth": {
    "email": "Email",
    "password": "Password"
  }
}
```

## 🛣️ Routing

- Routes are centralized in `src/routes/AppRoutes.jsx`
- All routes use **lazy loading** for better performance (critical for 400+ pages)
- Protected routes are wrapped with `<ProtectedRoute>` component
- Route constants are defined in `src/constants/routes.js`

### Route Pattern

```javascript
// Public route
<Route path={ROUTES.LOGIN} element={<Login />} />

// Protected route
<Route 
  path={ROUTES.DASHBOARD} 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## 📦 Key Dependencies

- **React 19** - UI library
- **Vite** - Build tool
- **React Router v7** - Routing
- **Tailwind CSS 4** - Styling
- **i18next** - Internationalization
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Material UI** - Component library (partial usage)

## 🔧 Development Guidelines

### Feature-Based Architecture

- Organize code by **features**, not by file type
- Each feature should be self-contained:
  - `pages/` - Feature pages
  - `components/` - Feature-specific components
  - `api/` - Feature API calls
  - `store/` - Feature state management

### Component Organization

- **UI Components** (`components/ui/`) - Reusable primitives
- **Form Components** (`components/forms/`) - Form-specific components
- **Layout Components** (`components/layout/`) - Layout-related components
- **Shared Components** (`components/shared/`) - Shared across features

### Code Style

- Use functional components with hooks
- Prefer named exports for components
- Use lazy loading for route components
- Follow React best practices

## 📝 Important Notes

1. **Always add translations** for all 14 languages when adding new text
2. **Use lazy loading** for all route components (performance critical)
3. **Follow feature-based structure** when adding new features
4. **Use Tailwind utility classes** instead of inline styles
5. **Language preference** is stored in `localStorage` with key `"lang"`

## 🤝 Contributing

When adding new pages or features:

1. Follow the feature-based architecture
2. Add translations for all 14 languages
3. Use lazy loading for routes
4. Update this README if adding new patterns or conventions
5. Test with multiple languages

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [i18next Documentation](https://www.i18next.com)
- [React Router Documentation](https://reactrouter.com)

---

**Last Updated**: Project supports 400+ pages with 14 languages (en, hi, gu, bn, ta, mr, te, kn, ml, ur, raj, bho, as, hry)
