import React, { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { database } from '../firebaseConfig/Firebase';
import { useAuth } from '../auth/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pl'; // Importuj lokalizację dla moment
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Importuj style kalendarza

moment.locale('pl');
const localizer = momentLocalizer(moment); // Ustaw lokalizator dla kalendarza

const DoctorDetails = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [doctorDetails, setDoctorDetails] = useState({});
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { currentUser } = useAuth();


    useEffect(() => {
        // Pobierz szczegóły lekarza
        database.ref(`Doctors/${doctorId}`).once('value', (snapshot) => {
            setDoctorDetails(snapshot.val());
        });
        database.ref(`Doctors/${doctorId}/appointments`).orderByChild('free').equalTo(true).once('value', (snapshot) => {
            const availableAppointments = [];
            snapshot.forEach(childSnapshot => {
                const app = childSnapshot.val();
                app.id = childSnapshot.key; // Tutaj przypisujemy klucz z Firebase do 'id'
                availableAppointments.push(app);
            });
            setAppointments(availableAppointments);
        });
    }, [doctorId]);


    const calendarEvents = appointments.map(appointment => {
        const correctFormatDateTime = moment(appointment.dateTime, 'DD/MM/YYYY HH:mm').toDate();
        return {
            ...appointment,
            id: appointment.id, // Upewnij się, że to pole jest przypisywane
            title: 'Wolny termin',
            start: correctFormatDateTime,
            end: new Date(correctFormatDateTime.getTime() + 30 * 60000),
            allDay: false
        };
    });


    const handleSelectEvent = (event) => {
        console.log(event); // Sprawdź, czy wydarzenie zawiera 'id'
        setSelectedAppointment(event); // Przypisz całe wydarzenie, które powinno zawierać 'id'
        setModalOpen(true);
    };


    const handleConfirmAppointment = () => {
        const user = currentUser;

        if (user && selectedAppointment?.id) {
            // Pobierz dodatkowe dane użytkownika z bazy danych
            database.ref(`Users/${user.uid}`).once('value').then((snapshot) => {
                const userData = snapshot.val();
                const updates = {};

                // Informacje o wizycie do zapisania w bazie lekarza
                const doctorAppointmentUpdate = {
                    address: doctorDetails.address,
                    complete: false,
                    dateTime: moment(selectedAppointment.start).format('DD/MM/YYYY HH:mm'), // Corrected format
                    doctorId: doctorId,
                    doctorName: `${doctorDetails.name} ${doctorDetails.lastName}`,
                    free: false,
                    id: selectedAppointment.id,
                    patientId: user.uid,
                    patientName: `${userData.name} ${userData.lastName}`,
                    price: doctorDetails.price
                };

                // Przygotuj aktualizację w bazie lekarza
                updates[`Doctors/${doctorId}/appointments/${selectedAppointment.id}`] = doctorAppointmentUpdate;

                // Informacje o wizycie do zapisania w bazie pacjenta
                const patientAppointmentUpdate = { ...doctorAppointmentUpdate }; // Use the same structure for patient

                // Dodaj informacje o wizycie do pacjenta
                updates[`Users/${user.uid}/appointments/${selectedAppointment.id}`] = patientAppointmentUpdate;

                // Wykonaj transakcję
                return database.ref().update(updates);

            }).then(() => {
                setModalOpen(false);
                alert('Wizyta została zarezerwowana.');
                navigate('/');
            }).catch(error => {
                alert('Nie udało się zarezerwować wizyty, spróbuj ponownie.');
                console.error('Błąd rezerwacji wizyty:', error);
            });
        } else {
            alert('Nie jesteś zalogowany lub wystąpił błąd z wybranym terminem.');
        }
    };


    return (
        <div>
            <h2>Informacje o lekarzu</h2>
            <div>
                <h4>Lek. {doctorDetails.name} {doctorDetails.lastName}</h4>
                <p>Specjalizacja: {doctorDetails.specialization}</p>
                <p>Średnia ocen: {doctorDetails.totalGrade}</p>
                <p>Cena za wizytę: {doctorDetails.price}</p>
                <p>Numer telefonu: {doctorDetails.phone}</p>
                <p>Email: {doctorDetails.email}</p>
                <p>Adres: {doctorDetails.address}</p>
            </div>

            <h2>Dostępne terminy</h2>
            <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectEvent={handleSelectEvent}
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

            {modalOpen && (
                <div>
                    <p>Czy chcesz umówić się na termin {selectedAppointment && moment(selectedAppointment.start).format('LLLL')}?</p>
                    <button onClick={handleConfirmAppointment}>TAK</button>
                    <button onClick={() => setModalOpen(false)}>NIE</button>
                </div>
            )}
        </div>
    );
};

export default DoctorDetails;
