# 🖥️ Nextcloud Talk Desktop 💬

> Talk Desktop client based on magic Talk Web bundling ✨

## 🧑‍💻 Development Setup

### Initial setup

```bash
# Install dependencies
npm ci

# Make .env file
cp .env.example .env
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

## 📝 TODO

- [ ] Talk Web upgrade
  - [x] Add IS_TALK_DESKTOP constant (Environment variable?)
  - ~~Replace full URL constructing with VueRouter's Location~~
  - [x] Add Electron to supported browsers / Disable browser check on Desktop
  - [x] Separate Webpack config to common and web
  - [x] Fix absolute links for conversations
  - [ ] Fix global session exception handling
- [ ] Basic features
  - [x] Fix WASM modules loading for "Blur background" (hotfix)
  - [x] Replacement for OC.dialogs.confirm
    - [x] Use simple native confirm
    - [ ] Add full-featured replacement
  - [x] File Uploading / Receiving
  - [ ] Localization
  - [ ] HTTP Proxy in main process for authentication (instead of patching and insecure mode)
  - [ ] Add initialization with Capabilities API and User Data from API
- [ ] Special Desktop features
  - [ ] Stay in tray
  - [ ] Run on startup
  - [ ] Native notifications
- [ ] Other apps integrations
  - [ ] Files opening
    - [ ] Open in-app
      - [ ] Images
      - [ ] Videos
      - [ ] PDFs
      - [ ] MDs (texts)
    - [ ] Open in default Web-Browser or Web View
      - [ ] Office documents
      - [ ] Contacts
      - [ ] Other files
  - [ ] User profile - open Web-Browser or Web View
  - [ ] User status - in-app integration
  - [ ] Search - integration
- [ ] Architecture documentation
- [ ] Packaging / Publishing / Updating
- [ ] Next stages features
  - [ ] Multi-accounts 


## 🪲 Known issues

- Login window
  - [ ] (bug) Sometimes login WebView does not appear without resizing window o_O
  - [ ] (feature) Need to catch server error and 404 on login WebView
  - [ ] (UI) Add display login WebView loading indicator 
- Talk
  - [ ] (feature) Cache server styles - so without internet connection it won't break  
  - [ ] (feature) Handle No Internet
  - [ ] (feature) Catch session issue on talk (replacement for page reload on web)

## 🤔 How it works

In general, it is a build of Talk Web Nextcloud app with:
- Replacement/patching some globals and npm packages of Nextcloud Server Frontend
- HTTP proxying on the main process for authentication
- Some conditions in Talk Web

## 👥 Multi-account with multi-versioning

Multi-account is not a problem... until different accounts have different version of Nextcloud...

### Way 1: multi-account only for specific version

Fix major version in the client. Allow to have many accounts

Props:
- The easiest for development
	Cons:
- Works only when a user needs to have many accounts on **one** server
- A user needs to install many clients for many servers...

### Way 2: download client resources from server on demand

Props:
- A bit tricky to develop, but still possible to maximize reusing of Web modules
	Cons:
- Old versions of nextcloud most likely want work

### Way 3: develop desktop client the same way as mobile clients

On mobile clients, client checks server capabilities and uses different APIs as well as different UI features.

The same could be archived on Electron Desktop in 2 ways:
1. Make Web client with the same approach.
	- This is a hard way. It would require all the Talk Frontenders thing about capabilities as they develop native application.
	- Do not reuse a whole Web Client. Instead, create a new client and reuse only services and basic components.

Props:
- Solve all problems with multi-versioning the same way as other clients
	Cons:
- Much less reusing of

## Contribution Guidelines

See spreed repo: https://github.com/nextcloud/spreed#contribution-guidelines
