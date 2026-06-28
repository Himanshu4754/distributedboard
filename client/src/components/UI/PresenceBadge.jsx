import useBoardStore from '../../store/boardStore';

export default function PresenceBadge({ onCopyLink }) {
  const { users, roomId } = useBoardStore();

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
      {/* Brand */}
      <span className="text-white font-bold text-sm hidden sm:block">
        Distributed<span className="text-indigo-400">Board</span>
      </span>

      <div className="w-px h-5 bg-slate-700 hidden sm:block" />

      {/* Room code + copy link */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs">Room</span>
        <code className="text-indigo-400 text-xs font-mono bg-slate-900 px-2 py-0.5 rounded select-all">
          {roomId}
        </code>
        <button
          onClick={onCopyLink}
          className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 transition"
        >
          Share link
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Online users */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">{users.length} online</span>
        <div className="flex items-center">
          {users.slice(0, 6).map((user, i) => (
            <div
              key={user.id}
              title={user.username}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800"
              style={{
                backgroundColor: user.color,
                marginLeft: i === 0 ? 0 : -8,
                zIndex: users.length - i,
              }}
            >
              {user.username?.[0]?.toUpperCase()}
            </div>
          ))}
          {users.length > 6 && (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-slate-600 border-2 border-slate-800"
              style={{ marginLeft: -8 }}
            >
              +{users.length - 6}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}