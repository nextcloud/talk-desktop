<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: CC0-1.0
-->

# Nextcloud Talk Desktop

[![REUSE status](https://api.reuse.software/badge/github.com/nextcloud/talk-desktop)](https://api.reuse.software/info/github.com/nextcloud/talk-desktop)

> Official Nextcloud Talk Desktop client

![Nextcloud Talk](./Nextcloud-Talk-light.png#gh-light-mode-only)
![Nextcloud Talk](./Nextcloud-Talk-dark.png#gh-dark-mode-only)

## 📥 Install

All binaries and `beta` releases are available on [Nextcloud Releases](https://github.com/nextcloud-releases/talk-desktop/releases).

| Platform (arch)          | Distribution type                                                                                                                                                   | Download link                                                                                                                                        |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| **🐧 Linux** (x64)       | [Flatpak](https://flatpak.org) single file (recommended)                                                                                                            | [Nextcloud.Talk-linux-x64.flatpak](https://github.com/nextcloud-releases/talk-desktop/releases/latest/download/Nextcloud.Talk-linux-x64.flatpak)     |
| **🐧 Linux** (x64)       | ZIP archive                                                                                                                                                         | [Nextcloud.Talk-linux-x64.zip](https://github.com/nextcloud-releases/talk-desktop/releases/latest/download/Nextcloud.Talk-linux-x64.zip)             |
| **🍎 macOS** (Universal) | Disc Image                                                                                                                                                          | [Nextcloud.Talk-macos-universal.dmg](https://github.com/nextcloud-releases/talk-desktop/releases/latest/download/Nextcloud.Talk-macos-universal.dmg) |
| **🪟 Windows** (x64)     | Non-admin single-user one-click installer (recommended)                                                                                                             | [Nextcloud.Talk-windows-x64.exe](https://github.com/nextcloud-releases/talk-desktop/releases/latest/download/Nextcloud.Talk-windows-x64.exe)         |
| **🪟 Windows** (x64)     | [MSI Deployment Tool](https://github.com/Squirrel/Squirrel.Windows/blob/develop/docs/using/machine-wide-installs.md) (for administrated environments, experimental) | [Nextcloud.Talk-windows-x64.msi](https://github.com/nextcloud-releases/talk-desktop/releases/latest/download/Nextcloud.Talk-windows-x64.msi)         |

### via Package manager

| Package       | Package manager                                                                       | Command                              |
|----------------|---------------------------------------------------------------------------------------|--------------------------------------|
| **🪟 Windows** | [Windows Package Manager](https://learn.microsoft.com/en-us/windows/package-manager/) | `winget install Nextcloud.Talk`      |
| **🪟 Windows** | [Windows Package Manager](https://learn.microsoft.com/en-us/windows/package-manager/) | `winget install Nextcloud.Talk.Beta` |

## 🏗️ Prerequisites

- [Nextcloud Server](https://github.com/nextcloud/server) version 27 or higher.
- [Nextcloud Talk](https://github.com/nextcloud/spreed) version 17 or higher.

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

1. Install dependencies
	 ```bash
	 npm ci 
	 ```
2. Nextcloud Talk Desktop requires [Nextcloud Talk source code](https://github.com/nextcloud/spreed).
   - **No `nextcloud/spreed` is cloned?**\
     Clone it and install dependencies:
	   ```sh
	   # Clone Talk to the repository root
	   git clone https://github.com/nextcloud/spreed
     
	   # Install dependencies
	   npm ci --prefix=spreed
	   ```
   - **You want to reuse existing `nextcloud/spreed`, for instance, in a server setup?**\
     Set `TALK_PATH` ENV variable or edit `.env` file:
     ```sh
     cp .env.example .env
     # Edit .env and set TALK_PATH
     TALK_PATH=/path/to/nextcloud/server/apps-extra/spreed/
     ```
3. Check `.env.example` for any additional configuration if needed.

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

## 👥 Contribution Guidelines

See: https://github.com/nextcloud/spreed#contribution-guidelines
