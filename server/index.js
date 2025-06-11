require('dotenv').config()
const express = require('express')
const cors = require('cors')

const tokenVerification = require('./middleware/tokenVerification')
const userRoutes = require("./routes/users")
const authRoutes = require("./routes/auth")
const readBooksRoutes = require('./routes/readBooks');
const libraryRoutes = require('./routes/library');
const connection = require('./db')

const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)
app.use('/api/readBooks', readBooksRoutes);
app.use('/api/library', libraryRoutes); // katalog książek


connection()

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Nasłuchiwanie na porcie ${port}`))
