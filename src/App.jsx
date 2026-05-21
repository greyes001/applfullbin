import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Html5QrcodeScanner } from "html5-qrcode";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyM7LEvsI05_EFvEUaf8WYMNMXPE4K9HWsTSyOWxma0141zgrLW1ikT6LogzFld3Rp7oQ/exec";

const BLOCK_ROWS = [
  ["Grove", "G1", "Jazz", 0.32],
  ["Grove", "G2", "Golden Delicious", 0.26],
  ["Grove", "G4", "Pink Lady", 0.51],
  ["Grove", "G4", "Rockit", 0.89],
  ["Grove", "G6", "Gala", 0.37],
  ["Grove", "G7", "Gala", 0.36],
  ["Grove", "G8", "Jazz", 0.42],
  ["Grove", "G9", "Granny Smith", 0.39],
  ["Grove", "G10", "Granny Smith", 0.89],
  ["Grove", "G12", "Gala", 0.45],
  ["Grove", "G14", "Rockit", 0.91],
  ["Grove", "G15", "Granny Smith", 2.2],
  ["Grove", "G18", "Rockit", 1.56],
  ["Grove", "G21", "Rockit", 1.54],
  ["Grove", "G27", "Rockit", 0.9],
  ["Grove", "G35", "Gala", 0.53],
  ["Grove", "G36", "Granny Smith", 0.52],
  ["Grove", "G37", "Pink Lady", 2.51],
  ["Grove", "H1", "Envy", 1.63],
  ["Grove", "H2", "Envy", 1.99],
  ["Grove", "H3", "Envy", 1.66],
  ["Grove", "H4", "Envy", 2.8],
  ["Grove", "H5", "Envy", 2.76],
  ["Grove", "H6", "Jazz", 1.13],
  ["Grove", "H6", "Granny Smith", 1.13],
  ["Grove", "H7", "Jazz", 1.63],
  ["Grove", "H7", "Granny Smith", 1.63],
  ["Grove", "H8", "Jazz", 1.3],
  ["Grove", "H8", "Granny Smith", 1.3],
  ["Grove", "H9", "Jazz", 1.42],
  ["Grove", "H9", "Granny Smith", 1.42],
  ["Grove", "H10", "Jazz", 1.45],
  ["Grove", "H10", "Granny Smith", 1.45],
  ["Grove", "H11", "Jazz", 1.79],
  ["Grove", "H11", "Granny Smith", 1.79],
  ["Grove", "H12", "Rockit", 1.79],
  ["Grove", "H13", "Rockit", 1.82],
  ["Grove", "H14", "Rockit", 0.6],

  ["Parsons", "P1", "Jazz", 1.39],
  ["Parsons", "P1", "Granny Smith", 1.39],
  ["Parsons", "P2", "Jazz", 1.47],
  ["Parsons", "P2", "Granny Smith", 1.47],
  ["Parsons", "P3", "Jazz", 1.47],
  ["Parsons", "P3", "Granny Smith", 1.47],
  ["Parsons", "P4", "Jazz", 1.47],
  ["Parsons", "P4", "Granny Smith", 1.47],
  ["Parsons", "P5", "Jazz", 1.39],
  ["Parsons", "P5", "Granny Smith", 1.39],
  ["Parsons", "P6", "Jazz", 2.28],
  ["Parsons", "P6", "Granny Smith", 2.28],
  ["Parsons", "P7", "Jazz", 1.97],
  ["Parsons", "P7", "Granny Smith", 1.97],
  ["Parsons", "P8", "Envy", 5.45],
  ["Parsons", "P9", "Pink Lady", 1.5],
  ["Parsons", "P10", "Gala", 4.62],

  ["Bailys", "B1", "Gala", 0.49],
  ["Bailys", "B3", "Jazz", 0.74],
  ["Bailys", "B4", "Jazz", 1.17],
  ["Bailys", "B8", "Jazz", 0.73],
  ["Bailys", "B9", "Gala", 0.12],
  ["Bailys", "B10", "Gala", 1.69],
  ["Bailys", "B12", "Jazz", 0.46],
  ["Bailys", "B13", "Gala", 0.32],
  ["Bailys", "B17", "Pink Lady", 2.22],
  ["Bailys", "B19", "Jazz", 0.47],
  ["Bailys", "B20", "Gala", 0.54],
  ["Bailys", "B21", "Gala", 0.71],
  ["Bailys", "B21", "Pink Lady", 0.77],
  ["Bailys", "B22", "Gala", 0.43],
  ["Bailys", "B23", "Gala", 0.82],
  ["Bailys", "B23", "Pink Lady", 0.76],
  ["Bailys", "B24", "Gala", 0.55],
  ["Bailys", "B25", "Jazz", 0.32],
  ["Bailys", "B26", "Jazz", 2.87],
  ["Bailys", "B29", "Gala", 1],
  ["Bailys", "B31", "Pink Lady", 2.71],
];

