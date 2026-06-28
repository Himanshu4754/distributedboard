import useBoardStore from '../../store/boardStore';

export default function PresenceBadge() {
  const { users, roomId } = useBoardStore();

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // toast handled in Board.jsx
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border-b border-slate-700">
      {/* Room ID + share */}
      <div className="flex items-center gap-2 mr-2">
        <span className="text-slate-400 text-xs">Room:</span>
        <code className="text-indigo-400 text-xs font-mono bg-slate-900 px-2 py-0.5 rounded">
          {roomId}
        </code>
        <button
          onClick={copyLink}
          className="text-xs text-slate-400 hover:text-white transition px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600"
        >
          Copy link
        </button>
      </div>

      {/* Users */}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-slate-500 text-xs mr-2">{users.length} online</span>
        {users.map((user) => (
          <div
            key={user.id}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800 -ml-1"
            style={{ backgroundColor: user.color }}
            title={user.username}
          >
            {user.username?.[0]?.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}