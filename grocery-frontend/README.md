
# Grocery Helper

Grocery Helper is a React Native app built with Expo for managing your grocery list.  
It supports user authentication, multilingual support (English, German, French), and a dark mode theme.

## Features

- User Signup/Login with token authentication
- Add, update, and toggle grocery list items
- Multilingual support using i18n-js
- Dark mode toggle
- Persistent login with AsyncStorage
- Simple and clean UI

## Technologies Used

- React Native & Expo
- i18n-js for internationalization
- AsyncStorage for persistent storage
- Fetch API for backend communication
- Expo Localization to detect device language
- Backend: Node.js with Express
- Database: MongoDB (Atlas)
- Backend deployed on Render.com

## Backend

The backend API is built using Node.js and Express. It handles user authentication, item CRUD operations, and token management.  
Data is stored in MongoDB, hosted on MongoDB Atlas. The backend is deployed on [Render.com](https://render.com) for reliable hosting and easy scaling.

API base URL used in the app:  
`https://grocery-helper.onrender.com`

---

## Getting Started

### Prerequisites

- Node.js & npm installed
- Expo CLI installed globally: `npm install -g expo-cli`
- Optional: Android/iOS emulator or physical device for testing

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/grocery-helper.git
   cd grocery-helper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the app:
   ```bash
   expo start
   ```

4. Open in Expo Go app on your device or emulator.

### Environment Variables

Replace the API URL in `App.js` with your backend URL if different:

```js
const API_URL = 'https://grocery-helper.onrender.com';
```

---

## Building for Production

To create standalone apps:

```bash
expo build:ios
expo build:android
```

Or use EAS Build for better workflows:

```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

---

## Folder Structure

- `App.js` - main app logic and UI
- `i18n.js` - translations and localization setup (if separated)
- Other components (if you break UI into multiple files)
- Assets (images, icons if any)

---

## Acknowledgments

- Thanks to Expo and React Native communities.
- Backend deployed on Render.com.
- Based on a sample project concept for grocery management.

---

## License

MIT License
