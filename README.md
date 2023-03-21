# 🖥️ Nextcloud Talk Desktop 💬

> Nextcloud Talk Desktop client based on Nextcloud Talk web application bundling ✨

## Prerequisites

- [Nextcloud Server](https://github.com/nextcloud/server) version 26 only.
- [Nextcloud Talk](https://github.com/nextcloud/spreed) version 16 only.

## 👾 Drawbacks

- Currently not supported:
  - Screen sharing ([#11](https://github.com/nextcloud/talk-desktop/issues/11))
  - Share from Nextcloud (including files creation) ([#12](https://github.com/nextcloud/talk-desktop/issues/12))
  - Contacts menu on user avatars menus ([#34](https://github.com/nextcloud/talk-desktop/issues/34))
  - Setting User Status ([#26](https://github.com/nextcloud/talk-desktop/issues/26))
  - Search ([#30](https://github.com/nextcloud/talk-desktop/issues/30))
  - Notifications ([#31](https://github.com/nextcloud/talk-desktop/issues/31))
  - Untrusted certificate on Linux ([#23](https://github.com/nextcloud/talk-desktop/issues/23))
  - Dark/light theme ([#17](https://github.com/nextcloud/talk-desktop/issues/17))
- Work with limitations:
  - File viewer - opened in the default web-browser

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

Clone `nextcloud/spreed` on `desktop-stable26` branch and install dependencies:

```bash
# Clone in the repository root
git clone -b desktop-stable26 https://github.com/nextcloud/spreed

# Install dependencies
cd ./spreed/
npm ci

# Don't forget to return back
cd ../
```

#### `nextcloud/spreed` is already cloned?

1. Switch to `desktop-stable26` branch.
2. Set `TALK_PATH` ENV variable or edit `.env` file:
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

## 👥 Contribution Guidelines

See: https://github.com/nextcloud/spreed#contribution-guidelines
