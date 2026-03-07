# 🔌 FootballHub+ - INTÉGRATIONS PRODUCTION COMPLÈTES

## 📋 TABLE DES MATIÈRES

1. [Stockage Cloud (AWS S3 / Cloudinary)](#stockage-cloud)
2. [Service Email (Resend)](#service-email)
3. [API Football Professionnelle](#api-football)
4. [Redis Caching Performance](#redis-caching)
5. [WebSockets Temps Réel](#websockets)
6. [Stripe Webhooks Complets](#stripe-webhooks)
7. [Firebase Push Notifications](#firebase-push)
8. [Monitoring & APM](#monitoring)
9. [CI/CD GitHub Actions](#cicd)

---

## ☁️ 1. STOCKAGE CLOUD (AWS S3 / Cloudinary)

### Option A : AWS S3 (Recommandé pour production)

```bash
# Installation
npm install aws-sdk multer-s3 sharp
```

```javascript
// server/src/config/aws.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const sharp = require('sharp');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'eu-west-1',
});

const s3 = new AWS.S3();

// Multer S3 storage
const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `uploads/${file.fieldname}/${uniqueName}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  },
});

// Image optimization middleware
const optimizeImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const optimized = await sharp(req.file.buffer)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload optimized version
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: req.file.key,
      Body: optimized,
      ACL: 'public-read',
      ContentType: 'image/jpeg',
    };

    await s3.upload(params).promise();
    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
};

// Delete file from S3
const deleteFromS3 = async (fileKey) => {
  try {
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
    }).promise();
    console.log(`✅ Deleted from S3: ${fileKey}`);
  } catch (error) {
    console.error('S3 delete error:', error);
  }
};

module.exports = {
  uploadS3,
  optimizeImage,
  deleteFromS3,
  s3,
};
```

### Option B : Cloudinary (Plus simple)

```bash
npm install cloudinary multer-storage-cloudinary
```

```javascript
// server/src/config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'footballhub',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto:good' },
    ],
  },
});

const uploadCloudinary = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Delete from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = {
  uploadCloudinary,
  deleteFromCloudinary,
  cloudinary,
};
```

### Utilisation dans les Routes

```javascript
// server/src/routes/upload.js
const express = require('express');
const router = express.Router();
const { uploadCloudinary } = require('../config/cloudinary');
const { authenticate } = require('../middleware/auth');

// Upload avatar
router.post('/avatar', 
  authenticate, 
  uploadCloudinary.single('avatar'), 
  async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      
      // Delete old avatar if exists
      if (user.avatar) {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`footballhub/${publicId}`);
      }

      // Update user avatar
      user.avatar = req.file.path;
      await user.save();

      res.json({
        success: true,
        avatar: req.file.path,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
      });
    }
  }
);

// Upload product images
router.post('/product',
  authenticate,
  uploadCloudinary.array('images', 5),
  async (req, res) => {
    try {
      const images = req.files.map(file => file.path);

      res.json({
        success: true,
        images,
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
      });
    }
  }
);

module.exports = router;
```

---

## 📧 2. SERVICE EMAIL (Resend)

```bash
npm install resend
```

```javascript
// server/src/config/resend.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'FootballHub+ <noreply@footballhub.ma>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('✅ Email sent:', data.id);
    return data;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

module.exports = { sendEmail, resend };
```

```javascript
// server/src/services/emailService.js
const { sendEmail } = require('../config/resend');

class EmailService {
  // Welcome email
  static async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 32px; font-weight: bold; color: #F9D406; }
          .content { color: #333; line-height: 1.6; }
          .button { display: inline-block; padding: 12px 30px; background: #F9D406; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚽ FootballHub+</div>
          </div>
          <div class="content">
            <h2>Bienvenue ${user.firstName} !</h2>
            <p>Merci de rejoindre FootballHub+, votre plateforme football ultime.</p>
            <p>Vous pouvez maintenant :</p>
            <ul>
              <li>Réserver des billets pour vos matchs préférés</li>
              <li>Suivre les scores en direct</li>
              <li>Acheter des produits exclusifs</li>
              <li>Scanner vos billets directement depuis l'app</li>
            </ul>
            <a href="https://footballhub.ma" class="button">Découvrir FootballHub+</a>
          </div>
          <div class="footer">
            <p>© 2024 FootballHub+. Tous droits réservés.</p>
            <p>Casablanca, Maroc</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Bienvenue sur FootballHub+ ! ⚽',
      html,
    });
  }

  // Ticket confirmation email
  static async sendTicketEmail(ticket) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .ticket { background: linear-gradient(135deg, #1A1915 0%, #2D2A25 100%); color: white; padding: 30px; border-radius: 16px; margin: 20px 0; }
          .ticket-number { font-size: 24px; font-weight: bold; color: #F9D406; margin-bottom: 20px; }
          .qr-code { text-align: center; background: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
          .event-details { line-height: 1.8; }
          .button { display: inline-block; padding: 12px 30px; background: #F9D406; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Votre Billet FootballHub+</h2>
          <div class="ticket">
            <div class="ticket-number">${ticket.ticketNumber}</div>
            <div class="event-details">
              <p><strong>Événement:</strong> ${ticket.event.title}</p>
              <p><strong>Date:</strong> ${new Date(ticket.event.startDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Lieu:</strong> ${ticket.event.venue.name}</p>
              <p><strong>Type:</strong> ${ticket.ticketType}</p>
              ${ticket.seating ? `<p><strong>Section:</strong> ${ticket.seating.section} - Rangée ${ticket.seating.row} - Siège ${ticket.seating.seat}</p>` : ''}
            </div>
            <div class="qr-code">
              <img src="${ticket.qrCode}" alt="QR Code" style="max-width: 200px;" />
            </div>
          </div>
          <p>Présentez ce QR code à l'entrée du stade.</p>
          <a href="https://footballhub.ma/tickets/${ticket._id}" class="button">Voir mon billet</a>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: ticket.member.email,
      subject: `Votre billet pour ${ticket.event.title} 🎫`,
      html,
    });
  }

  // Password reset email
  static async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `https://footballhub.ma/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .button { display: inline-block; padding: 12px 30px; background: #F9D406; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Réinitialisation de mot de passe</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
          <div class="warning">
            <p><strong>⚠️ Important :</strong></p>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - FootballHub+',
      html,
    });
  }

  // Order confirmation email
  static async sendOrderConfirmationEmail(order) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price} DH</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; }
          .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total { font-size: 20px; font-weight: bold; color: #F9D406; text-align: right; padding: 15px 0; border-top: 2px solid #F9D406; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Commande confirmée ! 🎉</h2>
          <p>Merci pour votre commande #${order.orderNumber}</p>
          
          <table class="order-table">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px; text-align: left;">Produit</th>
                <th style="padding: 10px; text-align: center;">Quantité</th>
                <th style="padding: 10px; text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="total">
            Total: ${order.total} DH
          </div>
          
          <p>Votre commande sera livrée à :</p>
          <p>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}
          </p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: order.user.email,
      subject: `Commande #${order.orderNumber} confirmée ! 📦`,
      html,
    });
  }
}

module.exports = EmailService;
```

Suite dans le prochain fichier avec API Football, Redis Cache, WebSockets ! 🚀
