import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Highlighter,
  Eraser,
  Minus,
  Plus,
  PenLine,
  Save,
  RotateCcw,
  Download,
  X,
  Check,
} from 'lucide-react';

// ── Color Palette ─────────────────────────────────────────────────────────────
const COLORS = [
  { name: 'Red',     hex: '#EF4444', rgba: 'rgba(239,68,68,0.55)' },
  { name: 'Green',   hex: '#10B981', rgba: 'rgba(16,185,129,0.50)' },
  { name: 'Blue',    hex: '#3B82F6', rgba: 'rgba(59,130,246,0.55)' },
  { name: 'Yellow',  hex: '#EAB308', rgba: 'rgba(234,179,8,0.55)' },
  { name: 'Purple',  hex: '#8B5CF6', rgba: 'rgba(139,92,246,0.55)' },
  { name: 'Charcoal',hex: '#323232', rgba: 'rgba(50,50,50,0.80)' },
];

// ── Tool definitions ──────────────────────────────────────────────────────────
const TOOLS = [
  { id: 'pen',       label: 'Pen',       Icon: PenLine },
  { id: 'highlight', label: 'Highlight', Icon: Highlighter },
  { id: 'tick',      label: 'Tick ✓',   Icon: Check },
  { id: 'cross',     label: 'Cross ✕',  Icon: X },
  { id: 'eraser',    label: 'Eraser',    Icon: Eraser },
];

