# ChromaVault 🎨

**ChromaVault** is an advanced browser extension that allows you to pick colors from any webpage, name them, and build a persistent color history.

## Features
*   **Pick Colors**: Use the native EyeDropper tool to grab any color on your screen.
*   **Custom Names**: Assign memorable names to your colors.
*   **Persistent History**: Your colors are saved automatically.
*   **Copy Formats**: Click to copy HEX or RGB values.
*   **Export**: Download your color palette as a JSON file.
*   **Dark Mode**: Automatically adapts to your system theme.

## Installation Instructions

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** (toggle in the top right corner).
3.  Click **Load unpacked**.
4.  Select the `d:\chromavault` folder.
5.  Pin the **ChromaVault** icon to your toolbar for easy access.

## Architecture
*   **Manifest V3**: Secure and modern extension framework.
*   **Storage API**: Uses `chrome.storage.local` to persist data.
*   **EyeDropper API**: leverage the browser's native picking capability.
*   **Vanilla JS/CSS**: Lightweight structure with no external dependencies.
