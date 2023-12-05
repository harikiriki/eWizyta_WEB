import React, { useState, useEffect } from 'react';
import '../styles/navbarStyle.css';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { database } from '../firebaseConfig/Firebase';
import logo from '../logo.png';

export default function Navbar() {
    const { currentUser } = useAuth();
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        if (currentUser) {
            // Sprawdź, czy użytkownik jest lekarzem
            database.ref(`Doctors/${currentUser.uid}`).once('value', snapshot => {
                if (snapshot.exists()) {
                    setUserRole('doctor');
                } else {
                    // Jeśli nie jest lekarzem, sprawdź czy jest pacjentem
                    database.ref(`Users/${currentUser.uid}`).once('value', snapshot => {
                        if (snapshot.exists()) {
                            setUserRole('patient');
                        }
                    });
                }
            });
        }
    }, [currentUser]);

    return (
        <nav className="navbar">
            <Link to="/" className="site-title">
                <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
                eWizyta</Link>
            <ul className="nav-links">
                {!currentUser && (
                    <>
                        <CustomLinkItem to="/login">Logowanie</CustomLinkItem>
                        <CustomLinkItem to="/register">Rejestracja</CustomLinkItem>
                        <CustomLinkItem to="/register-doctor">Dla profesjonalistów</CustomLinkItem>
                    </>
                )}
                {currentUser && (
                    <>
                        {userRole === 'patient' && <CustomLinkItem to="/schedule">Terminarz</CustomLinkItem>}
                        <CustomLinkItem to="/history">Historia wizyt</CustomLinkItem>
                        <CustomLinkItem to="/chat">Chat</CustomLinkItem>
                        <CustomLinkItem to="/user-profile">Profil użytkownika</CustomLinkItem>
                    </>
                )}
            </ul>
        </nav>
    );
}

function CustomLinkItem({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });

    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>{children}</Link>
        </li>
    );
}
