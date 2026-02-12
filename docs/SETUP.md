# BigTimer Local Setup

## Prerequisites
- JDK 17+
- Gradle (for initial wrapper generation only)
- Android SDK (platform 34)

## First-time bootstrap
```bash
cd android-app
gradle wrapper --gradle-version 8.7
./gradlew assembleDebug
```

## If `gradle` is missing
Install Gradle, then rerun bootstrap:
```bash
cd android-app
./bootstrap.sh
```

## Expected output
A successful `assembleDebug` with generated wrapper files:
- `android-app/gradlew`
- `android-app/gradle/wrapper/gradle-wrapper.jar`
- `android-app/gradle/wrapper/gradle-wrapper.properties`