// ── Draw stamp (tick or cross) ────────────────────────────────────────────────
function stampSymbol(ctx, x, y, type, colorHex, size = 36) {
  const s = size;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'tick') {
    ctx.strokeStyle = colorHex || '#10B981';
    ctx.lineWidth = Math.max(3, s / 7);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.45, y);
    ctx.lineTo(x - s * 0.08, y + s * 0.38);
    ctx.lineTo(x + s * 0.55, y - s * 0.48);
    ctx.stroke();
  } else if (type === 'cross') {
    ctx.strokeStyle = colorHex || '#EF4444';
    ctx.lineWidth = Math.max(3, s / 7);
    const h = s * 0.5;
    ctx.beginPath();
    ctx.moveTo(x - h, y - h);
    ctx.lineTo(x + h, y + h);
    ctx.moveTo(x + h, y - h);
    ctx.lineTo(x - h, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

// ── LocalStorage key builder ──────────────────────────────────────────────────
const storageKey = (submissionId) => `examiner_markup_${submissionId || 'default'}`;

// ── Main Component ────────────────────────────────────────────────────────────
export default function HighlighterCanvas({ containerRef, images, currentPage, submissionId }) {
  const canvasRef = useRef(null);
  const [tool, setTool]           = useState('pen');
  const [color, setColor]         = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(16);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes]     = useState({});        // { pageNum: dataURL }
  const [savedStrokes, setSavedStrokes] = useState({}); // last explicitly saved state
  const [hasUnsaved, setHasUnsaved]     = useState(false);
  const lastPos = useRef(null);

  // ── Load saved markup from localStorage on mount ──────────────────────────
  useEffect(() => {
    if (!submissionId) return;
    try {
      const raw = localStorage.getItem(storageKey(submissionId));
      if (raw) {
        const parsed = JSON.parse(raw);
        setStrokes(parsed);
        setSavedStrokes(parsed);
      }
    } catch (_) {}
  }, [submissionId]);

  // ── Canvas resize & reposition over active page image ─────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef?.current;
    if (!container) return;

    const img = container.querySelector(`[data-page-number="${currentPage}"] img`);
    if (!img) return;

    const rect    = img.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();

    canvas.style.position = 'absolute';
    canvas.style.left   = `${rect.left - contRect.left + container.scrollLeft}px`;
    canvas.style.top    = `${rect.top  - contRect.top  + container.scrollTop}px`;
    canvas.style.width  = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.pointerEvents = 'all';

    // Only clear & reload if pixel size changed
    const needsReset = canvas.width !== Math.round(rect.width * window.devicePixelRatio)
                    || canvas.height !== Math.round(rect.height * window.devicePixelRatio);

    if (needsReset) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = Math.round(rect.width  * dpr);
      canvas.height = Math.round(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      const saved = strokes[currentPage];
      if (saved) {
        const img2 = new Image();
        img2.onload = () => ctx.drawImage(img2, 0, 0, rect.width, rect.height);
        img2.src = saved;
      }
    }
  }, [containerRef, currentPage, strokes]);

  useEffect(() => {
    resizeCanvas();
    const obs = new ResizeObserver(resizeCanvas);
    if (containerRef?.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [resizeCanvas, currentPage]);

  // ── Restore per-page strokes when page changes ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved = strokes[currentPage];
    if (saved) {
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        ctx.drawImage(img, 0, 0, canvas.width / dpr, canvas.height / dpr);
      };
      img.src = saved;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // ── Coordinate helper (DPI-aware) ──────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top),
    };
  };

  // ── Save current page strokes into state (auto) ──────────────────────────
  const captureCurrentPage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setStrokes(prev => {
      const updated = { ...prev, [currentPage]: dataUrl };
      setHasUnsaved(true);
      return updated;
    });
  }, [currentPage]);

  // ── Drawing handlers ───────────────────────────────────────────────────────
  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e);

    // Stamps: instant on click
    if (tool === 'tick') {
      const stampColor = color.hex === '#EAB308' ? '#10B981' : color.hex;
      stampSymbol(ctx, pos.x, pos.y, 'tick', stampColor, brushSize * 2.5);
      captureCurrentPage();
      return;
    }
    if (tool === 'cross') {
      const stampColor = color.hex === '#EAB308' ? '#EF4444' : color.hex;
      stampSymbol(ctx, pos.x, pos.y, 'cross', stampColor, brushSize * 2.5);
      captureCurrentPage();
      return;
    }

    setIsDrawing(true);
    lastPos.current = pos;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2.5;
    } else if (tool === 'highlight') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = brushSize * 2;
      ctx.strokeStyle = color.rgba;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = Math.max(2, brushSize / 3);
      ctx.strokeStyle = color.hex;
    }
    ctx.lineCap  = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const pos    = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
    captureCurrentPage();
  };

  // ── Persist to localStorage ───────────────────────────────────────────────
  const handleSave = () => {
    if (!submissionId) return;
    const canvas   = canvasRef.current;
    const dataUrl  = canvas ? canvas.toDataURL('image/png') : null;
    const updated  = dataUrl ? { ...strokes, [currentPage]: dataUrl } : strokes;
    try {
      localStorage.setItem(storageKey(submissionId), JSON.stringify(updated));
    } catch (_) {}
    setSavedStrokes(updated);
    setHasUnsaved(false);
  };

  // ── Revert to last saved state ────────────────────────────────────────────
  const handleUnsave = () => {
    setStrokes(savedStrokes);
    setHasUnsaved(false);
    // Redraw canvas for current page
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext('2d');
    const dpr  = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved = savedStrokes[currentPage];
    if (saved) {
      const img2 = new Image();
      img2.onload = () => ctx.drawImage(img2, 0, 0, canvas.width / dpr, canvas.height / dpr);
      img2.src = saved;
    }
  };

  // ── Clear current page ────────────────────────────────────────────────────
  const clearPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes(prev => {
      const n = { ...prev };
      delete n[currentPage];
      return n;
    });
    setHasUnsaved(true);
  };

  // ── Download annotated page ───────────────────────────────────────────────
  const downloadAnnotated = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `annotated-page-${currentPage}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const cursorStyle = {
    pen:       'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'4\' fill=\'%23EF4444\'/%3E%3C/svg%3E") 12 12, crosshair',
    highlight: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 28 28\'%3E%3Crect x=\'4\' y=\'10\' width=\'20\' height=\'10\' rx=\'3\' fill=\'%23EAB308\' opacity=\'0.7\'/%3E%3C/svg%3E") 14 14, crosshair',
    tick:      'crosshair',
    cross:     'crosshair',
    eraser:    'cell',
  }[tool] || 'crosshair';

  return (
    <>
      {/* ── Canvas overlay ── */}
      <canvas
        ref={canvasRef}
        className="z-10 rounded-lg"
        style={{ cursor: cursorStyle, touchAction: 'none', position: 'absolute' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />

      {/* ── Floating Toolbar ── */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 select-none animate-slideUp"
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.22))' }}
      >
        {/* Main pill */}
        <div className="flex items-center gap-1 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/10 rounded-2xl px-2.5 py-2">

          {/* Tool buttons */}
          {TOOLS.map(({ id, label, Icon }) => {
            const isActive = tool === id;
            const accentMap = {
              pen:       'bg-blue-600 text-white shadow-blue-500/40',
              highlight: 'bg-yellow-500 text-white shadow-yellow-400/40',
              tick:      'bg-emerald-600 text-white shadow-emerald-500/40',
              cross:     'bg-rose-600 text-white shadow-rose-500/40',
              eraser:    'bg-slate-500 text-white shadow-slate-400/40',
            };
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTool(id)}
                title={label}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black transition-all duration-150 active:scale-90 ${
                  isActive
                    ? `${accentMap[id]} shadow-md`
                    : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}

          {/* Divider */}
          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Color dots */}
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => setColor(c)}
                className={`rounded-full border-2 transition-all duration-150 active:scale-90 ${
                  color.name === c.name
                    ? 'border-white scale-110 shadow-md'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-110'
                }`}
                style={{ background: c.hex, width: 18, height: 18 }}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Brush size */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setBrushSize((s) => Math.max(4, s - 4))}
              className="p-1 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
              title="Smaller brush"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span
              className="rounded-full border-2 border-white/40 inline-block transition-all duration-150"
              style={{
                width:  Math.max(8, Math.min(26, brushSize)) + 'px',
                height: Math.max(8, Math.min(26, brushSize)) + 'px',
                background: color.hex + 'bb',
              }}
            />
            <button
              type="button"
              onClick={() => setBrushSize((s) => Math.min(40, s + 4))}
              className="p-1 rounded-lg text-slate-300 hover:bg-white/10 transition-colors"
              title="Larger brush"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Unsaved/Saved indicator */}
          <span
            className={`text-[10px] font-black px-2 py-0.5 rounded-full border transition-all ${
              hasUnsaved
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
            }`}
          >
            {hasUnsaved ? 'Unsaved •' : 'Saved ✓'}
          </span>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            title="Save annotations to this device"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/30 transition-all active:scale-90"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save</span>
          </button>

          {/* Revert button */}
          {hasUnsaved && (
            <button
              type="button"
              onClick={handleUnsave}
              title="Revert to last saved"
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all active:scale-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Clear page */}
          <button
            type="button"
            onClick={clearPage}
            title="Clear all annotations on this page"
            className="p-1.5 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors active:scale-90"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={downloadAnnotated}
            title="Download annotated page as PNG"
            className="p-1.5 rounded-xl text-indigo-400 hover:bg-indigo-500/20 transition-colors active:scale-90"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}
