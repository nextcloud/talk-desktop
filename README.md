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

## 🧑‍💻 Development Setup

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

### Development

```bash
# Start development server
npm start
```

## 📦 Packaging

```bash
#########################
# Package to executable #
#########################

# 🐧 Linux
npm run package:linux

# 🍏 Mac (Darwin)
npm run package:mac

# 🪟 Windows (win32)
npm run package:windows

#  All
npm run package:all

#########################
# Make ZIP distribution #
#########################

# 🐧 Linux
npm run make:linux

# 🍏 Mac (Darwin)
# Note: doesn't work on Windows, use WSL
npm run make:mac

# 🪟 Windows (win32)
npm run make:windows

#  All
npm run make:all
```

## ✈️ Release

1. Create `release/vX.Y.Z` branch.
2. Go to https://github.com/nextcloud/talk-desktop/releases/new and draft a new release
   1. Choose a tag: Type the new version tag `v$(version)`
   2. Previous tag: Select the last release
   3. Generate release notes and copy the input
3. Update `CHANGELOG.md` with:
   1. The output of the previous step
   2. If a built-in Talk version is to be changed - add a note:
      ```md
      ### Build-in Talk update

      Built-in Talk in binaries is updated to $(talkVersion) Talk changelog: https://github.com/nextcloud/spreed/blob/$(talkVersion)/CHANGELOG.md
      ```
   3. Commit `CHANGELOG.md`
4. Update version in `package.json` and `package-locked.json` using npm:
   1. For minor update:
      ```sh
      npm version minor --no-git-tag
      ```
   2. For patch update:
      ```sh
      npm version patch --no-git-tag
      ```
   3. Commit `package.json` and `package-locked.json`
5. Push your branch and create a PR.
   1. Get approvals and merge the release PR.
6. Pull the branch you merged into
7. Create and push **a tag**:
    ```sh
    git tag -a v$(version) -m "Tagging the $(version) release."
    git push origin v$(version)
    git push releases v$(version)
    ```
8. **Draft a new release** on GitHub in [nextcloud-releases/talk-desktop](https://github.com/nextcloud-releases/talk-desktop/releases)
   1. Add **release title**: `v$(version) - Talk v$(talkVersion)`, e.g. `v0.10.0 - Talk v17.1.0-rc.1`
   2. Choose a tag: `v$(version)`
   3. Add the respective `CHANGELOG.md` section
   4. Use the **Generate release notes** button and wrap put the result into
       ```md
       ## What's Changed

       <details>
          <!-- Generated content -->
       </details>
       ``` 
9. **Draft a new release** on GitHub in [nextcloud/talk-desktop](https://github.com/nextcloud/talk-desktop/releases)
   1. Copy everything from the previous step
   2. Add:
       ```md
       > 📥 Download Binaries on https://github.com/nextcloud-releases/talk-desktop/releases/tag/v$(version)
       ```
10. Package release, specify version and platforms:
    ```sh
    npm run release:package -- --version v$(talkVersion) --windows --linux --mac
    ```
11. Upload packages to the GitHub Releases on [nextcloud-releases/talk-desktop](https://github.com/nextcloud-releases/talk-desktop/releases/lastest)
12. Publish both releases on GitHub Releases

## 🎨 Updating global styles

Talk frontend depends on the global Nextcloud server styles. To manually get them run:

```sh
# node ./scripts/fetch-server-styles.mjs <VERSION>, for example
node ./scripts/fetch-server-styles.mjs stable29
```

## 👥 Contribution Guidelines

See: https://github.com/nextcloud/spreed#contribution-guidelines
