const router = require('express').Router();
const { Book, User } = require('../models/user');
const tokenVerification = require('../middleware/tokenVerification');

// Pobierz wszystkie książki
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ data: books });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, author, description, rating } = req.body;
    if (!title || !author || !description || !rating) return res.status(400).json({ message: 'Brakuje wymaganych pól.' });

    const newBook = new Book({ title, author, description, rating });
    const saved = await newBook.save();
    res.status(201).json({ data: saved });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});


// Pobierz listę przeczytanych książek zalogowanego użytkownika
router.post('/read/:bookId', tokenVerification, async (req, res) => {
  try {
    const userId = req.userId; 
    const bookId = req.params.bookId;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Książka nie znaleziona' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });

    if (!user.readBooks.includes(bookId)) {
      user.readBooks.push(bookId);
      await user.save();
    }

    res.status(200).json({ message: 'Dodano do przeczytanych książek' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

router.get('/read', tokenVerification, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('readBooks');
    if (!user) return res.status(404).json({ message: "Użytkownik nie znaleziony." });

    res.status(200).json({ data: user.readBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Błąd serwera." });
  }
});

router.delete("/:id", tokenVerification, async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Książka nie została znaleziona." });
    }
    res.json({ message: "Książka usunięta." });
  } catch (err) {
    res.status(500).json({ message: "Błąd serwera podczas usuwania książki." });
  }
});


module.exports = router;
