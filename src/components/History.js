import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap'; // lub inny pakiet dla komponentów modalnych, który preferujesz
import { auth, database } from '../firebaseConfig/Firebase';
import '../styles/Home.css';

function History() {
    const [appointmentList, setAppointmentList] = useState([]);
    const [isDoctor, setIsDoctor] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const uid = auth.currentUser ? auth.currentUser.uid : null;

    useEffect(() => {
        if (uid) {
            const doctorsReference = database.ref(`Doctors/${uid}`);
            doctorsReference.once('value').then(snapshot => {
                setIsDoctor(snapshot.exists());

                const usersRef = database.ref('Users');
                let foundAppointments = [];

                usersRef.once('value').then(usersSnapshot => {
                    usersSnapshot.forEach(userSnapshot => {
                        const userAppointments = userSnapshot.child('appointments').val();
                        for (let key in userAppointments) {
                            const appointment = userAppointments[key];
                            if (appointment.complete) {
                                if (isDoctor && appointment.doctorId === uid) {
                                    foundAppointments.push({
                                        id: key,
                                        ...appointment,
                                        patientName: userSnapshot.child('name').val()
                                    });
                                } else if (!isDoctor && appointment.patientId === uid) {
                                    foundAppointments.push({
                                        id: key,
                                        ...appointment,
                                        doctorName: appointment.doctorName // Załóżmy, że nazwa lekarza jest już zapisana w wizycie
                                    });
                                }
                            }
                        }
                    });
                    foundAppointments.reverse();
                    setAppointmentList(foundAppointments);
                });
            });
        }
    }, [uid, isDoctor]);

    const handleShowDetails = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <div className="container mt-4">
            {appointmentList.map(appointment => (
                <div className="card mb-3" key={appointment.id}>
                    <div className="card-body">
                        <h5 className="card-title">{isDoctor ? appointment.patientName : appointment.doctorName}</h5>
                        <p className="card-text">Data wizyty: {appointment.dateTime}</p>
                        {!isDoctor &&
                            <button
                                className="btn btn-primary"
                                onClick={() => handleShowDetails(appointment)}>
                                Szczegóły
                            </button>
                        }
                    </div>
                </div>
            ))}

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Szczegóły wizyty</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <>
                            <p>Lekarz: {selectedAppointment.doctorName}</p>
                            <p>Miejsce: {selectedAppointment.address}</p>
                            <p>Data wizyty: {selectedAppointment.dateTime}</p>
                            <p>Całkowity koszt wizyty: {selectedAppointment.price}</p>
                            {/* Inne szczegóły wizyty, które chcesz wyświetlić */}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={handleCloseModal}>
                        Zamknij
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default History;
