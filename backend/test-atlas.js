import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Atlas Connection...');
console.log('Connection URI:', uri ? uri.replace(/:([^@]+)@/, ':****@') : 'Not set');

if (!uri || uri.includes('YOUR_PASSWORD_HERE')) {
  console.log('❌ MONGODB_URI still contains placeholder "YOUR_PASSWORD_HERE".');
  console.log('👉 Please replace "YOUR_PASSWORD_HERE" in server/.env with your actual password for database user "madhavan7808_db_user".');
  process.exit(1);
}

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ SUCCESSFULLY CONNECTED TO MONGODB ATLAS!');
    console.log('📁 Database Name:', mongoose.connection.name);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB Atlas Connection Error:', err.message);
    process.exit(1);
  });
