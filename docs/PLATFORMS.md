# Platform specific considerations

## Windows vs macOS UI and UX

Resources:
- macOS HUI Guidelines: https://developer.apple.com/design/human-interface-guidelines/
- Design Windows apps overview: https://learn.microsoft.com/en-us/windows/apps/design/
- Linux:
  - Usually more "Windows-like", but very desktop environment dependent
  - GNOME: https://developer.gnome.org/hig/
  - KDE: https://develop.kde.org/hig/

### Detecting platform during development

- **JS main process:** `import { isMac } from '/src/shared/os.utils.ts'`
- **JS renderer process:** `window.systemInfo.isMac`
- **CSS:** `[data-platform=macos]` selector.

### Terminology

Windows | macOS
-- | --
Window controls/Title bar buttons | Traffic lights
Task bar | Dock
System tray | Menu bar extras/Status items
Exit/Close | Quit
Explorer | Finder

### Button order

Both Windows and macOS align modal buttons on end, but in different order:
- Windows: `[Primary] [Cancel]`
- macOS: `[Cancel] [Primary]`

### App behavior

- **Windows**: closing application window is closing an app
- **macOS**: closing application window is only about the window, quitting an application is a different action

### Modal windows

On macOS native modal windows have no title bar:
- It must have <kbd>Escape</kbd> shortcut for closing the modal
- It should have an explicit `Cancel` button (not Windows style `X`)

### Keyboard shortcuts



### Menu position

### Title bar

- **Windows:** title bar controls on the end
- **macOS:** title bar controls on the start

### System Tray

- **Windows:**
  - Used for apps keeping working with all windows closed (no task bar icon), like messengers
  - Often colored
- **maxOS:**
  - Used for apps in background processes (apps keep running when all windows closed by default)
  - Usually monochrome via a template image (macOS sets the color automatically)

### Misc.

- 

## Linux