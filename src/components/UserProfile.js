import { useEffect, useState } from "react";
import { auth, database, storage } from '../firebaseConfig/Firebase';
import {Link, useNavigate} from "react-router-dom";
import '../styles/UserProfile.css';

function UserProfile() {
    const [userData, setUserData] = useState({});
    const [profileImage, setProfileImage] = useState("");
    const currentUser = auth.currentUser;
    const currentUserUid = currentUser.uid;
    const usersRef = database.ref(`Users/${currentUserUid}`);
    const doctorsRef = database.ref(`Doctors/${currentUserUid}`);
    const profilePictureRef = storage.ref(`profileImages/profileImage_${currentUserUid}.jpg`);
    const defaultProfilePicture = storage.ref(`profileImages/baseline_person.png`);
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
                    setUserData(snapshot.val());
                }
            });

        profilePictureRef.getDownloadURL()
            .then(url => {
                setProfileImage(url);
            })
            .catch(error => {
                // Gdy nie ma zdjęcia w bazie danych, ustaw domyślne zdjęcie profilowe
                defaultProfilePicture.getDownloadURL()
                    .then(url => setProfileImage(url))
                    .catch(err => console.error("Error fetching default image:", err));
            });
    }, []);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate("/login");
        } catch (error) {
            console.error("Error during sign out:", error);
            alert("Błąd podczas wylogowywania się. Spróbuj ponownie.");
        }
    };

    return (
        <div className="user-profile-container">
            {profileImage && (
                <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-image"
                />
            )}
            <div className="user-data">
                <p>Imię: {userData.name}</p>
                <p>Nazwisko: {userData.lastName}</p>
                <p>E-mail: {userData.email}</p>
                <p>Numer telefonu: {userData.phone}</p>
                <p>Data urodzenia: {userData.birthDate}</p>
                <Link to="/edit-profile" className="edit-link">Edytuj profil</Link>
                <Link to="/change-password" className="change-password-link">Zmień hasło</Link>
                <button onClick={handleLogout} className="logout-button">Wyloguj się</button>
            </div>
        </div>
    );
}
export default UserProfile;
