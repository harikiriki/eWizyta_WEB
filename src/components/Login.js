import React, { useState } from 'react';
import { auth } from '../firebaseConfig/Firebase';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                console.log('Zalogowano pomyślnie!');
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
        </div>
    );
}

export default Login;
