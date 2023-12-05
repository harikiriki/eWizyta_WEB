import React, { useState } from 'react';
import {auth, googleAuthProvider, database} from '../firebaseConfig/Firebase';
import {Link, useNavigate} from "react-router-dom";
import '../styles/Login.css';
import ic_google from '../ic_google.png';

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

    const handleGoogleSignInClick = () => {
        auth.signInWithPopup(googleAuthProvider)
            .then((result) => {
                // Sprawdź, czy użytkownik istnieje w bazie danych
                const uid = result.user.uid;
                database.ref(`Users/${uid}`).once('value', snapshot => {
                    if (snapshot.exists()) {
                        // Użytkownik istnieje, przekieruj na stronę główną
                        navigate('/');
                    } else {
                        // Użytkownik nie istnieje, przechowaj dane i przekieruj do /google-sign-in
                        localStorage.setItem('googleUser', JSON.stringify(result.user));
                        navigate('/google-sign-in');
                    }
                });
            })
            .catch(error => {
                console.error('Błąd logowania przez Google:', error);
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
            <button id="ic_google" onClick={handleGoogleSignInClick}>
                <img src={ic_google} alt="Google Sign In" />
            </button>
            <p>Zapomniałeś hasła? <Link to="/forgot-password" className="site-title">Zresetuj je!</Link></p>
            <p>Nie masz jeszcze konta? <Link to="/register" className="site-title">Zarejestuj się!</Link></p>

        </div>
    );
}

export default Login;
