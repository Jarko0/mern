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

      setReadBooks(res.data.data);

      const initialReviews = {};
      const initialEditing = {};
      res.data.data.forEach((readBook) => {
        initialReviews[readBook._id] = readBook.reviewText || "";
        initialEditing[readBook._id] = false;
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

  const handleReviewChange = (readBookId, value) => {
    setReviews((prev) => ({ ...prev, [readBookId]: value }));
  };

  const submitReview = async (readBookId) => {
    try {
      await axios.post(
        `http://localhost:8080/api/readBooks/${readBookId}/opinion`,
        { reviewText: reviews[readBookId] },
        { headers: { "x-access-token": token } }
      );
      alert("Opinia została zapisana!");
      setEditingReview((prev) => ({ ...prev, [readBookId]: false }));
      fetchReadBooks();
    } catch (error) {
      console.error("Błąd dodawania opinii:", error.response?.data || error.message);
      alert("Nie udało się dodać opinii.");
    }
  };

  const handleDeleteReadBook = async (readBookId) => {
  const confirmDelete = window.confirm("Czy na pewno chcesz usunąć tę książkę z listy przeczytanych?");
  if (!confirmDelete) return;

  try {
    await axios.delete(`http://localhost:8080/api/readBooks/${readBookId}`, {
      headers: { "x-access-token": token },
    });
    alert("Książka została usunięta z listy przeczytanych.");
    fetchReadBooks(); // Odśwież listę
  } catch (error) {
    console.error("Błąd usuwania książki:", error.response?.data || error.message);
    alert("Nie udało się usunąć książki.");
  }
};


 return (
  <div>
    <h2>Przeczytane książki</h2>
    <ul>
      {readBooks.map((readBook) => (
        <li
          key={readBook._id}
          style={{
            marginBottom: "2rem",
            borderBottom: "1px solid #ccc",
            paddingBottom: "1rem",
          }}
        >
          <h3>{readBook.bookTitle}</h3>
          <p><strong>Autor:</strong> {readBook.author}</p>

          {readBook.dateRead && (
            <p><strong>Data przeczytania:</strong> {new Date(readBook.dateRead).toLocaleDateString()}</p>
          )}
          {readBook.rating && (
            <p><strong>Ocena:</strong> {readBook.rating}</p>
          )}

          {editingReview[readBook._id] ? (
            <>
              <textarea
                value={reviews[readBook._id] || ""}
                onChange={(e) => handleReviewChange(readBook._id, e.target.value)}
                rows={3}
                style={{ width: "100%", marginTop: "0.5rem" }}
              />
              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => submitReview(readBook._id)}>
                  Zapisz opinię
                </button>
                <button
                  onClick={() =>
                    setEditingReview((prev) => ({ ...prev, [readBook._id]: false }))
                  }
                  style={{ marginLeft: "0.5rem" }}
                >
                  Anuluj
                </button>
              </div>
            </>
          ) : (
            <>
              {readBook.reviewText && (
                <p><strong>Opinia:</strong> {readBook.reviewText}</p>
              )}
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  onClick={() =>
                    setEditingReview((prev) => ({ ...prev, [readBook._id]: true }))
                  }
                >
                  {readBook.reviewText ? "Edytuj opinię" : "Dodaj opinię"}
                </button>
                <button
                  onClick={() => handleDeleteReadBook(readBook._id)}
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
