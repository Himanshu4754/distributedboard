import useBoardStore from '../../store/boardStore';

const COLORS = [
  '#ffffff', '#f87171', '#fb923c', '#fbbf24',
  '#34d399', '#38bdf8', '#818cf8', '#e879f9',
  '#94a3b8', '#000000',
];

const TOOLS = [
  { id: 'pencil',  icon: '✏️',  label: 'Pencil (draw)' },
  { id: 'rect',    icon: '⬜',  label: 'Rectangle' },
  { id: 'circle',  icon: '⭕',  label: 'Circle' },
  { id: 'eraser',  icon: '🧹',  label: 'Eraser' },
];

export default function Toolbar({
  onClear, onSave, onUndo, onExport, onVersions, isSaving,
}) {
  const { tool, color, strokeWidth, setTool, setColor, setStrokeWidth } =
    useBoardStore();

  return (
    <div className="flex flex-col gap-2 p-2 bg-slate-800 border-r border-slate-700 w-14 items-center overflow-y-auto">
      {/* Drawing tools */}
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={t.label}
          className={`w-10 h-10 rounded-lg text-base flex items-center justify-center transition
            ${tool === t.id
              ? 'bg-indigo-600 ring-2 ring-indigo-400'
              : 'bg-slate-700 hover:bg-slate-600'
            }`}
        >
          {t.icon}
        </button>
      ))}

      <Divider />

      {/* Stroke widths */}
      {[2, 4, 8].map((w) => (
        <button
          key={w}
          onClick={() => setStrokeWidth(w)}
          title={`${w}px stroke`}
          className={`w-10 h-8 rounded flex items-center justify-center transition
            ${strokeWidth === w
              ? 'bg-indigo-600'
              : 'bg-slate-700 hover:bg-slate-600'
            }`}
        >
          <div
            className="rounded-full bg-white"
            style={{ width: w * 3, height: w * 3, maxWidth: 20, maxHeight: 20 }}
          />
        </button>
      ))}

      <Divider />

      {/* Color swatches */}
      {COLORS.map((c) => (
        <button
          key={c}
          onClick={() => setColor(c)}
          title={c}
          className={`w-7 h-7 rounded-full border-2 transition hover:scale-110
            ${color === c
              ? 'border-white scale-110'
              : 'border-slate-600'
            }`}
          style={{ backgroundColor: c }}
        />
      ))}

      {/* Custom color picker */}
      <label title="Custom color" className="cursor-pointer">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="sr-only"
        />
        <div className="w-7 h-7 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center text-slate-400 hover:border-white text-xs transition">
          +
        </div>
      </label>

      <Divider />

      {/* Action buttons */}
      <ActionBtn onClick={onUndo}     title="Undo (Ctrl+Z)"     emoji="↩" />
      <ActionBtn
        onClick={onSave}
        title="Save + snapshot (Ctrl+S)"
        emoji={isSaving ? '⏳' : '💾'}
        disabled={isSaving}
      />
      <ActionBtn onClick={onExport}   title="Export PNG"        emoji="🖼️" />
      <ActionBtn onClick={onVersions} title="Version history"   emoji="🕒" />
      <ActionBtn onClick={onClear}    title="Clear board"       emoji="🗑️" danger />
    </div>
  );
}

function Divider() {
  return <div className="w-8 h-px bg-slate-600 my-1 flex-shrink-0" />;
}

function ActionBtn({ onClick, title, emoji, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-10 h-10 rounded-lg flex items-center justify-center text-base transition flex-shrink-0
        ${danger
          ? 'bg-slate-700 hover:bg-red-700'
          : 'bg-slate-700 hover:bg-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {emoji}
    </button>
  );
}