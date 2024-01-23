const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config();
const cors = require('cors');
const router = require('./router');
const app = express()

app.use(cors())
app.use(express.json())
app.use(router)


const start = async () => {
  try {
    await mongoose.connect(process.env.DATA_BASE_URL)
    app.listen(3000, () => console.log('Server has started successfully'))
  } catch (error) {
    console.log(error)
  }
}

start().catch(console.log)