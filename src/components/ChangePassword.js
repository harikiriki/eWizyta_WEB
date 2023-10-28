import firebase from 'firebase/compat/app';
import { useState } from "react";
import { auth } from '../firebaseConfig/Firebase';
import {useNavigate} from 'react-router-dom';

function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatNewPassword, setRepeatNewPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== repeatNewPassword) {
            alert("Nowe hasła nie są takie same!");
            return;
        }

        const currentUser = auth.currentUser;
        try {
            const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, oldPassword);
            await currentUser.reauthenticateWithCredential(credential);
        } catch (error) {
            console.error("Error with reauthentication:", error);
            alert("Wystąpił błąd, upewnij się, że podałeś poprawne stare hasło.");
            return;
        }

        try {
            await currentUser.updatePassword(newPassword);
            alert("Hasło zostało zmienione!");
            navigate('/user-profile')
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Błąd podczas aktualizacji hasła.");
        }

    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Stare hasło:</label>
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                />
            </div>
            <div>
                <label>Nowe hasło:</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
            </div>
            <div>
                <label>Powtórz nowe hasło:</label>
                <input
                    type="password"
                    value={repeatNewPassword}
                    onChange={(e) => setRepeatNewPassword(e.target.value)}
                />
            </div>
            <button type="submit">Zmień hasło</button>
        </form>
    );
}

export default ChangePassword;
