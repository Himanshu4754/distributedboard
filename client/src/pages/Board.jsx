import { useParams } from 'react-router-dom';

export default function Board() {
  const { roomId } = useParams();
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <p className="text-white text-xl">Room: {roomId} — Canvas coming in Phase 3</p>
    </div>
  );
}