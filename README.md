# Tabatus

Browser extension for quickly searching and switching tabs by keyboard. Available for Firefox and Chrome.

[![Firefox Add-on](https://img.shields.io/badge/Firefox-Get_the_Add--on-FF7139?logo=firefox-browser&logoColor=white&style=for-the-badge)](https://addons.mozilla.org/firefox/addon/tabatus)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Get_the_Extension-4285F4?logo=google-chrome&logoColor=white&style=for-the-badge)](https://chromewebstore.google.com/detail/tabatus/loombljijcmkinmckodheladpclpgmnn)

Use the browser action or the hotkey `Ctrl + .` to activate. Start typing to fuzzy-match tabs by title or URL, then press `Enter` (or click) to switch.

![Tabatus popup showing fuzzy tab search](https://raw.githubusercontent.com/jokokko/tabatus/master/misc/screenshot.png)

[Privacy Policy](PRIVACY.md)

## Options

- **Disable fuzzy matching** — falls back to simple substring search

## Build

```sh
npm install
./build.sh            # both browsers
./build.sh firefox    # Firefox only
./build.sh chrome     # Chrome only
```

Outputs to `dist/tabatus-firefox.zip` and `dist/tabatus-chrome.zip`.
