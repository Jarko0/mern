require('dotenv').config()
const express = require('express')
const cors = require('cors')
const tokenVerification = require('./middleware/tokenVerification')

const app = express()

app.get("/api/users/",tokenVerification)
app.use(express.json())
app.use(cors())

const userRoutes = require("./routes/users")
const authRoutes = require("./routes/auth")

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)

const connection = require('./db')
connection()

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Nasłuchiwanie na porcie ${port}`))


