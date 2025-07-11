import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../socket';
import { useNavigate } from 'react-router-dom';

export default function ChatPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const {
    messages,
    users,
    typingUsers,
    sendMessage,
    sendFile,
    reactToMessage,
    connect,
    disconnect,
    setTyping,
  } = useSocket();

  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const bottomRef = useRef();

  useEffect(() => {
    if (!user) return navigate('/');
    connect(user.username);
    return () => disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      await sendFile(file);
      setFile(null);
    } else if (input.trim()) {
      sendMessage(input);
    }
    setInput('');
    setTyping(false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-green-800 text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-4">Online Users</h2>
        <ul className="space-y-1 overflow-auto flex-1">
          {users.map((u) => (
            <li key={u.id} className="truncate">{u.username}</li>
          ))}
        </ul>
        <button
          onClick={() => {
            logout();
            disconnect();
            navigate('/');
          }}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* Chat area */}
      <main className="flex-1 flex flex-col bg-gray-50">
        <header className="p-4 shadow text-lg font-semibold bg-green-100">
          Welcome, {user?.username}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg) => (
            <div key={msg._id} className="p-3 bg-white rounded shadow relative">
              <div className="flex justify-between items-center">
                <div>
                  <strong className="text-green-700">{msg.sender}:</strong>{' '}
                  {msg.text && <span>{msg.text}</span>}
                </div>
                {msg.timestamp && (
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Image display */}
              {msg.attachments?.length > 0 &&
                msg.attachments.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="attachment"
                    className="mt-2 max-w-xs rounded"
                  />
                ))}

              {/* Reaction buttons */}
              <div className="text-sm mt-2">
                <button onClick={() => reactToMessage(msg._id, '👍')}>👍</button>
                <button onClick={() => reactToMessage(msg._id, '❤️')} className="ml-2">❤️</button>
                <button onClick={() => reactToMessage(msg._id, '😂')} className="ml-2">😂</button>
                {msg.reactions?.length > 0 && (
                  <span className="ml-2">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="mr-1">{r.type}</span>
                    ))}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="px-4 pb-1 text-sm text-gray-600">
            {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-green-50 flex flex-wrap gap-2 border-t border-green-200"
        >
          <input
            type="text"
            value={input}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded w-full md:w-auto"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="p-1 border rounded text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
