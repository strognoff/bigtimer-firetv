.PHONY: bootstrap build

bootstrap:
	cd android-app && ./bootstrap.sh

build:
	cd android-app && ./gradlew assembleDebug
