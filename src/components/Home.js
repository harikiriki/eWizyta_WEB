import React, { useState, useEffect } from "react";
import { database, storage } from '../firebaseConfig/Firebase';
import { useAuth } from '../auth/AuthContext';
import '../styles/Home.css';

function Home() {
    const [userType, setUserType] = useState(null);
    const [doctorsList, setDoctorsList] = useState([]);
    const [doctorImages, setDoctorImages] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            const doctorRef = database.ref(`Doctors/${currentUser.uid}`);
            doctorRef.once("value").then(snapshot => {
                if (snapshot.exists()) {
                    setUserType('doctor');
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
        }
    }, [currentUser]);

    // Funkcja do obsługi umawiania wizyty
    const handleAppointmentClick = (doctor) => {
        // Tutaj możesz dodać logikę do umawiania wizyty z wybranym lekarzem
        // Na przykład, otwórz nowy formularz umawiania wizyty lub przejdź do odpowiedniej strony
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
            <div><h1>Kalendarz lekarza</h1></div>
        )
    }

}
// //
export default Home;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useState, useEffect } from "react";
// import { database, storage } from '../firebaseConfig/Firebase';
// import { useAuth } from '../auth/AuthContext';
// import Select from 'react-select';
// import '../styles/Home.css';
//
// function Home() {
//     const [userType, setUserType] = useState(null);
//     const [doctorsList, setDoctorsList] = useState([]);
//     const [doctorImages, setDoctorImages] = useState({});
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedSpecialization, setSelectedSpecialization] = useState(null); // Dodane pole do przechowywania wybranej specjalizacji
//     const { currentUser } = useAuth();
//
//     useEffect(() => {
//         if (currentUser) {
//             const doctorRef = database.ref(`Doctors/${currentUser.uid}`);
//             doctorRef.once("value").then(snapshot => {
//                 if (snapshot.exists()) {
//                     setUserType('doctor');
//                 } else {
//                     setUserType('patient');
//
//                     const doctorsDatabaseRef = database.ref('Doctors');
//                     doctorsDatabaseRef.once("value").then(doctorsSnapshot => {
//                         if (doctorsSnapshot.exists()) {
//                             const doctors = [];
//                             const imagePromises = [];
//
//                             doctorsSnapshot.forEach(doctor => {
//                                 const doctorData = doctor.val();
//                                 doctors.push(doctorData);
//
//                                 // Pobierz zdjęcia lekarzy i zapisz je w stanie
//                                 const imageRef = storage.ref(`profileImages/profileImage_${doctorData.uid}.jpg`);
//                                 const imagePromise = imageRef.getDownloadURL().then(url => {
//                                     setDoctorImages(prevImages => ({
//                                         ...prevImages,
//                                         [doctorData.uid]: url
//                                     }));
//                                 }).catch(error => {
//                                     // Obsłuż błąd, jeśli nie ma zdjęcia lekarza
//                                     setDoctorImages(prevImages => ({
//                                         ...prevImages,
//                                         [doctorData.uid]: 'ścieżka/do/obrazu/domyślnego.png'
//                                     }));
//                                 });
//
//                                 imagePromises.push(imagePromise);
//                             });
//
//                             // Po załadowaniu wszystkich zdjęć zaktualizuj stan z listą lekarzy i zdjęciami
//                             Promise.all(imagePromises).then(() => {
//                                 setDoctorsList(doctors);
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     }, [currentUser]);
//
//     // Funkcja do obsługi umawiania wizyty
//     const handleAppointmentClick = (doctor) => {
//         // Tutaj możesz dodać logikę do umawiania wizyty z wybranym lekarzem
//         // Na przykład, otwórz nowy formularz umawiania wizyty lub przejdź do odpowiedniej strony
//     };
//
//     const specializationOptions = doctorsList.map((doctor) => ({
//         value: doctor.specialization,
//         label: doctor.specialization,
//     }));
//
//     // Funkcja do filtrowania lekarzy na podstawie wprowadzonego słowa kluczowego i wybranej specjalizacji
//     const filteredDoctors = doctorsList.filter((doctor) => {
//         const searchString = searchTerm.toLowerCase();
//         const specializationFilter = selectedSpecialization ? selectedSpecialization.value.toLowerCase() : '';
//
//         return (
//             (doctor.specialization.toLowerCase().includes(specializationFilter) ||
//                 `${doctor.name} ${doctor.lastName}`.toLowerCase().includes(searchString)) &&
//             (!selectedSpecialization || doctor.specialization.toLowerCase() === specializationFilter)
//         );
//     });
//
//     return (
//         <div>
//             <h1>Strona pacjenta</h1>
//             <div className="search-bar">
//                 <input
//                     type="text"
//                     placeholder="Wyszukaj lekarza..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//             </div>
//             <div className="specialization-select">
//                 <Select
//                     options={specializationOptions}
//                     isClearable
//                     placeholder="Wybierz specjalizację"
//                     value={selectedSpecialization}
//                     onChange={(selectedOption) => setSelectedSpecialization(selectedOption)}
//                 />
//             </div>
//             <div className="row">
//                 {filteredDoctors.map((doctor, index) => (
//                     <div key={index} className="card">
//                         <div className="card-img-wrapper">
//                             <img
//                                 src={doctorImages[doctor.uid] || 'ścieżka/do/obrazu/domyślnego.png'}
//                                 alt={`${doctor.name} ${doctor.lastName}`}
//                             />
//                         </div>
//                         <div className="card-body">
//                             <h5 className="card-title">{doctor.name} {doctor.lastName}</h5>
//                             <p className="card-text">Specjalizacja: {doctor.specialization}</p>
//                             <p className="card-text">Cena za wizytę: {doctor.price}</p>
//                             <p className="card-text">Średnia ocen: {doctor.totalGrade}</p>
//                             <button
//                                 className="btn btn-primary"
//                                 onClick={() => handleAppointmentClick(doctor)}
//                             >
//                                 Umów wizytę
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }
//
// export default Home;
