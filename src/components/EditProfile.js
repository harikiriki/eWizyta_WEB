// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { auth, database } from '../firebaseConfig/Firebase';
// import '../styles/EditProfile.css';
//
// function EditProfile() {
//     const currentUser = auth.currentUser;
//     const currentUserUid = currentUser.uid;
//     const usersRef = database.ref(`Users/${currentUserUid}`);
//     const doctorsRef = database.ref(`Doctors/${currentUserUid}`);
//
//     const [isDoctor, setIsDoctor] = useState(false);
//     const [userData, setUserData] = useState({
//         name: "",
//         lastName: "",
//         email: "",
//         phone: "",
//         birthDate: "",
//         // Dodatkowe pola dla lekarza
//         price: "",
//         pwz: "",
//         specialization: ""
//     });
//
//     const navigate = useNavigate();
//
// // ... wcześniejszy kod ...
//
//     useEffect(() => {
//         usersRef.once("value")
//             .then(snapshot => {
//                 if (snapshot.exists()) {
//                     const data = snapshot.val();
//                     // Upewnij się, że wszystkie klucze są ustawione, w tym 'specialization'
//                     setUserData({
//                         ...userData,
//                         name: data.name || "",
//                         lastName: data.lastName || "",
//                         email: data.email || "",
//                         phone: data.phone || "",
//                         birthDate: data.birthDate || "",
//                         price: data.price || "",
//                         pwz: data.pwz || "",
//                         specialization: data.specialization || ""
//                     });
//                 } else {
//                     // Jeśli nie znaleziono danych w Users/, przeszukaj ścieżkę Doctors/
//                     return doctorsRef.once("value");
//                 }
//             })
//             .then(snapshot => {
//                 if (snapshot && snapshot.exists()) {
//                     setIsDoctor(true); // Ustaw stan, jeśli użytkownik jest lekarzem
//                     const data = snapshot.val();
//                     // Upewnij się, że wszystkie klucze są ustawione, w tym 'specialization'
//                     setUserData({
//                         ...userData,
//                         name: data.name || "",
//                         lastName: data.lastName || "",
//                         email: data.email || "",
//                         phone: data.phone || "",
//                         birthDate: data.birthDate || "",
//                         price: data.price || "",
//                         pwz: data.pwz || "",
//                         specialization: data.specialization || ""
//                     });
//                 }
//             });
//     }, [currentUserUid, usersRef, doctorsRef]);
//
// // ... reszta kodu ...
//
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const refToUpdate = isDoctor ? doctorsRef : usersRef;
//
//         try {
//             await refToUpdate.update(userData);
//             navigate('/user-profile');
//         } catch (error) {
//             console.error("Error updating user data:", error);
//             alert(error.message);
//         }
//     };
//
//     return (
//         <form onSubmit={handleSubmit} className="edit-profile-form">
//             <div className="form-group">
//                 <label>Imię:</label>
//                 <input
//                     type="text"
//                     value={userData.name}
//                     onChange={(e) => setUserData({...userData, name: e.target.value})}
//                     className="form-control"
//                 />
//             </div>
//             <div className="form-group">
//                 <label>Nazwisko:</label>
//                 <input
//                     type="text"
//                     value={userData.lastName}
//                     onChange={(e) => setUserData({...userData, lastName: e.target.value})}
//                     className="form-control"
//                 />
//             </div>
//             <div className="form-group">
//                 <label>E-mail:</label>
//                 <input
//                     type="email"
//                     value={userData.email}
//                     onChange={(e) => setUserData({...userData, email: e.target.value})}
//                     className="form-control"
//                     disabled
//                 />
//             </div>
//             <div className="form-group">
//                 <label>Numer telefonu:</label>
//                 <input
//                     type="tel"
//                     value={userData.phone}
//                     onChange={(e) => setUserData({...userData, phone: e.target.value})}
//                     className="form-control"
//                 />
//             </div>
//             <div className="form-group">
//                 <label>Data urodzenia:</label>
//                 <input
//                     type="date"
//                     value={userData.birthDate}
//                     onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
//                     className="form-control"
//                 />
//             </div>
//             {
//                 isDoctor && (
//                     // Tylko lekarze mogą edytować te pola
//                     <>
//                         <div className="form-group">
//                             <label>Cena za wizytę:</label>
//                             <input
//                                 type="text"
//                                 value={userData.price}
//                                 onChange={(e) => setUserData({...userData, price: e.target.value})}
//                                 className="form-control"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Numer PWZ:</label>
//                             <input
//                                 type="text"
//                                 value={userData.pwz}
//                                 onChange={(e) => setUserData({...userData, pwz: e.target.value})}
//                                 className="form-control"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Specjalizacja:</label>
//                             <select
//                                 value={userData.specialization}
//                                 onChange={(e) => setUserData({...userData, specialization: e.target.value})}
//                                 className="form-control"
//                             >
//                                 <option value="Alergolog">Alergolog</option>
//                                 <option value="Chirurg">Chirurg</option>
//                                 <option value="Dermatolog">Dermatolog</option>
//                                 <option value="Endokrynolog">Endokrynolog</option>
//                                 <option value="Hepatolog">Hepatolog</option>
//                                 <option value="Kardiolog">Kardiolog</option>
//                                 <option value="Neurolog">Neurolog</option>
//                                 <option value="Ortopeda">Ortopeda</option>
//                                 <option value="Okulista">Okulista</option>
//                                 <option value="Onkolog">Onkolog</option>
//                                 <option value="Psychiatra">Psychiatra</option>
//                                 <option value="Urolog">Urolog</option>
//                             </select>
//                         </div>
//                     </>
//                 )
//             }
//             <button type="submit" className="btn-save">Zapisz</button>
//         </form>
//     );
// }
//
// export default EditProfile;
//
//
//


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from '../firebaseConfig/Firebase';
import '../styles/EditProfile.css';

