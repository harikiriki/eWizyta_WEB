import React, { useState, useEffect } from "react";
import { database, storage } from '../firebaseConfig/Firebase';
import { useAuth } from '../auth/AuthContext';
import '../styles/Home.css';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pl'; // Importuj lokalizację dla moment

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Ustaw lokalizator dla kalendarza
moment.locale('pl');
const localizer = momentLocalizer(moment);

function Home() {
    const [userType, setUserType] = useState(null);
    const [doctorsList, setDoctorsList] = useState([]);
    const [doctorImages, setDoctorImages] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTime, setSelectedTime] = useState(''); // stan dla wybranej godziny
    const [selectedSlot, setSelectedSlot] = useState(null);


    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false); // New state to handle the time picker


    const handleSelectSlot = ({ start, end }) => {
        console.log("Slot selected:", start, end);
        setSelectedSlot({ start, end }); // Zapisz wybrany slot jako selectedEvent
        setIsModalOpen(true);
    };


    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTime(''); // Resetujemy również wybraną godzinę
    };

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
        if (e.target.value) {
            setIsModalOpen('time'); // Ustawiamy na 'time', aby pokazać wybór godziny
        }
    };

    const handleSaveAppointment = async () => {
        if (userType !== 'doctor' || !currentUser) {
            alert('Tylko zalogowani lekarze mogą dodawać wizyty.');
            return;
        }

        if (!selectedTime) {
            alert('Musisz wybrać godzinę wizyty.');
            return;
        }

        try {
            // Pobieramy informacje o lekarzu
            const doctorDataRef = database.ref(`Doctors/${currentUser.uid}`);
            const doctorDataSnap = await doctorDataRef.once('value');
            const doctorData = doctorDataSnap.val();

            // Formatujemy datę wybraną w kalendarzu i dodajemy wybraną godzinę
            const date = moment(selectedSlot.start).format('DD/MM/YYYY');
            const dateTime = `${date} ${selectedTime}`;

            // Tworzymy obiekt wizyty z wymaganymi danymi
            const appointment = {
                doctorId: currentUser.uid,
                dateTime: dateTime,  // Używamy sformatowanego ciągu daty i czasu
                patientId: "",
                patientName: "YourPatientNameHere",
                address: doctorData.address || 'Brak adresu',
                complete: false,
                doctorName: `${doctorData.name} ${doctorData.lastName}`,
                free: true,
                price: doctorData.price || 'Brak ceny'
            };

            // Zapisujemy wizytę w bazie danych
            const appointmentRef = database.ref(`Doctors/${currentUser.uid}/appointments`).push();
            await appointmentRef.set(appointment);

            // Aktualizujemy wydarzenia w kalendarzu
            setEvents([...events, { ...appointment, id: appointmentRef.key }]);

            alert('Poprawnie dodano wizytę');
            closeModal();
        } catch (error) {
            console.error('Błąd przy zapisywaniu wizyty:', error);
            alert('Nie udało się dodać wizyty, spróbuj ponownie.');
        }
    };


    useEffect(() => {
        let appointmentsRef;
        if (currentUser) {
            const doctorRef = database.ref(`Doctors/${currentUser.uid}`);
            doctorRef.once("value").then(snapshot => {
                if (snapshot.exists()) {
                    setUserType('doctor');
                    // Ustawienie odnośnika do wizyt lekarza
                    appointmentsRef = database.ref(`Doctors/${currentUser.uid}/appointments`);
                    appointmentsRef.on("value", snapshot => {
                        const appointments = snapshot.val();
                        if (appointments) {
                            const formattedEvents = Object.keys(appointments).map(key => {
                                const { dateTime, patientName, free } = appointments[key];
                                const [date, time] = dateTime.split(' ');
                                const [day, month, year] = date.split('/');
                                const [hours, minutes] = time.split(':');
                                // Konwersja daty na format wymagany przez kalendarz
                                const start = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hours, 10), parseInt(minutes, 10));
                                const end = new Date(start.getTime() + 30 * 60000); // Zakładamy, że każda wizyta trwa 30 minut
                                return {
                                    title: free ? "Wolny termin" : patientName, // Ustawienie odpowiedniego tytułu w zależności od statusu wizyty
                                    start: start,
                                    end: end,
                                    allDay: false
                                };
                            });
                            setEvents(formattedEvents);
                        } else {
                            setUserType('patient');
                            const doctorsDatabaseRef = database.ref('Doctors');
                            doctorsDatabaseRef.once("value").then(doctorsSnapshot => {
                                if (doctorsSnapshot.exists()) {
                                    const doctors = [];
                                    const imagePromises = [];

                                    doctorsSnapshot.forEach(doctor => {
                                        const doctorData = doctor.val();
                                        doctors.push(doctorData);

                                        // Pobierz zdjęcia lekarzy i zapisz je w stanie
                                        const imageRef = storage.ref(`profileImages/profileImage_${doctorData.uid}.jpg`);
                                        const imagePromise = imageRef.getDownloadURL().then(url => {
                                            setDoctorImages(prevImages => ({
                                                ...prevImages,
                                                [doctorData.uid]: url
                                            }));
                                        }).catch(error => {
                                            // Obsłuż błąd, jeśli nie ma zdjęcia lekarza
                                            setDoctorImages(prevImages => ({
                                                ...prevImages,
                                                [doctorData.uid]: storage.ref(`profileImages/baseline_person.png`)
                                            }));
                                        });

                                        imagePromises.push(imagePromise);
                                    });

                                    // Po załadowaniu wszystkich zdjęć zaktualizuj stan z listą lekarzy i zdjęciami
                                    Promise.all(imagePromises).then(() => {
                                        setDoctorsList(doctors);
                                    });
                                }
                            });
                        }
                    });
                } else {
                    setUserType('patient');
                    // Reszta logiki dla pacjenta...
                    // (tutaj nic się nie zmienia)
                }
            });
        }
        // Clean-up function
        return () => {
            if (appointmentsRef) {
                appointmentsRef.off();
            }
        };
    }, [currentUser]); // Nie potrzebujesz 'userType' w tablicy zależności useEffect, ponieważ 'userType' jest ustawiane wewnątrz tego efektu



    // Funkcja do obsługi umawiania wizyty
    const handleAppointmentClick = (doctor) => {

    };

    // Funkcja do filtrowania lekarzy na podstawie wprowadzonego słowa kluczowego
    const filteredDoctors = doctorsList.filter((doctor) => {
        const searchString = searchTerm.toLowerCase();
        return (
            doctor.specialization.toLowerCase().includes(searchString) ||
            `${doctor.name} ${doctor.lastName}`.toLowerCase().includes(searchString)
        );
    });

    if (!userType) {
        return (
            <div><h1>Tu będzie strona główna</h1></div>
        )
    } else if (userType === 'patient') {
        return (
            <div>
                <h1>Strona pacjenta</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Wyszukaj lekarza..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="row">
                    {filteredDoctors.map((doctor, index) => (
                        <div key={index} className="card">
                            <div className="card-img-wrapper">
                                <img
                                    src={doctorImages[doctor.uid] || storage.ref(`profileImages/baseline_person.png`)}
                                    alt={`${doctor.name} ${doctor.lastName}`}
                                />
                            </div>
                            <div className="card-body">
                                <h5 className="card-title">{doctor.name} {doctor.lastName}</h5>
                                <p className="card-text">Specjalizacja: {doctor.specialization}</p>
                                <p className="card-text">Cena za wizytę: {doctor.price}</p>
                                <p className="card-text">Średnia ocen: {doctor.totalGrade}</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAppointmentClick(doctor)}
                                >
                                    Umów wizytę
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (userType === 'doctor') {

        return (
            <div><h1>Kalendarz lekarza</h1>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    selectable={true}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    messages={{
                        allDay: 'Cały dzień',
                        previous: 'Poprzedni miesiąc',
                        next: 'Następny miesiąc',
                        today: 'Dziś',
                        month: 'Miesiąc',
                        week: 'Tydzień',
                        day: 'Dzień',
                        agenda: 'Agenda',
                        date: 'Data',
                        time: 'Czas',
                        event: 'Wydarzenie',
                    }}
                />

                {isModalOpen && (
                    <div className="modal">
                        <h3>Chcesz dodać nową wizytę?</h3>
                        <strong><p>Wybrany termin:</p></strong>
                        {selectedSlot && (
                            <p>{moment(selectedSlot.start).format('LL')}</p> // Format 'LL' wyświetli datę w formacie np. "10 listopada 2023"
                        )}
                        <strong><p>Wybierz godzinę:</p></strong>
                        <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                        {selectedTime && <button onClick={handleSaveAppointment}>Zapisz wizytę</button>}
                        <button onClick={closeModal}>Anuluj</button>
                    </div>
                )}
            </div>
        )
    }
}
// //
export default Home;