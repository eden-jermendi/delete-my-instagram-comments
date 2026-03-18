# Delete My Instagram Comments

A simple JavaScript script to bulk delete your own Instagram comments using the browser DevTools console.

Built to work with Instagram’s current desktop web UI.

---

## ⚠️ Disclaimer

- This script is intended for deleting **your own comments only**
- Instagram may change their UI at any time, which can break this script
- Use at your own risk

---

## How to Use

1. Go to:
   https://www.instagram.com/your_activity/interactions/comments

2. Open DevTools:
   - Mac: `Cmd + Option + J`
   - Windows: `Ctrl + Shift + J`

3. Copy entire contents of `delete-insta-comments.js`

4. Paste the script into the Console tab

5. Press Enter

---

## Configuration Notes

This script includes configurable timing values, batch size, pause intervals, and retry delays.

You may be able to make it faster by adjusting those values, but reliability can drop quickly if the timings are too aggressive for Instagram’s current UI state.

If you choose to tune it further:

- change one value at a time
- test on a small number of comments first
- expect different results if Instagram changes their interface

Use your own judgement and test carefully.

---

## Features

- Deletes comments in batches
- Human-like delays to reduce detection risk
- Handles UI loading and async behaviour
- Basic error detection with automatic backoff

---

## Why This Exists

Instagram’s interface changes frequently, which breaks older automation scripts.  
This script is a fresh implementation designed to work with the current UI and be more resilient to changes.

---

## Acknowledgement

Inspired by an older gist by sbolel:  
https://gist.github.com/sbolel/a2b2bfde16b3ab185fbc2e2049240abc

This project is a rewritten implementation for Instagram’s updated interface.

---

## License

MIT
