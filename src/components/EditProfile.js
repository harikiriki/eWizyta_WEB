import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from '../firebaseConfig/Firebase';

function EditProfile() {
    const currentUser = auth.currentUser;
    const currentUserUid = currentUser.uid;
    const usersRef = database.ref(`Users/${currentUserUid}`);
    const doctorsRef = database.ref(`Doctors/${currentUserUid}`);

    const [userData, setUserData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: ""
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
                    setUserData(snapshot.val());
                }
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            usersRef.update(userData).then(() => {
                navigate('/user-profile');
            }).catch(async error => {
                console.log("Failed to update in Users/, trying Doctors/");
                await doctorsRef.update(userData);
                navigate('/user-profile');
            });
        } catch (error) {
            console.error("Error updating user data:", error);
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Imie:</label>
                <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                />
            </div>
            <div>
                <label>Nazwisko:</label>
                <input
                    type="text"
                    value={userData.lastName}
                    onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                />
            </div>
            <div>
                <label>E-mail:</label>
                <input
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    disabled
                />
            </div>
            <div>
                <label>Numer telefonu:</label>
                <input
                    type="tel"
                    value={userData.phone}
                    onChange={(e) => setUserData({...userData, phone: e.target.value})}
                />
            </div>
            <div>
                <label>Data urodzenia:</label>
                <input
                    type="date"
                    value={userData.birthDate}
                    onChange={(e) => setUserData({...userData, birthDate: e.target.value})}
                />
            </div>
            <button type="submit">Zapisz</button>
        </form>
    );
}

export default EditProfile;
