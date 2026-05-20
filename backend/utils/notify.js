const Notification = require('../models/Notification');

const sendNotification = async (req, { userId, userType, message, type, link = '' }) => {
  const io             = req.app.get('io');
  const connectedUsers = req.app.get('connectedUsers');

  // Save to DB
  const notif = await Notification.create({ userId, userType, message, type, link });

  // Push to socket if user is online
  if (io && connectedUsers) {
    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('notification', {
        _id: notif._id, message, type, link, createdAt: notif.createdAt
      });
    }
  }
};

module.exports = sendNotification;
