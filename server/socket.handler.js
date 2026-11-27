// ==========================================
// SOCKET.IO REAL-TIME EVENT HANDLER
// All socket events: chat, presence, wishes
// ==========================================

const { isValidPin } = require('./middleware/auth.middleware');
const { getISTTimeString, getISTDateString } = require('./utils/helpers');
const { getMessages, saveMessage, getDeletedMessages, saveDeletedMessage, getWishes, saveWish } = require('./utils/store');
const { updateHttpPresence, onlineUsers } = require('./utils/presence');
const fs = require('fs');

function initSocketHandlers(io, store) {
  io.on('connection', (socket) => {
    let socketUserRole = null;

    socket.on('user_join', (data) => {
      const { sender, pin } = data || {};
      if (!isValidPin(sender, pin)) {
        socket.emit('auth_error', { message: 'Invalid Passcode! Access Denied.' });
        return;
      }
      updateHttpPresence(sender);
      const s = (sender || '').toLowerCase();
      socketUserRole = s.includes('vanshika') ? 'vanshika' : 'rakesh';
      socket.join('love_chat_room');
      socket.emit('auth_success', { sender, onlineUsers, messages: getMessages() });
      io.to('love_chat_room').emit('presence_update', onlineUsers);
    });

    socket.on('send_message', (data) => {
      const { sender, pin, message, mediaType, mediaUrl, fileName } = data || {};
      if (!isValidPin(sender, pin)) {
        socket.emit('chat_error', { message: 'Access Denied: Invalid Security Passcode.' });
        return;
      }
      if ((!message || !message.trim()) && !mediaUrl) return;
      updateHttpPresence(sender);

      const now = new Date();
      const newMsg = {
        id: data.id || ('msg_' + Date.now()),
        sender,
        message: (message || '').trim(),
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        fileName: fileName || null,
        timestamp: data.timestamp || now.toISOString(),
        formattedTime: data.formattedTime || getISTTimeString(),
        formattedDate: data.formattedDate || getISTDateString(),
        status: data.status || 'sent',
        replyTo: data.replyTo || null
      };

      saveMessage(newMsg);
      io.to('love_chat_room').emit('new_message', newMsg);
    });

    socket.on('delete_message', (data) => {
      const { messageId, deleteType, deletedBy, pin } = data || {};
      if (!isValidPin(deletedBy, pin) && pin !== 'Vanshika170926') return;
      if (!messageId) return;

      let list = getMessages();
      const targetIdx = list.findIndex(m => m.id === messageId);
      const targetMsg = targetIdx !== -1 ? list[targetIdx] : null;
      const delType = deleteType === 'for_everyone' ? 'for_everyone' : 'for_me';
      const now = new Date();

      const auditRecord = {
        id: 'del_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        messageId,
        deleteType: delType,
        deletedBy: deletedBy || 'Unknown',
        deletedAt: now.toISOString(),
        deletedAtFormatted: `${getISTTimeString()} (${getISTDateString()})`,
        originalSender: targetMsg ? targetMsg.sender : 'Unknown',
        message: targetMsg ? targetMsg.message : (data.message || ''),
        mediaType: targetMsg ? targetMsg.mediaType : (data.mediaType || null),
        mediaUrl: targetMsg ? targetMsg.mediaUrl : (data.mediaUrl || null),
        fileName: targetMsg ? targetMsg.fileName : (data.fileName || null),
        originalTimestamp: targetMsg ? targetMsg.timestamp : null
      };
      saveDeletedMessage(auditRecord);

      const { MESSAGES_FILE } = require('./utils/store');
      if (delType === 'for_everyone') {
        if (targetIdx !== -1) {
          list.splice(targetIdx, 1);
          try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
        }
      } else {
        if (targetIdx !== -1) {
          list[targetIdx].deletedFor = list[targetIdx].deletedFor || [];
          const cleanUser = (deletedBy || '').toLowerCase();
          if (!list[targetIdx].deletedFor.includes(cleanUser)) {
            list[targetIdx].deletedFor.push(cleanUser);
          }
          try { fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2)); } catch (e) {}
        }
      }

      io.to('love_chat_room').emit('message_deleted', { messageId, deleteType: delType, deletedBy });
    });

    socket.on('launch_wish', (data) => {
      const { wishText, sender } = data || {};
      if (!wishText || !wishText.trim()) return;
      updateHttpPresence(sender);
      const newWish = {
        id: 'wish_' + Date.now(),
        sender: sender || 'Vanshika 👸',
        text: wishText.trim(),
        timestamp: new Date().toISOString(),
        formattedTime: getISTTimeString()
      };
      saveWish(newWish);
      io.to('love_chat_room').emit('new_sky_lantern', newWish);
    });

    socket.on('typing', (data) => {
      const isTyping = data && data.isTyping !== false;
      socket.to('love_chat_room').emit('user_typing', {
        sender: (data && data.sender) || 'Partner',
        isTyping
      });
    });

    socket.on('typing_start', (data) => {
      socket.to('love_chat_room').emit('user_typing', { sender: data.sender, isTyping: true });
    });

    socket.on('typing_stop', (data) => {
      socket.to('love_chat_room').emit('user_typing', { sender: data.sender, isTyping: false });
    });

    socket.on('disconnect', () => {
      if (socketUserRole) {
        const nowStr = getISTTimeString();
        if (socketUserRole === 'vanshika') {
          onlineUsers.vanshika.isOnline = false;
          onlineUsers.vanshika.lastSeen = nowStr;
        } else {
          onlineUsers.rakesh.isOnline = false;
          onlineUsers.rakesh.lastSeen = nowStr;
        }
        io.to('love_chat_room').emit('presence_update', onlineUsers);
      }
    });
  });
}

module.exports = { initSocketHandlers };