const ORCHARD_DATA = BLOCK_ROWS.reduce((acc, [orchard, block, variety, area]) => {
  if (!acc[orchard]) acc[orchard] = { blocks: {} };
  if (!acc[orchard].blocks[block]) acc[orchard].blocks[block] = [];
  acc[orchard].blocks[block].push({ variety, area });
  return acc;
}, {});

const C = {
  bg: "#f3f6fb",
  card: "#fff",
  border: "#dbe3ef",
  text: "#163459",
  muted: "#5f7391",
  green: "#0f9d73",
  greenSoft: "#e7f7f1",
  yellowSoft: "#fff5d7",
  yellow: "#8a6500",
  redSoft: "#ffe5e5",
  red: "#b00020",
};

const LIVE_SUMMARY_STORAGE_KEY = "hansen-apple-bin-tally-live-summary";
const LIVE_SUMMARY_DATE_KEY = "hansen-apple-bin-tally-live-summary-date";
const SCANNED_QR_STORAGE_KEY = "hansen-apple-bin-tally-scanned-qr-today";
const SCANNED_QR_DATE_KEY = "hansen-apple-bin-tally-scanned-qr-date";

function makeEntryId() {
  const n = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}${p(n.getMonth() + 1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`;
}

function getLocalDateKey() {
  const now = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

function formatDateForQR(date) {
  return String(date || "").replaceAll("-", "");
}

function parseQrValue(value) {
  const parts = String(value || "").trim().split("|");
  if (parts.length < 6 || parts[0] !== "HO") return null;

  return {
    grower: parts[0],
    orchard: parts[1],
    block: parts[2],
    variety: parts[3],
    dateKey: parts[4],
    binNumber: parts[5],
    qrValue: value,
  };
}

function StepBadge({ active, done, label, step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: active ? C.green : done ? C.greenSoft : "#fff",
          color: active ? "#fff" : done ? C.green : C.muted,
          border: `1px solid ${active ? C.green : C.border}`,
          fontWeight: 700,
        }}
      >
        {step}
      </div>
      <div>
        <div style={{ fontSize: 12, color: C.muted }}>Step {step}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{label}</div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{ background: "#f6f8fc", borderRadius: 22, padding: 22 }}>
      <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: "#0a2344" }}>{value}</div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  border: `1px solid ${C.border}`,
  padding: "0 12px",
  fontSize: 15,
  boxSizing: "border-box",
};

const secondaryButton = {
  background: "#fff",
  border: `1px solid ${C.border}`,
  color: C.text,
  borderRadius: 16,
  padding: "14px 22px",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButton = (enabled) => ({
  background: enabled ? C.green : "#c7d3e4",
  border: "none",
  color: "#fff",
  borderRadius: 16,
  padding: "14px 22px",
  fontSize: 16,
  fontWeight: 700,
  cursor: enabled ? "pointer" : "not-allowed",
});

export default function App() {
  const scannerRef = useRef(null);

  const [mode, setMode] = useState("tally");
  const [step, setStep] = useState(1);
  const [orchard, setOrchard] = useState("");
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [selectedVarieties, setSelectedVarieties] = useState([]);
  const [currentLines, setCurrentLines] = useState([]);
  const [savedEntries, setSavedEntries] = useState([]);
  const [userName, setUserName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [labelOrchard, setLabelOrchard] = useState("");
  const [labelBlock, setLabelBlock] = useState("");
  const [labelVariety, setLabelVariety] = useState("");
  const [labelTeam, setLabelTeam] = useState("");
  const [labelDate, setLabelDate] = useState(getLocalDateKey());
  const [labelQuantity, setLabelQuantity] = useState(10);
  const [labelStart, setLabelStart] = useState(1);
  const [labels, setLabels] = useState([]);

  const [scanStatus, setScanStatus] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [lastScan, setLastScan] = useState(null);
  const [scannedToday, setScannedToday] = useState([]);

  useEffect(() => {
    const todayKey = getLocalDateKey();
    const storedDate = localStorage.getItem(LIVE_SUMMARY_DATE_KEY);
    const storedEntries = localStorage.getItem(LIVE_SUMMARY_STORAGE_KEY);

    if (storedDate === todayKey && storedEntries) {
      try {
        setSavedEntries(JSON.parse(storedEntries));
      } catch {
        localStorage.removeItem(LIVE_SUMMARY_STORAGE_KEY);
      }
    } else {
      localStorage.setItem(LIVE_SUMMARY_DATE_KEY, todayKey);
      localStorage.removeItem(LIVE_SUMMARY_STORAGE_KEY);
    }

    const scanDate = localStorage.getItem(SCANNED_QR_DATE_KEY);
    const scanList = localStorage.getItem(SCANNED_QR_STORAGE_KEY);

    if (scanDate === todayKey && scanList) {
      try {
        setScannedToday(JSON.parse(scanList));
      } catch {
        localStorage.removeItem(SCANNED_QR_STORAGE_KEY);
      }
    } else {
      localStorage.setItem(SCANNED_QR_DATE_KEY, todayKey);
      localStorage.removeItem(SCANNED_QR_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LIVE_SUMMARY_DATE_KEY, getLocalDateKey());
    localStorage.setItem(LIVE_SUMMARY_STORAGE_KEY, JSON.stringify(savedEntries));
  }, [savedEntries]);

  useEffect(() => {
    localStorage.setItem(SCANNED_QR_DATE_KEY, getLocalDateKey());
    localStorage.setItem(SCANNED_QR_STORAGE_KEY, JSON.stringify(scannedToday));
  }, [scannedToday]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const orchardNames = Object.keys(ORCHARD_DATA);
  const orchardBlocks = orchard ? Object.keys(ORCHARD_DATA[orchard].blocks) : [];

  const availableVarieties = useMemo(() => {
    if (!orchard || selectedBlocks.length === 0) return [];
    const s = new Set();
    selectedBlocks.forEach((block) => {
      (ORCHARD_DATA[orchard].blocks[block] || []).forEach((item) => s.add(item.variety));
    });
    return Array.from(s).sort();
  }, [orchard, selectedBlocks]);

  const labelBlocks = labelOrchard ? Object.keys(ORCHARD_DATA[labelOrchard].blocks) : [];
  const labelVarieties =
    labelOrchard && labelBlock
      ? ORCHARD_DATA[labelOrchard].blocks[labelBlock].map((x) => x.variety)
      : [];

  const summary = useMemo(() => {
    const map = {};
    savedEntries.forEach((entry) => {
      const key = `${entry.orchard}|${entry.block}|${entry.variety}`;
      if (!map[key]) map[key] = { ...entry };
      else map[key].bins += Number(entry.bins);
    });
    return Object.values(map);
  }, [savedEntries]);

  const totalBins = summary.reduce((sum, x) => sum + Number(x.bins), 0);

  function chooseOrchard(name) {
    setOrchard(name);
    setSelectedBlocks([]);
    setSelectedVarieties([]);
    setCurrentLines([]);
    setStep(2);
    setMessage("");
  }

  function toggleBlock(block) {
    setSelectedBlocks((prev) =>
      prev.includes(block) ? prev.filter((x) => x !== block) : [...prev, block]
    );
  }

  function toggleVariety(v) {
    setSelectedVarieties((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function prepareLines() {
    const lines = [];
    selectedBlocks.forEach((block) => {
      const allowed = ORCHARD_DATA[orchard].blocks[block] || [];
      selectedVarieties
        .filter((v) => allowed.some((x) => x.variety === v))
        .forEach((v) => lines.push({ orchard, block, variety: v, bins: "" }));
    });
    setCurrentLines(lines);
    setStep(4);
  }

  function updateBins(index, value) {
    setCurrentLines((prev) =>
      prev.map((line, i) => (i === index ? { ...line, bins: value } : line))
    );
  }

  async function savePayloadToSheet(payload) {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Submission failed");
    return data;
  }

  async function saveTripEntries() {
    const valid = currentLines.filter((x) => Number(x.bins) > 0);
    if (valid.length === 0) return;

    const payload = {
      entryId: makeEntryId(),
      user: userName,
      notes,
      entries: valid.map((x) => ({
        orchard: x.orchard,
        block: x.block,
        variety: x.variety,
        bins: Number(x.bins),
      })),
    };

    setIsSubmitting(true);
    setMessage("");

    try {
      const data = await savePayloadToSheet(payload);

      setSavedEntries((prev) => [
        ...prev,
        ...valid.map((x) => ({ ...x, bins: Number(x.bins) })),
      ]);
      setSelectedBlocks([]);
      setSelectedVarieties([]);
      setCurrentLines([]);
      setNotes("");
      setMessage(`Submission complete. Saved ${data.rowsSaved} row${data.rowsSaved === 1 ? "" : "s"} to Google Sheets.`);
      setStep(1);
    } catch (err) {
      setMessage(`Could not save to Google Sheets: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function generateLabels() {
    if (!labelOrchard || !labelBlock || !labelVariety || !labelDate || Number(labelQuantity) < 1) return;

    const quantity = Number(labelQuantity);
    const start = Number(labelStart) || 1;
    const dateKey = formatDateForQR(labelDate);

    const made = await Promise.all(
      Array.from({ length: quantity }, async (_, i) => {
        const binNumber = String(start + i).padStart(4, "0");
        const qrValue = `HO|${labelOrchard.toUpperCase()}|${labelBlock.toUpperCase()}|${labelVariety.toUpperCase()}|${dateKey}|${binNumber}`;
        const qrImage = await QRCode.toDataURL(qrValue, {
          width: 360,
          margin: 1,
          errorCorrectionLevel: "M",
        });

        return {
          grower: "Hansen Orchards",
          orchard: labelOrchard,
          block: labelBlock,
          variety: labelVariety,
          date: labelDate,
          team: labelTeam,
          binNumber,
          qrValue,
          qrImage,
        };
      })
    );

    setLabels(made);
  }

  async function handleDecodedQr(decodedText) {
    const parsed = parseQrValue(decodedText);

    if (!parsed) {
      setScanStatus("invalid");
      setScanMessage("Invalid QR code");
      return;
    }

    if (scannedToday.includes(parsed.qrValue)) {
      setScanStatus("duplicate");
      setScanMessage("Already scanned — not counted again");
      setLastScan(parsed);
      return;
    }

    setScanStatus("saving");
    setScanMessage("Saving scan...");
    setLastScan(parsed);

    const payload = {
      entryId: makeEntryId(),
      user: "QR Scan",
      notes: `QR:${parsed.qrValue}`,
      entries: [
        {
          orchard: parsed.orchard,
          block: parsed.block,
          variety: parsed.variety,
          bins: 1,
          qrValue: parsed.qrValue,
          binNumber: parsed.binNumber,
          harvestDate: parsed.dateKey,
        },
      ],
    };

    try {
      await savePayloadToSheet(payload);

      setScannedToday((prev) => [...prev, parsed.qrValue]);
      setSavedEntries((prev) => [
        ...prev,
        {
          orchard: parsed.orchard,
          block: parsed.block,
          variety: parsed.variety,
          bins: 1,
        },
      ]);

      setScanStatus("success");
      setScanMessage("Bin scanned and saved");
    } catch (err) {
      setScanStatus("error");
      setScanMessage(`Could not save scan: ${err.message}`);
    }
  }

  function startScanner() {
    setScanStatus("");
    setScanMessage("");

    if (scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        handleDecodedQr(decodedText);
      },
      () => {}
    );

    scannerRef.current = scanner;
  }

  async function stopScanner() {
    if (scannerRef.current) {
      await scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
  }

  const canGo3 = selectedBlocks.length > 0;
  const canGo4 = selectedVarieties.length > 0;
  const canSave = currentLines.some((x) => Number(x.bins) > 0) && !isSubmitting;
  const canGenerateLabels =
    labelOrchard && labelBlock && labelVariety && labelDate && Number(labelQuantity) > 0;

  return (
    <div style={{ minHeight: "100%", background: C.bg, padding: 16 }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-labels, #print-labels * { visibility: visible; }
          #print-labels {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print { display: none !important; }
          .print-label {
            page-break-after: always;
            break-after: page;
          }
        }

        @page {
          size: 70mm 100mm;
          margin: 0;
        }
      `}</style>

      <div className="no-print" style={{ maxWidth: 1380, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
          <button onClick={() => setMode("tally")} style={mode === "tally" ? primaryButton(true) : secondaryButton}>
            Bin tally
          </button>
          <button onClick={() => setMode("labels")} style={mode === "labels" ? primaryButton(true) : secondaryButton}>
            Generate QR Labels
          </button>
          <button onClick={() => setMode("scan")} style={mode === "scan" ? primaryButton(true) : secondaryButton}>
            QR Bin Scan
          </button>
        </div>

        {mode === "tally" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div style={{ maxWidth: 860 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#08295b", marginBottom: 8 }}>
                  Hansen Orchards Apple Bin Tally
                </div>
                <div style={{ fontSize: 18, lineHeight: 1.5, color: C.text }}>
                  Manual backup option. Orchard is a single selection. Blocks and varieties can be multi-selected.
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
                <StepBadge active={step === 1} done={step > 1} label="Orchard" step={1} />
                <StepBadge active={step === 2} done={step > 2} label="Blocks" step={2} />
                <StepBadge active={step === 3} done={step > 3} label="Varieties" step={3} />
                <StepBadge active={step === 4} done={false} label="Bins per line" step={4} />
              </div>
            </div>

            {message ? (
              <div style={{ background: "#fff", border: `1px solid ${C.border}`, color: C.text, padding: 14, borderRadius: 16, marginBottom: 16 }}>
                {message}
              </div>
            ) : null}

            <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 28 }}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 28, padding: 30 }}>
                {step === 1 && (
                  <>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>1. Pick orchard</div>
                    <div style={{ display: "grid", gap: 16 }}>
                      {orchardNames.map((name) => (
                        <button key={name} onClick={() => chooseOrchard(name)} style={{ padding: "28px 18px", borderRadius: 22, border: `1px solid ${C.border}`, background: "#fff", textAlign: "left", cursor: "pointer" }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: "#102746", marginBottom: 10 }}>{name}</div>
                          <div style={{ fontSize: 16, color: C.muted }}>{Object.keys(ORCHARD_DATA[name].blocks).length} blocks</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>2. Pick one or more blocks</div>
                    <div style={{ fontSize: 18, color: C.muted, marginBottom: 24 }}>Selected orchard: <b>{orchard}</b></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                      {orchardBlocks.map((block) => {
                        const selected = selectedBlocks.includes(block);
                        return (
                          <button key={block} onClick={() => toggleBlock(block)} style={{ padding: "16px 14px", borderRadius: 18, cursor: "pointer", textAlign: "left", border: `1px solid ${selected ? C.green : C.border}`, background: selected ? C.greenSoft : "#fff", fontSize: 16, fontWeight: 700, color: C.text }}>
                            {block}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>3. Pick one or more varieties</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
                      {availableVarieties.map((v) => {
                        const selected = selectedVarieties.includes(v);
                        return (
                          <button key={v} onClick={() => toggleVariety(v)} style={{ padding: "16px 14px", borderRadius: 18, cursor: "pointer", textAlign: "left", border: `1px solid ${selected ? C.green : C.border}`, background: selected ? C.greenSoft : "#fff", fontSize: 16, fontWeight: 700, color: C.text }}>
                            {v}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>User</div>
                        <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Driver or supervisor name" style={inputStyle} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>Notes</div>
                        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes" style={inputStyle} />
                      </div>
                    </div>
                  </>
                )}

                {step === 4 && (
                  <>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>4. Enter bins for each block and variety</div>

                    <div style={{ display: "grid", gap: 12 }}>
                      {currentLines.map((line, i) => (
                        <div key={`${line.block}-${line.variety}-${i}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: 12, alignItems: "end", border: `1px solid ${C.border}`, borderRadius: 16, padding: 14 }}>
                          <div><b>{line.block}</b></div>
                          <div>{line.variety}</div>
                          <input value={line.bins} onChange={(e) => updateBins(i, e.target.value)} type="number" min="0" placeholder="0" style={inputStyle} />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                      <button onClick={saveTripEntries} disabled={!canSave} style={primaryButton(canSave)}>
                        {isSubmitting ? "Saving..." : "Save trip entries"}
                      </button>
                      <button onClick={() => { setCurrentLines([]); setSelectedBlocks([]); setSelectedVarieties([]); setStep(1); }} style={secondaryButton}>
                        Start new entry
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 28, padding: 30, alignSelf: "start" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#0b2345", marginBottom: 12 }}>Live summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  <MetricCard label="Saved lines" value={savedEntries.length} />
                  <MetricCard label="Total bins" value={totalBins} />
                </div>

                <div style={{ border: `1px solid ${C.border}`, borderRadius: 18, minHeight: 280, maxHeight: 500, overflowY: "auto", padding: 14 }}>
                  {summary.length === 0 ? (
                    <div style={{ fontSize: 16, color: C.muted }}>No entries yet.</div>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      {summary.map((entry, idx) => (
                        <div key={`${entry.block}-${entry.variety}-${idx}`} style={{ background: "#f8fbff", borderRadius: 14, padding: 14 }}>
                          <b>{entry.block}</b> — {entry.variety}
                          <div style={{ color: C.muted }}>{entry.orchard}</div>
                          <div style={{ fontWeight: 800, color: C.green }}>{entry.bins} bins</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <button disabled={step === 1 || isSubmitting} onClick={() => setStep((s) => Math.max(1, s - 1))} style={secondaryButton}>
                Back
              </button>
              <button disabled={isSubmitting || (step === 2 && !canGo3) || (step === 3 && !canGo4) || step === 4} onClick={() => {
                if (step === 2 && canGo3) setStep(3);
                else if (step === 3 && canGo4) prepareLines();
              }} style={primaryButton(!(isSubmitting || (step === 2 && !canGo3) || (step === 3 && !canGo4) || step === 4))}>
                Next
              </button>
            </div>
          </>
        )}

        {mode === "labels" && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 28, padding: 30 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#08295b", marginBottom: 8 }}>
              Generate QR Labels
            </div>
            <div style={{ fontSize: 18, color: C.muted, marginBottom: 24 }}>
              Creates sequential QR labels for Munbyn printing.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Orchard</div>
                <select value={labelOrchard} onChange={(e) => { setLabelOrchard(e.target.value); setLabelBlock(""); setLabelVariety(""); }} style={inputStyle}>
                  <option value="">Select orchard</option>
                  {orchardNames.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Block</div>
                <select value={labelBlock} onChange={(e) => { setLabelBlock(e.target.value); setLabelVariety(""); }} style={inputStyle}>
                  <option value="">Select block</option>
                  {labelBlocks.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Variety</div>
                <select value={labelVariety} onChange={(e) => setLabelVariety(e.target.value)} style={inputStyle}>
                  <option value="">Select variety</option>
                  {labelVarieties.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Date</div>
                <input type="date" value={labelDate} onChange={(e) => setLabelDate(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Team</div>
                <input value={labelTeam} onChange={(e) => setLabelTeam(e.target.value)} placeholder="Team name or number" style={inputStyle} />
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Number of labels</div>
                <input type="number" min="1" value={labelQuantity} onChange={(e) => setLabelQuantity(e.target.value)} style={inputStyle} />
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Starting bin number</div>
                <input type="number" min="1" value={labelStart} onChange={(e) => setLabelStart(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <button onClick={generateLabels} disabled={!canGenerateLabels} style={primaryButton(canGenerateLabels)}>
                Generate labels
              </button>
              <button onClick={() => window.print()} disabled={labels.length === 0} style={labels.length ? secondaryButton : { ...secondaryButton, opacity: 0.4 }}>
                Print labels
              </button>
            </div>

            {labels.length > 0 && (
              <div style={{ color: C.muted, marginBottom: 12 }}>
                Generated {labels.length} labels. Use Print labels, then set Munbyn print scale to 100%.
              </div>
            )}
          </div>
        )}

        {mode === "scan" && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 28, padding: 30 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#08295b", marginBottom: 8 }}>
              QR Bin Scan
            </div>
            <div style={{ fontSize: 18, color: C.muted, marginBottom: 24 }}>
              Scan a QR label. Each successful scan adds 1 bin to the connected Google Sheet.
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <button onClick={startScanner} style={primaryButton(true)}>Start scanner</button>
              <button onClick={stopScanner} style={secondaryButton}>Stop scanner</button>
            </div>

            <div id="reader" style={{ width: "100%", maxWidth: 520, marginBottom: 20 }} />

            {scanStatus && (
              <div
                style={{
                  marginTop: 18,
                  background:
                    scanStatus === "success" ? C.greenSoft :
                    scanStatus === "duplicate" ? C.yellowSoft :
                    scanStatus === "saving" ? "#eef4ff" : C.redSoft,
                  color:
                    scanStatus === "success" ? C.green :
                    scanStatus === "duplicate" ? C.yellow :
                    scanStatus === "saving" ? C.text : C.red,
                  padding: 20,
                  borderRadius: 18,
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                {scanStatus === "success" && "✅ "}
                {scanStatus === "duplicate" && "⚠️ "}
                {scanStatus === "invalid" && "❌ "}
                {scanStatus === "error" && "❌ "}
                {scanStatus === "saving" && "Saving... "}
                {scanMessage}
              </div>
            )}

            {lastScan && (
              <div style={{ marginTop: 18, border: `1px solid ${C.border}`, borderRadius: 18, padding: 18 }}>
                <div><b>Orchard:</b> {lastScan.orchard}</div>
                <div><b>Block:</b> {lastScan.block}</div>
                <div><b>Variety:</b> {lastScan.variety}</div>
                <div><b>Bin:</b> {lastScan.binNumber}</div>
                <div style={{ marginTop: 10, fontSize: 12, color: C.muted, wordBreak: "break-all" }}>{lastScan.qrValue}</div>
              </div>
            )}

            <div style={{ marginTop: 18, fontSize: 14, color: C.muted }}>
              Device duplicate protection today: {scannedToday.length} QR code{scannedToday.length === 1 ? "" : "s"} scanned.
            </div>
          </div>
        )}
      </div>

      <div id="print-labels" style={{ display: labels.length ? "block" : "none" }}>
        {labels.map((label) => (
          <div
            className="print-label"
            key={label.qrValue}
            style={{
              width: "70mm",
              height: "100mm",
              boxSizing: "border-box",
              padding: "6mm",
              background: "#fff",
              color: "#111",
              fontFamily: "Arial, sans-serif",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "3mm",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1 }}>HANSEN ORCHARDS</div>
            <img src={label.qrImage} alt="QR" style={{ width: "43mm", height: "43mm" }} />
            <div style={{ width: "100%", fontSize: 16, lineHeight: 1.8 }}>
              <div><b>Grower:</b> Hansen</div>
              <div><b>Variety:</b> {label.variety}</div>
              <div><b>Block:</b> {label.block}</div>
              <div><b>Date:</b> {label.date}</div>
              <div><b>Team:</b> {label.team || ""}</div>
              <div><b>Bin:</b> {label.binNumber}</div>
            </div>
            <div style={{ marginTop: "auto", fontSize: 8, wordBreak: "break-all", color: "#333", textAlign: "center" }}>
              {label.qrValue}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
