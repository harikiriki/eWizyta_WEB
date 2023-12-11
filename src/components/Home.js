import React, { useState, useEffect } from "react";
import { database, storage } from '../firebaseConfig/Firebase';
import { useAuth } from '../auth/AuthContext';
import '../styles/Home.css';
import clinic from '../clinic.png'


import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/pl'; // Importuj lokalizację dla moment

import 'react-big-calendar/lib/css/react-big-calendar.css';
import {useNavigate} from "react-router-dom";

// Ustaw lokalizator dla kalendarza
moment.locale('pl');
const localizer = momentLocalizer(moment);

function Home() {
    const [userType, setUserType] = useState(null);
    const [doctorsList, setDoctorsList] = useState([]);
    const [doctorImages, setDoctorImages] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTime, setSelectedTime] = useState(''); // stan dla wybranej godziny
    const [selectedSlot, setSelectedSlot] = useState(null);


    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false); // New state to handle the time picker


    const handleSelectSlot = ({ start, end }) => {
        console.log("Slot selected:", start, end);

        // Sprawdź, czy wybrana data jest w przyszłości
        if (moment(start).isSameOrAfter(moment(), 'day')) {
            setSelectedSlot({ start, end }); // Zapisz wybrany slot jako selectedEvent
            setIsModalOpen(true);
        } else {
            alert('Nie można dodawać wizyt w przeszłości.');
        }
    };



    const handleSelectEvent = async (event) => {
        console.log("Wybrano wydarzenie:", event);

        // Format selected event date and time to match database format
        const selectedEventDateTime = moment(event.start).format('DD/MM/YYYY HH:mm');

        try {
            // Fetch all appointments from the database
            const appointmentsRef = database.ref(`Doctors/${currentUser.uid}/appointments`);
            const snapshot = await appointmentsRef.once('value');
            const appointments = snapshot.val();

            // Find an appointment with a matching dateTime
            let matchingAppointment = null;
            for (const [key, appointment] of Object.entries(appointments)) {
                if (appointment.dateTime === selectedEventDateTime) {
                    matchingAppointment = { id: key, ...appointment };
                    break;
                }
            }

            console.log("Znaleziono pasującą wizytę:", matchingAppointment);

            // Check if a matching appointment is found
            if (matchingAppointment) {
                if (!matchingAppointment.free) {
                    // If the appointment is not free, display details
                    setSelectedEvent(matchingAppointment);
                    setIsModalOpen('booked');
                } else {
                    // If the appointment is free, show a message
                    setSelectedTime(selectedEventDateTime); // Use the date and time of the event
                    setIsModalOpen('free');
                }
            } else {
                console.error('Brak danych dla wybranego wydarzenia w bazie danych.');
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Błąd przy pobieraniu danych wydarzenia:', error);
        }
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
        console.log("useEffect started"); // Logowanie na początku useEffect

        if (currentUser) {
            console.log("Current user:", currentUser);
            const doctorRef = database.ref(`Doctors/${currentUser.uid}`);
            doctorRef.once("value").then(snapshot => {
                console.log("DoctorRef snapshot:", snapshot.exists());

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
                        }
                    });
                } else {
                    setUserType('patient');
                }
            }).catch(error => {
                console.error("Error with doctorRef snapshot:", error);
            });
        }

        // Pobieranie listy lekarzy dla wszystkich użytkowników, niezależnie od ich typu
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
                        setDoctorImages(prevImages => ({
                            ...prevImages,
                            [doctorData.uid]: storage.ref(`profileImages/baseline_person.png`)
                        }));
                    });

                    imagePromises.push(imagePromise);
                });

                Promise.all(imagePromises).then(() => {
                    setDoctorsList(doctors);
                }).catch(error => {
                    console.error("Error loading doctor images:", error);
                });
            } else {
                console.log("No doctors found in database");
            }
        }).catch(error => {
            console.error("Error loading doctors from database", error);
        });

        // Clean-up function
        return () => {
            if (appointmentsRef) {
                appointmentsRef.off();
            }
        };
    }, [currentUser]);


    // Funkcja do obsługi umawiania wizyty
    const handleAppointmentClick = (doctor) => {
        // Przenosi użytkownika do strony szczegółów lekarza
        navigate(`/doctor/${doctor.uid}`);
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
            <div><h2>Witaj w eWizyta!</h2>
                <h3>Systemie umożliwiającym szybki kontakt z lekarzem specjalistą.</h3>
                <img
                    src={clinic}
                    alt="Strona główna"
                    className="home-image"
                />
            </div>
        )
    } else if (userType === 'patient') {
        return (
            <div>
                <h2>Znajdź lekarza i umów wizytę w kilka chwil!</h2>
                <h5>Skorzystaj z wyszukiwarki, aby znaleźć lekarza o wybranej przez siebie specjalizacji.</h5>
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
                                <p className="card-text">Średnia ocen: {
                                    doctor.ratingCount > 0 ? (doctor.totalGrade / doctor.ratingCount).toFixed(1) : "Brak ocen"
                                }</p>
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
                    }}x
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

                {isModalOpen === 'booked' && selectedEvent && (
                    <div className="modal">
                        <h3>Informacje o wizycie</h3>
                        <p>Data wizyty: {moment(selectedEvent.start).format('LL HH:mm')}</p>
                        <p>Imię i nazwisko pacjenta: {selectedEvent.patientName}</p>
                        {/* Add additional information fields as needed */}
                        <button onClick={closeModal}>Zamknij</button>
                    </div>
                )}

                {isModalOpen === 'free' && (
                    <div className="modal">
                        <h3>Termin wolny</h3>
                        <p>Wybrany termin: {selectedTime}</p>
                        <p>Żaden pacjent nie umówił się na tę wizytę</p>
                        <button onClick={closeModal}>Zamknij</button>
                    </div>
                )}
            </div>
        )
    }
}
// //
export default Home;