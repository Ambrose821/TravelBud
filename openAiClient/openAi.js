
const dotenv = require('dotenv')
dotenv.config({path: '../config/config.env'})
const OpenAIApi = require('openai');

const openaiClient = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
})




module.exports = openaiClient;