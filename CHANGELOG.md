# Changelog

## v0.17.0 - 2023-11-30

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.0-rc.2 Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

### Features

- Add `--background` argv support for opening app minimized to the system tray [#427](https://github.com/nextcloud/talk-desktop/issues/427)

## v0.16.0 - 2023-11-17

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.0-beta.3 Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.15.0 - 2023-11-13

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.0-beta.2 Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

### Fixes

- Update confirm dialogs to use Nextcloud dialogs instead of native confirm [#12](https://github.com/nextcloud/talk-desktop/issues/12)
- Add support for `.gif` images request for animated emojis in call reactions [#405](https://github.com/nextcloud/talk-desktop/issues/405)

## v0.14.0 - 2023-11-07

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.0-beta.1 Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

### Fixes

- Fix translations on Login, Help and Upgrade required windows [#363](https://github.com/nextcloud/talk-desktop/issues/363), [#3](https://github.com/nextcloud/talk-desktop/issues/3)

## v0.13.0 - 2023-10-27

### Build-in Talk update

- Built-in Talk in binaries is updated to v17.1.2 Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.12.0 - 2023-09-28

### Build-in Talk update

- Built-in Talk in binaries is updated to v17.1.1 Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.11.0 - 2023-09-18

### Fixes

- Restore app from system tray on reopen by @ShGKme in [#348](https://github.com/nextcloud/talk-desktop/pull/348)
- Catch http errors on development and styles loading by @ShGKme in [#347](https://github.com/nextcloud/talk-desktop/pull/347)

### Build-in Talk update

- Built-in Talk in binaries is updated to v17.1.0 Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.10.0 - 2023-08-11

### Features

- Add support for "Upgrade required" server response [#289](https://github.com/nextcloud/talk-desktop/pull/289)

### Build-in Talk update

Built-in Talk in binaries is updated to 17.1.0-rc.1. Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.9.0 - 2023-07-28

### Build-in Talk update

Built-in Talk in binaries is updated to 17.0.3. Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.8.0 - 2023-07-25

### Build-in Talk update

Built-in Talk in binaries is updated to 17.0.2. Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

### Features

- Add System Tray icon [#79](https://github.com/nextcloud/talk-desktop/pull/79)
- Add quit button on the Welcome screen [#271](https://github.com/nextcloud/talk-desktop/pull/271)

### Fixes

- Fix incorrect dark theme detection [#254](https://github.com/nextcloud/talk-desktop/pull/254)
- Fix infinity Welcome loading on revoked credentials [#270](https://github.com/nextcloud/talk-desktop/pull/270)

## v0.7.0 - 2023-06-27

### Build-in Talk update

Built-in Talk in binaries is updated to 17.0.1. Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

### Features

- Allow to log in with a copy-pasted URL from browser [#204](https://github.com/nextcloud/talk-desktop/pull/204)

### Fixes

- Fix capabilities update only with re-login [#198](https://github.com/nextcloud/talk-desktop/issues/198)
- Fix login for users with a space in userid [#199](https://github.com/nextcloud/talk-desktop/issues/199)
- Urldecode the app password [#203](https://github.com/nextcloud/talk-desktop/pull/203)

## v0.6.0 - 2023-05-22

### Build-in Talk update

Built-in Talk in binaries is updated to 17.0.0-rc.1. Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.5.0 - 2023-05-15

### Build-in Talk update

Built-in Talk in binaries is updated to 17.0.0-beta.3. Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.4.0 - 2023-05-09

### Fixes

- Fix doubling webroot cause failing loading the default file icon [#173](https://github.com/nextcloud/talk-desktop/pull/173)
- Allow MKCOL requests for creating virtual bg folder [#174](https://github.com/nextcloud/talk-desktop/pull/174)
- Fix initial state patching to add highlight own group mentions support [#171](https://github.com/nextcloud/talk-desktop/pull/171)

### Build-in Talk update

Built-in Talk in binaries is updated to new major 17.0.0-beta.2. Talk changelog: https://github.com/nextcloud/spreed/blob/master/CHANGELOG.md

## v0.3.2 - 2023-04-20

### Fixes

- Fix importing images to support video backgrounds in Nextcloud Talk 17

### Build-in Talk update

Built-in Talk in binaries is updated to 16.0.3. Talk changelog: https://github.com/nextcloud/spreed/releases/tag/v16.0.3

## v0.3.1 - 2023-04-16

### Fixes

- Fix issue with opening a chat [#141](https://github.com/nextcloud/talk-desktop/pull/141)
- Fix GitHub rate limit error on development [#125](https://github.com/nextcloud/talk-desktop/pull/125) 

### Development notes

- Now Nextcloud Talk can be built with [Nextcloud Talk `stable26` branch](https://github.com/nextcloud/spreed/tree/stable26)

## v0.3.0 - 2023-04-06

### Features

- Native context menu for text editing and spell checking
- New release notifications
- More translations

### Fixes

- Fix black screen on signaling session error
- Fix unclosable "About window" on macOS
- Fix macOS icon

### Build-in Talk update

Built-in Talk in binaries is updated to 16.0.2. Talk changelog: https://github.com/nextcloud/spreed/releases/tag/v16.0.2

## v0.2.2 - 2023-03-24

### Fixes

- Fix wrong display name in calls and temp messages
- Fix loosing authentication on notify_push caused brute force protection
- Fix zoom without SHIFT and by mouse wheel

### Build-in Talk update

Built-in Talk in binaries is updated to 16.0.1. Talk changelog: https://github.com/nextcloud/spreed/releases/tag/v16.0.1

## v0.2.1 - 2023-03-21

### Fixes
 
- Fix dev and prod instances lock each other
- Fix repository links

## v0.2.0 - 2023-03-21

🎉 First release of Nextcloud Talk Preview

- Connect to Nextcloud 26 with Nextcloud Talk 16
- Chat and make video-calls
- Send files
- Receive native notifications
