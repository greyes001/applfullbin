import React, { useMemo, useState } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyM7LEvsI05_EFvEUaf8WYMNMXPE4K9HWsTSyOWxma0141zgrLW1ikT6LogzFld3Rp7oQ/exec";

const ORCHARD_DATA = {
  Grove: {
    blocks: {
      G1: ["Jazz"],
      G2: ["Golden Delicious"],
      G4: ["Pink Lady", "Rockit"],
      G5: ["Rockit"],
      G6: ["Gala"],
      G7: ["Gala"],
      G8: ["Jazz"],
      G9: ["Granny Smith"],
      G10: ["Granny Smith"],
      G12: ["Gala"],
      G14: ["Rockit"],
      G15: ["Granny Smith"],
      G18: ["Rockit"],
      G21: ["Rockit"],
      G27: ["Rockit"],
      G35: ["Gala"],
      G36: ["Granny Smith"],
      G37: ["Pink Lady"],
      H1: ["Envy"],
      H2: ["Envy"],
      H3: ["Envy"],
      H4: ["Envy"],
      H5: ["Envy"],
      H6: ["Jazz", "Granny Smith"],
      H7: ["Jazz", "Granny Smith"],
      H8: ["Jazz", "Granny Smith"],
      H9: ["Jazz", "Granny Smith"],
      H10: ["Jazz", "Granny Smith"],
      H11: ["Jazz", "Granny Smith"],
      H12: ["Rockit"],
      H13: ["Rockit"],
      H14: ["Rockit"],
    },
  },
  Parsons: {
    blocks: {
      P1: ["Jazz", "Granny Smith"],
      P2: ["Jazz", "Granny Smith"],
      P3: ["Jazz", "Granny Smith"],
      P4: ["Jazz", "Granny Smith"],
      P5: ["Jazz", "Granny Smith"],
      P6: ["Jazz", "Granny Smith"],
      P7: ["Jazz", "Granny Smith"],
      P8: ["Envy"],
      P9: ["Pink Lady"],
      P10: ["Gala"],
    },
  },
  Bailys: {
    blocks: {
      B1: ["Gala"],
      B3: ["Jazz"],
      B4: ["Jazz"],
      B8: ["Jazz"],
      B9: ["Gala"],
      B10: ["Gala"],
      B12: ["Jazz"],
      B13: ["Gala"],
      B17: ["Pink Lady"],
      B19: ["Pink Lady"],
      B20: ["Gala"],
      B21: ["Gala", "Pink Lady"],
      B22: ["Gala"],
      B23: ["Gala", "Pink Lady"],
      B24: ["Gala"],
      B25: ["Jazz"],
      B26: ["Jazz"],
      B29: ["Gala"],
      B31: ["Pink Lady"],
    },
  },
};

const C = {
  bg: "#f3f6fb",
  card: "#fff",
  border: "#dbe3ef",
  text: "#163459",
  muted: "#5f7391",
  green: "#0f9d73",
  greenSoft: "#e7f7f1",
};

