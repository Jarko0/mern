import { Route, Routes, Navigate } from "react-router-dom"
import Main from "./components/Main"
import Signup from "./components/Signup"
import Login from "./components/Login"
import AddBook from "./components/Main/books.jsx"  // import komponentu dodawania książki

function App() {
  const user = localStorage.getItem("token")

  return (
    <Routes>
      {user && <Route path="/" exact element={<Main />} />}
      {user && <Route path="/add-book" exact element={<AddBook />} />}  {/* nowa ścieżka */}
      <Route path="/signup" exact element={<Signup />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="*" element={<Navigate replace to={user ? "/" : "/login"} />} />
    </Routes>
  )
}

export default App
