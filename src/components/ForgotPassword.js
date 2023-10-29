import React, { useState } from 'react';
import { auth } from '../firebaseConfig/Firebase';
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = () => {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                setMessage('Link do resetowania hasła został wysłany na Twój email!');
                // Przekierowanie na stronę logowania po chwili od wysłania maila
                setTimeout(() => {
                   navigate('/login');
                }, 5000);
            })
            .catch(error => {
                setMessage('Wystąpił błąd: ' + error.message);
            });
    };

    return (
        <div className="reset-password-container">
            <h2>Wpisz swój adres mailowy w celu zresetowania hasła</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={handleResetPassword}>
                Wyślij link do resetowania
            </button>

            {message && <p>{message}</p>}

            <p>Pamiętasz hasło? <Link to="/login" className="site-title">Zaloguj się!</Link></p>
            <p>Nie masz jeszcze konta? <Link to="/register" className="site-title">Zarejestruj się!</Link></p>
        </div>
    );
}

export default ForgotPassword;
