import { useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";

function AddBook({ onBookAdded }) {
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    rating: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const token = localStorage.getItem("token");

  const validate = () => {
    const validationErrors = {};
    if (!newBook.title.trim()) validationErrors.title = "Tytuł jest wymagany.";
    else if (newBook.title.trim().length < 2) validationErrors.title = "Tytuł musi mieć co najmniej 2 znaki.";

    if (!newBook.author.trim()) validationErrors.author = "Autor jest wymagany.";
    else if (newBook.author.trim().length < 2) validationErrors.author = "Autor musi mieć co najmniej 2 znaki.";

    const ratingNum = Number(newBook.rating);
    if (!newBook.rating.trim()) validationErrors.rating = "Ocena jest wymagana.";
    else if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      validationErrors.rating = "Ocena musi być liczbą od 1 do 5.";
    }

    if (!newBook.description.trim()) validationErrors.description = "Opis jest wymagany.";
    else if (newBook.description.trim().length < 10) {
      validationErrors.description = "Opis musi mieć co najmniej 10 znaków.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleAddBook = async () => {
    if (!validate()) return;

    try {
      await axios.post(
        "http://localhost:8080/api/library/",
        {
          title: newBook.title.trim(),
          author: newBook.author.trim(),
          rating: Number(newBook.rating),
          description: newBook.description.trim(),
        },
        { headers: { "x-access-token": token } }
      );

      setNewBook({ title: "", author: "", rating: "", description: "" });
      setErrors({});
      alert("Książka dodana!");

      if (onBookAdded) onBookAdded();
    } catch (error) {
      console.error("Błąd dodawania książki:", error.response || error.message);
      alert("Wystąpił błąd podczas dodawania książki.");
    }
  };

  return (
    <div className={styles.form_container}>
      <h2 className={styles.form_title}>Dodaj książkę</h2>

      <input className={styles.input} type="text" placeholder="Tytuł" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}/>
      {errors.title && <p className={styles.error}>{errors.title}</p>}
      <input className={styles.input} type="text" placeholder="Autor" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}/>
      {errors.author && <p className={styles.error}>{errors.author}</p>}
      <input className={styles.input} type="number" placeholder="Ocena (1-5)" value={newBook.rating} onChange={(e) => setNewBook({ ...newBook, rating: e.target.value })} min="1" max="5"/>
      {errors.rating && <p className={styles.error}>{errors.rating}</p>}

      <textarea className={styles.textarea} placeholder="Opis" value={newBook.description} onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}/>
      {errors.description && <p className={styles.error}>{errors.description}</p>}
      <button className={styles.submit_btn} onClick={handleAddBook}> Dodaj książkę </button>
    </div>
  );
}

export default AddBook;
