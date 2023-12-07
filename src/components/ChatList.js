import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import {useChat} from "./ChatProvider";
import Chat from './Chat'; // Ensure this import points to your Chat model file
import { database } from '../firebaseConfig/Firebase';
import { useNavigate } from 'react-router-dom';

import '../styles/ChatList.css';

const ChatList = () => {
    const { currentUser } = useAuth();
    const { setCurrentChat } = useChat(); // Use the context to get the setCurrentChat function
    const [chats, setChats] = useState([]);
    const navigate = useNavigate(); // Initialize the navigate function


    useEffect(() => {
        if (!currentUser) {
            console.log('No user is signed in.');
            return;
        }

        // Determine if the current user is a doctor or a patient
        const userRolesRef = database.ref();
        userRolesRef.child(`Doctors/${currentUser.uid}`).once('value')
            .then(doctorSnapshot => {
                if (doctorSnapshot.exists()) {
                    fetchChats('Doctors', currentUser.uid);
                } else {
                    fetchChats('Users', currentUser.uid);
                }
            })
            .catch(error => {
                console.error('Error fetching user role:', error);
            });

        function fetchChats(role, userId) {
            const chatsRef = database.ref(`${role}/${userId}/chats`);

            chatsRef.on('value', snapshot => {
                const chatsData = [];
                snapshot.forEach(childSnapshot => {
                    const chatData = childSnapshot.val();
                    const chat = new Chat(
                        childSnapshot.key,
                        chatData.name,
                        chatData.lastMessage,
                        chatData.timestamp
                    );
                    chatsData.push(chat);
                });
                setChats(chatsData);
            });

            // Unsubscribe from the previous chat reference on cleanup
            return () => chatsRef.off('value');
        }
    }, [currentUser, setCurrentChat]); // Dependency array to re-run the effect when currentUser changes

    const handleChatClick = (chat) => {
        // Assuming 'chat' is an object that contains 'id', 'userType', and 'userId'
        setCurrentChat({
            id: chat.id,
            name: chat.name,
            userType: chat.userType, // 'Doctors' or 'Users', assuming this information is part of your chat object
            userId: chat.userId, // ID of the user who owns the chat
        });
        // Navigate to the ChatRoom component with the chatId
        navigate(`/chat/${chat.id}`);
    };


    return (
        <div>
            {chats.length > 0 ? (
                <div className="chat-list">
                    {chats.map((chat) => (
                        <div key={chat.id} className="chat-item" onClick={() => handleChatClick(chat)}>
                            <div className="chat-name">{chat.name}</div>
                            <div className="chat-last-message">{chat.lastMessage}</div>
                            <div className="chat-timestamp">{new Date(chat.timestamp).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

            ) : (
                <p>No chats available.</p>
            )}
        </div>
    );
};

export default ChatList;
