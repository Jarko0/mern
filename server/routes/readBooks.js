const router = require('express').Router();
const { ReadBook } = require('../models/user');
const tokenVerification = require('../middleware/tokenVerification');

// Pobierz wszystkie książki użytkownika
router.get('/', tokenVerification, async (req, res) => {
    try {
        const books = await ReadBook.find({ userId: req.user._id });
        res.status(200).json({ data: books });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Dodaj nową książkę do przeczytanych
router.post('/add', tokenVerification, async (req, res) => {
    console.log("➡️ Otrzymano żądanie dodania książki");
    console.log("📝 Dane książki:", req.body);

    try {
        const { title, author, rating, review } = req.body;

        // Sprawdź, czy wymagane pola istnieją
        if (!title || !author) {
            return res.status(400).json({ error: "Brakuje pola title lub author" });
        }

        const book = new ReadBook({
            userId: req.user._id, // z tokenVerification
            bookTitle: title,
            author,
            rating,
            reviewText: review
        });

        const savedBook = await book.save();
        console.log("✅ Książka zapisana:", savedBook);
        res.status(201).json(savedBook);
    } catch (err) {
        console.error("❌ Błąd podczas dodawania książki:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', tokenVerification, async (req, res) => {
    try {
        const book = await ReadBook.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Książka nie znaleziona.' });
        if (book.userId.toString() !== req.user._id) return res.status(403).json({ message: 'Brak dostępu.' });

        const { title, author, dateRead, rating, review } = req.body;
        if (title) book.title = title;
        if (author) book.author = author;
        if (dateRead) book.dateRead = dateRead;
        if (rating) book.rating = rating;
        if (review) book.review = review;

        await book.save();
        res.status(200).json({ message: 'Zaktualizowano książkę.', data: book });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

router.delete('/:id', tokenVerification, async (req, res) => {
    try {
        const book = await ReadBook.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Książka nie znaleziona.' });
        if (book.userId.toString() !== req.user._id) return res.status(403).json({ message: 'Brak dostępu.' });

        await book.deleteOne();
        res.status(200).json({ message: 'Usunięto książkę z przeczytanych.' });
    } catch (error) {
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});


router.post('/:readBookId/opinion', tokenVerification, async (req, res) => {
  try {
    const { readBookId } = req.params;
    const { reviewText } = req.body;
    const userId = req.user._id;

    const readBook = await ReadBook.findOne({ _id: readBookId, userId });

    if (!readBook) {
      return res.status(404).json({ message: 'Nie znaleziono przeczytanej książki dla tego użytkownika.' });
    }

    readBook.reviewText = reviewText;
    await readBook.save();

    res.json({ message: 'Opinia zapisana.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});








module.exports = router;
