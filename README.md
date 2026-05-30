# Pastro Mobile App

React Native e-commerce app for browsing products, placing orders, and managing your profile. It connects to the Pastro Symfony API on Railway.

## Features

- Email/password registration and login
- Google Sign-In (Firebase)
- Product catalog with live stock status
- Order creation and order history
- Profile management
- Real-time updates via Mercure (SSE)

## Prerequisites

- Node.js 22.11+
- JDK 17+
- Android Studio (Android SDK, emulator or device)
- For iOS: macOS with Xcode and CocoaPods

## Quick start (development)

```sh
npm install
npm start
```

In a second terminal:

```sh
npm run android
```

For iOS (macOS only):

```sh
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

## Release APK (Android)

The release build bundles JavaScript into the APK so the app runs without Metro:

```sh
cd android
.\gradlew assembleRelease
```

APK output:

`android/app/build/outputs/apk/release/app-release.apk`

Install on a device:

```sh
adb install android/app/build/outputs/apk/release/app-release.apk
```

## API

The app uses `https://finalwebdev-production.up.railway.app/api` by default (see `src/services/api.ts`).

## Documentation

Full specs and user guides are in the [`documentation/`](documentation/) folder.

## Google Sign-In

Register debug and release SHA-1 fingerprints in Firebase. See [documentation/GOOGLE_SIGNIN_SETUP.md](documentation/GOOGLE_SIGNIN_SETUP.md).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Unable to load script" on release install | Rebuild with `assembleRelease` (do not rely on a hand-copied bundle). |
| App crashes on launch with Hermes errors | Ensure `hermesEnabled=true` in `android/gradle.properties`. |
| Google Sign-In `DEVELOPER_ERROR` | Follow [GOOGLE_SIGNIN_SETUP.md](documentation/GOOGLE_SIGNIN_SETUP.md). |
| Logged out after closing app | Fixed: auth uses AsyncStorage; rebuild after pulling latest changes. |
