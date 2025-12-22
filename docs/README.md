# Development Documentation

## Cross-platform development

### Testing in Linux on Windows/macOS

#### 1. Install hypervisors (VM manager)

The best performance with "everything just works out of the box" is **VMWare**.

It is a proprietary software and download an installer requires creating an account:
- [VMware Workstation Pro](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) for Windows and Linux hosts
- [VMware Fusion Pro](https://www.vmware.com/products/desktop-hypervisor/workstation-and-fusion) for macOS host

Alternatively you can use open-source [Oracle VirtualBox](https://www.virtualbox.org).

#### 2. Create a VM

If you don't want to install and configure guest OS manually, you can find all popular Linux VM on [osboxes.org](https://www.osboxes.org). Just find a VM (both VMWare and VirtualBox are available), download and attach in the hypervisor.

You will have an installed and ready to use Linux VM with `osboxes.org` (or `osboxes`) user and `osboxes.org` password.

There is no single Linux VM that covers everything. It is recommended to have some VMS with different base distribution (Debian, Arch), display server (Wayland/X11), Desktop Environment (GNOME, KDE, etc.)

A good set could be:
1. [Ubuntu](https://ubuntu.com) - Debian-based, Wayland, GNOME with extensions (the most popular) [osboxes link](https://www.osboxes.org/ubuntu/)
2. [Manjaro](https://manjaro.org) - Arch-based, Wayland, KDE [osboxes link](https://www.osboxes.org/manjaro/)
3. [Fedora](https://fedoraproject.org) - Red Hat-based, Wayland, GNOME [osboxes link](https://www.osboxes.org/fedora/)
4. One of:
   - [Linux Mint](https://linuxmint.com) - Ubuntu-based, X11, Cinnamon (low requirements) [osboxes link](https://www.osboxes.org/linux-mint/)
   - [Xubuntu](https://xubuntu.org) - Ubuntu-based, X11, xfce (very low requirements) [osboxes link](https://www.osboxes.org/xubuntu/)
5. Optionally:
  - Older versions of Ubuntu, 24 or even 22
  - [openSUSE](https://www.opensuse.org) - SUSE-based, Wayland, KDE [osboxes link](https://www.osboxes.org/opensuse/)

```
![NOTE]

On Windows it is also possible to run the app inside **WSL (Windows Subsystem Linux)**. It works, but too far from a normal Linux desktop environment experience.
```

### Testing in Linux on Linux (different distros)

#### Option 1: Virtual Box + osboxes.org

Follow **Testing in Linux on Windows/macOS** instructions.

#### Option 2: `quickemu`

Follow instructions on [https://github.com/quickemu-project/quickemu](https://github.com/quickemu-project/quickemu).
After installation running a VM will look like:

```sh
quickget ubuntu 24.04
quickemu --vm ubuntu-24.04.conf
```

### Testing in Windows on Linux/macOS

#### Option 1: manual VMWare/VirtualBox creation

1. Install a hypervisor (VMWare or VirtualBox, see Linux instructions above)
2. Download an `.iso` from Microsoft Evaluation: https://www.microsoft.com/en-us/evalcenter/
3. Create a VM with the `.iso` and install Windows

#### Option 2: `quickemu` (Linux-only)

Follow **Testing in Linux on Linux / Option 2: `quickemu`** instructions.

```sh
quickget windows-11
quickemu --vm windows-11.conf
```

### Testing in macOS

Unfortunately, the best option is to find an actual Apple device at least on M1...

Alternatives:
- [quickemu](https://github.com/quickemu-project/quickemu) (Linux-only)
- [Docker-OSX](https://github.com/sickcodes/Docker-OSX)
