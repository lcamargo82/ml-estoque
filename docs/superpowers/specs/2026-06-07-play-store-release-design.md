# Play Store Release Preparation

## Objective

Prepare the existing Android app `br.dev.lcamargo.mlestoque` for a new Google
Play closed-test release, replacing the currently published build
`versionCode 4` / `versionName 1.0.3`.

## Release Version

- `versionCode`: `5`
- `versionName`: `1.0.4`

The application ID must remain `br.dev.lcamargo.mlestoque`.

## Android Toolchain

Keep the current compatible toolchain:

- Gradle Wrapper `8.14.3`
- Android Gradle Plugin `8.13.0`
- `compileSdkVersion 36`
- `targetSdkVersion 36`
- Java 21

These versions are already recent and meet the current Google Play target API
requirement. Changing them without a compatibility need would add release risk.

## Signing

Use the existing upload keystore:

`/Users/leandro/Documents/Pessoal/mlestoque-release.keystore`

Create a local `projeto-nest/mobile/android/keystore.properties` file containing
the keystore path, alias, and passwords. This file and all keystore files must
be ignored by Git.

`app/build.gradle` reads this optional local properties file and configures
`signingConfigs.release`. Release bundle generation fails with a clear message
when signing properties are absent rather than producing an unsigned artifact.

Do not commit credentials, keystore contents, or the populated properties file.
Commit a safe example properties file with placeholder values.

## Release Build

The release workflow is:

1. Build the mobile web assets.
2. Synchronize Capacitor Android assets and plugins.
3. Run the signed Android App Bundle release task.
4. Verify the generated bundle metadata and signing certificate.

Expected artifact:

`projeto-nest/mobile/android/app/build/outputs/bundle/release/app-release.aab`

## Verification

- Confirm `versionCode 5`, `versionName 1.0.4`, and application ID.
- Confirm release uses `targetSdkVersion 36`.
- Confirm the `.aab` is signed using the existing upload keystore.
- Run the Android release bundle build successfully.
- Keep secrets and generated bundles outside Git.

## Acceptance Criteria

- A signed `app-release.aab` is generated for version `5 (1.0.4)`.
- The bundle can replace the existing Google Play closed-test build.
- No signing credential or keystore is committed.
- The release process is documented and repeatable.
