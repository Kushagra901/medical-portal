const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Check if credentials are set and not the default placeholders
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                               process.env.CLOUDINARY_API_KEY &&
                               process.env.CLOUDINARY_API_KEY !== 'your_api_key' &&
                               process.env.CLOUDINARY_API_SECRET &&
                               process.env.CLOUDINARY_API_SECRET !== 'your_api_secret';

let storage;
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'medicare-portal',
      format: async () => 'jpg',
      transformation: [{ width: 400, height: 400, crop: "fill" }],
    },
  });
  console.log('✅ Cloudinary initialized successfully.');
} else {
  console.warn('⚠️ Cloudinary is not configured or using placeholders. Falling back to memory storage.');
  storage = multer.memoryStorage();
}

const upload = multer({ storage });
module.exports = { cloudinary: isCloudinaryConfigured ? cloudinary : null, upload, isCloudinaryConfigured };
