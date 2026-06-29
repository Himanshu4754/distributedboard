import { Keyboard, X } from 'lucide-react';

const SHORTCUTS = [
  { keys: ['P'],       label: 'Pencil tool'     },
  { keys: ['R'],       label: 'Rectangle tool'  },
  { keys: ['C'],       label: 'Circle tool'     },
  { keys: ['E'],       label: 'Eraser'          },
  { keys: ['T'],       label: 'Text tool'       },
  { keys: ['Ctrl','Z'],label: 'Undo'            },
  { keys: ['Ctrl','S'],label: 'Save snapshot'   },
  { keys: ['[', ']'],  label: 'Stroke width'    },
  { keys: ['Esc'],     label: 'Close panels'    },
];

export default function ShortcutsPanel({ onClose }) {
  return (
    <div className="absolute bottom-12 left-16 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Keyboard size={14} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Keyboard Shortcuts</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-1">
        {SHORTCUTS.map(({ keys, label }) => (
          <div key={label} className="flex items-center justify-between py-1.5 px-1">
            <span className="text-slate-300 text-xs">{label}</span>
            <div className="flex gap-1">
              {keys.map((k) => (
                <kbd
                  key={k}
                  className="px-1.5 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs text-slate-200 font-mono"
                >
                  {k}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}