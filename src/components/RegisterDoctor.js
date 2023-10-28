// import React, { useState } from 'react';
// import { auth, database } from '../firebaseConfig/Firebase';
// import { useNavigate } from "react-router-dom";
// import User from '../User';
//
// function RegisterDoctor() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [name, setName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [phone, setPhone] = useState('');
//     const [birthDate, setBirthDate] = useState('');
//     const [gender, setGender] = useState('');
//     const navigate = useNavigate();
//     const [message, setMessage] = useState("");
//
//     const transformDate = (date) => {
//         const [year, month, day] = date.split('-');
//         return `${day}-${month}-${year}`;
//     };
//
//     const handleRegister = () => {
//         if (email && password && name && lastName && phone && birthDate && gender) {
//             if (email.includes('@')) {
//                 auth.createUserWithEmailAndPassword(email, password)
//                     .then(authResult => {
//                         const uid = authResult.user.uid;
//                         const transformedDate = transformDate(birthDate);
//                         const user = new User(name, lastName, email, password, phone, transformedDate, gender);
//                         return database.ref(`Users/${uid}`).set(user);
//                     })
//                     .then(() => {
//                         console.log('Pomyślna rejestracja!');
//                     })
//                     .catch(error => {
//                         console.error('Błąd rejestracji:', error);
//                     });
//             } else {
//                 console.log('Niewłaściwy e-mail!');
//             }
//         } else {
//             console.log('Uzupełnij wszystkie pola!');
//         }
//     };
//
//
//     return (
//         <div className="register-container">
//             <h2>Rejestracja</h2>
//
//             <input
//                 type="text"
//                 placeholder="Imię"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//             />
//
//             <input
//                 type="text"
//                 placeholder="Nazwisko"
//                 value={lastName}
//                 onChange={(e) => setLastName(e.target.value)}
//             />
//
//             <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//             />
//
//             <input
//                 type="password"
//                 placeholder="Hasło"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//             />
//
//             <input
//                 type="text"
//                 placeholder="Telefon"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//             />
//
//             <input
//                 type="date"
//                 placeholder="Data urodzenia"
//                 value={birthDate}
//                 onChange={(e) => setBirthDate(e.target.value)}
//             />
//
//             <select
//                 value={gender}
//                 onChange={(e) => setGender(e.target.value)}
//             >
//                 <option value="">Płeć</option>
//                 <option value="Mężczyzna">Mężczyzna</option>
//                 <option value="Kobieta">Kobieta</option>
//                 <option value="Inna">Inna</option>
//             </select>
//
//             <button onClick={handleRegister}>
//                 Zarejestruj się
//             </button>
//         </div>
//     );
// }
//
// export default Register;

import React, { useState } from 'react';
import { auth, database } from '../firebaseConfig/Firebase';
import { useNavigate } from "react-router-dom";
import Doctor from '../Doctor';

function RegisterDoctor() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [pwz, setPwz] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [address, setAddress] = useState('');
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    const transformDate = (date) => {
        const [year, month, day] = date.split('-');
        return `${day}-${month}-${year}`;
    };

    const handleRegister = () => {
        if (email && password && name && lastName && phone && birthDate && gender && pwz && specialization && address) {
            if (email.includes('@')) {
                auth.createUserWithEmailAndPassword(email, password)
                    .then(authResult => {
                        const uid = authResult.user.uid;
                        const transformedDate = transformDate(birthDate);
                        const doctor = new Doctor(name, lastName, email, password, phone, transformedDate, gender, pwz, specialization, "100 PLN", true, address);
                        return database.ref(`Doctors/${uid}`).set(doctor);
                    })
                    .then(() => {
                        console.log('Pomyślna rejestracja!');
                        navigate('/login'); // Przeniesienie do strony logowania po udanej rejestracji
                    })
                    .catch(error => {
                        console.error('Błąd rejestracji:', error);
                    });
            } else {
                console.log('Niewłaściwy e-mail!');
            }
        } else {
            console.log('Uzupełnij wszystkie pola!');
        }
    };

    return (
        <div className="register-container">
            <h2>Rejestracja dla lekarza</h2>

            <input type="text" placeholder="Imię" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="Nazwisko" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input type="text" placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="date" placeholder="Data urodzenia" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Płeć</option>
                <option value="Mężczyzna">Mężczyzna</option>
                <option value="Kobieta">Kobieta</option>
                <option value="Inna">Inna</option>
            </select>
            <input type="text" placeholder="PWZ" value={pwz} onChange={(e) => setPwz(e.target.value)} />
            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
                <option value="">Specjalizacja</option>
                <option value="Alergolog">Alergolog</option>
                <option value="Chirurg">Chirurg</option>
                <option value="Chirurg">Dermatolog</option>
                <option value="Chirurg">Endokrynolog</option>
                <option value="Chirurg">Hepatolog</option>
                <option value="Chirurg">Kardiolog</option>
                <option value="Chirurg">Neurolog</option>
                <option value="Chirurg">Ortopeda</option>
                <option value="Chirurg">Okulista</option>
                <option value="Chirurg">Onkolog</option>
                <option value="Chirurg">Psychiatra</option>
                <option value="Chirurg">Urolog</option>
            </select>
            <input type="text" placeholder="Adres" value={address} onChange={(e) => setAddress(e.target.value)} />

            <button onClick={handleRegister}>
                Zarejestruj się
            </button>
        </div>
    );
}

export default RegisterDoctor;
