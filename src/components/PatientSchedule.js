import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../firebaseConfig/Firebase';
import { useAuth } from '../auth/AuthContext';
import { useChat } from './ChatProvider';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('pl');
const localizer = momentLocalizer(moment);

const PatientSchedule = () => {
    const { currentUser } = useAuth();
    const { setCurrentChat, sendMessage } = useChat();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null); // Stan dla wybranego wydarzenia
    const [modalOpen, setModalOpen] = useState(false); // Stan dla modalu

    useEffect(() => {
        if (currentUser) {
            const appointmentsRef = database.ref(`Users/${currentUser.uid}/appointments`);
            appointmentsRef.on('value', snapshot => {
                const appointmentsData = snapshot.val();
                if (appointmentsData) {
                    const formattedAppointments = Object.keys(appointmentsData).map(key => {
                        const { dateTime, doctorName, price, address, doctorId } = appointmentsData[key];
                        return {
                            id: key, // Przechowujemy klucz Firebase jako id wizyty
                            doctorId, // Zapisujemy doctorId dla każdego wydarzenia
                            title: `Wizyta u Lek. ${doctorName} - cena: ${price}, adres: ${address}`,
                            start: moment(dateTime, 'DD/MM/YYYY HH:mm').toDate(),
                            end: moment(dateTime, 'DD/MM/YYYY HH:mm').add(30, 'minutes').toDate(),
                        };
                    });
                    setAppointments(formattedAppointments);
                }
            });

            return () => appointmentsRef.off(); // Detach listener on unmount
        } else {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const handleEventSelection = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleCancelAppointment = () => {
        if (window.confirm('Czy na pewno chcesz odwołać tę wizytę?')) {
            const appointmentRef = database.ref(`Users/${currentUser.uid}/appointments/${selectedEvent.id}`);

            // Upewnij się, że doctorId istnieje przed próbą aktualizacji
            if (selectedEvent.doctorId) {
                const doctorAppointmentRef = database.ref(`Doctors/${selectedEvent.doctorId}/appointments/${selectedEvent.id}`);

                // Usuń wizytę z konta pacjenta
                appointmentRef.remove().then(() => {
                    // Wyczyść dane pacjenta z wizyty lekarza i ustaw status na wolny
                    doctorAppointmentRef.update({
                        patientId: "",
                        patientName: "",
                        free: true,
                    });
                    // Odśwież kalendarz wizyt
                    setAppointments(appointments.filter(appointment => appointment.id !== selectedEvent.id));
                    setSelectedEvent(null);
                    setModalOpen(false);
                    alert('Wizyta została odwołana.');
                }).catch(error => {
                    alert('Nie udało się odwołać wizyty, spróbuj ponownie.');
                    console.error('Error cancelling appointment:', error);
                });
            } else {
                console.error('Brak doctorId dla wybranej wizyty');
                alert('Wystąpił błąd podczas odwoływania wizyty. Prosimy spróbować ponownie.');
            }
        }
    };

    const getUserName = (userId) => {
        return database.ref(`Users/${userId}`).once('value').then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                return `${userData.name} ${userData.lastName}`; // Załóżmy, że pola to name i lastName
            } else {
                throw new Error('Użytkownik nie istnieje');
            }
        });
    };

    const handleChatWithDoctor = (doctorId) => {
        Promise.all([
            getUserName(currentUser.uid), // Pobierz imię i nazwisko pacjenta
            database.ref(`Doctors/${doctorId}`).once('value') // Pobierz dane lekarza
        ]).then(([patientFullName, doctorSnapshot]) => {
            if (doctorSnapshot.exists()) {
                const doctorData = doctorSnapshot.val();
                const doctorFullName = `${doctorData.name} ${doctorData.lastName}`;

                const chatData = {
                    id: `${currentUser.uid}:${doctorId}`,
                    doctorId: doctorId,
                    name: doctorFullName // Pełne imię i nazwisko lekarza
                };

                setCurrentChat(chatData);
                navigate(`/chat/${chatData.id}`);
                sendMessage(chatData.id, "", currentUser.uid, patientFullName, doctorId, doctorFullName, "Users");
            } else {
                alert('Nie znaleziono danych lekarza.');
            }
        }).catch(error => {
            console.error('Error:', error);
            alert('Nie udało się pobrać informacji o użytkowniku.');
        });
    };



    return (
        <div>
            <h2>Twój kalendarz wizyt</h2>
            <Calendar
                localizer={localizer}
                events={appointments}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '80vh' }}
                onSelectEvent={handleEventSelection}
                messages={{
                    allDay: 'Cały dzień',
                    previous: 'Poprzedni',
                    next: 'Następny',
                    today: 'Dziś',
                    month: 'Miesiąc',
                    week: 'Tydzień',
                    day: 'Dzień',
                    agenda: 'Agenda',
                    date: 'Data',
                    time: 'Czas',
                    event: 'Wydarzenie',
                    noEventsInRange: 'Brak wizyt w tym zakresie.',
                }}
            />

            {/* Modal dla szczegółów wydarzenia */}
            {modalOpen && selectedEvent && (
                <div>
                    <h3>Szczegóły wizyty:</h3>
                    <p>{selectedEvent.title}</p>
                    <p>Data i czas: {moment(selectedEvent.start).format('LLLL')}</p>
                    <button onClick={handleCancelAppointment}>Odwołaj wizytę</button>
                    <button onClick={() => handleChatWithDoctor(selectedEvent.doctorId, `Lek. ${selectedEvent.doctorName}`)}>Chat z lekarzem</button>
                    <button onClick={() => setModalOpen(false)}>Zamknij</button>
                </div>
            )}
        </div>
    );
};

export default PatientSchedule;
