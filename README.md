# 🖥️ Nextcloud Talk Desktop 💬

> Nextcloud Talk Desktop client based on Nextcloud Talk web application bundling ✨

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
git clone -b shgkme https://github.com/nextcloud/spreed

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

## 👥 Contribution Guidelines

See: https://github.com/nextcloud/spreed#contribution-guidelines
