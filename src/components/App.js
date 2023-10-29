import React from 'react';
import '../styles/App.css';
import Navbar from "./NavBar";
import { Route, Routes } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import { AuthProvider } from "../auth/AuthContext";
import UserProfile from "./UserProfile";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import RegisterDoctor from "./RegisterDoctor";
import History from "./History";

function App() {
    return (
        <AuthProvider>
            <div align="center">
                <Navbar />
                <div className="container">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/register-doctor" element={<RegisterDoctor />} />
                        <Route path="/user-profile" element={<UserProfile />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/update-profile" element={<UpdateProfile />} />
                        <Route path="/edit-profile" element={<EditProfile />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/history" element={<History />} />

                    </Routes>
                </div>
            </div>
        </AuthProvider>
    );
}

export default App;

