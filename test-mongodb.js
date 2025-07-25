// MongoDB Connection Test Script
const { MongoClient } = require('mongodb');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;

console.log('🔧 Testing MongoDB Connection...');
console.log('URI (masked):', uri?.replace(/:[^@]*@/, ':***@'));

async function testConnection() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database access
    const db = client.db('chemistry-lab');
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('🔌 Connection closed.');
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 8000) {
      console.log('\n🔍 Authentication failed. Possible solutions:');
      console.log('1. Check if the password is correct');
      console.log('2. Verify the username exists in MongoDB Atlas');
      console.log('3. Check database user permissions');
      console.log('4. Ensure your IP is whitelisted');
    }
  }
}

testConnection();
