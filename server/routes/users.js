const router = require("express").Router()
const { User, validate } = require("../models/user")
const bcrypt = require("bcrypt")
const tokenVerification = require("../middleware/tokenVerification")

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body)
        if (error)
            return res.status(400).send({ message: error.details[0].message })
        const user = await User.findOne({ email: req.body.email })
        if (user)
            return res
                .status(409)
                .send({ message: "User with given email already Exist!" })
        const salt = await bcrypt.genSalt(Number(process.env.SALT))
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        await new User({ ...req.body, password: hashPassword }).save()
        res.status(201).send({ message: "User created successfully" })
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" })
    }
})

router.get("/", async (req, res) => {   
    User.find().exec()
        .then(async () => {
            const users = await User.find();
            res.status(200).send({ data: users, message: "Lista użytkowników" });
        })
        .catch(error => {
            res.status(500).send({ message: error.message });
        });
})

router.get("/details", tokenVerification, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).send({ message: "Użytkownik nie znaleziony." });
        }

        res.status(200).send({
            message: "Szczegóły konta:",
            data: user
        });
    } catch (error) {
        console.error("Błąd przy pobieraniu szczegółów konta:", error);
        res.status(500).send({ message: "Błąd serwera." });
    }
});

router.delete("/delete", tokenVerification, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user._id);
        if (!deletedUser) {
            return res.status(404).send({ message: "Użytkownik nie znaleziony." });
        }

        res.status(200).send({ message: "Konto zostało usunięte." });
    } catch (error) {
        console.error("Błąd podczas usuwania konta:", error);
        res.status(500).send({ message: "Błąd serwera." });
    }
});




module.exports = router