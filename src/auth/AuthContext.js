// import React, { useContext, useState, useEffect } from "react";
// import { auth, database } from "../firebaseConfig/Firebase";
// import { ref, push, set } from 'firebase/database';
//
// const AuthContext = React.createContext();
//
// export function useAuth() {
//     return useContext(AuthContext);
// }
//
// export function AuthProvider({ children }) {
//     const [currentUser, setCurrentUser] = useState();
//     const [loading, setLoading] = useState(true);
//
//     function register(email, password, name, lastName, phone, birthDate, gender) {
//         return auth.createUserWithEmailAndPassword(email, password)
//             .then((userCredential) => {
//                 const user = userCredential.user;
//                 const uid = user.uid;
//                 const userRef = ref(database, `Users/${uid}`);
//                 const userData = {
//                     name: name,
//                     lastName: lastName,
//                     email: email,
//                     password: password, // Note: Storing passwords in plain text is not recommended for production apps
//                     phone: phone,
//                     birthDate: birthDate,
//                     gender: gender,
//                     notifications: true
//                 };
//
//                 return push(userRef, userData)
//                     .then(() => {
//                         setCurrentUser(user);
//                         return user;
//                     })
//                     .catch(error => {
//                         console.error("Błąd podczas zapisywania danych użytkownika:", error);
//                         throw error;
//                     });
//             })
//             .catch(error => {
//                 console.error("Błąd rejestracji:", error);
//                 throw error;
//             });
//     }
//
//     function login(email, password) {
//         return auth.signInWithEmailAndPassword(email, password)
//             .then((userCredential) => {
//                 const user = userCredential.user;
//                 console.log("Zalogowany użytkownik:", user);
//                 return user;
//             })
//             .catch(error => {
//                 console.error("Błąd logowania:", error);
//                 throw error;
//             });
//     }
//
//     function logout() {
//         return auth.signOut()
//     }
//
//     function updateProfile(email, password, name, lastName, phone, birthDate, gender) {
//         const user = auth.currentUser;
//         const updateEmailPromise = user.updateEmail(email);
//
//         let updatePasswordPromise = Promise.resolve(); // Początkowo nie aktualizujemy hasła, chyba że jest dostarczone
//         if (password) {
//             updatePasswordPromise = user.updatePassword(password);
//         }
//
//         // Czekaj na zakończenie obietnic dotyczących emaila i hasła
//         return Promise.all([updateEmailPromise, updatePasswordPromise])
//             .then(() => {
//                 // Po udanej aktualizacji emaila i hasła, zaktualizuj inne pola użytkownika w bazie danych
//                 const userRef = ref(database, `Users/${user.uid}`);
//                 return set(userRef, {
//                     email: email,
//                     name: name,
//                     lastName: lastName,
//                     phone: phone,
//                     birthDate: birthDate,
//                     gender: gender,
//                     // ... inne pola użytkownika
//                 });
//             })
//             .then(() => {
//                 // Zwróć użytkownika po zaktualizowaniu wszystkich danych
//                 setCurrentUser(user);
//                 return user;
//             });
//     }
//
//
//     function resetPassword(email) {
//         return auth.sendPasswordResetEmail(email)
//     }
//
//     // function updateEmail(email) {
//     //     return currentUser.updateEmail(email)
//     // }
//     // function updatePassword(password) {
//     //     return currentUser.updatePassword(password)
//     // }
//
//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(user => {
//             setCurrentUser(user);
//             setLoading(false);
//         });
//
//         return unsubscribe;
//     }, []);
//
//     const value = {
//         currentUser,
//         login,
//         register,
//         logout,
//         resetPassword,
//         updateProfile
//         // updateEmail,
//         // updatePassword
//     };
//
//     return (
//         <AuthContext.Provider value={value}>
//             {!loading && children}
//         </AuthContext.Provider>
//     )
// }


// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from '../firebaseConfig/Firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}
//
// export function AuthProvider({ children }) {
//     const [currentUser, setCurrentUser] = useState();
//
//     useEffect(() => {
//         const unsubscribe = auth.onAuthStateChanged(user => {
//             setCurrentUser(user);
//         });
//
//         return unsubscribe;
//     }, []);
//
//     const value = {
//         currentUser
//     };
//
//     return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [userRole, setUserRole] = useState(null); // Dodaj stan dla roli użytkownika

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async user => {
            setCurrentUser(user);

            if (user) {
                // Sprawdzamy, czy użytkownik jest w gałęzi 'doctors'
                const doctorRef = database.ref('Doctors/' + user.uid);
                const doctorSnapshot = await doctorRef.once('value');

                if (doctorSnapshot.exists()) {
                    setUserRole('doctor');
                } else {
                    // Jeśli nie jest lekarzem, zakładamy, że jest pacjentem
                    setUserRole('patient');
                }
            } else {
                setUserRole(null); // Resetujemy rolę użytkownika, gdy jest wylogowany
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole  // Udostępniamy rolę użytkownika przez context
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
