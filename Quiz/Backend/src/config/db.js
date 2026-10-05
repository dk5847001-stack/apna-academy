const mongoose = require('mongoose')

async function connectDatabase(uri) {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  })
  console.log('Quiz MongoDB connected')
}

module.exports = { connectDatabase }
