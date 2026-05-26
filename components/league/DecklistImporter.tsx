// components/league/DecklistImporter.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";

interface CardEntry {
  qty:        number;
  name:       string;
  valid:      boolean | null;
  suggestion?: string;
}

interface DecklistImporterProps {
  onConfirm: (text: string) => void;
  onCancel:  () => void;
}

type Step = "choose" | "ocr" | "input" | "validating" | "fix";

// ── Helpers ───────────────────────────────────────────────────────────────

function parseLines(text: string): CardEntry[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("//") && !l.startsWith("#"))
    .map((line) => {
      const match = line.match(/^(\d+)x?\s+(.+)$/);
      if (match) return { qty: parseInt(match[1]), name: match[2].trim(), valid: null };
      return { qty: 1, name: line.trim(), valid: null };
    });
}

function toText(cards: CardEntry[]): string {
  return cards.map((c) => `${c.qty} ${c.name}`).join("\n");
}

async function validateCard(name: string): Promise<{ valid: boolean; canonical?: string; suggestion?: string }> {
  try {
    const res = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`);
    if (res.ok) {
      const data = await res.json();
      return { valid: true, canonical: data.name };
    }
    const acRes = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(name)}`);
    if (acRes.ok) {
      const acData = await acRes.json();
      return { valid: false, suggestion: acData.data?.[0] };
    }
    return { valid: false };
  } catch {
    return { valid: false };
  }
}

async function ocrImage(dataUrl: string): Promise<string> {
  // Dynamically import Tesseract.js (client-side only)
  const Tesseract = (await import("tesseract.js")).default;

  const { data: { text } } = await Tesseract.recognize(dataUrl, "eng", {
    logger: () => {}, // silence progress logs
  });

  // Post-process: clean up common OCR artefacts in decklists
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    // Remove lines that are clearly not card entries (no letters or just symbols)
    .filter((l) => /[a-zA-Z]/.test(l))
    // Normalise quantity prefix: "4x" → "4 ", "4." → "4 "
    .map((l) => l.replace(/^(\d+)[x.:]\s*/, "$1 "))
    // Remove lines that look like section headers (all caps, no digits)
    .filter((l) => !/^[A-Z\s]+$/.test(l));

  return lines.join("\n");
}

// ── Sub-components ────────────────────────────────────────────────────────

