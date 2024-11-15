<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: CC0-1.0
-->

# 🖥️ Nextcloud Talk Desktop 💬

[![REUSE status](https://api.reuse.software/badge/github.com/nextcloud/talk-desktop)](https://api.reuse.software/info/github.com/nextcloud/talk-desktop)

> Nextcloud Talk Desktop client based on Nextcloud Talk web application bundling ✨

## 📥 Download Binaries

### https://github.com/nextcloud-releases/talk-desktop/releases

## 🏗️ Prerequisites

- [Nextcloud Server](https://github.com/nextcloud/server) version 27 or higher.
- [Nextcloud Talk](https://github.com/nextcloud/spreed) version 17 or higher.

## 👾 Drawbacks

- Currently not supported:
  - Search ([#30](https://github.com/nextcloud/talk-desktop/issues/30))
  - Untrusted certificate on Linux ([#23](https://github.com/nextcloud/talk-desktop/issues/23))
  - Dark/light theme ([#17](https://github.com/nextcloud/talk-desktop/issues/17))
- Works with limitations:
  - File Viewer — only images and videos

## 👥 Multi-account

Full multi-account currently [is not currently supported](https://github.com/nextcloud/talk-desktop/issues/7).

However, using portable `zip` distribution, you can have several Nextcloud Talk instances run simultaneously. Just rename the executable from default  `Nextcloud Talk` to a custom name. For example: 

```
/path/to/apps/
├── home-apps/
│   └── Nextcloud Talk/
│       ├── ...
│       ├── Nextcloud Talk (Home).exe
│       └── ...
└── work-apps/
    └── Nextcloud Talk/
        ├── ...
        ├── Nextcloud Talk (Work).exe
        └── ...
```

## 🛠️ Development Setup

### Initial setup

```bash
# Install dependencies
npm ci

# Make .env file
cp .env.example .env

# Don't forget to configure ENV variables! 
```

Nextcloud Talk Desktop requires [Nextcloud Talk source code](https://github.com/nextcloud/spreed).

#### No `nextcloud/spreed` is cloned?

Clone `nextcloud/spreed` and install dependencies:

```bash
# Clone in the repository root
git clone https://github.com/nextcloud/spreed

# Install dependencies
cd ./spreed/
npm ci

# Don't forget to return back
cd ../
```

#### `nextcloud/spreed` is already cloned?

Set `TALK_PATH` ENV variable or edit `.env` file:
 ```dotenv
TALK_PATH=/path/to/nextcloud-dev/apps/spreed/
 ```

## 🧑‍💻 Development

### Start development server in Electron

```bash
npm run dev
```

### Build binaries for production

```bash
# 🖥️ Current platform and architecture
npm run build

# 🐧 Linux (x64)
npm run build:linux

# 🍏 macOS (universal)
npm run build:mac
# 🍏 macOS (separate x64 and arm64)
npm run build:mac:x64
npm run build:mac:arm64

# 🪟 Windows (win32-x64)
npm run build:windows
```

Notes:
- **General recommendation is to always build binaries on the same platform**
- Building Windows binaries on Linux/Mac requires Wine
- Building Mac binaries on Windows is not supported
- Building Linux binaries on Windows is not supported for some Linux distributions

### Maintenance

#### Generating icons

After changing source icons, to generate icons in different sizes and formats, run:

```bash
npm run generate-icons
```

#### Updating global (server) styles

Talk frontend depends on the global Nextcloud server styles. To manually get them run:

```bah
# node ./scripts/fetch-server-styles.mjs <VERSION>, for example
node ./scripts/fetch-server-styles.mjs stable29
```

## 📦 Packaging distributions

```bash
# 🐧 Linux (x64)
npm run package:linux

# 🍏 macOS (universal)
npm run package:mac
# 🍏 macOS (separate x64 and arm64)
npm run package:mac:arm64
npm run package:mac:x64

# 🪟 Windows (win32-x64)
npm run package:windows
```

## ✈️ Release

1. Create `release/vX.Y.Z` branch.
2. Update `CHANGELOG.md`.  
   1. If a built-in Talk version is to be changed - add a note:
      ```md
      ### Build-in Talk update

      Built-in Talk in binaries is updated to $(VERSION) Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md
      ```
3. Update `package.json`:
   - For minor update:
     ```sh
     npm version minor
     ```
   - For patch update:
     ```sh
     npm version patch
     ```
4. Create **a release PR**.
5. Merge **the release PR**.
6. Create and push **a tag**:
   ```sh
   git tag -a v$(version) -m "Tagging the $(version) release."
   git push origin v$(version)
   git push releases v$(version)
   ```
7. **Draft a new release** on GitHub in [nextcloud-releases/talk-desktop](https://github.com/nextcloud-releases/talk-desktop/releases)
   1. Add **release title**: `v$(version) - Talk v$(talkVersion)`, e.g. `v0.10.0 - Talk v17.1.0-rc.1`
   2. Choose a **tag**
   3. Add the respective `CHANGELOG.md` section
   4. Use the **Generate release notes** button and wrap put the result into
      ```md
      ## What's Changed

      <details>
        <!-- Generated content -->
      </details>
      ``` 
8. **Draft a new release** on GitHub in [nextcloud/talk-desktop](https://github.com/nextcloud/talk-desktop/releases)
   1. Copy everything from the previous step
   2. Add:
      ```md
      > 📥 Download Binaries on https://github.com/nextcloud-releases/talk-desktop/releases/tag/v$(version)
      ```
9. Package release on each platform separately:
   ```sh
   npm run release:package
   ```
10. Upload packages to the GitHub Releases on [nextcloud-releases/talk-desktop](https://github.com/nextcloud-releases/talk-desktop/releases/lastest)
11. Publish both releases on GitHub Releases

## 👥 Contribution Guidelines

See: https://github.com/nextcloud/spreed#contribution-guidelines
