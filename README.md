# Novel Reader — Native starter (0.1.0)

This is the first native foundation for the local EPUB translator. It is intentionally an independent implementation; it does not reuse KolNovel's compiled code, assets, branding, or private source.

## Included now
- React Native + Expo app shell.
- Five Arabic bottom tabs: Home, Discover, Library, Activity, Settings.
- Local SQLite schema for books, chapters, reading progress/settings, paragraph translations, translation batches, and history.
- EPUB file picker and copy into the app's document directory.
- Book list, detail screen, favorite toggle, and reader placeholder.
- Dark interface with fixed gold accent.

## Explicitly not implemented yet
- EPUB package parsing (container.xml, OPF, spine, nav/NCX, XHTML, CSS, images).
- Actual chapter rendering and TOC.
- MyMemory/Google translation provider implementation.
- Background translation scheduling.
- EPUB/TXT export and backup/restore.
- Visual pixel-match to every KolNovel screen. The supplied recording does not expose every screen.

## Run
Requires Node.js and Android Studio / Android SDK.
1. `npm install`
2. `npx expo install --fix` (resolve Expo SDK-compatible native package versions if needed)
3. `npx expo run:android`

`npm run typecheck` checks TypeScript.

## Important
This environment did not have Android SDK, Gradle, emulator, or an attached Android device, so an APK was not built or runtime-tested here. Do not treat this starter as a finished reader. It is a clean, structured foundation for the next tested milestones.


## GitHub Actions
A workflow is included at `.github/workflows/android-debug.yml`. After pushing to `main`, or manually running the workflow from the Actions tab, GitHub Actions attempts to build a debug APK and uploads it as an artifact. This workflow has not yet been run in this environment; verify the build log before treating the APK as working.


## GitHub Actions APK build
The repository includes `.github/workflows/android.yml`.
After pushing the project to GitHub:
- Open the repository's **Actions** tab.
- Select **Android APK**.
- Use **Run workflow** for a manual build, or push a commit to `main`/`master`.
- When the run finishes, open the run and download `NovelReader-debug-apk` from **Artifacts**.

The workflow uses Expo prebuild and Gradle on GitHub's Ubuntu runner. It has not been executed in this environment, so the first GitHub run is the real build verification.
