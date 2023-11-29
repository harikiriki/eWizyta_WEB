import React, { useState } from 'react';
import { auth } from '../firebaseConfig/Firebase';
import {Link, useNavigate} from "react-router-dom";
import '../styles/Login.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                console.log('Zalogowano pomyślnie!');
                navigate('/')
            })
            .catch(error => {
                console.error('Błąd logowania:', error);
            });
    };

    return (
        <div className="login-container">
            <h2>Logowanie</h2>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>
                Zaloguj się
            </button>
            <p>Zapomniałeś hasła? <Link to="/forgot-password" className="site-title">Zresetuj je!</Link></p>
            <p>Nie masz jeszcze konta? <Link to="/register" className="site-title">Zarejestuj się!</Link></p>

        </div>
    );
}

export default Login;
