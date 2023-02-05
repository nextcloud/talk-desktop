# 🖥️ Nextcloud Talk Desktop 💬

> Talk Desktop client based on magic Talk Web bundling ✨

## 🧑‍💻 Development Setup

### Initial setup

```bash
# Install dependencies
npm ci

# Make .env file
cp .env.example .env

# Don't forget to configure ENV variables! 
```

Talk Desktop requires [Talk source code](https://github.com/nextcloud/spreed).

### No talk is cloned?

Clone talk and install dependencies:

```bash
# Clone spreed in this repository root
git clone -b shgkme https://github.com/nextcloud/spreed

# Install Talk dependencies
cd ./spreed/
npm ci

# Don't forget to return back
cd ../
```

### Talk is already cloned?

Set `TALK_PATH` ENV variable or edit `.env` file:

```dotenv
TALK_PATH=/path/to/nextcloud-dev/apps/spreed/
```

### Development

```bash
# Start development server
npm start

# Build to production and package to executable
npm run package
```

## Contribution Guidelines

See spreed repo: https://github.com/nextcloud/spreed#contribution-guidelines
