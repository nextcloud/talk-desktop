<!--
  - SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: CC0-1.0
-->

# Changelog

## v2.0.5 - 2025-12-16

### Features

- Add custom theming to the build config [#1583](https://github.com/nextcloud/talk-desktop/pull/1583)

### Fixes

- Incorrect application name and application version in the settings dialog footer [#1577](https://github.com/nextcloud/talk-desktop/pull/1577), [#1578](https://github.com/nextcloud/talk-desktop/pull/1578)
- Incorrect application name during the login flow [#1594](https://github.com/nextcloud/talk-desktop/pull/1594)
- Adjust the help window layout to the new Markdown rendering and minor diagnosis report adjustments [#1595](https://github.com/nextcloud/talk-desktop/pull/1595)

### Changes

- Built-in Talk in binaries is updated to v22.0.6 in both beta and stable release channels [#1590](https://github.com/nextcloud/talk-desktop/pull/1590)
- Fix `scripts/fetch-server-styles` for `server@master` [#1591](https://github.com/nextcloud/talk-desktop/pull/1591)

## v2.0.4 - 2025-11-25

### Fixes

- Windows/MSI: add Firewall exception during install [#1518](https://github.com/nextcloud/talk-desktop/pull/1518)
- Linux: downgrade to Electron v38.1.2 due to issues on Wayland [#1526](https://github.com/nextcloud/talk-desktop/pull/1526)
- macOS: use new Nextcloud 32 background on the DMG installer [#1539](https://github.com/nextcloud/talk-desktop/pull/1539)
- Allow overwriting the user status like in the web without having to restore first [#1536](https://github.com/nextcloud/talk-desktop/pull/1536)
- Remove the title bar in fullscreen mode [#1553](https://github.com/nextcloud/talk-desktop/pull/1553)
- Adjust settings to the new design [#1530](https://github.com/nextcloud/talk-desktop/pull/1530)
- "Check devices" cannot be open from the main menu settings [#1560](https://github.com/nextcloud/talk-desktop/pull/1560)

### Changes

- Built-in Talk in binaries is updated to v22.0.4 in both beta and stable release channels [#1561](https://github.com/nextcloud/talk-desktop/pull/1561)
- Make bundling compatible with Talk 23 again [#1544](https://github.com/nextcloud/talk-desktop/pull/1544)

## v2.0.3 - 2025-10-27

### Fixes

- Wrong buttons position and color in Viewer [#1487](https://github.com/nextcloud/talk-desktop/pull/1487)

### Changes

- Built-in Talk in binaries is updated to v22.0.2 in both beta and stable release channels [#1510](https://github.com/nextcloud/talk-desktop/pull/1510)

## v2.0.2 - 2025-09-27

### Fixes

- Experimental fix for video streams [#1478](https://github.com/nextcloud/talk-desktop/pull/1478)

### Changes

- Built-in Talk in binaries is updated to v22.0.0 in both beta and stable release channels [#1480](https://github.com/nextcloud/talk-desktop/pull/1480)

## v2.0.1-beta - 2025-09-12

### Changes

- Built-in Talk in binaries is updated to v22.0.0-rc.2 in the beta release channel [#1465](https://github.com/nextcloud/talk-desktop/pull/1465)

## v2.0.0-beta - 2025-09-04

### Changes

- Built-in Talk in binaries is updated to v22.0.0-rc.1 in the beta release channel [#1452](https://github.com/nextcloud/talk-desktop/pull/1452)
- Built-in styles were updated to Nextcloud v32.0.0rc1 styles [#1451](https://github.com/nextcloud/talk-desktop/pull/1451)
- Talk Desktop is migrated Vue 3 and can no longer use built-in Talk below v22 with Vue 2 [#680](https://github.com/nextcloud/talk-desktop/pull/680), [#1422](https://github.com/nextcloud/talk-desktop/pull/1422)

## v1.2.6 - 2025-09-02

### Fixes

- MSI installer installs update as a new app [#1435](https://github.com/nextcloud/talk-desktop/pull/1435)
- User Status is set to offline when (in)activity is not changing [#1405](https://github.com/nextcloud/talk-desktop/pull/1405)
- Missing localization in some places [#1391](https://github.com/nextcloud/talk-desktop/pull/1391) 

### Changes

- Built-in Talk in binaries is updated to v21.1.4 in the stable release channel [#1445](https://github.com/nextcloud/talk-desktop/pull/1445)

## v1.2.5 - 2025-07-17

### Fixes

- Logout and Quit buttons do nothing [#1378](https://github.com/nextcloud/talk-desktop/pull/1378)

### Changes

- Built-in Talk in binaries is updated to v21.1.2 in both beta and stable release channels [#1384](https://github.com/nextcloud/talk-desktop/pull/1384)
- Electron is updated to 37, including Chromium 138 [#1382](https://github.com/nextcloud/talk-desktop/pull/1382)

## v1.2.4 - 2025-07-11

### Added

- Quit button in the user menu [#1356](https://github.com/nextcloud/talk-desktop/pull/1356)

### Fixes

- Re-opening application while running in background is broken on Linux in Flatpak [#1358](https://github.com/nextcloud/talk-desktop/pull/1358)
 
### Changes

- Built-in Talk in binaries is updated to v21.1.1 in both beta and stable release channels [#1365](https://github.com/nextcloud/talk-desktop/pull/1365)

## v1.2.3 - 2025-06-05

### Added

- Taskbar icon badge counter [#1326](https://github.com/nextcloud/talk-desktop/pull/1326)

### Changes

- Built-in Talk in binaries is updated to v21.1.0 in both beta and stable release channels [#1327](https://github.com/nextcloud/talk-desktop/pull/1327)

## v1.2.2-beta - 2025-05-30

### Added

- Online/Away status update on system level activity change and locked screen [#1222](https://github.com/nextcloud/talk-desktop/pull/1222)

### Fixes

- Untrusted certificate support on all platforms [#1308](https://github.com/nextcloud/talk-desktop/pull/1308)
- Some settings and user data are only updated after re-login [#1312](https://github.com/nextcloud/talk-desktop/pull/1312)

### Changes

- Built-in Talk in binaries is updated to v21.1.0-rc.4 in the beta release channel [#1316](https://github.com/nextcloud/talk-desktop/pull/1316)

## v1.2.1-beta - 2025-05-16

### Fixes

- Crash with GTK version error on Linux with GNOME [#1290](https://github.com/nextcloud/talk-desktop/pull/1290)

### Changes

- Built-in Talk in binaries is updated to v21.1.0-rc.2 in the beta release channel [#1298](https://github.com/nextcloud/talk-desktop/pull/1298)

## v1.2.0-beta - 2025-05-12

### Changes

- Built-in Talk in binaries is updated to v21.1.0-rc.1 in the beta release channel [#1286](https://github.com/nextcloud/talk-desktop/pull/1286)

## v1.1.9 - 2025-05-12

### Fixes

- Regression breaking connection to Nextcloud server with non-empty base URL [#1263](https://github.com/nextcloud/talk-desktop/issues/1263)

### Changes

- Update translations
- Update dependencies

## v1.1.8 - 2025-05-05

### Fixes

- Reduce the number of user status requests by half [#1237](https://github.com/nextcloud/talk-desktop/pull/1237)
- Regression from the previous release causing unnecessary OPTIONS request to the server [#1236](https://github.com/nextcloud/talk-desktop/pull/1236) + [#1261](https://github.com/nextcloud/talk-desktop/pull/1261)
- File picker does not work in some locales [#1235](https://github.com/nextcloud/talk-desktop/pull/1235)

### Changes

- Built-in Talk in binaries is updated to v21.0.4 in both beta and stable release channels [#1246](https://github.com/nextcloud/talk-desktop/pull/1246)
- Talk Desktop can now be installed on Windows via community supported Chocolatey package: `choco install nextcloud-talk` [#1247](https://github.com/nextcloud/talk-desktop/pull/1247)

## v1.1.7 - 2025-04-18

### Features

- Add untrusted SSL certificate support on Linux [#1200](https://github.com/nextcloud/talk-desktop/pull/1200)

### Changes

- Built-in Talk in binaries is updated to v21.0.3 in both beta and stable release channels [#1224](https://github.com/nextcloud/talk-desktop/pull/1224)
- Update translations
- Update dependencies

## v1.1.6 - 2025-04-10

### Fixes

- File picker does not work when user never set locale [#1164](https://github.com/nextcloud/talk-desktop/pull/1164)

### Changes

- Built-in Talk in binaries is updated to v21.0.2 in both beta and stable release channels [#1207](https://github.com/nextcloud/talk-desktop/pull/1207)
- Update translations
- Update dependencies

## v1.1.5 - 2025-02-24

### Fixes

- Loop ringtone on incoming call [#1123](https://github.com/nextcloud/talk-desktop/pull/1123)
- Teams (Circles) support [#1121](https://github.com/nextcloud/talk-desktop/pull/1121)

### Changes

- Built-in Talk in binaries is updated to v21.0.0 in both beta and stable release channels [#1137](https://github.com/nextcloud/talk-desktop/pull/1137)
- Update translations
- Update dependencies

## v1.1.4-beta - 2025-02-17

### Notes

**Squirrel Deployment Tool .msi → WiX v3 .msi**:\
Experimental MSI installer with Squirrel Deployment Tool is removed
and replaced with a new MSI installer based on WiX v3.
You may remove the old installation. Your settings will be preserved.  

### Features

- Add a new MSI installer based on WiX v3 for Windows [#1103](https://github.com/nextcloud/talk-desktop/pull/1103)
- Add an option to repeat call notification sound on a second output device [#772](https://github.com/nextcloud/talk-desktop/issues/772)

### Fixes
  
- Fix call notification is still active when the call is joined [#1117](https://github.com/nextcloud/talk-desktop/issues/1117)

### Changes

- Built-in Talk in binaries is updated to v21.0.0-rc.4 in the beta release channel [#1119](https://github.com/nextcloud/talk-desktop/pull/1119)
- Click five times on the logo in the about window to enable dev mode [#1105](https://github.com/nextcloud/talk-desktop/pull/1105)
- Update translations
- Update dependencies

## v1.1.3-beta - 2025-02-10

### Fixes

- Fix unexpected notifications delay [#1097](https://github.com/nextcloud/talk-desktop/pull/1097)

### Changes

- Built-in Talk in binaries is updated to v21.0.0-rc.3 in the beta release channel [#1098](https://github.com/nextcloud/talk-desktop/pull/1098)

## v1.1.2-beta - 2025-02-04

### Fixes

- Improve screen sharing picker and fix performance issues [#1003](https://github.com/nextcloud/talk-desktop/pull/1003)
- Fix loading performance regression from server update handling in the previous release [#1073](https://github.com/nextcloud/talk-desktop/pull/1073)
- Fix crash on Linux when C (POSIX) is set as the preferred language [#1070](https://github.com/nextcloud/talk-desktop/pull/1070)

### Changes

- Built-in Talk in binaries is updated to v21.0.0-rc.2 in the beta release channel [#1074](https://github.com/nextcloud/talk-desktop/pull/1074)

## v1.1.1-beta - 2025-01-24

### Fixes

- Fix app immediately relaunches on server update [#1050](https://github.com/nextcloud/talk-desktop/pull/1050)
- Fix duplicated options in user status settings [#1048](https://github.com/nextcloud/talk-desktop/pull/1048)

### Changes

- Built-in Talk in binaries is updated to v21.0.0-rc.1 in the beta release channel [#1053](https://github.com/nextcloud/talk-desktop/pull/1053)

## v1.1.0-beta - 2025-01-20

### Changes

- Built-in Talk in binaries is updated to v21.0.0-beta.2 in the beta release channel [#1029](https://github.com/nextcloud/talk-desktop/pull/1029)

## v1.0.2 - 2025-01-20

### Features

- Add launch at startup for Windows and macOS [#1004](https://github.com/nextcloud/talk-desktop/pull/1004)

### Fixes

- Fix macOS microphone issue on screen sharing [#1023](https://github.com/nextcloud/talk-desktop/pull/1023)
- Fix bidirectional text support [#1033](https://github.com/nextcloud/talk-desktop/pull/1033)

### Changes

- Built-in Talk in binaries is updated to v20.1.3 in the stable release channel [#1039](https://github.com/nextcloud/talk-desktop/pull/1039)
- Release with beta versions of Talk is now supported starting v21.0.0-beta.2 [#1029](https://github.com/nextcloud/talk-desktop/pull/1029)
- Building with built-in Talk v18 is no longer supported [#1037](https://github.com/nextcloud/talk-desktop/pull/1037) 
- Update translations
- Update dependencies

## v1.0.1 - 2024-12-19

### Fixes

- Fix crash on the second instance run on Linux [#993](https://github.com/nextcloud/talk-desktop/pull/993)
- Fix native elements have incorrect theme [#974](https://github.com/nextcloud/talk-desktop/pull/974)
- Fix notifications are shown for too old entries [#967](https://github.com/nextcloud/talk-desktop/pull/967)
- Improve call state check in the call notification popup with new call state api [#965](https://github.com/nextcloud/talk-desktop/pull/965)
- Fix call notification popup is shown when the call has already ended [#964](https://github.com/nextcloud/talk-desktop/pull/964)

### Changes

- Built-in Talk in binaries is updated to v20.1.1 [#995](https://github.com/nextcloud/talk-desktop/pull/995)
- Update translations
- Update dependencies

## v1.0.0 - 2024-12-03

### Features

- Add call notification popup [#868](https://github.com/nextcloud/talk-desktop/pull/868)

### Fixes 

- Adjust icon on Linux and Windows [#948](https://github.com/nextcloud/talk-desktop/pull/948)
- Fix an occasional error alert [#936](https://github.com/nextcloud/talk-desktop/pull/936)
- Fix minor issues in the About window [#934](https://github.com/nextcloud/talk-desktop/pull/934), [#935](https://github.com/nextcloud/talk-desktop/pull/935)
- Fix zoom issues in edge cases [#893](https://github.com/nextcloud/talk-desktop/pull/893)

### Changes

- Built-in Talk in binaries is updated to v20.1.0 [#949](https://github.com/nextcloud/talk-desktop/pull/949)
- New release notify interval is decreased from 2 hours to 1 day [#952](https://github.com/nextcloud/talk-desktop/pull/952)
- `.env` file is now optional for development [#929](https://github.com/nextcloud/talk-desktop/pull/929) 
- Update translations
- Update dependencies

## v1.0.0-rc.2 - 2024-11-22

### Features

- Add new About window with an improved diagnosis report [#917](https://github.com/nextcloud/talk-desktop/pull/917)
- Add "Copy email address" to `mailto:` links context menu [#890](https://github.com/nextcloud/talk-desktop/pull/890)

### Fixes

- Fix light/dark theme is not applied to native parts of the app [#916](https://github.com/nextcloud/talk-desktop/pull/916)
- Fix parallel installations sharing common settings [#891](https://github.com/nextcloud/talk-desktop/pull/891)
- Fix macOS tray icon not following system style [#887](https://github.com/nextcloud/talk-desktop/pull/887)
- Fix screensharing on Flatpak distribution in Wayland [#877](https://github.com/nextcloud/talk-desktop/pull/877)

### Changes

- Built-in Talk in binaries is updated to v20.1.0-rc.2 [#920](https://github.com/nextcloud/talk-desktop/pull/920)
- Distributions for macOS and Windows are now signed with a certificate [#908](https://github.com/nextcloud/talk-desktop/pull/908)
- New MSI distribution is now provided for Windows in administrated environments with GPO deployment [#922](https://github.com/nextcloud/talk-desktop/pull/922)
- ZIP distribution is now provided only for Linux [#904](https://github.com/nextcloud/talk-desktop/pull/904)
- Distribution for macOS is now universal (support both Apple Silicon and Intel Macs) [#896](https://github.com/nextcloud/talk-desktop/pull/896)
- Flatpak distribution runtime and platform have been updated [#892](https://github.com/nextcloud/talk-desktop/pull/892)
- Update translations
- Update dependencies

## v1.0.0-rc.1 - 2024-11-11

### Features

- Add application settings [#835](https://github.com/nextcloud/talk-desktop/pull/835)
- Add monochrome tray icon setting [#836](https://github.com/nextcloud/talk-desktop/pull/836)
- Add download links handling with a new message menu item [#840](https://github.com/nextcloud/talk-desktop/pull/840)
- Add zoom setting and fix a number of zoom-related issues [#853](https://github.com/nextcloud/talk-desktop/pull/853)

### Fixes

- Fix error on launching app twice quickly before it initializes [#856](https://github.com/nextcloud/talk-desktop/pull/876)
- Fix login window cannot be reopened after close on macOS [#852](https://github.com/nextcloud/talk-desktop/pull/852)
- Fix Viewer close not handled during a call [#835](https://github.com/nextcloud/talk-desktop/pull/835)
- Fix preview not shown for a supported mime-type [#831](https://github.com/nextcloud/talk-desktop/pull/831)

### Changes 

- Built-in Talk in binaries is updated to v20.0.2 [#858](https://github.com/nextcloud/talk-desktop/pull/858)
- Built-in Talk version in now specified in `package.json` [#858](https://github.com/nextcloud/talk-desktop/pull/858)
- Add Windows Squirrel distribution [#841](https://github.com/nextcloud/talk-desktop/pull/841)
- Add macOS Dist Image (.dmg) distribution [#844](https://github.com/nextcloud/talk-desktop/pull/844)
- Add Linux Flatpak file distribution [#869](https://github.com/nextcloud/talk-desktop/pull/869)
- Handle opening a new installation as replacement of a running one [#859](https://github.com/nextcloud/talk-desktop/pull/859)
- Check whether spreed repository dependencies are installed on build [#847](https://github.com/nextcloud/talk-desktop/pull/847)
- Rename scripts `package` to `build`, `make` to `package` following Nextcloud apps and libs style [#846](https://github.com/nextcloud/talk-desktop/pull/846)
- Update translations
- Update dependencies

## v0.39.0 - 2024-10-11

### Build-in Talk update

- Built-in Talk in binaries is updated to v20.0.1

## v0.38.0 - 2024-09-19

### Build-in Talk update

- Built-in Talk in binaries is updated to v20.0.0

### Fixes

- Fix typing-status sharing being always disabled [#799](https://github.com/nextcloud/talk-desktop/pull/799)

## v0.37.0 - 2024-09-06

### Build-in Talk update

- Built-in Talk in binaries is updated to v20.0.0-rc.4

### Features

- Add PDF Viewer [#784](https://github.com/nextcloud/talk-desktop/pull/784)
- Add Text, Markdown, and Source Code Viewer (read-only) [#785](https://github.com/nextcloud/talk-desktop/pull/785)

### Fixes

- Improve Viewer styling and loading/error handling [#783](https://github.com/nextcloud/talk-desktop/pull/783)

## v0.36.0 - 2024-08-27

### Build-in Talk update

- Built-in Talk in binaries is updated to v20.0.0-rc.3

### Fixes

- Fix error when connecting to old Nextcloud Talk servers [#760](https://github.com/nextcloud/talk-desktop/issues/760)
- UI fixes [#761](https://github.com/nextcloud/talk-desktop/pull/761), [#773](https://github.com/nextcloud/talk-desktop/pull/773)

## v0.35.0 - 2024-08-16

### Build-in Talk update

- Built-in Talk in binaries is updated to v20.0.0-rc.2

### Fixes

- Adjust About window size and paddings [#754](https://github.com/nextcloud/talk-desktop/pull/754)
- Fix federated invitations support [#747](https://github.com/nextcloud/talk-desktop/pull/747)
- Make Talk window default size smaller with new compact design [#746](https://github.com/nextcloud/talk-desktop/pull/746)
- Fix the connection issue with losing base URL when built with Nextcloud Talk v20 [#742](https://github.com/nextcloud/talk-desktop/pull/742)

### Other changes

- Fix REUSE-compliance and check it on CI [#752](https://github.com/nextcloud/talk-desktop/pull/752)
- Support building with Talk 21 (Nextcloud 31) [#751](https://github.com/nextcloud/talk-desktop/pull/751)

## v0.34.0 - 2024-08-05

### Build-in Talk update

- Built-in Talk in binaries is updated to v20.0.0-beta.3

### Features

- Use built-in global styles instead of server's, increasing stability and performance but losing custom theming support [#741](https://github.com/nextcloud/talk-desktop/pull/741)

### Fixes

- Fix the connection issue with losing base URL when built with Nextcloud Talk v20 [#742](https://github.com/nextcloud/talk-desktop/pull/742)
- Fix several minor UI bugs with the user menu [#737](https://github.com/nextcloud/talk-desktop/pull/737)
- Fix styles compatibility with Nextcloud 30 [#736](https://github.com/nextcloud/talk-desktop/pull/736)
- Adjust the title bar to new Nextcloud design [#738](https://github.com/nextcloud/talk-desktop/pull/738)
- Disable custom title bar on Linux due to several; minor issue [#735](https://github.com/nextcloud/talk-desktop/pull/735)

## v0.33.0 - 2024-07-18

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.7

### Fixes

- User is kept logged in on the Login Flow Web-View [#683](https://github.com/nextcloud/talk-desktop/pull/717)

## v0.32.0 - 2024-07-11

### Fixes

* fix(DesktopHeader): make text and icons contrast by @Antreesy in https://github.com/nextcloud/talk-desktop/pull/703

### Dependencies

* build(deps-dev): Bump zx from 8.1.3 to 8.1.4 by @dependabot in https://github.com/nextcloud/talk-desktop/pull/705
* build(deps-dev): Bump eslint-plugin-promise from 6.2.0 to 6.4.0 by @dependabot in https://github.com/nextcloud/talk-desktop/pull/708
* build(deps-dev): Bump eslint-plugin-vue from 9.26.0 to 9.27.0 by @dependabot in https://github.com/nextcloud/talk-desktop/pull/707

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.5 Talk changelog: https://github.com/nextcloud/spreed/blob/v19.0.5/CHANGELOG.md

## v0.31.0 - 2024-06-30

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.4

## v0.30.0 - 2024-06-14

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.2

### Features

- Add user status support [#26](https://github.com/nextcloud/talk-desktop/issues/26)
- Flash or bounce icon on a new notification [#388](https://github.com/nextcloud/talk-desktop/issues/388)

### Fixes

- Improve user menu design [#683](https://github.com/nextcloud/talk-desktop/pull/683)
- Make Talk Desktop user appears "online" on server [#634](https://github.com/nextcloud/talk-desktop/pull/634)
- Disable sounds on Do-Not-Disturb [#415](https://github.com/nextcloud/talk-desktop/issues/415)
- Increase the default window size to fit the display and include the join call dialog [#682](https://github.com/nextcloud/talk-desktop/pull/682)
- Define the default outline color for focus visible [#643](https://github.com/nextcloud/talk-desktop/pull/643)

## v0.29.0 - 2024-04-19

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.0-rc.5

### Features

- New title bar design and other minor design changes [#617](https://github.com/nextcloud/talk-desktop/pull/617)
- Workaround for multi-account support with different executable names [#620](https://github.com/nextcloud/talk-desktop/pull/620)

### Fixes

- Better sort and name available screensharing sources [#618](https://github.com/nextcloud/talk-desktop/pull/618)
- Show mime type icon for attachments in messages [#619](https://github.com/nextcloud/talk-desktop/pull/619)
- Show main window after login [#623](https://github.com/nextcloud/talk-desktop/pull/623)

## v0.28.0 - 2024-04-12

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.0-rc.3

### Features

- Add screensharing support [#11](https://github.com/nextcloud/talk-desktop/issues/11)
- Add image and video viewer support [#255](https://github.com/nextcloud/talk-desktop/issues/255)

### Fixes

- Open a conversation by link to other conversations in the app instead of a web-browser [#603](https://github.com/nextcloud/talk-desktop/pull/603)
- Open and create a 1-to-1 conversation by "Talk to User" from the participant's menu in the app instead of a web-browser [Talk#11879](https://github.com/nextcloud/spreed/pull/11879)
- Pretty "Copy conversation link" without "index.php" if supported by server for Nextcloud 29+ [#605](https://github.com/nextcloud/talk-desktop/issues/605)

### Other changes

- Drop support for building with Talk v17 [#598](https://github.com/nextcloud/talk-desktop/pull/598)

## v0.27.0 - 2024-03-28

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.0-rc.1

## v0.26.1 - 2024-03-26

### Fixes

- Downgrade undici dependency again [#583](https://github.com/nextcloud/talk-desktop/pull/583)

## v0.26.0 - 2024-03-26

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.0-beta.5

## v0.25.0 - 2024-03-21

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.0-beta.4

## v0.24.0 - 2024-03-15

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.0-beta.2

## v0.23.0 - 2024-03-11

### Build-in Talk update

- Built-in Talk in binaries is updated to v19.0.0-beta.1

### Fixes

- Fix Talk hash integration with Talk 18 and below [#550](https://github.com/nextcloud/talk-desktop/pull/550)

## v0.22.0 - 2024-03-05

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.4

### Fixes

- Fix window icon on linux [#308](https://github.com/nextcloud/talk-desktop/pull/308)
- Fix "Share from Nextcloud" support [#540](https://github.com/nextcloud/talk-desktop/pull/540)
- Allow avatar menu on desktop [Talk#11675](https://github.com/nextcloud/spreed/pull/11675)

### Other changes

- Added Nextcloud Talk 19 support
- Update dependencies
- Update translations

## v0.21.0 - 2024-02-01

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.3

## v0.20.0 - 2024-01-09

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.1

### Fixes

- Fix language detection for some languages [#458](https://github.com/nextcloud/talk-desktop/pull/458)

## v0.19.0 - 2023-12-12

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.0

## v0.18.0 - 2023-12-07

### Build-in Talk update

- Built-in Talk in binaries is updated to v18.0.0-rc.3

### Fixes

- l10n: replace triple dots with ellipsis [#450](https://github.com/nextcloud/talk-desktop/pull/450)

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
