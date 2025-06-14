const router = require('express').Router();
const { ReadBook } = require('../models/user');
const tokenVerification = require('../middleware/tokenVerification');

// GET przeczytane książki użytkownika
router.get('/', tokenVerification, async (req, res) => {
  try {
    const books = await ReadBook.find({ userId: req.user._id });
    res.status(200).json({ data: books });
  } catch (error) {
    console.error('Błąd podczas pobierania przeczytanych książek:', error);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

// PUT - aktualizacja przeczytanej książki
router.put('/:id', tokenVerification, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Nieprawidłowe ID książki.' });
    }

    const book = await ReadBook.findById(id);
    if (!book) return res.status(404).json({ message: 'Książka nie znaleziona.' });
    if (book.userId.toString() !== req.user._id) return res.status(403).json({ message: 'Brak dostępu.' });

    const { title, author, dateRead, rating, review } = req.body;

    if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2)) {
      return res.status(400).json({ message: 'Tytuł musi mieć co najmniej 2 znaki.' });
    }

    if (author !== undefined && (typeof author !== 'string' || author.trim().length < 2)) {
      return res.status(400).json({ message: 'Autor musi mieć co najmniej 2 znaki.' });
    }

    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 10)) {
      return res.status(400).json({ message: 'Ocena musi być liczbą od 1 do 10.' });
    }

    if (review !== undefined && typeof review !== 'string') {
      return res.status(400).json({ message: 'Recenzja musi być tekstem.' });
    }

    if (dateRead !== undefined && isNaN(Date.parse(dateRead))) {
      return res.status(400).json({ message: 'Nieprawidłowy format daty.' });
    }

    if (title) book.title = title.trim();
    if (author) book.author = author.trim();
    if (dateRead) book.dateRead = new Date(dateRead);
    if (rating != null) book.rating = rating;
    if (review) book.review = review.trim();

    await book.save();
    res.status(200).json({ message: 'Zaktualizowano książkę.', data: book });

  } catch (error) {
    console.error('Błąd podczas aktualizacji książki:', error);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

// DELETE przeczytanej książki
router.delete('/:id', tokenVerification, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Nieprawidłowe ID książki.' });
    }

    const book = await ReadBook.findById(id);
    if (!book) return res.status(404).json({ message: 'Książka nie znaleziona.' });
    if (book.userId.toString() !== req.user._id) return res.status(403).json({ message: 'Brak dostępu.' });

    await book.deleteOne();
    res.status(200).json({ message: 'Usunięto książkę z przeczytanych.' });

  } catch (error) {
    console.error('Błąd podczas usuwania książki:', error);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

// POST opinia do przeczytanej książki
router.post('/:readBookId/opinion', tokenVerification, async (req, res) => {
  try {
    const { readBookId } = req.params;
    const { reviewText } = req.body;
    const userId = req.user._id;

    if (!readBookId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Nieprawidłowe ID książki.' });
    }

    if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length < 5) {
      return res.status(400).json({ message: 'Opinia musi zawierać co najmniej 5 znaków.' });
    }

    const readBook = await ReadBook.findOne({ _id: readBookId, userId });

    if (!readBook) {
      return res.status(404).json({ message: 'Nie znaleziono przeczytanej książki dla tego użytkownika.' });
    }

    readBook.reviewText = reviewText.trim();
    await readBook.save();

    res.status(200).json({ message: 'Opinia zapisana.' });

  } catch (err) {
    console.error('Błąd przy dodawaniu opinii:', err);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

module.exports = router;
