import React from 'react';

export default function MessageList({ messages, reactToMessage, currentUserId }) {
  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className="p-3 bg-white rounded shadow relative text-sm"
        >
          <div className="flex justify-between items-start">
            <div>
              <strong className="text-green-800">{msg.sender}:</strong>{' '}
              {msg.text}
            </div>
            {msg.timestamp && (
              <span className="text-xs text-gray-400 ml-2">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>

          {msg.fileUrl && msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) && (
            <img
              src={msg.fileUrl}
              alt="shared"
              className="mt-2 max-w-xs rounded border"
            />
          )}

          {msg.fileUrl && !msg.fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) && (
            <a
              href={msg.fileUrl}
              target="_blank"
              className="block mt-2 text-blue-600 underline text-xs"
            >
              📎 Download File
            </a>
          )}

          <div className="mt-2 flex items-center gap-2">
            <button onClick={() => reactToMessage(msg._id, '👍')}>👍</button>
            <button onClick={() => reactToMessage(msg._id, '❤️')}>❤️</button>

            {msg.reactions &&
              Object.entries(msg.reactions).map(([emoji, userIds]) =>
                userIds.length ? (
                  <span key={emoji} className="text-xs text-gray-500 ml-1">
                    {emoji} {userIds.length}
                  </span>
                ) : null
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
