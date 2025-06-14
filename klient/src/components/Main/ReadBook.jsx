import { useEffect, useState, useCallback } from "react";
import axios from "axios";

function ReadBooks() {
  const [readBooks, setReadBooks] = useState([]);
  const [reviews, setReviews] = useState({});
  const [editingReview, setEditingReview] = useState({});
  const token = localStorage.getItem("token");

  const fetchReadBooks = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/readBooks", {
        headers: { "x-access-token": token },
      });

      const books = res.data.data;
      setReadBooks(books);

      const initialReviews = {};
      const initialEditing = {};
      books.forEach((book) => {
        initialReviews[book._id] = book.reviewText || "";
        initialEditing[book._id] = false;
      });
      setReviews(initialReviews);
      setEditingReview(initialEditing);
    } catch (err) {
      console.error("Błąd pobierania przeczytanych książek:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchReadBooks();
  }, [fetchReadBooks]);

  const handleReviewChange = (bookId, value) => {
    setReviews((prev) => ({ ...prev, [bookId]: value }));
  };

  const submitReview = async (bookId) => {
    const text = reviews[bookId]?.trim();

    if (!text || text.length < 5) {
      alert("Opinia musi zawierać co najmniej 5 znaków.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8080/api/readBooks/${bookId}/opinion`,
        { reviewText: text },
        { headers: { "x-access-token": token } }
      );
      alert("Opinia została zapisana!");
      setEditingReview((prev) => ({ ...prev, [bookId]: false }));
      fetchReadBooks();
    } catch (error) {
      console.error("Błąd dodawania opinii:", error.response?.data || error.message);
      alert("Nie udało się dodać opinii.");
    }
  };

  const handleDeleteReadBook = async (bookId) => {
    const confirmDelete = window.confirm("Czy na pewno chcesz usunąć tę książkę z listy przeczytanych?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/readBooks/${bookId}`, {
        headers: { "x-access-token": token },
      });
      alert("Książka została usunięta z listy przeczytanych.");
      fetchReadBooks();
    } catch (error) {
      console.error("Błąd usuwania książki:", error.response?.data || error.message);
      alert("Nie udało się usunąć książki.");
    }
  };

  return (
    <div>
      <h2>Przeczytane książki</h2>
      <ul>
        {readBooks.map((book) => (
          <li
            key={book._id}
            style={{
              marginBottom: "2rem",
              borderBottom: "1px solid #ccc",
              paddingBottom: "1rem",
            }}
          >
            <h3>{book.bookTitle}</h3>
            <p><strong>Autor:</strong> {book.author}</p>

            {book.dateRead && (
              <p><strong>Data przeczytania:</strong> {new Date(book.dateRead).toLocaleDateString("pl-PL")}</p>
            )}
            {book.rating && (
              <p><strong>Ocena:</strong> {book.rating}</p>
            )}
            {book.description && (
              <p><strong>Opis:</strong> {book.description}</p>
            )}

            {editingReview[book._id] ? (
              <>
                <textarea
                  value={reviews[book._id] || ""}
                  onChange={(e) => handleReviewChange(book._id, e.target.value)}
                  rows={3}
                  style={{ width: "100%", marginTop: "0.5rem" }}
                />
                <div style={{ marginTop: "0.5rem" }}>
                  <button onClick={() => submitReview(book._id)}>
                    Zapisz opinię
                  </button>
                  <button
                    onClick={() =>
                      setEditingReview((prev) => ({ ...prev, [book._id]: false }))
                    }
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Anuluj
                  </button>
                </div>
              </>
            ) : (
              <>
                {book.reviewText && (
                  <p><strong>Opinia:</strong> {book.reviewText}</p>
                )}
                <div style={{ marginTop: "0.5rem" }}>
                  <button
                    onClick={() =>
                      setEditingReview((prev) => ({ ...prev, [book._id]: true }))
                    }
                  >
                    {book.reviewText ? "Edytuj opinię" : "Dodaj opinię"}
                  </button>
                  <button
                    onClick={() => handleDeleteReadBook(book._id)}
                    style={{
                      marginLeft: "0.5rem",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "0.3rem 0.6rem",
                      cursor: "pointer",
                    }}
                  >
                    Usuń z przeczytanych
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReadBooks;
