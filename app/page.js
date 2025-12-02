"use client";
import React, { useEffect, useRef, useState } from "react";
import antlr4 from "antlr4";
import AmosToJavaScriptTranslator from "@/AmosToJavaScriptTranslator";
import AMOSParser from "@/AMOSParser";
import AMOSLexer from "@/AMOSLexer";
import { Sketch } from "@uiw/react-color";
import prettier from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import AMOSDecoder from "@/src/tools/AmosDecoder";
import AnalogClock from "@/src/tools/UI/analogClock";
import { WorkbenchIcon, WorkbenchShell, WorkbenchWindow } from "@/src/tools/UI/workbench";

const styleButton = {
  backgroundColor: "#00aaaa",
  minWidth: "300px",
  color: "white",
  fontWeight: "bold",
  padding: "10px 20px",
  border: "4px solid #006666",
  boxShadow: "4px 4px 0 #004444",
  textShadow: "1px 1px 0 #006666",
  letterSpacing: "1px",
  fontFamily: "monospace",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.1s ease-in-out",
};

class CollectingErrorListener extends antlr4.error.ErrorListener {
  constructor() {
    super();
    this.errors = [];
  }
  syntaxError(recognizer, offendingSymbol, line, column, msg /*, e*/) {
    this.errors.push({ line, column, msg });
  }
}
// Put this near the top of your file (outside App)
function CodeEditorWithErrors({
  value,
  onChange,
  errors = [], // [{ line: 1-based, column: 0-based, msg }]
  style,
  className,
  fontFamily = "'Amiga4Ever', monospace",
  fontSize = 12,
  lineHeight = 1.4,
  tabColumns = 4,
}) {
  const taRef = React.useRef(null);
  const innerRef = React.useRef(null);

  const [tip, setTip] = React.useState(null);
  const cursorPos = (e) => ({ x: e.clientX + 12, y: e.clientY + 12 });
  // ❶ Error lookup: line -> Map<col,msg>
  const byLine = React.useMemo(() => {
    const map = new Map();
    for (const e of errors || []) {
      const line = Number(e.line) | 0;
      const col = Number(e.column);
      if (!map.has(line)) map.set(line, new Map());
      if (Number.isFinite(col)) {
        if (!map.get(line).has(col))
          map.get(line).set(col, e.msg || "Syntax error");
      } else {
        map.get(line).set(-1, e.msg || "Syntax error"); // whole‑line
      }
    }
    return map;
  }, [errors]);

  // ❷ Expand tabs only for the overlay; textarea keeps real tabs
  const expandTabs = React.useCallback(
    (s) => {
      if (!s || !s.includes("\t")) return s ?? "";
      const tab = " ".repeat(tabColumns);
      return s.replace(/\t/g, tab);
    },
    [tabColumns]
  );

  // ❸ Compute absolute string index from (line, col) for caret placement
  const indexFromLineCol = React.useCallback(
    (src, lineOneBased, colZeroBased) => {
      const lines = src.split("\n");
      const li = Math.max(0, Math.min(lines.length - 1, lineOneBased - 1));
      let idx = 0;
      for (let i = 0; i < li; i++) idx += lines[i].length + 1; // +1 for \n
      return idx + Math.max(0, Math.min(colZeroBased, lines[li].length));
    },
    []
  );

  // ❹ Render overlay (no own scroll; we translate inside)
  const renderHighlights = React.useMemo(() => {
    const lines = expandTabs(value ?? "").split("\n");
    return lines.map((ln, i) => {
      const lineNo = i + 1;
      const colMap = byLine.get(lineNo);
      if (!colMap)
        return (
          <div key={i}>
            {ln || " "}
            {"\n"}
          </div>
        );

      const hasWholeLineError = colMap.has(-1);
      const parts = [];
      const maxCols = Math.max(ln.length + 1, 1); // include EOL

      for (let c = 0; c < maxCols; c++) {
        const ch = ln[c] ?? " ";
        const msg = colMap.get(c);

        if (msg) {
          // pass line/col to handler for caret setting
          parts.push(
            <span
              key={c}
              className="err-ch"
              title={msg}
              data-line={lineNo}
              data-col={c}
              onMouseEnter={(e) => setTip({ ...cursorPos(e), msg })}
              onMouseMove={(e) =>
                setTip((t) => (t ? { ...cursorPos(e), msg } : t))
              }
              onMouseLeave={() => setTip(null)}
              onMouseDown={(e) => {
                e.preventDefault();
                const ta = taRef.current;
                if (!ta) return;
                const line = Number(e.currentTarget.dataset.line);
                const col = Number(e.currentTarget.dataset.col);
                const pos = indexFromLineCol(value ?? "", line, col);
                ta.focus();
                ta.setSelectionRange(pos, pos);
              }}
            >
              {ch}
            </span>
          );
        } else {
          parts.push(<span key={c}>{ch}</span>);
        }
      }

      return (
        <div
          key={i}
          className={hasWholeLineError ? "err-line line-soft" : "err-line"}
        >
          {parts}
          {"\n"}
        </div>
      );
    });
  }, [value, byLine, expandTabs, indexFromLineCol]);

  // ❺ Translate overlay to match textarea scroll, with a small vertical fix
  React.useLayoutEffect(() => {
    const ta = taRef.current;
    const inner = innerRef.current;
    if (!ta || !inner) return;

    const Y_ADJUST = -5; // ← move overlay UP by 5px; tweak if you change font/lineHeight

    const sync = () => {
      inner.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop + Y_ADJUST}px)`;
    };
    sync();
    ta.addEventListener("scroll", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(ta);
    return () => {
      ta.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [value]);

  // Shared metrics—must be identical on both layers
  const metrics = {
    fontFamily,
    fontSize: `${fontSize}px`,
    lineHeight,
    letterSpacing: "0",
    tabSize: tabColumns,
  };

  const wrapStyle = { position: "relative", ...style };

  // Overlay wrapper: pointer-events:none so clicks fall through EXCEPT error spans
  const overlayWrapStyle = {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
    padding: 8,
    boxSizing: "border-box",
    zIndex: 2,
    ...metrics,
    color: "transparent",
    whiteSpace: "pre",
    pointerEvents: "none", // ← allow click-through by default
  };

  const overlayInnerStyle = {
    position: "absolute",
    left: 0,
    top: 0,
    willChange: "transform",
  };

  const textareaStyle = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    padding: 8,
    boxSizing: "border-box",
    background: "#222",
    color: "#0f0",
    border: "none",
    resize: "none",
    whiteSpace: "pre",
    overflow: "auto",
    outline: "none",
    zIndex: 1,
    ...metrics,
  };

  const tooltipStyle = tip && {
    position: "fixed", // ← fixed to the viewport, unaffected by scroll
    left: tip.x,
    top: tip.y,
    background: "#111",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: 6,
    padding: "8px 10px",
    maxWidth: 360,
    fontSize: 12,
    lineHeight: 1.3,
    zIndex: 9999,
    boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
    pointerEvents: "none",
  };

  return (
    <div className={className} style={wrapStyle}>
      {/* Overlay (no scroll; translated inner) */}
      <div
        style={overlayWrapStyle}
        onWheel={(e) => {
          const ta = taRef.current;
          if (!ta) return;
          e.preventDefault();
          ta.scrollTop += e.deltaY;
          ta.scrollLeft += e.deltaX;
          setTip(null); // hide while scrolling (optional)
        }}
      >
        <pre ref={innerRef} style={overlayInnerStyle} className="overlay-pre">
          {renderHighlights}
        </pre>
      </div>

      {/* Textarea */}
      <textarea
        ref={taRef}
        style={textareaStyle}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        spellCheck={false}
        placeholder="Enter AMOS BASIC code here"
      />

      {tip && <div style={tooltipStyle}>{tip.msg}</div>}

      <style>{`
        .overlay-pre {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .overlay-pre::-webkit-scrollbar { display: none; }

        /* Error cell: re-enable pointer events so we can show tooltip + set caret */
        .err-line .err-ch {
          display: inline-block;
          background: rgba(255, 0, 0, 0.45);
          color: transparent;
          border-radius: 2px;
          outline: 1px solid rgba(255,0,0,0.8);
          pointer-events: auto;   /* ← active over errors only */
          cursor: text;
        }
        .err-line.line-soft {
          background: rgba(255, 0, 0, 0.10);
        }
      `}</style>
    </div>
  );
}
function ExampleTabs({ tabs, onSelect }) {
  const [active, setActive] = useState(0);

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      Examples
      {/* --- Buttons for the active tab --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "10px",
        }}
      >
        {tabs[active].map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            style={styleButton}
            onMouseDown={(e) => {
              e.target.style.transform = "translate(4px, 4px)";
              e.target.style.boxShadow = "0 0 0 #004444";
            }}
            onMouseUp={(e) => {
              e.target.style.transform = "translate(0, 0)";
              e.target.style.boxShadow = "4px 4px 0 #004444";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translate(0, 0)";
              e.target.style.boxShadow = "4px 4px 0 #004444";
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translate(2px, 2px)";
              e.target.style.boxShadow = "2px 2px 0 #004444";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translate(0, 0)";
              e.target.style.boxShadow = "4px 4px 0 #004444";
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* --- Circle pagination --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        {tabs.map((_, i) => (
          <div
            key={i}
            onClick={() => setActive(i)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: i === active ? "#00aaaa" : "#888",
              cursor: "pointer",
              transition: "0.2s",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [showCode, setShowCode] = useState(false);

  const [jsCode, setJsCode] = useState("");
  const [parseErrors, setParseErrors] = useState([]);
  const [numBanks, setNumBanks] = useState(6);
  const [bankFiles, setBankFiles] = useState([]);
  const [option, setOption] = useState("file");
  const [AmosCode, setAmosCode] = useState("");
  const fileInputRef = useRef();
  const [createBank, setCreateBank] = useState(false);
  const [bankFileNames, setBankFileNames] = useState(
    Array(numBanks).fill(null)
  );
  const [decodedText, setDecodedText] = useState("");
  const [bankCreator, setBankCreator] = useState({
    sprites: [],
    palette: Array(32).fill("#000000"),
  });

  useEffect(() => {
    setAmosCode(decodedText);
  }, [decodedText]);
  useEffect(() => {
    // Load bank data from local storage if it exists
    const savedBankData = localStorage.getItem("bankCreator");
    if (savedBankData) {
      setBankCreator(JSON.parse(savedBankData));
    }
  }, []);

  const bankFilesRef = React.useRef(bankFiles);
  useEffect(() => { bankFilesRef.current = bankFiles; }, [bankFiles]);
  useEffect(() => {
    // Save bank data to local storage whenever it changes
    localStorage.setItem("bankCreator", JSON.stringify(bankCreator));
  }, [bankCreator]);

  function loadBank(bank) {
    const findElementId = "Creator_bankStored" + bank;
    const inputElement = document.getElementById(findElementId);
    const file = inputElement?.files?.[0];

    console.log("Storing bank:", inputElement?.id);
    if (!file) {
      console.log("Bank failed to be loaded: No file was selected");
      return;
    }
    const reader = new FileReader();

    reader.onload = function (e) {
      const arrayBuffer = e.target.result; // The result is now an ArrayBuffer
      const buffer = new Uint8Array(arrayBuffer); // Convert to Uint8Array for easier byte manipulation
      console.log(buffer);
      let offset = 6; // Adjust the starting offset as per the file format
      const numberExpected = (buffer[4] << 8) | buffer[5]; // Check this is correct

      let objectsArray = [];

      for (let i = 0; i < numberExpected; i++) {
        const width = (buffer[offset] << 8) | buffer[offset + 1];
        const height = (buffer[offset + 2] << 8) | buffer[offset + 3];
        const depth = (buffer[offset + 4] << 8) | buffer[offset + 5];
        const hotspotX = (buffer[offset + 6] << 8) | buffer[offset + 7];
        const hotspotY = (buffer[offset + 8] << 8) | buffer[offset + 9];

        const planarGraphicData = [];
        const dataSize = width * 2 * height * depth; // Ensure this calculation is correct

        for (let j = 0; j < dataSize; j++) {
          planarGraphicData.push(buffer[offset + 10 + j]);
        }

        const objectBuilder = {
          width,
          height,
          depth,
          hotspotX,
          hotspotY,
          planarGraphicData,
        };

        objectsArray.push(objectBuilder);
        offset += 10 + dataSize;
      }

      // Initialize colorPalette to hold 32 colors (64 bytes in total)
      let colorPalette = [];

      // Loop through each pair of bytes in the color palette section (32 colors x 2 bytes)
      for (let k = offset; k < offset + 64; k += 2) {
        const byte1 = buffer[k];
        const byte2 = buffer[k + 1];

        const color1 = (byte1 << 8) | byte2;

        // Extract the red, green, and blue components (4 bits each)
        const red = (color1 >> 8) & 0xf;
        const green = (color1 >> 4) & 0xf;
        const blue = color1 & 0xf;

        // Convert 4-bit values (0-15) to 8-bit values (0-255) by multiplying by 17
        const red8 = (red * 17).toString(16).padStart(2, "0");
        const green8 = (green * 17).toString(16).padStart(2, "0");
        const blue8 = (blue * 17).toString(16).padStart(2, "0");

        // Format as HTML color code #RRGGBB
        const color = "#" + red8 + green8 + blue8;
        colorPalette.push(color.toUpperCase());
      }
      setBankCreator({
        ...bankCreator,
        sprites: objectsArray,
        palette: colorPalette,
      });
      console.log("Bank loaded successfully:", objectsArray, colorPalette);
    };

    reader.readAsArrayBuffer(file); // Use readAsArrayBuffer for binary data
  }
  function downloadASCFile(filename, text) {
    const blob = new Blob([text], { type: "text/plain" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".asc") ? filename : filename + ".asc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
  const clearBank = () => {
    localStorage.removeItem("bankCreator");
    setBankCreator({ sprites: [], palette: Array(32).fill("#000000") });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const amosBasicCode = event.target.result;
      setAmosCode(amosBasicCode);
      parseAmosCode(amosBasicCode);
    };

    reader.readAsText(file);
  };

  const parseAmosCode = async (amosBasicCode) => {
    const chars = new antlr4.InputStream(amosBasicCode);
    const lexer = new AMOSLexer(chars);

    const lexErr = new CollectingErrorListener();
    lexer.removeErrorListeners();
    lexer.addErrorListener(lexErr);

    const tokens = new antlr4.CommonTokenStream(lexer);
    const parser = new AMOSParser(tokens);

    const parseErr = new CollectingErrorListener();
    parser.removeErrorListeners();
    parser.addErrorListener(parseErr);

    const tree = parser.program();

    // Save errors for UI highlighting (1-based line numbers)
    setParseErrors([...lexErr.errors, ...parseErr.errors]);

    // … your translation, formatting and setJsCode as before …
    const translator = new AmosToJavaScriptTranslator();
    const walker = new antlr4.tree.ParseTreeWalker();
    walker.walk(translator, tree);

    const translatedJsCode = translator.getJavaScript();
    try {
      const formatted = await prettier.format(translatedJsCode, {
        parser: "babel",
        plugins: [babelPlugin, estreePlugin],
      });
      setJsCode(formatted);
      console.log(formatted);
    } catch {
      setJsCode(translatedJsCode);
    }
  };
  const handleFileChange = (index, file) => {
    console.log(file);
    const newBankFiles = [...bankFiles];
    newBankFiles[index] = file;
    setBankFiles(newBankFiles);
  };
  const [runNonce, setRunNonce] = useState(0);
  const onRunClick = () => {
    // If you re-parse AMOS here, keep it; otherwise just bump the nonce
    setRunNonce((n) => n + 1);
  };
  useEffect(() => {
    if (!jsCode) return;

    const host = document.getElementById("game-container");
    if (!host) {
      console.error('AMOS runner: host "#game-container" not found.');
      return;
    }
    console.log("[parent] AMOS runner: host found, injecting iframe…");
    host.replaceChildren();

    const token = Math.random().toString(36).slice(2);

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.style.border = "0";
    iframe.style.display = "block";
    iframe.style.width = "640px"; // initial; iframe will resize itself
    iframe.style.height = "480px";
    host.style.display = "inline-block";

    // ---- PLAIN JS selector; find the bank file inputs in the PARENT ----
    const forwardBanks = async () => {
      // 1) existing: from real <input type="file">
      const inputs = Array.from(
        document.querySelectorAll(
          'input[type="file"][id^="bankStored"], input[type="file"][id^="Creator_bankStored"]'
        )
      );

      for (const input of inputs) {
        const file = input.files && input.files[0];
        if (!file) continue;
        const buffer = await file.arrayBuffer();
        const m = input.id.match(/(\d+)$/);
        const bankId = m ? m[1] : "";
        iframe.contentWindow?.postMessage(
          {
            type: "amos-bank",
            token,
            bankId,
            name: file.name,
            mime: file.type || "application/octet-stream",
            buffer,
          },
          "*",
          [buffer]
        );
      }

      // 2) NEW: also forward from React state (programmatically loaded files)
      const files = bankFilesRef.current || [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!f) continue;
        const buffer = await f.arrayBuffer();
        iframe.contentWindow?.postMessage(
          {
            type: "amos-bank",
            token,
            bankId: String(i + 1),      // banks are 1-based in your IDs
            name: f.name,
            mime: f.type || "application/octet-stream",
            buffer,
          },
          "*",
          [buffer]
        );
      }
    };


    const onMessage = (e) => {
      const data = e.data || {};
      if (data.token !== token) return;

      if (data.type === "amos-size") {
        iframe.style.width = `${Math.max(1, Math.round(data.width))}px`;
        iframe.style.height = `${Math.max(1, Math.round(data.height))}px`;
      }

      if (data.type === "amos-ready") {
        Promise.resolve()
          .then(forwardBanks) // run on next tick to be safe
          .then(() => {
            console.log("[parent] banks forwarded, telling iframe we're done");
            iframe.contentWindow &&
              iframe.contentWindow.postMessage(
                { type: "amos-banks-done", token },
                "*"
              );
          });
      }
    };
    window.addEventListener("message", onMessage);

    const FONT_CSS = `
@font-face { font-family: 'Amiga4Ever';
  src: url('/fonts/amiga/amiga4ever.ttf') format('truetype'); font-display: swap; }
@font-face { font-family: 'Amiga4EverPro';
  src: url('/fonts/amiga/amiga4ever-pro.ttf') format('truetype'); font-display: swap; }
html, body, #game-container, #amos-screen, * { font-family: 'Amiga4Ever', sans-serif; }
`;

    iframe.srcdoc = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      ${FONT_CSS}
      html, body { margin:0; padding:0; height:100%; overflow:hidden; box-sizing:border-box; }
      *, *::before, *::after { box-sizing: inherit; }
      #game-container { position:relative; display:inline-block; }
      #amos-screen { box-sizing: content-box; }
      body { font: 14px/1.4 system-ui, sans-serif; }
    </style>
  </head>
  <body>
    <div id="game-container"></div>
    <script>
      const TOKEN = ${JSON.stringify(token)};
      const EXTRA = 30;

      // Tell parent we're ready to receive banks
      window.parent && window.parent.postMessage({ type: "amos-ready", token: TOKEN }, "*");

      // Pipe console to parent (optional)
      (function () {
        const send = (level, args) => {
          try { parent.postMessage({ type: "amos-console", level, args, token: TOKEN }, "*"); } catch {}
        };
        ["log","warn","error","info"].forEach(level => {
          const orig = console[level];
          console[level] = function () { send(level, Array.from(arguments)); orig && orig.apply(console, arguments); };
        });
        window.onerror = function (msg, src, line, col, err) {
          send("error", [msg, { src, line, col, stack: err && err.stack }]);
        };
      })();

      // --- BANK STORE + RESOLVER ---
      const BANKS_BY_ID   = new Map();   // "1" -> rec
      const BANKS_BY_NAME = new Map();   // exact lowercased name -> rec
      const BANKS_BY_NORM = new Map();   // normalized key -> rec

      const clean = (s) => String(s || "").trim().replace(/['"]/g, "");
      const norm  = (s) => {
        s = clean(s).toLowerCase();
        s = s.replace(/^amosbank[_-]?/, "");     // drop "AmosBank_" prefix
        s = s.replace(/\.(abk|bank)$/i, "");     // drop extension
        s = s.replace(/[\s._-]+/g, "");          // remove separators
        return s;
      };

      // IMPORTANT: define banksReady so we can await it later
      let resolveBanksReady;
      const banksReady = new Promise((res) => {
        resolveBanksReady = res;
        setTimeout(res, 500); // fallback if no banks are posted
      });

      window.__getBankFile = function (bankId, bankName) {
        const nameClean = clean(bankName);
        const nameKey   = nameClean.toLowerCase();
        const normKey   = norm(nameClean);

        let rec = null;
        if (bankId != null) rec = BANKS_BY_ID.get(String(bankId));
        if (!rec && nameKey) rec = BANKS_BY_NAME.get(nameKey);
        if (!rec && normKey) rec = BANKS_BY_NORM.get(normKey);

   
        if (!rec) return null;
        try {
          return new File([rec.buffer], rec.name || \`bank\${bankId||''}.abk\`, { type: rec.mime || "application/octet-stream" });
        } catch {
          const blob = new Blob([rec.buffer], { type: rec.mime || "application/octet-stream" });
          blob.name = rec.name || \`bank\${bankId||''}.abk\`;
          return blob; // FileReader works with Blob too
        }
      };

      // Receive banks from parent
      window.addEventListener("message", (e) => {
        const d = e.data || {};
        if (d.token !== TOKEN) return;

        if (d.type === "amos-bank") {
          const rec  = { name: d.name, mime: d.mime || "application/octet-stream", buffer: d.buffer };
          const nkey = norm(d.name);
          if (d.bankId) BANKS_BY_ID.set(String(d.bankId), rec);
          if (d.name)   BANKS_BY_NAME.set(clean(d.name).toLowerCase(), rec);
          if (nkey)     BANKS_BY_NORM.set(nkey, rec);
          console.log("[iframe] received bank", { bankId: d.bankId, name: d.name, norm: nkey, bytes: d.buffer && d.buffer.byteLength });
        }

        if (d.type === "amos-banks-done") {
          console.log("[iframe] banks done signal");
          if (typeof resolveBanksReady === "function") resolveBanksReady();
        }
      });

      // --- Size reporting (+30 px cushion) ---
      const postSize = () => {
        const screen = document.getElementById("amos-screen");
        if (!screen) return;
        const rect = screen.getBoundingClientRect();
        const w = Math.max(rect.width, screen.scrollWidth, screen.offsetWidth);
        const h = Math.max(rect.height, screen.scrollHeight, screen.offsetHeight);
        try {
          parent.postMessage({ type: "amos-size", token: TOKEN, width: Math.ceil(w) + EXTRA, height: Math.ceil(h) + EXTRA }, "*");
        } catch {}
      };
      const tryInitObservers = () => {
        const screen = document.getElementById("amos-screen");
        if (!screen) return false;
        postSize();
        const ro = new ResizeObserver(() => postSize());
        ro.observe(screen);
        const mo = new MutationObserver(() => postSize());
        mo.observe(screen, { childList: true, subtree: true, attributes: true, characterData: true });
        requestAnimationFrame(postSize);
        return true;
      };
      const moRoot = new MutationObserver(() => { if (tryInitObservers()) moRoot.disconnect(); });
      moRoot.observe(document, { childList: true, subtree: true });
      tryInitObservers();

      // Run generated code only after banks are in (or timeout)
      (async () => {
        try {
          await banksReady;
          ${jsCode}
        } catch (e) {
          console.error("Async error in dynamic JavaScript:", e);
        }
      })();
    <\/script>
  </body>
</html>`.trim();

    host.appendChild(iframe);

    // Re-forward banks if the user changes inputs later
    const changeHandler = () => forwardBanks();
    const bankInputs = Array.from(
      document.querySelectorAll(
        'input[type="file"][id^="bankStored"], input[type="file"][id^="Creator_bankStored"]'
      )
    );
    bankInputs.forEach((el) => el.addEventListener("change", changeHandler));

    return () => {
      window.removeEventListener("message", onMessage);
      bankInputs.forEach((el) =>
        el.removeEventListener("change", changeHandler)
      );
      try {
        iframe.remove();
      } catch { }
    };
  }, [jsCode, runNonce]);

  function generateAmosBankFile(bankCreator) {
    const { sprites, palette } = bankCreator;
    const identifier = "AmSp"; // 4-byte identifier for sprites

    // Create an array to hold the binary data
    let binaryData = [];

    // Add the 4-byte identifier
    for (let i = 0; i < identifier.length; i++) {
      binaryData.push(identifier.charCodeAt(i));
    }

    // Add the 2-byte number of sprites
    const spriteCount = sprites.length;
    binaryData.push((spriteCount >> 8) & 0xff); // High byte
    binaryData.push(spriteCount & 0xff); // Low byte
    // Add each sprite's data
    sprites.forEach((sprite) => {
      const { width, height, depth, hotspotX, hotspotY, planarGraphicData } =
        sprite;

      let object = [];
      // Width and height are each 2 bytes
      object.push((width >> 8) & 0xff);
      object.push(width & 0xff);
      object.push((height >> 8) & 0xff);
      object.push(height & 0xff);

      // Depth, hotspot X, and hotspot Y are each 2 bytes
      object.push((depth >> 8) & 0xff);
      object.push(depth & 0xff);
      object.push((hotspotX >> 8) & 0xff);
      object.push(hotspotX & 0xff);
      object.push((hotspotY >> 8) & 0xff);
      object.push(hotspotY & 0xff);
      if (Array.isArray(planarGraphicData)) {
        object.push(...planarGraphicData);
      } else {
        console.error("planarGraphicData is not an array", planarGraphicData);
      }

      binaryData.push(...object);
    });
    let newPalette = [...palette];
    function rgbTo16Bit(rgbColor) {
      // Extract the red, green, and blue components from the hex color
      const red = parseInt(rgbColor.slice(1, 3), 16) >> 4; // Red channel (top 4 bits)
      const green = parseInt(rgbColor.slice(3, 5), 16) >> 4; // Green channel (middle 4 bits)
      const blue = parseInt(rgbColor.slice(5, 7), 16) >> 4; // Blue channel (bottom 4 bits)

      // Combine red, green, and blue components into a 16-bit color value
      const color16Bit = (red << 8) | (green << 4) | blue;

      return color16Bit;
    }
    let binaryPalette = [];
    // Convert the palette into 16-bit color values and then add to binaryData
    newPalette.forEach((color) => {
      const rgb = rgbTo16Bit(color); // Convert to 16-bit color
      binaryData.push((rgb >> 8) & 0xff); // High byte
      binaryData.push(rgb & 0xff); // Low byte

      binaryPalette.push((rgb >> 8) & 0xff); // High byte
      binaryPalette.push(rgb & 0xff); // Low byte
    });

    console.log(binaryPalette);

    console.log(binaryData);
    const blob = new Blob([new Uint8Array(binaryData)], {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);

    // Create a download link
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "AmosBank_test4.abk";
    downloadLink.click();
  }

  // Helper function to convert pixels array to planar format

  // Helper function to convert a hex color to 4-bit RGB values

  function BankEditor({ bankCreator, setBankCreator }) {
    const renderSpritePixels = (
      planarGraphicData,
      width,
      height,
      depth,
      palette
    ) => {
      const pixels = [];
      const bytesPerRow = width / 8;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let colorIndex = 0;

          // Build colorIndex by combining bits across planes
          for (let plane = 0; plane < depth; plane++) {
            const byteIndex =
              y * bytesPerRow +
              plane * (height * bytesPerRow) +
              Math.floor(x / 8);
            const bitPos = 7 - (x % 8);
            const bit = (planarGraphicData[byteIndex] >> bitPos) & 1;

            colorIndex |= bit << plane;
          }

          const hexColor = palette[colorIndex];
          pixels.push(hexColor);
        }
      }
      return pixels;
    };

    const [palette, setPalette] = useState(
      bankCreator.palette || Array(32).fill("#000000")
    );
    const [sprites, setSprites] = useState(bankCreator.sprites || []);
    const [spriteSelected, setSpriteSelected] = useState(null);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [colorPickerPosition, setColorPickerPosition] = useState({
      top: 0,
      left: 0,
    });
    const [selectedColorIndex, setSelectedColorIndex] = useState(null);
    const [currentColorIndex, setCurrentColorIndex] = useState(0);
    const [spriteWidth, setSpriteWidth] = useState(0);
    const [spriteHeight, setSpriteHeight] = useState(0);

    useEffect(() => {
      const handleMouseUp = () => setIsMouseDown(false);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }, []);
    const handlePixelPaint = (index) => {
      if (spriteSelected !== null) {
        const selectedSprite = sprites[spriteSelected];
        const actualWidth = selectedSprite.width * 16;
        const bytesPerRow = Math.ceil(actualWidth / 8);

        const x = index % actualWidth;
        const y = Math.floor(index / actualWidth);

        for (let plane = 0; plane < selectedSprite.depth; plane++) {
          const bit = (currentColorIndex >> plane) & 1;
          const byteIndex =
            y * bytesPerRow +
            plane * (selectedSprite.height * bytesPerRow) +
            Math.floor(x / 8);
          const bitPos = 7 - (x % 8);

          if (bit) {
            selectedSprite.planarGraphicData[byteIndex] |= 1 << bitPos;
          } else {
            selectedSprite.planarGraphicData[byteIndex] &= ~(1 << bitPos);
          }
        }

        const updatedSprites = sprites.map((sprite, i) =>
          i === spriteSelected ? { ...selectedSprite } : sprite
        );
        setSprites(updatedSprites);
      }
    };

    const handleColorClick = (index, event) => {
      event.preventDefault();
      if (event.button === 2) {
        setSelectedColorIndex(index);
        setColorPickerPosition({ top: event.clientY, left: event.clientX });
        setShowColorPicker(true);
      } else if (event.button === 0) {
        console.log("Current color: ", index);
        setCurrentColorIndex(index);
      }
    };

    const handleColorChange = (color) => {
      const newPalette = [...palette];
      newPalette[selectedColorIndex] = color.hex;
      setPalette(newPalette);
    };

    const addNewSprite = () => {
      const newSprite = {
        width: 1,
        height: 16,
        depth: 4, // Default depth (4 color planes for 16 colors)
        hotspotX: 0,
        hotspotY: 0,
        planarGraphicData: [], // Initialize planarGraphicData with zeros for an 8x8 sprite
      };
      const updatedSprites = [...sprites, newSprite];
      setSprites(updatedSprites);
      setBankCreator({ ...bankCreator, sprites: updatedSprites });
    };

    const selectSprite = (index) => {
      setSpriteSelected(index);
    };

    const handlePixelClick = (index) => {
      if (spriteSelected !== null) {
        const selectedSprite = sprites[spriteSelected];
        const actualWidth = selectedSprite.width * 16; // Convert to actual pixel width
        const bytesPerRow = Math.ceil(actualWidth / 8);

        // Calculate x and y based on index
        const x = index % actualWidth;
        const y = Math.floor(index / actualWidth);

        // Update the planarGraphicData based on currentColorIndex
        for (let plane = 0; plane < selectedSprite.depth; plane++) {
          const bit = (currentColorIndex >> plane) & 1;
          const byteIndex =
            y * bytesPerRow +
            plane * (selectedSprite.height * bytesPerRow) +
            Math.floor(x / 8);
          const bitPos = 7 - (x % 8);

          if (bit) {
            selectedSprite.planarGraphicData[byteIndex] |= 1 << bitPos;
          } else {
            selectedSprite.planarGraphicData[byteIndex] &= ~(1 << bitPos);
          }
        }

        // Update the sprites array with the modified sprite
        const updatedSprites = sprites.map((sprite, i) =>
          i === spriteSelected ? { ...selectedSprite } : sprite
        );
        console.log(selectedSprite);
        setSprites(updatedSprites);
      }
    };

    const updateSpriteSize = (dimension, value) => {
      if (spriteSelected !== null) {
        const newSize = Number(value);
        const selectedSprite = sprites[spriteSelected];

        if (!isNaN(newSize) && newSize > 0) {
          const newSprite = {
            ...selectedSprite,
            [dimension]: newSize,
            planarGraphicData: Array(
              spriteHeight * spriteWidth * selectedSprite.depth * 2
            ).fill(0), // Reset planar data based on new size
          };

          if (dimension === "width") {
            newSprite.planarGraphicData = Array(
              newSize * spriteHeight * selectedSprite.depth * 2
            ).fill(0);
          } else {
            newSprite.planarGraphicData = Array(
              spriteWidth * newSize * selectedSprite.depth * 2
            ).fill(0);
          }

          console.log(newSprite);
          const updatedSprites = sprites.map((sprite, i) =>
            i === spriteSelected ? newSprite : sprite
          );
          setSprites(updatedSprites);
        }
      }
    };
    const duplicateSprite = () => {
      if (spriteSelected !== null) {
        const original = sprites[spriteSelected];

        // Deep copy of planarGraphicData
        const copiedPlanarData = [...original.planarGraphicData];

        const duplicatedSprite = {
          ...original,
          planarGraphicData: copiedPlanarData,
        };

        const updatedSprites = [...sprites, duplicatedSprite];
        setSprites(updatedSprites);
        setBankCreator({ ...bankCreator, sprites: updatedSprites });
      }
    };

    const handleSpriteClick = (index) => {
      setSpriteSelected(index);
      setSpriteHeight(sprites[index].height);
      setSpriteWidth(sprites[index].width);
    };

    // Save bank data to local storage
    const saveBankToLocalStorage = () => {
      const bankData = JSON.stringify(bankCreator);
      localStorage.setItem("bankCreator", bankData);
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "20%",
          border: "1px solid red",

        }}
      >
        <div>
          <button
            onClick={() => {
              console.log(bankCreator);
              generateAmosBankFile(bankCreator);
            }}
          >
            GENERATE BANK FILE
          </button>
          <div>
            Load bank:
            <input
              id={`Creator_bankStored1`}
              type="file"
              onChange={(e) => {
                setBankCreator({ ...bankCreator, sprites: [], palette: [] });
                if (e.target.files.length > 0) {
                  const file = e.target.files[0];
                  console.log("File selected for bank 1:", file.name);
                  loadBank(1);
                }
              }}
              multiple
            />
          </div>
          <button onClick={() => saveBankToLocalStorage()}>
            Save Bank to Local Storage
          </button>
          <h2>Palette</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(1, 1fr)",
              gap: "4px",
            }}
          >
            {palette.map((color, index) => (
              <div
                key={index}
                style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: color,
                  border: "1px solid black",
                  cursor: "pointer",
                }}
                onClick={(event) => handleColorClick(index, event)}
                onContextMenu={(event) => handleColorClick(index, event)}
              >
                {color}
              </div>
            ))}
          </div>
          {showColorPicker && (
            <div
              style={{
                position: "absolute",
                top: colorPickerPosition.top,
                left: colorPickerPosition.left,
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => {
                  setBankCreator({ ...bankCreator, palette: palette });
                  setShowColorPicker(false);
                }}
              >
                Close
              </button>
              <Sketch
                color={palette[selectedColorIndex]}
                onChange={handleColorChange}
                onClose={() => setShowColorPicker(false)}
              />
            </div>
          )}
        </div>

        <div>
          <h2>Pixel Editor</h2>
          <div>
            <label>Width:</label>
            <input
              type="number"
              value={
                spriteSelected !== null ? sprites[spriteSelected].width : ""
              }
              onChange={(e) => updateSpriteSize("width", e.target.value)}
            />
          </div>
          <div>
            <label>Height:</label>
            <input
              type="number"
              value={
                spriteSelected !== null ? sprites[spriteSelected].height : ""
              }
              onChange={(e) => updateSpriteSize("height", e.target.value)}
            />
          </div>
          <div>
            <button
              onClick={() => {
                console.log(sprites[spriteSelected]);
                setBankCreator({ ...bankCreator, sprites: sprites });
              }}
            >
              Save
            </button>
            <button
              onClick={() => {
                console.log(sprites[spriteSelected]);
                const spritesCopy = [...sprites];
                spritesCopy.splice(spriteSelected, 1);
                setBankCreator({ ...bankCreator, sprites: spritesCopy });
              }}
            >
              Delete
            </button>
          </div>
          {spriteSelected !== null && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${sprites[spriteSelected].width * 16
                  }, 20px)`,
                gap: "1px",
              }}
            >
              {renderSpritePixels(
                sprites[spriteSelected].planarGraphicData,
                sprites[spriteSelected].width * 16,
                sprites[spriteSelected].height,
                sprites[spriteSelected].depth,
                palette
              ).map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: color,
                    border: "1px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() => handlePixelClick(index)}
                  onMouseDown={() => {
                    setIsMouseDown(true);
                    handlePixelPaint(index);
                  }}
                  onMouseEnter={() => {
                    if (isMouseDown) handlePixelPaint(index);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2>Sprites</h2>
          <button onClick={duplicateSprite}>Duplicate Sprite selected</button>

          <button onClick={addNewSprite}>Add New Sprite</button>
          <button
            onClick={clearBank}
            style={{
              marginTop: "10px",
              backgroundColor: "#FF6961",
              color: "#FFF",
            }}
          >
            Clear Bank
          </button>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px",
                marginTop: "10px",
              }}
            >
              {sprites.map((sprite, index) => {
                const width = sprite.width * 16; // Convert width in words to pixels
                const pixels = renderSpritePixels(
                  sprite.planarGraphicData,
                  width,
                  sprite.height,
                  sprite.depth,
                  palette
                );

                return (
                  <div
                    key={index}
                    onClick={() => {
                      handleSpriteClick(index);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      console.log(sprites[index]);
                      const spritesCopy = [...sprites];
                      spritesCopy.splice(index, 1);
                      setBankCreator({ ...bankCreator, sprites: spritesCopy });
                      selectSprite(index);
                    }}
                    style={{
                      width: "40px",
                      height: "40px",
                      border:
                        spriteSelected === index
                          ? "2px solid blue"
                          : "1px solid black",
                      cursor: "pointer",
                      display: "grid",
                      gridTemplateColumns: `repeat(${width}, 1fr)`,
                    }}
                  >
                    {pixels.map((color, pixelIndex) => (
                      <div
                        key={pixelIndex}
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundColor:
                            color === palette[0] ? "transparent" : color,
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  useEffect(() => {
    if (!AmosCode) {
      setParseErrors([]);
      return;
    }

    const id = setTimeout(() => {
      parseAmosCode(AmosCode);
    }, 250); // debounce 250ms

    return () => clearTimeout(id);
  }, [AmosCode]);


  const [showRender, setShowRender] = useState(false);
  const [showSpriteEditor, setShowSpriteEditor] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showClock, setShowClock] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const styleButton = {
    backgroundColor: "#00aaaa",
    minWidth: "300px",
    color: "white",
    fontWeight: "bold",
    padding: "10px 20px",
    border: "4px solid #006666",
    boxShadow: "4px 4px 0 #004444",
    textShadow: "1px 1px 0 #006666",
    letterSpacing: "1px",
    fontFamily: "monospace",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.1s ease-in-out",
  };

  return (
    <WorkbenchShell>

      {/* Icons Row */}
      <div
        onClick={() => setSelectedIcon(null)}
        style={{
          position: "absolute",

          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "60px",
          margin: "20px"
        }}>
        <WorkbenchIcon id="crvja" label="CRVJA" icon="/icons/beer.png" onOpen={() => setShowCode(true)} selected={selectedIcon === "crvja"}
          setSelectedIcon={setSelectedIcon} />
        <WorkbenchIcon id="sprites" label="Sprites" icon="/icons/sprite.png" onOpen={() => setShowSpriteEditor(true)} selected={selectedIcon === "sprites"}
          setSelectedIcon={setSelectedIcon} />

        <WorkbenchIcon id="clock" label="Clock" icon="/icons/clock.png" onOpen={() => setShowClock(true)} selected={selectedIcon === "clock"}
          setSelectedIcon={setSelectedIcon} />
      </div>

      {/* Windows */}
      {showCode && (
        <WorkbenchWindow title="CRVJA" onClose={() => setShowCode(false)}>
          <div>

            <div
              style={{
                display: "flex",
                marginTop: "30px",

                padding: "5px",
              }}
            >
              <div
                style={{

                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    height: "20vh",

                  }}
                >
                  <div style={{ display: 'flex', flexDirection: "row", gap: "10px" }} >
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: "-2px",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",

                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={styleButton}
                          onMouseDown={(e) => {
                            e.target.style.transform = "translate(4px, 4px)";
                            e.target.style.boxShadow = "0 0 0 #004444";
                          }}
                          onMouseUp={(e) => {
                            e.target.style.transform = "translate(0, 0)";
                            e.target.style.boxShadow = "4px 4px 0 #004444";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "translate(0, 0)";
                            e.target.style.boxShadow = "4px 4px 0 #004444";
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "translate(2px, 2px)";
                            e.target.style.boxShadow = "2px 2px 0 #004444";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = "translate(0, 0)";
                            e.target.style.boxShadow = "4px 4px 0 #004444";
                          }}
                        >
                          Load .ASC File
                        </button>

                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          style={{ display: "none" }}
                          accept=".asc, .txt, .amo"
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignContent: "center",
                        }}
                      >
                        <AMOSDecoder onDecoded={(text) => setDecodedText(text)} />
                      </div>

                    </div>
                    <div style={{ display: 'flex', flexDirection: "column", gap: "10px" }} >
                      <button
                        onClick={async () => {
                          try {
                            await parseAmosCode(AmosCode); // updates jsCode
                            onRunClick(); // bumps runNonce -> useEffect runs -> iframe rebuilt
                          } catch (err) {
                            console.error("❌ Failed to run code:", err);
                          }
                        }}
                        style={styleButton}
                        onMouseDown={(e) => {
                          e.target.style.transform = "translate(4px, 4px)";
                          e.target.style.boxShadow = "0 0 0 #004444";
                        }}
                        onMouseUp={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "4px 4px 0 #004444";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "4px 4px 0 #004444";
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translate(2px, 2px)";
                          e.target.style.boxShadow = "2px 2px 0 #004444";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "4px 4px 0 #004444";
                        }}
                      >
                        Run code
                      </button>
                      <button

                        onClick={() => {
                          const filename = "my_amos_code.asc"; // or generate dynamic name
                          downloadASCFile(filename, AmosCode);
                        }}

                        style={styleButton}
                        onMouseDown={(e) => {
                          e.target.style.transform = "translate(4px, 4px)";
                          e.target.style.boxShadow = "0 0 0 #004444";
                        }}
                        onMouseUp={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "4px 4px 0 #004444";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "4px 4px 0 #004444";
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = "translate(2px, 2px)";
                          e.target.style.boxShadow = "2px 2px 0 #004444";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translate(0, 0)";
                          e.target.style.boxShadow = "4px 4px 0 #004444";
                        }}
                      >
                        Save .ASC Code
                      </button>
                    </div>
                  </div>

                  <div style={{ width: "100%", marginTop: "10px" }}>
                    <ExampleTabs
                      tabs={[
                        [

                          {
                            label: "Pacman",
                            onClick: async () => {
                              const resBank1 = await fetch("/AmosFiles/AmosBank_pacman.abk");
                              const blob = await resBank1.blob();
                              const file = new File([blob], "AmosBank_pacman.abk");
                              handleFileChange(0, file);

                              const text = await (await fetch("/AmosFiles/Pacman.txt")).text();
                              setAmosCode(text);
                              parseAmosCode(text);
                            },
                          },
                          {
                            label: "Piano",
                            onClick: async () => {
                              const text = await (await fetch("/AmosFiles/Amos1_piano_improved.asc")).text();
                              setAmosCode(text);
                              parseAmosCode(text);
                            },
                          },

                        ],
                        [
                          {
                            label: "Rotating Triangle",
                            onClick: async () => {
                              const text = await (await fetch("/AmosFiles/Amos2_Rotating_Triangle.txt")).text();
                              setAmosCode(text);
                              parseAmosCode(text);
                            },
                          },
                          {
                            label: "Empty",
                            onClick: () => {
                              setAmosCode("");
                              parseAmosCode("");
                            },
                          },
                        ],
                      ]}
                    />
                  </div>

                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    height: "fit-content",
                    border: "1px solid black",
                    justifyContent: "space-between",

                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      maxHeight: "80vh",
                      minHeight: "500px"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignContent: "center",
                        alignItems: "center",
                        gap: "20px"
                      }}
                    >
                      {" "}
                      <label htmlFor="amos-code">Code Area</label>


                    </div>

                    <CodeEditorWithErrors
                      value={AmosCode}
                      onChange={setAmosCode}
                      errors={parseErrors}
                      style={{ width: "44vw", height: "100%", margin: "10px" }}
                    />
                  </div>
                  <div>

                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: "200vh",
                      alignItems: "center",
                      minHeight: "100vh"

                    }}
                  >
                    <label htmlFor="amos-code">Render code area</label>
                    <div id="game-container"></div>
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    border: "1px solid black",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div>
                      {" "}
                      {bankFiles.map((file, index) => (
                        <li key={index}>
                          Bank {index + 1}:{" "}
                          {file ? file.name.split("_")[1] : <i>No file selected</i>}
                        </li>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      {Array.from({ length: numBanks }, (_, index) => (
                        <div style={{ marginBottom: "10px" }} key={index}>
                          <label>Bank {index + 1}: </label>
                          <input
                            id={`bankStored${index + 1}`}
                            type="file"
                            onChange={(e) => {
                              if (e.target.files.length > 0) {
                                const file = e.target.files[0];
                                console.log(
                                  `File selected for bank ${index + 1}:`,
                                  file.name
                                );
                                handleFileChange(index, file);
                              }
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </WorkbenchWindow>
      )}


      {showSpriteEditor && (
        <WorkbenchWindow title="Sprite Editor" onClose={() => setShowSpriteEditor(false)}>
          <BankEditor
            bankCreator={bankCreator}
            setBankCreator={setBankCreator}
          />
        </WorkbenchWindow>
      )}


      {showClock && (
        <WorkbenchWindow title="Clock" onClose={() => setShowClock(false)}>
          <AnalogClock />
        </WorkbenchWindow>
      )}
     


    </WorkbenchShell>
  );


}

export default App;
