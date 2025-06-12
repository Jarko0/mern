const router = require('express').Router();
const { Book, User, ReadBook } = require('../models/user');
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


router.post('/read/:bookId', tokenVerification, async (req, res) => {
  try {
    const userId = req.user._id; // <-- UPEWNIJ SIĘ, że to jest ._id, NIE req.userId
    const bookId = req.params.bookId;

    console.log("📥 userId:", userId);
    console.log("📘 bookId:", bookId);

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Książka nie znaleziona' });

    console.log("📗 book znaleziony:", book);

    const readBook = new ReadBook({
      userId,
      bookTitle: book.title,
      author: book.author
    });

    console.log("📝 Tworzony ReadBook:", readBook);

    await readBook.save();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony' });

    if (!user.readBooks.includes(readBook._id)) {
      user.readBooks.push(readBook._id);
      await user.save();
    }

    res.status(201).json({ message: 'Dodano do przeczytanych książek', readBook });
  } catch (error) {
    console.error("❌ Błąd serwera przy dodawaniu książki do przeczytanych:", error);
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

// router.delete("/:id", tokenVerification, async (req, res) => {
//   try {
//     const deleted = await Book.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Książka nie została znaleziona." });
//     }
//     res.json({ message: "Książka usunięta." });
//   } catch (err) {
//     res.status(500).json({ message: "Błąd serwera podczas usuwania książki." });
//   }
// });


module.exports = router;
