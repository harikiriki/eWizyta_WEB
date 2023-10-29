import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from '../firebaseConfig/Firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

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
