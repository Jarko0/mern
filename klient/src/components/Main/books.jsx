import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./styles.module.css";

function ReadBooks() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: '', author: '', rating: '', review: '' });

  const token = localStorage.getItem('token');

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/books', {
        headers: { 'x-access-token': token },
      });
      setBooks(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/books/add', form, {
        headers: { 'x-access-token': token },
      });
      fetchBooks();
      setForm({ title: '', author: '', rating: '', review: '' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h2>Moje przeczytane książki</h2>
      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Tytuł" value={form.title} onChange={handleChange} required />
        <input name="author" placeholder="Autor" value={form.author} onChange={handleChange} />
        <input name="rating" type="number" min="1" max="5" placeholder="Ocena 1-5" value={form.rating} onChange={handleChange} />
        <textarea name="review" placeholder="Twoja opinia" value={form.review} onChange={handleChange} />
        <button type="submit">Dodaj książkę</button>
      </form>

      <ul>
        {books.map(book => (
          <li key={book._id}>
            <strong>{book.title}</strong> - {book.author} | Ocena: {book.rating} <br />
            Opinia: {book.review}
            {/* Tutaj można dodać edycję i usuwanie */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReadBooks;
