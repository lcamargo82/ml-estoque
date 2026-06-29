# Play Store Release Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a signed Android App Bundle for the existing Play Store app as version `5 (1.0.4)` without committing signing secrets.

**Architecture:** Keep the current compatible Gradle/Android toolchain. Configure release signing from an ignored local properties file, add repeatable release scripts/documentation, synchronize Capacitor, and verify bundle metadata and signature.

**Tech Stack:** Capacitor 8, Android Gradle Plugin 8.13.0, Gradle 8.14.3, Java 21, Android SDK 36.

---

### Task 1: Configure Version and Secure Signing

**Files:**
- Modify: `projeto-nest/mobile/android/app/build.gradle`
- Modify: `projeto-nest/mobile/android/.gitignore`
- Create: `projeto-nest/mobile/android/keystore.properties.example`

- [ ] Verify the current release configuration reports `versionCode 4` and `versionName 1.0.3`.
- [ ] Change the release to `versionCode 5` and `versionName 1.0.4`.
- [ ] Load `android/keystore.properties` and configure `signingConfigs.release`.
- [ ] Fail release tasks clearly when required signing properties are missing.
- [ ] Ignore `keystore.properties`, `*.jks`, and `*.keystore`.
- [ ] Add a safe example properties file with `storeFile`, `storePassword`, `keyAlias`, and `keyPassword` keys.
- [ ] Run `./gradlew :app:properties` and confirm configuration parses.

### Task 2: Add Repeatable Release Workflow

**Files:**
- Modify: `projeto-nest/mobile/package.json`
- Create: `projeto-nest/mobile/PLAY_STORE_RELEASE.md`

- [ ] Add `android:sync` and `release:aab` scripts.
- [ ] Document how to populate local signing properties without exposing passwords.
- [ ] Document Play App Signing upload, version increment rules, and artifact location.
- [ ] Run mobile web build and Capacitor Android sync.

### Task 3: Generate and Verify Signed Bundle

**Files:**
- Create locally only: `projeto-nest/mobile/android/keystore.properties`
- Generated: `projeto-nest/mobile/android/app/build/outputs/bundle/release/app-release.aab`

- [ ] Populate local signing properties using the existing keystore path and user-supplied local credentials.
- [ ] Run `./gradlew :app:bundleRelease`.
- [ ] Confirm the bundle exists and is not tracked by Git.
- [ ] Inspect bundle metadata for package `br.dev.lcamargo.mlestoque`, version code `5`, version name `1.0.4`, and target SDK `36`.
- [ ] Verify the bundle signing certificate matches the existing upload key.
- [ ] Run `git diff --check` and confirm no signing secret is tracked.
