require('dotenv').config()
const express = require('express')
const cors = require('cors')

const tokenVerification = require('./middleware/tokenVerification')
const userRoutes = require("./routes/users")
const authRoutes = require("./routes/auth")
const booksRoutes = require('./routes/books')
const connection = require('./db')

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/books", booksRoutes)

connection()

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Nasłuchiwanie na porcie ${port}`))
