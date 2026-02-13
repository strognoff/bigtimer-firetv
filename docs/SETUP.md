# BigTimer Local Setup

## Prerequisites
- JDK 17+
- Gradle (for initial wrapper generation only)
- Android SDK (platform 34)
- `adb` (for device install/testing)

Quick check:
```bash
./scripts/check-prereqs.sh
```

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

## If `adb` is missing
Install Android platform tools.

Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y android-sdk-platform-tools
```

Then verify:
```bash
adb version
adb devices
```

## Expected output
A successful `assembleDebug` with generated wrapper files:
- `android-app/gradlew`
- `android-app/gradle/wrapper/gradle-wrapper.jar`
- `android-app/gradle/wrapper/gradle-wrapper.properties`
