/**
 * @name CartoonCussFilter
 * @author promiscuousLibertine
 * @description Profanity -> deterministic cartoon grawlix which is intended for entertainment purposes. Filters on-send AND on message edit.
 * @version 0.1.1
 */

/*
 * Copyright 2026 promiscuousLibertine
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = class CartoonCussFilter {
  constructor() {
    this.pluginName = "CartoonCussFilter";

    this.defaults = {
      // Global mode:
      // - smart: default whole-word unless overridden by suffix syntax (* or ^)
      // - whole: whole-word only (ignores suffix overrides)
      // - partial: partial everywhere (ignores suffix overrides)
      matchMode: "smart",

      // Allowlist (one per line): exact words that should never be censored (case-insensitive)
      allowWords: "assassin\nassassins\nassassinate\nassassinated\nassassination\nclassic\nclassics\nclassical\nclassy\nclassification\nclassifications\nclassified\nclassify\nassign\nassigned\nassigning\nassignment\nassignments\nassessment\nassessments\nassess\nassessed\nassessing\nassemble\nassembled\nassembling\nassembly\nassist\nassisted\nassisting\nassistant\nassistants\nassistance\npassion\npassionate\ncompassion\ncompassionate",


      // Banned list (one per line).
      // Suffix syntax (only used in matchMode=smart):
      // - word     : whole-word only
      // - word*    : partial anywhere
      // - word^    : prefix-only (start of a word)
      bannedWords: "fuck^\nshit*\ntit\ntits\nbitch*\nass\nasshole*\nbastard*\ndamn\ngoddamn*\nhell\ncrap^\npiss^\ndick*\ncock*\ncunt\ntwat^\nwank^\njerk\nprick^\nslut*\nwhore*\nho\nmotherfucker*\nmf*\nfag\nfaggot*\ndyke\ntranny*\nshemale*\nretard*\nspaz*\ncripple*\nmongoloid*\nnigger*\nnigga*\nchink*\ngook\nkike\nwetback*\nbeaner*\nspic\nraghead*\nsandnigger*\ncoon",


      // Deterministic character map (one per line: a=@)
      // Your requested defaults:
      // a=@, e=3, i=!, o=0, s=$, t=+, f=%, k=#, u=&, l=), h=#, 0=%
      charMap: "a=@\ne=3\ni=!\no=0\ns=$\nt=+\nf=%\nk=#\nu=&\nl=)\nh=#\n0=%",

      // Fallback symbols (cycles)
      fallbackSymbols: "%&$@!#*?"
    };

    this.settings = this.loadSettings();
  }

  // -------------------------
  // BetterDiscord lifecycle
  // -------------------------
  start() {
    this.patchSendMessage();
    this.patchEditMessage();
    BdApi.UI.showToast("CartoonCussFilter enabled ðŸŽ­ (send + edit)", { type: "success" });
  }

  stop() {
    BdApi.Patcher.unpatchAll(this.pluginName);
    BdApi.UI.showToast("CartoonCussFilter disabled ðŸ§¹", { type: "info" });
  }

  // -------------------------
  // Settings persistence
  // -------------------------
  loadSettings() {
    try {
      const saved = BdApi.Data.load(this.pluginName, "settings");
      return Object.assign({}, this.defaults, saved || {});
    } catch (_) {
      return Object.assign({}, this.defaults);
    }
  }

  saveSettings(next) {
    this.settings = Object.assign({}, this.settings, next);
    try {
      BdApi.Data.save(this.pluginName, "settings", this.settings);
    } catch (_) {}
  }

  // -------------------------
  // Settings UI (manual React)
  // -------------------------
  getSettingsPanel() {
    const React = BdApi.React;

    const panelStyle = { padding: "16px", color: "var(--text-normal, #dcddde)" };
    const rowStyle = { marginBottom: "16px" };
    const labelStyle = { fontWeight: 600, marginBottom: "6px" };
    const noteStyle = { opacity: 0.8, fontSize: "12px", marginBottom: "8px", lineHeight: 1.35 };

    const fieldStyle = {
      width: "100%",
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid var(--background-modifier-accent, rgba(255,255,255,0.12))",
      background: "var(--input-background, rgba(0,0,0,0.25))",
      color: "var(--text-normal, #dcddde)",
      outline: "none",
      fontSize: "14px",
      boxSizing: "border-box"
    };

    const textareaStyle = Object.assign({}, fieldStyle, {
      minHeight: "130px",
      resize: "vertical",
      fontFamily:
        "var(--font-code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)"
    });

    const dividerStyle = {
      height: "1px",
      background: "var(--background-modifier-accent, rgba(255,255,255,0.08))",
      margin: "18px 0"
    };

    const SelectRow = ({ id, label, note, options }) =>
      React.createElement(
        "div",
        { style: rowStyle },
        React.createElement("div", { style: labelStyle }, label),
        note ? React.createElement("div", { style: noteStyle }, note) : null,
        React.createElement(
          "select",
          {
            style: fieldStyle,
            defaultValue: String(this.settings[id] ?? ""),
            onChange: (e) => this.saveSettings({ [id]: e.target.value })
          },
          options.map((opt) => React.createElement("option", { key: opt.value, value: opt.value }, opt.label))
        )
      );

    const TextInputRow = ({ id, label, note }) =>
      React.createElement(
        "div",
        { style: rowStyle },
        React.createElement("div", { style: labelStyle }, label),
        note ? React.createElement("div", { style: noteStyle }, note) : null,
        React.createElement("input", {
          type: "text",
          style: fieldStyle,
          defaultValue: String(this.settings[id] ?? ""),
          onChange: (e) => this.saveSettings({ [id]: e.target.value })
        })
      );

    const TextAreaRow = ({ id, label, note }) =>
      React.createElement(
        "div",
        { style: rowStyle },
        React.createElement("div", { style: labelStyle }, label),
        note ? React.createElement("div", { style: noteStyle }, note) : null,
        React.createElement("textarea", {
          style: textareaStyle,
          defaultValue: String(this.settings[id] ?? ""),
          onChange: (e) => this.saveSettings({ [id]: e.target.value })
        })
      );

    return React.createElement(
      "div",
      { style: panelStyle },
      React.createElement(
        "div",
        { style: { fontSize: "16px", fontWeight: 800, marginBottom: "10px" } },
        "CartoonCussFilter Settings"
      ),
      React.createElement(
        "div",
        { style: noteStyle },
        "Filters when you send OR edit a message. Hybrid matching: global mode + per-word overrides + allowlist. Allowlist always wins.\nPolicy notice: This plugin is for personal filtering/styling only. Do not use it to evade moderation or violate Discord's' rules. You are responsible for what you send."
      ),

      React.createElement(SelectRow, {
        id: "matchMode",
        label: "Match mode",
        note:
          "Smart = whole-word by default, with per-line suffix overrides (* or ^). Whole = whole-word only. Partial = partial everywhere.",
        options: [
          { value: "smart", label: "Smart (recommended)" },
          { value: "whole", label: "Whole word only" },
          { value: "partial", label: "Partial everywhere" }
        ]
      }),

      React.createElement("div", { style: dividerStyle }),

      React.createElement(TextAreaRow, {
        id: "allowWords",
        label: "Allowed words (one per line)",
        note: "Exact whole words that should never be censored (case-insensitive). Example: assassin, classic"
      }),

      React.createElement(TextAreaRow, {
        id: "bannedWords",
        label: "Banned words (one per line)",
        note:
          "In Smart mode you can use suffixes: 'word' (whole), 'word*' (partial anywhere), 'word^' (prefix-only). Example: fuck^, shit*, ass"
      }),

      React.createElement(TextAreaRow, {
        id: "charMap",
        label: "Deterministic character map (one per line: a=@)",
        note: "Keys must be single characters; value uses the first character. Example: s=$"
      }),

      React.createElement(TextInputRow, {
        id: "fallbackSymbols",
        label: "Fallback symbols",
        note: "Used when a character isnâ€™t in your map; cycles through these."
      }),

      React.createElement("div", { style: noteStyle }, "Changes are saved immediately as you type.")
    );
  }

  // -------------------------
  // Patching helpers
  // -------------------------
  getActionWithKey(fnName) {
    // Prefer getWithKey so patching survives mangled exports.
    try {
      const res = BdApi.Webpack.getWithKey((m) => m && typeof m[fnName] === "function", { searchExports: true });
      if (Array.isArray(res) && res.length >= 2) return { mod: res[0], key: res[1] };
    } catch (_) {}

    try {
      const mod = BdApi.Webpack.getModule((m) => m && typeof m[fnName] === "function");
      if (mod) return { mod, key: fnName };
    } catch (_) {}

    return null;
  }

  // -------------------------
  // Send + Edit censorship
  // -------------------------
  patchSendMessage() {
    const action = this.getActionWithKey("sendMessage");
    if (!action) {
      BdApi.UI.showToast("CartoonCussFilter: sendMessage not found ðŸ˜¬", { type: "error" });
      return;
    }

    BdApi.Patcher.before(this.pluginName, action.mod, action.key, (_this, args) => {
      // Typical: sendMessage(channelId, messageObj)
      const msg = args?.[1];
      if (!msg || typeof msg.content !== "string") return;

      const filtered = this.filterText(msg.content);
      if (filtered !== msg.content) msg.content = filtered;
    });
  }

  patchEditMessage() {
    const action = this.getActionWithKey("editMessage");
    if (!action) {
      BdApi.UI.showToast("CartoonCussFilter: editMessage not found (send still works) âš ï¸", { type: "warning" });
      return;
    }

    BdApi.Patcher.before(this.pluginName, action.mod, action.key, (_this, args) => {
      // Signatures vary. Common patterns:
      // - editMessage(channelId, messageId, contentString)
      // - editMessage(channelId, messageId, messageObj{content})
      const payload = args?.[2];

      if (typeof payload === "string") {
        const filtered = this.filterText(payload);
        if (filtered !== payload) args[2] = filtered;
        return;
      }

      if (payload && typeof payload === "object") {
        if (typeof payload.content === "string") {
          const filtered = this.filterText(payload.content);
          if (filtered !== payload.content) payload.content = filtered;
        } else if (payload.message && typeof payload.message.content === "string") {
          const filtered = this.filterText(payload.message.content);
          if (filtered !== payload.message.content) payload.message.content = filtered;
        }
      }
    });
  }

  // -------------------------
  // Filtering logic
  // -------------------------
  filterText(text) {
    const allowSet = this.parseAllowWordsSet();
    const map = this.parseCharMap();
    const fallback = (this.settings.fallbackSymbols || "%&$@!#*?").split("");
    const mode = (this.settings.matchMode || "smart").toLowerCase();

    const bannedLines = this.parseBannedLines();
    if (!bannedLines.length) return text;

    if (mode === "whole" || mode === "smart") {
      return this.replaceByWordTokens(text, (token) => {
        if (!token) return token;

        const lower = token.toLowerCase();
        if (allowSet.has(lower)) return token;

        if (mode === "whole") {
          const bannedWhole = bannedLines.map((b) => b.base);
          if (!this.matchesAnyExact(lower, bannedWhole)) return token;
          return this.mapToSymbols(token, map, fallback);
        }

        return this.applySmartRulesToToken(token, allowSet, bannedLines, map, fallback);
      });
    }

    // Partial everywhere (word-segments only), respecting allowlist for whole words
    const wordish = /[A-Za-z0-9]+/g;
    return text.replace(wordish, (w) => {
      const lower = w.toLowerCase();
      if (allowSet.has(lower)) return w;

      const bases = bannedLines
        .map((b) => b.base)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);
      if (!bases.length) return w;

      const pattern = new RegExp(`(${bases.map(this.escapeRegex).join("|")})`, "gi");
      return w.replace(pattern, (m) => this.mapToSymbols(m, map, fallback));
    });
  }

  // Replace only "word tokens" (letters/digits) while preserving punctuation/spaces as-is.
  replaceByWordTokens(text, fn) {
    const re = /[A-Za-z0-9]+/g;
    let out = "";
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      out += text.slice(last, m.index);
      out += fn(m[0]);
      last = m.index + m[0].length;
    }
    out += text.slice(last);
    return out;
  }

  // Smart per-line rule application inside a single token
  applySmartRulesToToken(token, allowSet, bannedLines, map, fallback) {
    const lowerToken = token.toLowerCase();
    if (allowSet.has(lowerToken)) return token;

    const wholeBases = [];
    const prefixBases = [];
    const partialBases = [];

    for (const b of bannedLines) {
      if (!b.base) continue;
      if (b.mode === "whole") wholeBases.push(b.base);
      else if (b.mode === "prefix") prefixBases.push(b.base);
      else if (b.mode === "partial") partialBases.push(b.base);
    }

    // Whole-token bans
    if (wholeBases.length && this.matchesAnyExact(lowerToken, wholeBases)) {
      return this.mapToSymbols(token, map, fallback);
    }

    let working = token;

    // Prefix-only bans
    if (prefixBases.length) {
      prefixBases.sort((a, b) => b.length - a.length);
      for (const base of prefixBases) {
        const re = new RegExp(`^(${this.escapeRegex(base)})`, "i");
        working = working.replace(re, (m) => this.mapToSymbols(m, map, fallback));
      }
    }

    // Partial-anywhere bans
    if (partialBases.length) {
      partialBases.sort((a, b) => b.length - a.length);
      const pattern = new RegExp(`(${partialBases.map(this.escapeRegex).join("|")})`, "gi");
      working = working.replace(pattern, (m) => this.mapToSymbols(m, map, fallback));
    }

    return working;
  }

  matchesAnyExact(lowerToken, bases) {
    for (const b of bases) {
      if (lowerToken === b) return true;
    }
    return false;
  }

  mapToSymbols(word, map, fallback) {
    let f = 0;
    let out = "";
    for (const ch of word) {
      const lower = ch.toLowerCase();
      if (map[lower]) out += map[lower];
      else {
        out += fallback[f % fallback.length];
        f++;
      }
    }
    return out;
  }

  // -------------------------
  // Parsing helpers
  // -------------------------
  parseAllowWordsSet() {
    const set = new Set();
    String(this.settings.allowWords || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((w) => set.add(w.toLowerCase()));
    return set;
  }

  parseBannedLines() {
    const mode = (this.settings.matchMode || "smart").toLowerCase();
    const lines = String(this.settings.bannedWords || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const out = [];
    for (const raw of lines) {
      let base = raw;
      let m = "whole";

      if (mode === "smart") {
        if (raw.endsWith("*")) {
          base = raw.slice(0, -1);
          m = "partial";
        } else if (raw.endsWith("^")) {
          base = raw.slice(0, -1);
          m = "prefix";
        } else {
          base = raw;
          m = "whole";
        }
      } else {
        base = raw.replace(/[*^]$/, "");
        m = mode === "partial" ? "partial" : "whole";
      }

      base = String(base).trim().toLowerCase();
      if (!base) continue;
      out.push({ raw, base, mode: m });
    }
    return out;
  }

  parseCharMap() {
    const lines = String(this.settings.charMap || "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const map = {};
    for (const line of lines) {
      const idx = line.indexOf("=");
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim().toLowerCase();
      const val = line.slice(idx + 1).trim();
      if (!key || !val) continue;
      if (key.length === 1) map[key] = val[0];
    }
    return map;
  }

  escapeRegex(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
};