function makeEntryId() {
  const n = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${n.getFullYear()}${p(n.getMonth() + 1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}${p(n.getSeconds())}`;
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

function InfoBox({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.muted,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{value || "-"}</div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{ background: "#f6f8fc", borderRadius: 22, padding: 22 }}>
      <div style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
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

  const orchardNames = Object.keys(ORCHARD_DATA);
  const orchardBlocks = orchard ? Object.keys(ORCHARD_DATA[orchard].blocks) : [];

  const availableVarieties = useMemo(() => {
    if (!orchard || selectedBlocks.length === 0) return [];
    const s = new Set();
    selectedBlocks.forEach((block) => {
      (ORCHARD_DATA[orchard].blocks[block] || []).forEach((v) => s.add(v));
    });
    return Array.from(s).sort();
  }, [orchard, selectedBlocks]);

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
        .filter((v) => allowed.includes(v))
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
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Submission failed");

      setSavedEntries((prev) => [
        ...prev,
        ...valid.map((x) => ({ ...x, bins: Number(x.bins) })),
      ]);
      setSelectedBlocks([]);
      setSelectedVarieties([]);
      setCurrentLines([]);
      setNotes("");
      setMessage(
        `Saved ${data.rowsSaved} row${data.rowsSaved === 1 ? "" : "s"} to Google Sheets.`
      );
      setStep(1);
    } catch (err) {
      setMessage(`Could not save to Google Sheets: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canGo3 = selectedBlocks.length > 0;
  const canGo4 = selectedVarieties.length > 0;
  const canSave = currentLines.some((x) => Number(x.bins) > 0) && !isSubmitting;

  return (
    <div style={{ minHeight: "100%", background: C.bg, padding: 16 }}>
      <div style={{ maxWidth: 1380, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18,
          }}
        >
          <div style={{ maxWidth: 860 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#08295b", marginBottom: 8 }}>
              Hansen Orchards Apple Bin Tally
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.5, color: C.text }}>
              Mobile-friendly app for iPhone and Android. Orchard is a single selection. Blocks and
              varieties can be multi-selected. Each block-variety line gets its own separate bin
              count.
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
          <div
            style={{
              background: "#fff",
              border: `1px solid ${C.border}`,
              color: C.text,
              padding: 14,
              borderRadius: 16,
              marginBottom: 16,
            }}
          >
            {message}
          </div>
        ) : null}

        <div style={{ display: "grid", gridTemplateColumns: "2.1fr 1fr", gap: 28 }}>
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 28,
              padding: 30,
              boxShadow: "0 1px 2px rgba(0,0,0,.03)",
            }}
          >
            {step === 1 && (
              <>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>
                  1. Pick orchard
                </div>
                <div style={{ fontSize: 18, color: C.muted, marginBottom: 28 }}>
                  Choose one orchard for this entry. Mixed orchards should be entered separately.
                </div>
                <div style={{ display: "grid", gap: 16 }}>
                  {orchardNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => chooseOrchard(name)}
                      style={{
                        padding: "28px 18px",
                        borderRadius: 22,
                        border: `1px solid ${C.border}`,
                        background: "#fff",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: "#102746",
                          marginBottom: 10,
                        }}
                      >
                        {name}
                      </div>
                      <div style={{ fontSize: 16, color: C.muted }}>
                        {Object.keys(ORCHARD_DATA[name].blocks).length} blocks
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>
                  2. Pick one or more blocks
                </div>
                <div style={{ fontSize: 18, color: C.muted, marginBottom: 24 }}>
                  Selected orchard: <b>{orchard}</b>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  {orchardBlocks.map((block) => {
                    const selected = selectedBlocks.includes(block);
                    return (
                      <button
                        key={block}
                        onClick={() => toggleBlock(block)}
                        style={{
                          padding: "16px 14px",
                          borderRadius: 18,
                          cursor: "pointer",
                          textAlign: "left",
                          border: `1px solid ${selected ? C.green : C.border}`,
                          background: selected ? C.greenSoft : "#fff",
                          fontSize: 16,
                          fontWeight: 700,
                          color: C.text,
                        }}
                      >
                        {block}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>
                  3. Pick one or more varieties
                </div>
                <div style={{ fontSize: 18, color: C.muted, marginBottom: 24 }}>
                  Only varieties that exist in the selected blocks are shown.
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                    marginBottom: 24,
                  }}
                >
                  {availableVarieties.map((v) => {
                    const selected = selectedVarieties.includes(v);
                    return (
                      <button
                        key={v}
                        onClick={() => toggleVariety(v)}
                        style={{
                          padding: "16px 14px",
                          borderRadius: 18,
                          cursor: "pointer",
                          textAlign: "left",
                          border: `1px solid ${selected ? C.green : C.border}`,
                          background: selected ? C.greenSoft : "#fff",
                          fontSize: 16,
                          fontWeight: 700,
                          color: C.text,
                        }}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div
                    style={{
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                      User
                    </div>
                    <input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Driver or supervisor name"
                      style={inputStyle}
                    />
                  </div>
                  <div
                    style={{
                      background: "#fff",
                      border: `1px solid ${C.border}`,
                      borderRadius: 18,
                      padding: 16,
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                      Notes
                    </div>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional notes"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#0b2345", marginBottom: 10 }}>
                  4. Enter bins for each block and variety
                </div>
                <div style={{ fontSize: 18, color: C.muted, marginBottom: 18 }}>
                  This keeps every block-variety result separate, so G1 Envy and G2 Envy are stored
                  as different lines.
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 12,
                    marginBottom: 18,
                  }}
                >
                  <InfoBox title="Orchard" value={orchard} />
                  <InfoBox title="Blocks" value={selectedBlocks.join(", ")} />
                  <InfoBox title="Varieties" value={selectedVarieties.join(", ")} />
                </div>

                <div
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 14 }}>
                    Bin entry lines
                  </div>
                  <div style={{ display: "grid", gap: 12 }}>
                    {currentLines.map((line, i) => (
                      <div
                        key={`${line.block}-${line.variety}-${i}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 160px",
                          gap: 12,
                          alignItems: "end",
                          border: `1px solid ${C.border}`,
                          borderRadius: 16,
                          padding: 14,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: C.muted,
                              marginBottom: 6,
                              textTransform: "uppercase",
                            }}
                          >
                            Block
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                            {line.block}
                          </div>
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: C.muted,
                              marginBottom: 6,
                              textTransform: "uppercase",
                            }}
                          >
                            Variety
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                            {line.variety}
                          </div>
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: C.muted,
                              marginBottom: 6,
                              textTransform: "uppercase",
                            }}
                          >
                            Bins
                          </div>
                          <input
                            value={line.bins}
                            onChange={(e) => updateBins(i, e.target.value)}
                            type="number"
                            min="0"
                            placeholder="0"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                  <button onClick={saveTripEntries} disabled={!canSave} style={primaryButton(canSave)}>
                    {isSubmitting ? "Saving..." : "Save trip entries"}
                  </button>
                  <button
                    onClick={() => {
                      setCurrentLines([]);
                      setSelectedBlocks([]);
                      setSelectedVarieties([]);
                      setStep(1);
                    }}
                    style={secondaryButton}
                  >
                    Start new entry
                  </button>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 28,
              padding: 30,
              boxShadow: "0 1px 2px rgba(0,0,0,.03)",
              alignSelf: "start",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0b2345", marginBottom: 12 }}>
              Live summary
            </div>
            <div style={{ fontSize: 18, color: C.muted, lineHeight: 1.5, marginBottom: 24 }}>
              Saved lines are grouped by exact orchard, block, and variety.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <MetricCard label="Saved lines" value={savedEntries.length} />
              <MetricCard label="Total bins" value={totalBins} />
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 14 }}>
                Saved totals by exact line
              </div>
              <div
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 18,
                  minHeight: 280,
                  maxHeight: 500,
                  overflowY: "auto",
                  padding: 14,
                }}
              >
                {summary.length === 0 ? (
                  <div style={{ fontSize: 16, color: C.muted }}>No entries yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {summary.map((entry, idx) => (
                      <div
                        key={`${entry.block}-${entry.variety}-${idx}`}
                        style={{ background: "#f8fbff", borderRadius: 14, padding: 14 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                              {entry.block}
                            </div>
                            <div style={{ fontSize: 15, color: C.muted }}>{entry.variety}</div>
                            <div style={{ fontSize: 12, color: "#93a2b7" }}>{entry.orchard}</div>
                          </div>
                          <div
                            style={{
                              background: C.greenSoft,
                              color: C.green,
                              borderRadius: 999,
                              padding: "8px 12px",
                              fontWeight: 800,
                            }}
                          >
                            {entry.bins} bins
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <button
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            style={{
              ...secondaryButton,
              opacity: step === 1 || isSubmitting ? 0.45 : 1,
              cursor: step === 1 || isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            Back
          </button>

          <button
            disabled={isSubmitting || (step === 2 && !canGo3) || (step === 3 && !canGo4) || step === 4}
            onClick={() => {
              if (step === 2 && canGo3) setStep(3);
              else if (step === 3 && canGo4) prepareLines();
            }}
            style={primaryButton(
              !(isSubmitting || (step === 2 && !canGo3) || (step === 3 && !canGo4) || step === 4)
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
