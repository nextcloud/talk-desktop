# 🖥️ Nextcloud Talk Desktop 💬

> Nextcloud Talk Desktop client based on Nextcloud Talk web application bundling ✨

## 📥 Download Binaries

### https://github.com/nextcloud-releases/talk-desktop/releases

## 🏗️ Prerequisites

- [Nextcloud Server](https://github.com/nextcloud/server) version 27 or higher.
- [Nextcloud Talk](https://github.com/nextcloud/spreed) version 17 or higher.

## 👾 Drawbacks

- Currently not supported:
  - Setting User Status ([#26](https://github.com/nextcloud/talk-desktop/issues/26))
  - Search ([#30](https://github.com/nextcloud/talk-desktop/issues/30))
  - Untrusted certificate on Linux ([#23](https://github.com/nextcloud/talk-desktop/issues/23))
  - Dark/light theme ([#17](https://github.com/nextcloud/talk-desktop/issues/17))
- Works with limitations:
  - File Viewer — only images and videos

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
9. Package release, specify version and platforms:
   ```sh
   npm run release:package -- --version v$(talkVersion) --windows --linux --mac
   ```
10. Upload packages to the GitHub Releases on [nextcloud-releases/talk-desktop](https://github.com/nextcloud-releases/talk-desktop/releases/lastest)
11. Publish both releases on GitHub Releases

## 👥 Contribution Guidelines

See: https://github.com/nextcloud/spreed#contribution-guidelines
