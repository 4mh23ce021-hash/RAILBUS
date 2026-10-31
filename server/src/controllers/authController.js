const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../config/prisma');
const env = require('../config/env');

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

/**
 * Passenger Registration (Strictly PASSENGER role only)
 */
async function passengerRegister(req, res, next) {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validated.email.toLowerCase() },
          { phone: validated.phone }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email or phone number already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(validated.password, 12);

    const user = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: validated.email.toLowerCase().trim(),
        phone: validated.phone.trim(),
        passwordHash,
        role: 'PASSENGER', // Enforced role
        status: 'ACTIVE',
        passengerProfile: {
          create: {
            preferredLanguage: 'en'
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Welcome to RAILBUS!',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Passenger Login
 */
async function passengerLogin(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        passengerProfile: true
      }
    });

    if (!user || user.role !== 'PASSENGER') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or non-passenger account.'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your passenger account is suspended. Please contact customer support.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        passengerProfile: user.passengerProfile
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin Login (Dedicated Admin Portal Authentication)
 */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        adminProfile: true
      }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or unauthorized administrative access.'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Administrative account suspended.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    // Log administrative login audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_LOGIN',
        resource: 'AUTH',
        details: 'Admin logged into Command Centre',
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      }
    });

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Command Center authentication verified.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        adminProfile: user.adminProfile
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Conductor Login
 */
async function conductorLogin(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        conductorProfile: true
      }
    });

    if (!user || (user.role !== 'CONDUCTOR' && user.role !== 'ADMIN')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid conductor credentials.'
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Conductor credentials suspended.'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Conductor authentication verified.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        conductorProfile: user.conductorProfile
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get Current Authenticated User
 */
async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        passengerProfile: req.user.role === 'PASSENGER',
        adminProfile: req.user.role === 'ADMIN',
        conductorProfile: req.user.role === 'CONDUCTOR'
      }
    });

    return res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  passengerRegister,
  passengerLogin,
  adminLogin,
  conductorLogin,
  getMe
};
