import { Route, Routes, Navigate } from "react-router-dom"
import Main from "./components/Main"
import Signup from "./components/Signup"
import Login from "./components/Login"
import AddBook from "./components/Main/AddBook.jsx";
import Books from "./components/Main/Books.jsx";
import ReadBooks from "./components/Main/ReadBook.jsx";


function App() {
  const user = localStorage.getItem("token")

  return (
    <Routes>
      {user && <Route path="/" exact element={<Main />} />}
      {user && <Route path="/books" element={<Books />} />}
      <Route path="/add-book" element={<AddBook />} /> 
      <Route path="/read-books" element={<ReadBooks />} /> 
      <Route path="/signup" exact element={<Signup />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="*" element={<Navigate replace to={user ? "/" : "/login"} />} />
    </Routes>
  )
}

export default App
