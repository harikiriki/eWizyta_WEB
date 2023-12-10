import React, { useState, useContext, useEffect } from 'react';
import { ChatContext } from './ChatProvider';
import { database, storage } from '../firebaseConfig/Firebase';
import { useAuth } from '../auth/AuthContext';
import '../styles/ChatRoom.css';
import imageIcon from '../addIMG.png';
import pdfIcon from '../pdf_ic.png';
import Modal from 'react-modal';


const ChatRoom = () => {
    const { currentUser, userRole } = useAuth(); // This is assuming you have a hook like this.
    const { currentChat, sendMessage, sendImageMessage, sendFileMessage } = useContext(ChatContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [senderFullName, setSenderFullName] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false); // State to handle uploading status
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');

    useEffect(() => {
        if (!currentChat || !currentChat.id || !currentUser) {
            return;
        }

        const userRolePath = userRole === 'doctor' ? 'Doctors' : 'Users';

        if (currentUser && currentUser.uid) {
            const userRef = database.ref(`${userRolePath}/${currentUser.uid}`);

            userRef.once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setSenderFullName(`${userData.name} ${userData.lastName}`);
                } else {
                }
            }).catch((error) => {
            });
        } else {
        }

        const messagesRef = database.ref(`${userRolePath}/${currentUser.uid}/chats/${currentChat.id}/messages`);

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

        return () => {
            messagesRef.off();
        };
    }, [currentUser, currentChat, userRole]);


    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingImage(true); // Set uploading status to true

        // Create a file name based on the timestamp and user ID
        const timestamp = Date.now();
        const fileName = `${timestamp}-${currentUser.uid}`;
        const imageRef = storage.ref(`chatImages/${fileName}`);

        try {
            await imageRef.put(file);
            const imageUrl = await imageRef.getDownloadURL();

            const ids = currentChat.id.split(':');
            const receiverId = ids.find(id => id !== currentUser.uid);
            const receiverName = currentChat.name;
            const userRolePath = userRole === 'doctor' ? 'Doctors' : 'Users';

            // Use sendImageMessage to send the image URL
            sendImageMessage(currentChat.id, imageUrl, currentUser.uid, senderFullName, receiverId, receiverName, userRolePath);
        } catch (error) {
            console.error('Error uploading image:', error);
        }

        setUploadingImage(false); // Set uploading status to false after upload
    };


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

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || file.type !== 'application/pdf') return;

        const timestamp = Date.now();
        const fileName = `${timestamp}-${currentUser.uid}.pdf`; // Create file name
        const fileRef = storage.ref(`chatFiles/${fileName}`);

        setUploadingImage(true); // Use a state for handling the loading status

        try {
            const snapshot = await fileRef.put(file, { contentType: 'application/pdf' }); // Set the content type for the PDF
            const fileUrl = await snapshot.ref.getDownloadURL();

            const ids = currentChat.id.split(':');
            const receiverId = ids.find(id => id !== currentUser.uid);
            const receiverName = currentChat.name;
            const userRolePath = userRole === 'doctor' ? 'Doctors' : 'Users';

            sendFileMessage(currentChat.id, fileUrl, currentUser.uid, senderFullName, receiverId, receiverName, userRolePath);
        } catch (error) {
            console.error('Error uploading file:', error);
        }

        setUploadingImage(false); // Update loading status
    };

    const openModalWithImage = (imageUrl) => {
        setModalImageSrc(imageUrl);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setModalImageSrc('');
    };

    return (
        <div className="chat-container">
            <h2>Rozmowa z {currentChat?.name}</h2>
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} contentLabel="Image Modal">
                <img src={modalImageSrc} alt="Full Size" style={{ maxWidth: '100%' }} />
                <button onClick={closeModal}>Close</button>
            </Modal>
            <div className="messages-container">
                {messages.map((message, index) => (
                    <div key={index} className={message.isCurrentUser ? 'message-sent' : 'message-received'}>
                        {message.type === 'TEXT' && <p>{message.text}</p>}
                        {message.type === 'IMAGE' && (
                            <img
                                src={message.imageUrl}
                                alt="Sent image"
                                style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                                onClick={() => openModalWithImage(message.imageUrl)}
                            />
                        )}
                        {message.type === 'PDF' && (
                            <a href={message.fileUrl} download target="_blank" rel="noopener noreferrer">
                                Download PDF
                            </a>
                        )}
                        <span className="message-timestamp">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                ))}

            </div>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="input-field"
                    disabled={uploadingImage}
                />
                <div className="file-inputs">
                    <label htmlFor="image-upload" className="file-input-label">
                        <img src={imageIcon} alt="Upload Image" />
                        <input
                            id="image-upload"
                            type="file"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            disabled={uploadingImage}
                        />
                    </label>
                    <label htmlFor="pdf-upload" className="file-input-label">
                        <img src={pdfIcon} alt="Upload PDF" />
                        <input
                            id="pdf-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            disabled={uploadingImage}
                        />
                    </label>
                </div>
                <button onClick={handleSendMessage} className="send-button" disabled={uploadingImage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;

