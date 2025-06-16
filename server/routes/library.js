const router = require('express').Router();
const { Book, User, ReadBook } = require('../models/user');
const tokenVerification = require('../middleware/tokenVerification');

//wszystkie książki
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ data: books });
  } catch (error) {
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

//dodanie nowej książki
router.post('/', async (req, res) => {
  try {
    const { title, author, description, rating } = req.body;

    if (!title || !author || !description || rating == null) {
      return res.status(400).json({ message: 'Brakuje wymaganych pól.' });
    }

    if (typeof title !== 'string' || title.trim().length < 2) {
      return res.status(400).json({ message: 'Tytuł musi mieć co najmniej 2 znaki.' });
    }

    if (typeof author !== 'string' || author.trim().length < 2) {
      return res.status(400).json({ message: 'Autor musi mieć co najmniej 2 znaki.' });
    }

    if (typeof description !== 'string' || description.trim().length < 10) {
      return res.status(400).json({ message: 'Opis musi mieć co najmniej 10 znaków.' });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 10) {
      return res.status(400).json({ message: 'Ocena musi być liczbą od 1 do 10.' });
    }

    const newBook = new Book({
      title: title.trim(),
      author: author.trim(),
      description: description.trim(),
      rating
    });

    const saved = await newBook.save();
    res.status(201).json({ data: saved });

  } catch (error) {
    console.error('Błąd serwera przy tworzeniu książki:', error);
    res.status(500).json({ message: 'Błąd serwera.' });
  }
});

//oznaczenie książki jako przeczytanej
router.post('/read/:bookId', tokenVerification, async (req, res) => {
  try {
    const userId = req.user._id;
    const bookId = req.params.bookId;

    if (!bookId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Nieprawidłowe ID książki.' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Książka nie znaleziona' });
    }

    const existingRead = await ReadBook.findOne({
      userId,
      bookTitle: book.title,
      author: book.author
    });

    if (existingRead) {
      return res.status(400).json({ message: 'Ta książka została już oznaczona jako przeczytana.' });
    }

    const readBook = new ReadBook({
      userId,
      bookTitle: book.title,
      author: book.author,
      rating: book.rating,
      description: book.description
    });

    await readBook.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }

    if (!user.readBooks.includes(readBook._id)) {
      user.readBooks.push(readBook._id);
      await user.save();
    }

    res.status(201).json({ message: 'Dodano do przeczytanych książek', readBook });

  } catch (error) {
    console.error("Błąd serwera przy dodawaniu książki do przeczytanych:", error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

module.exports = router;
