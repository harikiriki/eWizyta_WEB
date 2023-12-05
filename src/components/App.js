import React from 'react';
import '../styles/App.css';
import Navbar from "./NavBar";
import { Route, Routes } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import { AuthProvider } from "../auth/AuthContext";
import { ChatProvider } from './ChatProvider';
import UserProfile from "./UserProfile";
import ForgotPassword from "./ForgotPassword";
import UpdateProfile from "./UpdateProfile";
import EditProfile from "./EditProfile";
import ChangePassword from "./ChangePassword";
import RegisterDoctor from "./RegisterDoctor";
import History from "./History";
import DoctorDetails from "./DoctorDetails";
import PatientSchedule from "./PatientSchedule";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import CompleteGoogleSignIn from "./CompleteGoogleSignIn";

function App() {
    return (
        <AuthProvider>
            <ChatProvider>
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
                            <Route path="/doctor/:doctorId" element={<DoctorDetails />} />
                            <Route path="/schedule" element={<PatientSchedule />} />
                            <Route path="/chat" element={<ChatList/>} />
                            <Route path="/chat/:chatId" element={<ChatRoom />} />
                            <Route path="/google-sign-in" element={<CompleteGoogleSignIn />} />


                        </Routes>
                    </div>
                </div>
            </ChatProvider>
        </AuthProvider>
    );
}

export default App;

