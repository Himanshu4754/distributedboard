import useBoardStore from '../../store/boardStore';

export default function CursorOverlay() {
  const { cursors } = useBoardStore();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Object.entries(cursors).map(([userId, { x, y, username, color }]) => (
        <div
          key={userId}
          className="absolute transition-all duration-75"
          style={{ left: x, top: y, transform: 'translate(-4px, -4px)' }}
        >
          {/* Cursor arrow */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 2L14 7L8 9L6 14L2 2Z"
              fill={color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          {/* Name tag */}
          <div
            className="absolute top-4 left-2 text-white text-xs px-1.5 py-0.5 rounded whitespace-nowrap"
            style={{ backgroundColor: color }}
          >
            {username}
          </div>
        </div>
      ))}
    </div>
  );
}