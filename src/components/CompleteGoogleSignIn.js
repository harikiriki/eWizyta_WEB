import React, {useEffect, useState} from 'react';
import {database, auth} from '../firebaseConfig/Firebase'; // Załóżmy, że są już odpowiednie importy
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/Login.css';
import {useLocation, useNavigate} from 'react-router-dom';

function CompleteGoogleSignIn() {
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState(null);
    const [gender, setGender] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState(''); // Dodane
    const [lastName, setLastName] = useState(''); // Dodane
    const navigate = useNavigate();

    useEffect(() => {
        const googleUser = JSON.parse(localStorage.getItem('googleUser'));
        if (!googleUser) {
            navigate('/login');
        } else {
            setEmail(googleUser.email);
            const fullName = googleUser.displayName.split(' '); // Rozdzielenie imienia i nazwiska
            if (fullName.length > 1) {
                setName(fullName[0]); // Ustawienie pierwszego elementu jako imię
                setLastName(fullName.slice(1).join(' ')); // Połączenie pozostałych elementów jako nazwisko
            } else {
                setName(googleUser.displayName); // W przypadku tylko jednego słowa, ustaw jako imię
            }
            localStorage.removeItem('googleUser');
        }
    }, [navigate]);

    const saveUserData = () => {
        if (!phone || !birthDate || !gender) {
            alert("Please complete all fields!");
            return;
        }

        // Formatowanie daty urodzenia do DD/MM/RRRR
        const formattedDate = birthDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const uid = auth.currentUser.uid;
        const user = {
            name,
            lastName,
            email,
            phone,
            birthDate: formattedDate, // Używamy sformatowanej daty
            gender,
            notifications: true
        };

        database.ref(`Users/${uid}`).set(user)
            .then(() => {
                navigate('/home'); // Zaktualizowane przekierowanie
            })
            .catch(error => {
                alert("Error saving user details: " + error.message);
            });
    };


    return (
        <div className="login-container">
            <input
                type="text"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <DatePicker
                selected={birthDate}
                onChange={(date) => setBirthDate(date)}
                dateFormat="dd/MM/yyyy"
            />
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Płeć</option>
                <option value="Mężczyzna">Mężczyzna</option>
                <option value="Kobieta">Kobieta</option>
                <option value="Inna">Inna</option>
            </select>
            <button onClick={saveUserData}>
                Zarejestruj
            </button>
        </div>
    );
}

export default CompleteGoogleSignIn;
