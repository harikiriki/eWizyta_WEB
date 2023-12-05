import React, { useState, useContext, useEffect } from 'react';
import { ChatContext } from './ChatProvider';
import { database } from '../firebaseConfig/Firebase';
import { useAuth } from '../auth/AuthContext';
import '../styles/ChatRoom.css';

const ChatRoom = () => {
    const { currentUser, userRole } = useAuth(); // This is assuming you have a hook like this.
    const { currentChat, sendMessage } = useContext(ChatContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [senderFullName, setSenderFullName] = useState('');

    useEffect(() => {
        if (!currentChat || !currentChat.id || !currentUser) return;
        // Określ, czy zalogowany użytkownik to lekarz, czy pacjent

        const userRole = currentChat.userType === 'Doctors' ? 'Doctors' : 'Users';

        if (currentUser && currentUser.uid) {
            const userRef = database.ref(`${userRole}/${currentUser.uid}`);
            userRef.once('value').then((snapshot) => {
                const userData = snapshot.val();
                setSenderFullName(`${userData.name} ${userData.lastName}`);
            }).catch((error) => {
                console.error('Error fetching user data:', error);
            });
        }

        // Stwórz referencję do wiadomości w oparciu o rolę użytkownika i ID czatu
        const messagesRef = database.ref(`${userRole}/${currentUser.uid}/chats/${currentChat.id}/messages`);

        messagesRef.on('value', snapshot => {
            const fetchedMessages = [];
            snapshot.forEach(childSnapshot => {
                const message = childSnapshot.val();
                message.id = childSnapshot.key;
                message.isCurrentUser = message.senderId === currentUser.uid;
                fetchedMessages.push(message);
            });
            setMessages(fetchedMessages);
        });

        return () => messagesRef.off();
    }, [currentUser, currentChat]);

    const handleSendMessage = () => {
        if (newMessage.trim() && currentChat && currentChat.id && currentUser && currentUser.uid && senderFullName) {
            // Rozdziel identyfikator czatu, aby znaleźć receiverId
            const ids = currentChat.id.split(':');
            const receiverId = ids.find(id => id !== currentUser.uid); // Znajdź id, które nie jest senderId
            const receiverName = currentChat.name; // Zakładamy, że name jest dostępne w currentChat

            // Teraz możemy użyć userRole z kontekstu do ustalenia ścieżki
            const userRolePath = userRole === 'doctor' ? 'Doctors' : 'Users';

            console.log('chatId', currentChat.id)
            console.log('text', newMessage)
            console.log('senderId', currentUser.uid)
            console.log('senderName', senderFullName)
            console.log('receiverId', receiverId)
            console.log('receiverName', receiverName)
            console.log('userRolePath', userRolePath)

            // Ustaw resztę danych i wyślij wiadomość
            sendMessage(currentChat.id, newMessage, currentUser.uid, senderFullName, receiverId, receiverName, userRolePath);
            setNewMessage('');
        } else {
            console.error('Current chat or user is not set');
        }
    };


    return (
        <div>
            <h2>Rozmowa z {currentChat?.name}</h2>
            <div>
                {messages.map((message, index) => (
                    <div key={index} className={message.isCurrentUser ? 'message-sent' : 'message-received'}>
                        <p>{message.text}</p>
                        <span className="message-timestamp">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default ChatRoom;

