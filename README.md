# CartoonCussFilter 🎭

A BetterDiscord plugin that turns profanity into classic cartoon grawlix! Deterministic 1:1 character mapping, filters on send + message edits, preserves punctuation, and supports Smart/Whole/Partial matching with per-word overrides and an allowlist.

✅ Filters **only when you send** a message  
✅ Also filters when you **edit** a message  
✅ **Hybrid matching**: global mode + per-word overrides + allowlist  
✅ Preserves punctuation and spacing (only transforms matched segments)

---

## What it does

If you type a banned word, it will be replaced character-by-character with a predictable symbol mapping.

Example (Smart mode):
- Banned rule: `fuck^` (prefix-only)
- Text: `fucking`
- Output: `%&##ing` *(example; based on your char map + fallbacks)*

It also avoids false positives (like `assassin`) using an **allowlist**.

---

## Install (BetterDiscord)

1. Download the latest `.plugin.js` file from **Releases**.
2. In Discord, go to:
   - **User Settings → BetterDiscord → Plugins**
3. Click **Open Plugin Folder**
4. Drop the `.plugin.js` file into that folder
5. Enable it in the Plugins list ✅

> Tip: If you update the file, toggle the plugin off/on or click “Reload” in BetterDiscord.

---

## Configuration

Open:  
**User Settings → BetterDiscord → Plugins → CartoonCussFilter → Settings**

### Match mode

- **Smart (recommended)**  
  Default is **whole-word only**, but you can override per banned-word line using suffixes:
  - `word` = whole word only  
  - `word*` = partial anywhere in a word  
  - `word^` = prefix-only (start of a word)

- **Whole word only**  
  Censors only exact words (ignores `*` and `^` suffix overrides).

- **Partial everywhere**  
  Censors inside larger words everywhere (ignores `*` and `^` suffix overrides).

### Allowed words (allowlist)

Exact whole words (case-insensitive) that should **never** be censored.

Example:
```
assassin
classic
```

### Banned words

One per line. In **Smart** mode you can use suffix rules.

Example:
```
butt
butthole*
fork^
```

### Deterministic character map

One per line in the format:
```
a=@
s=$
t=+
```

Only the **first character** on the right side is used.

### Fallback symbols

If a character isn’t in your map, the plugin cycles through your fallback list.

Default:
```
%&$@!#*?
```

---

## How it works (high level)

- Hooks Discord’s internal message actions using BetterDiscord’s patching API
- Intercepts text **before send** and **before edit**
- Applies:
  1) allowlist protection  
  2) matching rules (smart/whole/partial + suffix overrides)  
  3) deterministic symbol mapping

---

## Safety / Notes

- This is **client-side only**. It changes what *your client sends*.
- It does **not** retroactively alter messages already posted unless you edit them.

---

## Contributing

PRs welcome. If you want to add features, open an issue describing:
- expected behavior
- example inputs/outputs

---

## License

Licensed under the Apache License, Version 2.0 (Apache-2.0).  
See the `LICENSE` file for details.

If you contribute to this project, you agree that your contributions will be licensed under Apache-2.0.
