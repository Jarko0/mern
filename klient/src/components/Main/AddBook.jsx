import { useState } from "react";
import axios from "axios";

function AddBook({ onBookAdded }) {
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    rating: "",
    description: "",
  });

  const token = localStorage.getItem("token");

  const handleAddBook = async () => {
    if (!newBook.title.trim() || !newBook.author.trim() || !newBook.rating.trim() || !newBook.description.trim()) {
      alert("Wszystkie dane są wymagane.");
      return;
    }

    const ratingNum = newBook.rating ? Number(newBook.rating) : null;
    if (ratingNum !== null && (ratingNum < 1 || ratingNum > 5)) {
      alert("Ocena musi być liczbą od 1 do 5.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/library/",
        {
          title: newBook.title,
          author: newBook.author,
          rating: newBook.rating,
          description: newBook.description,
        },
        { headers: { "x-access-token": token } }
      );

      setNewBook({ title: "", author: "", rating: "", description: "" });
      alert("Książka dodana!");

      if (onBookAdded) onBookAdded();
    } catch (error) {
      console.error("Błąd dodawania książki:", error.response || error.message);
      alert("Wystąpił błąd podczas dodawania książki.");
    }
  };

  return (
    <div>
      <h2>Dodaj książkę</h2>
      <input
        type="text"
        placeholder="Tytuł"
        value={newBook.title}
        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
      />
      <input
        type="text"
        placeholder="Autor"
        value={newBook.author}
        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
      />
      <input
        type="number"
        placeholder="Ocena (1-5)"
        value={newBook.rating}
        onChange={(e) => setNewBook({ ...newBook, rating: e.target.value })}
        min="1"
        max="5"
      />
      <textarea
        placeholder="Opis"
        value={newBook.description}
        onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
      />
      <button onClick={handleAddBook}>Dodaj książkę</button>
    </div>
  );
}

export default AddBook;
