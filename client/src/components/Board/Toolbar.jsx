import {
  Pencil, Square, Circle, Eraser, Type,
  Undo2, Save, Image, Clock, Trash2,
  ChevronRight, Keyboard,
} from 'lucide-react';
import useBoardStore from '../../store/boardStore';

const TOOLS = [
  { id: 'pencil', Icon: Pencil,  label: 'Pencil',     key: 'P' },
  { id: 'rect',   Icon: Square,  label: 'Rectangle',  key: 'R' },
  { id: 'circle', Icon: Circle,  label: 'Circle',     key: 'C' },
  { id: 'eraser', Icon: Eraser,  label: 'Eraser',     key: 'E' },
  { id: 'text',   Icon: Type,    label: 'Text',       key: 'T' },
];

const COLORS = [
  '#ffffff','#f87171','#fb923c','#fbbf24',
  '#34d399','#38bdf8','#818cf8','#e879f9',
  '#94a3b8','#1e293b',
];

const STROKES = [2, 4, 8];

export default function Toolbar({
  onClear, onSave, onUndo, onExport,
  onVersions, onReplay, onShortcuts,
  isSaving, canEdit = true,
}) {
  const editClass = canEdit ? '' : 'opacity-40 pointer-events-none';
  const { tool, color, strokeWidth, setTool, setColor, setStrokeWidth } =
    useBoardStore();

  return (
    <div className="flex flex-col gap-1.5 py-3 px-2 bg-slate-900 border-r border-slate-800 w-14 items-center overflow-y-auto overflow-x-hidden flex-shrink-0"
      style={{ scrollbarWidth: 'none' }}
    >
      {/* Drawing tools */}
      <div className={editClass}>
      <ToolSection label="Draw">
        {TOOLS.map(({ id, Icon, label, key }) => (
          <ToolBtn
            key={id}
            active={tool === id}
            onClick={() => setTool(id)}
            tooltip={`${label} (${key})`}
          >
            <Icon size={16} />
          </ToolBtn>
        ))}
      </ToolSection>
      </div>

      <Divider />

      {/* Stroke width */}
      <div className={editClass}>
      <ToolSection label="Size">
        {STROKES.map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            title={`${w}px stroke`}
            className={`w-9 h-8 rounded-lg flex items-center justify-center transition
              ${strokeWidth === w
                ? 'bg-indigo-600 ring-1 ring-indigo-400'
                : 'hover:bg-slate-800'
              }`}
          >
            <div
              className="rounded-full bg-white"
              style={{ width: w * 3, height: w * 3, maxWidth: 18, maxHeight: 18 }}
            />
          </button>
        ))}
      </ToolSection>
      </div>

      <Divider />

      {/* Color palette */}
      <div className={editClass}>
      <ToolSection label="Color">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            title={c}
            className={`w-6 h-6 rounded-full border-2 transition hover:scale-110 flex-shrink-0
              ${color === c ? 'border-white scale-110' : 'border-slate-700'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        {/* Custom color */}
        <label title="Custom color" className="cursor-pointer">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="sr-only" />
          <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center text-slate-400 hover:border-indigo-400 text-xs transition">
            +
          </div>
        </label>
      </ToolSection>
      </div>

      <Divider />

      {/* Actions */}
      <div className={editClass}>
      <ToolSection label="Edit">
        <ActionBtn onClick={onUndo}    tooltip="Undo (Ctrl+Z)"       Icon={Undo2}  />
        <ActionBtn onClick={onSave}    tooltip="Save snapshot (Ctrl+S)" Icon={Save} disabled={isSaving} pulse={isSaving} />
      </ToolSection>
      </div>

      <Divider />
      <div className={editClass}>
      <ToolSection label="More">
        <ActionBtn onClick={onExport}   tooltip="Export PNG"          Icon={Image}    />
        <ActionBtn onClick={onVersions} tooltip="Version history"     Icon={Clock}    />
        <ActionBtn onClick={onReplay}   tooltip="Session replay"      Icon={ChevronRight} accent />
        <ActionBtn onClick={onShortcuts}tooltip="Keyboard shortcuts"  Icon={Keyboard} />
        <ActionBtn onClick={onClear}    tooltip="Clear board"         Icon={Trash2}   danger />
      </ToolSection>
      </div>

    </div>
  );
}

function ToolSection({ label, children }) {
  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-slate-600 text-[9px] uppercase tracking-widest mb-0.5">{label}</span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="w-8 h-px bg-slate-800 my-1 flex-shrink-0" />;
}

function ToolBtn({ active, onClick, tooltip, children }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition
        ${active
          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
    >
      {children}
    </button>
  );
}

function ActionBtn({ onClick, tooltip, Icon, danger, accent, disabled, pulse }) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition relative
        ${danger  ? 'text-slate-400 hover:text-red-400   hover:bg-red-900/30'     : ''}
        ${accent  ? 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-900/30' : ''}
        ${!danger && !accent ? 'text-slate-400 hover:text-white hover:bg-slate-800' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      <Icon size={15} />
      {pulse && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      )}
    </button>
  );
}
