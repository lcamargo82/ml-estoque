# Play Store Release

## Current Release

- Application ID: `br.dev.lcamargo.mlestoque`
- Version code: `5`
- Version name: `1.0.4`
- Target SDK: `36`

The previous Play Console build is `4 (1.0.3)`.

## Local Signing Setup

The release bundle must use the existing Play Console upload key.

1. Copy `android/keystore.properties.example` to
   `android/keystore.properties`.
2. Fill the local file with:

```properties
storeFile=/Users/leandro/Documents/Pessoal/mlestoque-release.keystore
storePassword=your-local-store-password
keyAlias=your-local-key-alias
keyPassword=your-local-key-password
```

The populated file and keystore files are ignored by Git. Never commit them.

## Generate Android App Bundle

From `projeto-nest/mobile`:

```bash
npm run release:aab
```

This command:

1. Builds the Vue/Ionic web application.
2. Synchronizes Capacitor Android assets and plugins.
3. Generates the signed release bundle.

Expected artifact:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

## Upload

In Google Play Console, open the existing ML Estoque application and create a
new release in the desired test or production track. Upload `app-release.aab`.
Google Play App Signing will verify the upload key and sign distributed APKs.

## Future Versions

Every Play Store upload needs a unique, increasing `versionCode`. Increment
`versionName` using the product release number:

```groovy
versionCode 6
versionName "1.0.5"
```

Run the full release command again after each version change.
