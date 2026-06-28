import useBoardStore from '../../store/boardStore';

const COLORS = [
  '#ffffff', '#f87171', '#fb923c', '#fbbf24',
  '#34d399', '#38bdf8', '#818cf8', '#e879f9',
  '#000000', '#374151',
];

const TOOLS = [
  { id: 'pencil',  icon: '✏️', label: 'Pencil' },
  { id: 'rect',    icon: '⬜', label: 'Rectangle' },
  { id: 'circle',  icon: '⭕', label: 'Circle' },
  { id: 'eraser',  icon: '🧹', label: 'Eraser' },
];

export default function Toolbar({ onClear, onSave, onUndo, onExport }) {
  const { tool, color, strokeWidth, setTool, setColor, setStrokeWidth } = useBoardStore();

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-800 border-r border-slate-700 w-16 items-center">
      {/* Tools */}
      {TOOLS.map((t) => (
        <button
          key={t.id}
          onClick={() => setTool(t.id)}
          title={t.label}
          className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition
            ${tool === t.id
              ? 'bg-indigo-600 ring-2 ring-indigo-400'
              : 'bg-slate-700 hover:bg-slate-600'
            }`}
        >
          {t.icon}
        </button>
      ))}

      <div className="w-8 h-px bg-slate-600 my-1" />

      {/* Stroke width */}
      <div className="flex flex-col gap-1 items-center">
        {[2, 4, 8].map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            title={`${w}px`}
            className={`w-10 h-8 rounded flex items-center justify-center transition
              ${strokeWidth === w ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            <div
              className="bg-white rounded-full"
              style={{ width: w * 2.5, height: w * 2.5, maxWidth: 20, maxHeight: 20 }}
            />
          </button>
        ))}
      </div>

      <div className="w-8 h-px bg-slate-600 my-1" />

      {/* Color palette */}
      <div className="flex flex-col gap-1 items-center">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            title={c}
            className={`w-7 h-7 rounded-full border-2 transition
              ${color === c ? 'border-white scale-110' : 'border-slate-600 hover:border-slate-400'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        {/* Custom color */}
        <label title="Custom color" className="cursor-pointer">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="sr-only"
          />
          <div className="w-7 h-7 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center text-xs text-slate-400 hover:border-white">
            +
          </div>
        </label>
      </div>

      <div className="w-8 h-px bg-slate-600 my-1" />

      {/* Actions */}
      <button
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
        className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm flex items-center justify-center transition"
      >
        ↩
      </button>
      <button
        onClick={onSave}
        title="Save board"
        className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-green-700 text-slate-200 text-sm flex items-center justify-center transition"
      >
        💾
      </button>
      <button
        onClick={onExport}
        title="Export as PNG"
        className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-blue-700 text-slate-200 text-sm flex items-center justify-center transition"
      >
        🖼️
      </button>
      <button
        onClick={onClear}
        title="Clear board"
        className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-red-700 text-slate-200 text-sm flex items-center justify-center transition"
      >
        🗑️
      </button>
    </div>
  );
}