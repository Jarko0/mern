import { useEffect, useState } from "react";
import axios from "axios";

function Books({ reloadTrigger }) {
  const [books, setBooks] = useState([]);
  const token = localStorage.getItem("token");

  const fetchBooks = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/library", {
        headers: { "x-access-token": token },
      });
      setBooks(res.data.data);
    } catch (error) {
      console.error("Błąd pobierania książek:", error);
    }
  };

  const markAsRead = async (bookId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/library/read/${bookId}`,
        {},
        { headers: { "x-access-token": token } }
      );
      alert("Dodano do listy przeczytanych książek!");
    } catch (error) {
      console.error("Błąd dodawania do przeczytanych:", error.response?.data || error.message);
      alert(`Nie udało się dodać do przeczytanych: ${error.response?.data?.message || error.message}`);
    }
  };



  useEffect(() => {
    fetchBooks();
  }, [reloadTrigger]); // <- reaguje na zmianę


  return (
    <div className="books-container">
      <h2>Książki</h2>
      <div className="books-list">
        {books.map((book) => (
          <div className="book-card" key={book._id}>
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author"><em>{book.author}</em></p>
            {book.year && <p className="book-year">Rok wydania: {book.year}</p>}
            {book.description && <p className="book-description">{book.description}</p>}
            <button className="read-button" onClick={() => markAsRead(book._id)}>
              Dodaj do przeczytanych
            </button>
            {/* <button className="delete-button" onClick={() => deleteBook(book._id)}>
              Usuń książkę
            </button> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Books;
