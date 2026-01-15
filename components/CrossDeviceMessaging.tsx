'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Smartphone, Send, Check, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeviceMessage {
  id: number;
  message_text: string;
  sender_device: string;
  recipient_device?: string;
  priority: string;
  category: string;
  is_read: boolean;
  created_at: string;
}

const DEVICES = [
  { value: 'mac', label: 'Mac', icon: '💻' },
  { value: 'iphone', label: 'iPhone', icon: '📱' },
  { value: 'ipad', label: 'iPad', icon: '📱' },
  { value: 'web', label: 'Web', icon: '🌐' }
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' }
];

export default function CrossDeviceMessaging() {
  const [messages, setMessages] = useState<DeviceMessage[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({
    text: '',
    sender: 'web',
    recipient: '',
    priority: 'normal',
    category: 'reminder'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.text.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: newMessage.text,
          senderDevice: newMessage.sender,
          recipientDevice: newMessage.recipient || undefined,
          priority: newMessage.priority,
          category: newMessage.category,
          expiresIn: 1440 // 24 hours
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.notification);
        setNewMessage({
          text: '',
          sender: 'web',
          recipient: '',
          priority: 'normal',
          category: 'reminder'
        });
        setShowCompose(false);
        fetchMessages();
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const res = await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        fetchMessages();
      }
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const getDeviceIcon = (device: string) => {
    return DEVICES.find(d => d.value === device)?.icon || '📱';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority)?.color || 'text-gray-500';
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const unreadMessages = messages.filter(m => !m.is_read);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Smartphone className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">Cross-Device Messages</h2>
            <p className="text-sm text-muted-foreground">
              {unreadMessages.length} unread message{unreadMessages.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowCompose(!showCompose)}
          size="sm"
          variant="outline"
        >
          <Send className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      {/* Compose form */}
      <AnimatePresence>
        {showCompose && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSendMessage}
            className="mb-6 p-4 bg-muted/50 rounded-lg space-y-3"
          >
            <textarea
              value={newMessage.text}
              onChange={(e) => setNewMessage({ ...newMessage, text: e.target.value })}
              placeholder="Type your message..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm resize-none"
              rows={3}
              autoFocus
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">From</label>
                <select
                  value={newMessage.sender}
                  onChange={(e) => setNewMessage({ ...newMessage, sender: e.target.value })}
                  className="w-full px-2 py-1 bg-background border border-border rounded-md text-sm"
                >
                  {DEVICES.map(device => (
                    <option key={device.value} value={device.value}>
                      {device.icon} {device.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">To (optional)</label>
                <select
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                  className="w-full px-2 py-1 bg-background border border-border rounded-md text-sm"
                >
                  <option value="">All Devices</option>
                  {DEVICES.filter(d => d.value !== newMessage.sender).map(device => (
                    <option key={device.value} value={device.value}>
                      {device.icon} {device.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs text-muted-foreground">Priority:</label>
              {PRIORITIES.map(priority => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setNewMessage({ ...newMessage, priority: priority.value })}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    newMessage.priority === priority.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button type="submit" size="sm">
                <Send className="h-3 w-3 mr-1" />
                Send
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Messages list */}
      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet!</p>
            <p className="text-sm">Send yourself a reminder across devices</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 rounded-lg border transition-all ${
                message.is_read
                  ? 'bg-muted/30 border-border'
                  : 'bg-blue-500/10 border-blue-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{getDeviceIcon(message.sender_device)}</span>
                  {message.recipient_device && (
                    <>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-xl">{getDeviceIcon(message.recipient_device)}</span>
                    </>
                  )}
                  <span className={`text-xs font-medium ${getPriorityColor(message.priority)}`}>
                    {message.priority !== 'normal' && (
                      <AlertCircle className="h-3 w-3 inline mr-1" />
                    )}
                    {message.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getTimeSince(message.created_at)}
                </span>
              </div>

              <p className="text-sm text-card-foreground mb-2">{message.message_text}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                  {message.category}
                </span>
                {!message.is_read && (
                  <Button
                    onClick={() => handleMarkAsRead(message.id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Mark Read
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
