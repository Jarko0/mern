import { useState } from "react";
import axios from "axios";
import styles from "./styles.module.css";
import Users from "./Users";

const Main = () => {
    const [dane, setDane] = useState([]); // lista użytkowników
    const [showUsers, setShowUsers] = useState(false);
    const [accountDetails, setAccountDetails] = useState(null); // dane aktualnego użytkownika
    const [message, setMessage] = useState(""); // komunikat z serwera

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    const handleGetUsers = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const config = {
                    method: 'get',
                    url: 'http://localhost:8080/api/users',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                };
                const { data: res } = await axios(config);
                setDane(res.data);           
                setMessage(res.message || "Lista użytkowników:");
                setShowUsers(true);
                setAccountDetails(null);
            } catch (error) {
                if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                    localStorage.removeItem("token");
                    window.location.reload();
                }
            }
        }
    };


    const handleGetAccountDetails = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const config = {
                    method: 'get',
                    url: 'http://localhost:8080/api/users/details',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                };
                console.log("Token:", token);
                const { data: res } = await axios(config);
                setAccountDetails(res.data);    
                setMessage(res.message || "Szczegóły konta:");
                setShowUsers(false);
                setDane([]);
            } catch (error) {
                console.error("Błąd w handleGetAccountDetails:", error.response || error.message);
                if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                    localStorage.removeItem("token");
                    window.location.reload();
                }
            }
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Czy na pewno chcesz usunąć swoje konto?");
        if (!confirmDelete) return;

        const token = localStorage.getItem("token");
        if (token) {
            try {
                const config = {
                    method: 'delete',
                    url: 'http://localhost:8080/api/users/delete',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': token
                    }
                };
                const { data: res } = await axios(config);
                alert(res.message || "Konto zostało usunięte.");
                localStorage.removeItem("token");
                window.location.reload();
            } catch (error) {
                if (error.response && error.response.status >= 400 && error.response.status <= 500) {
                    alert("Błąd przy usuwaniu konta.");
                    localStorage.removeItem("token");
                    window.location.reload();
                }
            }
        }
    };

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>MySite</h1>
                <div>
                    <button className={styles.white_btn} onClick={handleGetUsers}>Użytkownicy</button>
                    <button className={styles.white_btn} onClick={handleGetAccountDetails}>Szczegóły konta</button>
                    <button className={styles.white_btn} onClick={handleDeleteAccount}>Usuń konto</button>
                    <button className={styles.white_btn} onClick={handleLogout}>Wyloguj się</button>
                </div>
            </nav>

            {message && <h2>{message}</h2>}

            {showUsers && dane.length > 0 && <Users users={dane} />}
            {showUsers && dane.length === 0 && <p>Brak użytkowników do wyświetlenia.</p>}

            {accountDetails && (
                <div>
                    <ul>
                        <li><strong>First Name:</strong> {accountDetails.firstName}</li>
                        <li><strong>Last Name:</strong> {accountDetails.lastName}</li>
                        <li><strong>Email:</strong> {accountDetails.email}</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Main;
