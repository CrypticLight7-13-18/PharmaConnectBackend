import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';

/**
 * Socket.IO authentication middleware
 * Verifies JWT token and attaches user to socket
 * @param {Object} socket - Socket.IO socket instance
 * @param {Function} next - Next middleware function
 */
export const socketAuth = async (socket, next) => {
  try {
    // Extract token from auth header or cookies
    let token = socket.handshake.auth?.token;
    
    // If no token in auth, try to extract from cookies
    if (!token && socket.handshake.headers?.cookie) {
      const cookies = socket.handshake.headers.cookie.split(';');
      const jwtCookie = cookies.find(cookie => cookie.trim().startsWith('jwt='));
      if (jwtCookie) {
        token = jwtCookie.split('=')[1];
      }
    }
    
    if (!token || token === 'loggedout') {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // Find the user
    let user = await Patient.findById(decoded.id);
    if (!user) {
      user = await Doctor.findById(decoded.id);
    }
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    // Attach user to socket for use in event handlers
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

export default socketAuth;
