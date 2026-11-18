import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Highlighter,
  Eraser,
  Palette,
  RotateCcw,
  Download,
  Minus,
  Plus,
  PenLine,
  Square,
} from 'lucide-react';

const COLORS = [
  { name: 'Yellow', value: 'rgba(253, 224, 71, 0.55)', hex: '#FDE047' },
  { name: 'Green',  value: 'rgba(74, 222, 128, 0.50)', hex: '#4ADE80' },
  { name: 'Red',    value: 'rgba(252, 165, 165, 0.60)', hex: '#FCA5A5' },
  { name: 'Blue',   value: 'rgba(147, 197, 253, 0.55)', hex: '#93C5FD' },
  { name: 'Purple', value: 'rgba(196, 181, 253, 0.60)', hex: '#C4B5FD' },
];

const TOOLS = [
  { id: 'highlight', label: 'Highlight', Icon: Highlighter },
  { id: 'pen',       label: 'Pen',       Icon: PenLine },
  { id: 'eraser',    label: 'Eraser',    Icon: Eraser },
];

export default function HighlighterCanvas({ containerRef, images, currentPage }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState('highlight');
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(18);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [strokes, setStrokes] = useState({}); // keyed by page
  const lastPos = useRef(null);

  // Determine image element and canvas sync
  const getCanvas = () => canvasRef.current;

  const resizeCanvas = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const container = containerRef?.current;
    if (!container) return;
    // Find the active page image element
    const img = container.querySelector(`[data-page-number="${currentPage}"] img`);
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    canvas.style.position = 'absolute';
    canvas.style.left = `${rect.left - contRect.left + container.scrollLeft}px`;
    canvas.style.top = `${rect.top - contRect.top + container.scrollTop}px`;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    canvas.style.pointerEvents = tool === 'none' ? 'none' : 'all';
    // Only resize pixel buffer if dimensions changed
    if (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height)) {
      const saved = strokes[currentPage] || null;
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      // Restore saved strokes
      if (saved) {
        const img2 = new Image();
        img2.onload = () => {
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img2, 0, 0);
        };
        img2.src = saved;
      }
    }
  }, [containerRef, currentPage, tool, strokes]);

  useEffect(() => {
    resizeCanvas();
    const obs = new ResizeObserver(resizeCanvas);
    if (containerRef?.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [resizeCanvas, currentPage]);

  // Save page strokes when switching pages
  const saveCurrentPage = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    setStrokes((prev) => ({ ...prev, [currentPage]: canvas.toDataURL() }));
  }, [currentPage]);

  useEffect(() => {
    // When page changes, save old and restore new
    return () => { saveCurrentPage(); };
  }, [currentPage, saveCurrentPage]);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved = strokes[currentPage];
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }
  }, [currentPage]);

  const getPos = (e) => {
    const canvas = getCanvas();
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;

    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
    } else if (tool === 'highlight') {
      ctx.globalCompositeOperation = 'multiply';
      ctx.lineWidth = brushSize;
      ctx.strokeStyle = color.value;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = Math.max(2, brushSize / 4);
      ctx.strokeStyle = color.hex;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = getCanvas();
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    ctx.globalCompositeOperation = 'source-over';
    // Auto-save strokes
    setStrokes((prev) => ({ ...prev, [currentPage]: canvas.toDataURL() }));
  };

  const clearPage = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes((prev) => { const n = { ...prev }; delete n[currentPage]; return n; });
  };

  const downloadAnnotated = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `annotated-page-${currentPage}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      {/* Canvas overlay — positioned absolutely inside containerRef */}
      <canvas
        ref={canvasRef}
        className={`z-10 rounded-lg ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
        style={{ touchAction: 'none' }}
      />

      {/* Floating toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl px-3 py-2 select-none animate-slideUp">

        {/* Tool buttons */}
        {TOOLS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            className={`p-2 rounded-xl transition-all duration-150 ${
              tool === id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Color palette */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPalette((v) => !v)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Pick color"
          >
            <Palette className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span
              className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-white dark:border-slate-900"
              style={{ background: color.hex }}
            />
          </button>
          {showPalette && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl p-2 animate-popIn">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => { setColor(c); setShowPalette(false); }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform active:scale-90 ${
                    color.name === c.name ? 'border-indigo-600 scale-110' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Brush size */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setBrushSize((s) => Math.max(4, s - 4))}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Smaller brush"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center border-2 border-current transition-all duration-150"
            style={{
              width: Math.max(8, Math.min(28, brushSize)) + 'px',
              height: Math.max(8, Math.min(28, brushSize)) + 'px',
              background: color.hex + '88',
              borderColor: color.hex,
            }}
          />
          <button
            type="button"
            onClick={() => setBrushSize((s) => Math.min(40, s + 4))}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Larger brush"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Clear page */}
        <button
          type="button"
          onClick={clearPage}
          className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Clear annotations on this page"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Download */}
        <button
          type="button"
          onClick={downloadAnnotated}
          className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
          title="Download annotated page"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
