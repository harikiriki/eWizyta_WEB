import React, { createContext, useContext, useState, useEffect } from 'react';
import { database, auth } from '../firebaseConfig/Firebase';
import {useAuth} from "../auth/AuthContext";

export const ChatContext = createContext(); // Add export here if you want to export ChatContext directly

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { currentUser } = useAuth(); // This is assuming you have a hook like this.
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);

    useEffect(() => {
        // Auth state change listener to determine user role
        const unsubscribeAuth = auth.onAuthStateChanged(user => {
            if (user) {
                // First check if user is a doctor
                database.ref(`Doctors/${user.uid}`).once('value').then((doctorSnapshot) => {
                    if (doctorSnapshot.exists()) {
                        console.log('User is a doctor');
                        fetchChats('Doctors', user.uid);
                    } else {
                        console.log('User is a patient');
                        fetchChats('Users', user.uid);
                    }
                }).catch(error => {
                    console.error("Error fetching user role:", error);
                });
            } else {
                setChats([]); // Clear chats if user is not logged in
                console.log('User is not logged in');
            }
        });

        const fetchChats = (userRole, userId) => {
            const chatsRef = database.ref(`${userRole}/${userId}/chats`);
            chatsRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const chatsData = [];
                    snapshot.forEach(childSnapshot => {
                        const chat = childSnapshot.val();
                        chat.id = childSnapshot.key;
                        chatsData.push(chat);
                    });
                    setChats(chatsData);
                    console.log('Chats fetched:', chatsData);
                } else {
                    console.log('No chats found for this user.');
                }
            });
        };


        return () => {
            unsubscribeAuth();
            // Unsubscribe from chats when component unmounts or auth state changes
            database.ref('Doctors').off();
            database.ref('Users').off();
        };
    }, []);
    

    const sendMessage = (chatId, text, senderId, senderName, receiverId, receiverName, userRolePath) => {
        if (!chatId || !senderId || !receiverId) {
            console.error('Required information is missing');
            return;
        }

        const message = {
            text,
            timestamp: Date.now(),
            senderId,
            senderName,
            receiverId,
            receiverName,
            read: false,
            type: 'TEXT',
        };

        // Zapisz wiadomość pod ścieżką nadawcy
        const senderRef = database.ref(`${userRolePath}/${senderId}/chats/${chatId}/messages`).push();
        senderRef.set(message);

        // Określ ścieżkę odbiorcy na podstawie roli zalogowanego użytkownika
        const receiverRolePath = userRolePath === 'Doctors' ? 'Users' : 'Doctors'; // Zamień ścieżkę na przeciwną

        // Zapisz wiadomość pod ścieżką odbiorcy
        const receiverRef = database.ref(`${receiverRolePath}/${receiverId}/chats/${chatId}/messages`).push();
        receiverRef.set(message);
    };





    const value = {
        chats,
        currentChat,
        setCurrentChat,
        sendMessage
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