function CardRow({
  card, idx, onUpdate, onRevalidate, onRemove,
}: {
  card: CardEntry;
  idx: number;
  onUpdate:     (patch: Partial<CardEntry>) => void;
  onRevalidate: () => void;
  onRemove:     () => void;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      card.valid === false
        ? "bg-red-950/30 border border-red-900"
        : "bg-neutral-50 dark:bg-neutral-800/50"
    }`}>
      <input
        type="number" min={1} max={99} value={card.qty}
        onChange={(e) => onUpdate({ qty: parseInt(e.target.value) || 1 })}
        className="w-10 text-center px-1 py-1 text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex-1 min-w-0">
        {card.valid === false ? (
          <div className="flex flex-col gap-0.5">
            <input
              type="text" value={card.name}
              onChange={(e) => onUpdate({ name: e.target.value, valid: null })}
              onBlur={onRevalidate}
              className="w-full px-2 py-1 text-xs rounded border border-red-700 bg-red-950/50 text-red-200 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            {card.suggestion && (
              <button
                type="button"
                onClick={() => { onUpdate({ name: card.suggestion!, valid: null }); setTimeout(onRevalidate, 50); }}
                className="text-left text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                Did you mean: <span className="underline">{card.suggestion}</span>?
              </button>
            )}
          </div>
        ) : (
          <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate block">{card.name}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {card.valid === null  && <svg className="animate-spin text-neutral-400" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" strokeLinecap="round"/></svg>}
        {card.valid === true  && <span className="text-emerald-500 text-xs">✓</span>}
        {card.valid === false && <span className="text-red-400 text-xs">✗</span>}
        <button type="button" onClick={onRemove} className="text-neutral-400 hover:text-red-400 transition-colors ml-1">
          <svg width={12} height={12} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <line x1={4} y1={4} x2={12} y2={12}/><line x1={12} y1={4} x2={4} y2={12}/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export function DecklistImporter({ onConfirm, onCancel }: DecklistImporterProps) {
  const [step, setStep]         = useState<Step>("choose");
  const [rawText, setRawText]   = useState("");
  const [cards, setCards]       = useState<CardEntry[]>([]);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied]     = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);
  const [isOcring, startOcr]    = useTransition();
  const [isValidating, startValidation] = useTransition();

  const invalidCards  = cards.filter((c) => c.valid === false);
  const hasErrors     = invalidCards.length > 0;
  const totalCards    = cards.reduce((sum, c) => sum + c.qty, 0);
  const isProcessing  = isOcring || isValidating;

  // ── OCR ────────────────────────────────────────────────────────────────

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      setStep("ocr");
      startOcr(async () => {
        try {
          const text = await ocrImage(dataUrl);
          setRawText(text);
          setStep("input");
        } catch (err) {
          setOcrError("OCR failed. Please try again or paste manually.");
          setStep("choose");
        }
      });
    };
    reader.readAsDataURL(file);
  }

  // ── Validate ───────────────────────────────────────────────────────────

  function handleValidate() {
    const parsed = parseLines(rawText);
    if (parsed.length === 0) return;
    setCards(parsed);
    setProgress(0);
    setStep("validating");

    startValidation(async () => {
      const results: CardEntry[] = [...parsed];
      for (let i = 0; i < parsed.length; i++) {
        const { valid, canonical, suggestion } = await validateCard(parsed[i].name);
        results[i] = {
          ...results[i],
          valid,
          name:       valid && canonical ? canonical : results[i].name,
          suggestion: valid ? undefined : suggestion,
        };
        setCards([...results]);
        setProgress(Math.round(((i + 1) / parsed.length) * 100));
        await new Promise((r) => setTimeout(r, 110)); // Scryfall rate limit
      }
      setStep("fix");
    });
  }

  function updateCard(idx: number, patch: Partial<CardEntry>) {
    setCards((prev) => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  }

  function revalidateCard(idx: number) {
    const card = cards[idx];
    updateCard(idx, { valid: null });
    validateCard(card.name).then(({ valid, canonical, suggestion }) => {
      updateCard(idx, { valid, name: valid && canonical ? canonical : card.name, suggestion: valid ? undefined : suggestion });
    });
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(toText(cards.filter((c) => c.valid !== false))).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Step: choose ───────────────────────────────────────────────────────

  if (step === "choose") {
    return (
      <div className="flex flex-col gap-4">
        {ocrError && (
          <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded-lg px-4 py-2">{ocrError}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Photo / file */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-blue-500 transition-colors">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx={12} cy={13} r={4}/>
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-blue-500 transition-colors">Scan photo</p>
              <p className="text-xs text-neutral-400 mt-0.5">Take or upload a photo of your deck</p>
            </div>
          </button>

          {/* Manual text */}
          <button
            type="button"
            onClick={() => setStep("input")}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
          >
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 group-hover:text-blue-500 transition-colors">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1={16} y1={13} x2={8} y2={13}/><line x1={16} y1={17} x2={8} y2={17}/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-blue-500 transition-colors">Paste text</p>
              <p className="text-xs text-neutral-400 mt-0.5">Type or paste a decklist manually</p>
            </div>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImagePick}
          className="hidden"
        />

        <button type="button" onClick={onCancel} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors text-center">
          Cancel
        </button>
      </div>
    );
  }

  // ── Step: ocr ─────────────────────────────────────────────────────────

  if (step === "ocr") {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        {preview && (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <img src={preview} alt="Deck photo" className="w-full h-full object-cover opacity-60" />
          </div>
        )}
        <svg className="animate-spin text-blue-500" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
        </svg>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Reading cards from image…</p>
      </div>
    );
  }

  // ── Step: input (text) ─────────────────────────────────────────────────

  if (step === "input") {
    return (
      <div className="flex flex-col gap-4">
        {preview && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-900 text-sm text-emerald-300">
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2 8 6 12 14 4"/>
            </svg>
            Image scanned — review and edit the list below
          </div>
        )}
        <p className="text-xs text-neutral-400 font-mono">Format: <span className="text-neutral-300">4 Lightning Bolt &nbsp;·&nbsp; 4x Counterspell &nbsp;·&nbsp; Black Lotus</span></p>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={"4 Lightning Bolt\n2x Counterspell\n1 Black Lotus\n..."}
          rows={12}
          className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="button" onClick={handleValidate}
            disabled={rawText.trim().length === 0}
            className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            Validate cards →
          </button>
          <button type="button" onClick={() => { setPreview(null); setRawText(""); setStep("choose"); }} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── Step: validating ───────────────────────────────────────────────────

  if (step === "validating") {
    const checked = cards.filter((c) => c.valid !== null).length;
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <svg className="animate-spin text-blue-500" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
        </svg>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Validating… {checked}/{cards.length}</p>
        <div className="w-48 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <div className="w-full max-h-48 overflow-y-auto flex flex-col gap-1 mt-2">
          {cards.filter((c) => c.valid !== null).map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={c.valid ? "text-emerald-500" : "text-red-400"}>{c.valid ? "✓" : "✗"}</span>
              <span className="text-neutral-500">{c.qty}x</span>
              <span className={c.valid ? "text-neutral-600 dark:text-neutral-300" : "text-red-400"}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Step: fix ──────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{totalCards} cards</span>
          {hasErrors ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-300">{invalidCards.length} error{invalidCards.length > 1 ? "s" : ""}</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300">All valid ✓</span>
          )}
        </div>
        <button type="button" onClick={() => { setStep("input"); setCards([]); }} className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          ← Edit text
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1">
        {cards.map((card, idx) => (
          <CardRow
            key={idx} card={card} idx={idx}
            onUpdate={(patch) => updateCard(idx, patch)}
            onRevalidate={() => revalidateCard(idx)}
            onRemove={() => setCards((prev) => prev.filter((_, i) => i !== idx))}
          />
        ))}
      </div>

      {/* Copy to clipboard — to paste into Moxfield */}
      {!hasErrors && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 shrink-0">
            <rect x={5} y={5} width={9} height={9} rx={1}/><path d="M10 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h1"/>
          </svg>
          <p className="text-xs text-neutral-500 flex-1">Copy the list, import it in Moxfield, then paste the URL below.</p>
          <button
            type="button" onClick={copyToClipboard}
            className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
          >
            {copied ? "Copied!" : "Copy list"}
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <button
          type="button" onClick={() => onConfirm(toText(cards.filter((c) => c.valid !== false)))}
          disabled={hasErrors}
          className="flex-1 sm:flex-none px-5 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {hasErrors ? `Fix ${invalidCards.length} error${invalidCards.length > 1 ? "s" : ""} first` : "Done"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
