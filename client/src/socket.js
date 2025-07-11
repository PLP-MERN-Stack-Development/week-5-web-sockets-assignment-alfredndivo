// src/socket.js
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import api from './utils/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const useSocket = () => {
  const { token } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const connect = () => {
    socket.auth = { token };
    socket.connect();
    socket.emit('join_room', 'global');
  };

  const disconnect = () => socket.disconnect();

  const sendMessage = (text, room = 'global') => {
    socket.emit('send_message', { text, room });
  };

  const sendFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/upload', formData);
    const fileUrl = res.data.url;

    socket.emit('send_message', {
      text: '',
      attachments: [fileUrl],
    });
  };

  const reactToMessage = (id, type) => {
    socket.emit('reaction', { id, type });
  };

  const setTyping = (isTyping, room = 'global') => {
    socket.emit('typing', { room, isTyping });
  };

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('private_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('message_read', ({ id, readBy }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, readBy } : m))
      );
    });

    socket.on('reaction_update', (msg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? msg : m))
      );
    });

    socket.on('user_list', setUsers);
    socket.on('typing_users', setTypingUsers);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('receive_message');
      socket.off('private_message');
      socket.off('message_read');
      socket.off('reaction_update');
      socket.off('user_list');
      socket.off('typing_users');
    };
  }, []);

  return {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendFile,
    reactToMessage,
    setTyping,
  };
};

export default socket;