function EditProfile() {
    const currentUser = auth.currentUser;
    const currentUserUid = currentUser.uid;
    const usersRef = database.ref(`Users/${currentUserUid}`);
    const doctorsRef = database.ref(`Doctors/${currentUserUid}`);
    const [isDoctor, setIsDoctor] = useState(false); // Nowy stan dla identyfikacji, czy użytkownik to lekarz

    const [userData, setUserData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        price: "",
        pwz: "",
        specialization: ""
    });

    const navigate = useNavigate();

    useEffect(() => {
        usersRef.once("value")
            .then(snapshot => {
                const userDataValue = snapshot.val();
                if (userDataValue) {
                    setUserData(userDataValue);
                } else {
                    // Jeśli nie znaleziono danych w Users/, przeszukaj ścieżkę Doctors/
                    return doctorsRef.once("value");
                }
            })
            .then(snapshot => {
                if (snapshot && snapshot.val()) {
                    setIsDoctor(true);
                    setUserData(snapshot.val());
                }
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const refToUpdate = isDoctor ? doctorsRef : usersRef;


    //     try {
    //         usersRef.update(userData).then(() => {
    //             navigate('/user-profile');
    //         }).catch(async error => {
    //             console.log("Failed to update in Users/, trying Doctors/");
    //             await doctorsRef.update(userData);
    //             navigate('/user-profile');
    //         });
    //     } catch (error) {
    //         console.error("Error updating user data:", error);
    //         alert(error.message);
    //     }
    // };
        try {
            await refToUpdate.update(userData);
            navigate('/user-profile');
        } catch (error) {
            console.error("Error updating user data:", error);
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="form-group">
                <label>Imię:</label>
                <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Nazwisko:</label>
                <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>E-mail:</label>
                <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="form-control"
                    disabled
                />
            </div>
            <div className="form-group">
                <label>Numer telefonu:</label>
                <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                    className="form-control"
                />
            </div>
            <div className="form-group">
                <label>Data urodzenia:</label>
                <input
                    type="date"
                    value={userData.birthDate}
                    onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                    className="form-control"
                />
            </div>
            {
                isDoctor && (
                    // Tylko lekarze mogą edytować te pola
                    <>
                        <div className="form-group">
                            <label>Cena za wizytę:</label>
                            <input
                                type="text"
                                value={userData.price}
                                onChange={(e) => setUserData({...userData, price: e.target.value})}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Numer PWZ:</label>
                            <input
                                type="text"
                                value={userData.pwz}
                                onChange={(e) => setUserData({...userData, pwz: e.target.value})}
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Specjalizacja:</label>
                            <select
                                value={userData.specialization}
                                onChange={(e) => setUserData({...userData, specialization: e.target.value})}
                                className="form-control"
                            >
                                <option value="Alergolog">Alergolog</option>
                                <option value="Chirurg">Chirurg</option>
                                <option value="Dermatolog">Dermatolog</option>
                                <option value="Endokrynolog">Endokrynolog</option>
                                <option value="Hepatolog">Hepatolog</option>
                                <option value="Kardiolog">Kardiolog</option>
                                <option value="Neurolog">Neurolog</option>
                                <option value="Ortopeda">Ortopeda</option>
                                <option value="Okulista">Okulista</option>
                                <option value="Onkolog">Onkolog</option>
                                <option value="Psychiatra">Psychiatra</option>
                                <option value="Urolog">Urolog</option>
                            </select>
                        </div>
                    </>
                )
            }
            <button type="submit" className="btn-save">Zapisz</button>
        </form>
    );
}

export default EditProfile;