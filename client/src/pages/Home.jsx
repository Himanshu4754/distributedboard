import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const createRoom = () => {
    if (!username.trim()) return alert('Enter your name');
    const newRoomId = uuidv4().slice(0, 8);
    localStorage.setItem('db_username', username);
    navigate(`/board/${newRoomId}`);
  };

  const joinRoom = () => {
    if (!username.trim()) return alert('Enter your name');
    if (!roomId.trim()) return alert('Enter a room code');
    localStorage.setItem('db_username', username);
    navigate(`/board/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Distributed<span className="text-indigo-400">Board</span>
          </h1>
          <p className="text-slate-400 text-sm">Real-time collaborative whiteboard</p>
        </div>

        <input
          className="w-full mb-4 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button
          onClick={createRoom}
          className="w-full mb-3 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition"
        >
          Create New Board
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-700" />
          <span className="text-slate-500 text-sm">or join existing</span>
          <div className="flex-1 h-px bg-slate-700" />
        </div>

        <input
          className="w-full mb-3 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
          placeholder="Room code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
        />

        <button
          onClick={joinRoom}
          className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold border border-slate-600 transition"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}