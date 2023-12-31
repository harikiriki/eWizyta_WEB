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
        // References to the sender's and receiver's chat paths
        const senderChatRef = database.ref(`${userRolePath}/${senderId}/chats/${chatId}`);
        const receiverRolePath = userRolePath === 'Doctors' ? 'Users' : 'Doctors';
        const receiverChatRef = database.ref(`${receiverRolePath}/${receiverId}/chats/${chatId}`);

        // Check if the chat exists in the sender's path
        senderChatRef.once('value', snapshot => {
            if (!snapshot.exists()) {
                // If the chat doesn't exist, create it
                const chatDetails = {
                    name: userRolePath === 'Users' ? receiverName : senderName, // Use doctor's name for patients and patient's name for doctors
                    timestamp: Date.now(),
                    messages: []
                };
                senderChatRef.set(chatDetails);
            }

            // Send the message
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

            senderChatRef.child('messages').push().set(message);
            senderChatRef.update({ lastMessage: text });

            // Check if the chat exists in the receiver's path
            receiverChatRef.once('value', snapshot => {
                if (!snapshot.exists()) {
                    // If the chat doesn't exist, create it
                    const chatDetails = {
                        name: userRolePath === 'Doctors' ? senderName : receiverName, // Use patient's name for doctors
                        timestamp: Date.now(),
                        messages: []
                    };
                    receiverChatRef.set(chatDetails);
                }
                receiverChatRef.child('messages').push().set(message);
                receiverChatRef.update({ lastMessage: text });
                receiverChatRef.update({ name: senderName });

            });
        });
    };





    const sendImageMessage = (chatId, imageUrl, senderId, senderName, receiverId, receiverName, userRolePath) => {
        if (!chatId || !imageUrl || !senderId || !receiverId) {
            console.error('Required information for image message is missing');
            return;
        }

        const message = {
            imageUrl, // URL of the uploaded image
            timestamp: Date.now(),
            senderId,
            senderName,
            receiverId,
            receiverName,
            read: false,
            type: 'IMAGE', // Specify the message type as IMAGE
        };

        // Save the message under the sender's chat path
        const senderMessageRef = database.ref(`${userRolePath}/${senderId}/chats/${chatId}/messages`).push();
        senderMessageRef.set(message);

        // Update lastMessage in the sender's chat branch
        database.ref(`${userRolePath}/${senderId}/chats/${chatId}`).update({ lastMessage: 'Wysłano zdjęcie' });

        // Determine the receiver's path based on the logged-in user role
        const receiverRolePath = userRolePath === 'Doctors' ? 'Users' : 'Doctors';

        // Save the message under the receiver's chat path
        const receiverMessageRef = database.ref(`${receiverRolePath}/${receiverId}/chats/${chatId}/messages`).push();
        receiverMessageRef.set(message);

        // Update lastMessage in the receiver's chat branch
        database.ref(`${receiverRolePath}/${receiverId}/chats/${chatId}`).update({ lastMessage: 'Otrzymano zdjęcie' });
    };

    const sendFileMessage = (chatId, imageUrl, senderId, senderName, receiverId, receiverName, userRolePath) => {
        // Similar to sendImageMessage but with file details
        const message = {
            imageUrl,
            timestamp: Date.now(),
            senderId,
            senderName,
            receiverId,
            receiverName,
            read: false,
            type: 'PDF',
            text: 'PDF File',
        };

        const senderMessageRef = database.ref(`${userRolePath}/${senderId}/chats/${chatId}/messages`).push();
        senderMessageRef.set(message);

        // Update lastMessage in the sender's chat branch
        database.ref(`${userRolePath}/${senderId}/chats/${chatId}`).update({ lastMessage: 'Wysłano plik PDF' });

        // Determine the receiver's path based on the logged-in user role
        const receiverRolePath = userRolePath === 'Doctors' ? 'Users' : 'Doctors';

        // Save the message under the receiver's chat path
        const receiverMessageRef = database.ref(`${receiverRolePath}/${receiverId}/chats/${chatId}/messages`).push();
        receiverMessageRef.set(message);

        // Update lastMessage in the receiver's chat branch
        database.ref(`${receiverRolePath}/${receiverId}/chats/${chatId}`).update({ lastMessage: 'Otrzymano plik PDF' });
    };


    const value = {
        chats,
        currentChat,
        setCurrentChat,
        sendMessage,
        sendImageMessage,
        sendFileMessage
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
