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
   `https://www.instagram.com/your_activity/interactions/comments`

2. Open DevTools:
   - Mac: `Cmd + Option + J`
   - Windows: `Ctrl + Shift + J`

3. Copy the entire contents of `delete-insta-comments.js`

4. Paste the script into the **Console** tab

5. Press Enter

---

## Features

- Deletes comments in batches
- **Randomized batch size per cycle (between 5–9) for more human-like behavior**
- Adjustable timing to better handle UI loading and async behavior
- Basic error detection with automatic backoff
- Automatic in-DOM error handling (detects Instagram error popups and clicks **OK** to resume)
- Works with Instagram’s current desktop comments management flow

---

## Configuration Notes

This script includes configurable timing values, batch size range, pause intervals, and retry delays.

You may be able to make it faster by adjusting those values, but reliability can drop quickly if the timings are too aggressive for Instagram’s current UI state.

If you choose to tune it further:

- change one value at a time
- test on a small number of comments first
- expect different results if Instagram changes their interface

Use your own judgement and test carefully.

### For reference

These are the main levers that affect speed vs reliability:

- **batchSizeMin / batchSizeMax**
  - Default: `5–9` (randomized each batch)
  - Higher ranges increase speed but can increase UI instability
  - Lower ranges improve stability but reduce throughput

- **minShortDelay / maxShortDelay**
  - Controls delay between selecting individual comments
  - Can be slightly reduced, but too low may cause selection to not register

- **minMediumDelay / maxMediumDelay**
  - Controls delay between cycles (when not pausing)
  - Safe to reduce a little, but going too low can cause UI state issues

- **minLongPause / maxLongPause**
  - Controls periodic cooldown pauses
  - Reducing these increases speed but may trigger more frequent Instagram interruptions

- **pauseEveryMin / pauseEveryMax**
  - How often long pauses occur (based on total comments processed, not batches)
  - Lower values = more frequent pauses (safer)
  - Higher values = faster but more likely to hit rate limits

- **minErrorBackoff / maxErrorBackoff**
  - Delay after errors
  - Can be shortened, but too aggressive retries may cause repeated failures

---

### Practical tuning advice

- Change **one variable at a time**
- Test on small batches before running at scale
- If you see frequent:
  - "Selection did not register"
  - UI controls disappearing
  - repeated error popups  
    → your timings are too aggressive

- If the script runs smoothly but slower than desired  
  → gradually reduce:
  - long pauses first
  - then medium delays
  - adjust batch size range carefully

- If unsure, prioritise stability over speed — a slightly slower script that runs unattended is usually more effective

---

## Why This Exists

Instagram’s interface changes frequently, which breaks older automation scripts.  
This script is a fresh implementation designed to work with the current UI and be more resilient to changes.

---

## Acknowledgement

Inspired by an older gist by sbolel:  
`https://gist.github.com/sbolel/a2b2bfde16b3ab185fbc2e2049240abc`

This project is a rewritten implementation for Instagram’s updated interface.

---

## License

MIT
