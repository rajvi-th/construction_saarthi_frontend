# Languages Configuration

## 📋 Quick Reference

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

## How to Use

Each language folder contains `common.json` with translations.

Example:
- `en/common.json` → English translations
- `hi/common.json` → Hindi translations

## Storage

Language preference is saved in `localStorage` with key: `"lang"`

Example:
```javascript
localStorage.setItem('lang', 'hi'); // Set Hindi
localStorage.getItem('lang'); // Get current language
```

