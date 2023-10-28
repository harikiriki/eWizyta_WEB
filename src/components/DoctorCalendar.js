import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { database } from '../firebaseConfig/Firebase';

const localizer = momentLocalizer(moment);

function DoctorCalendar() {
    // const [events, setEvents] = useState([]);
    //
    // useEffect(() => {
    //     const doctorRef = database.ref(`Doctors/${YOUR_DOCTOR_ID}/appointments`);
    //     doctorRef.on('value', (snapshot) => {
    //         const appointments = snapshot.val();
    //         const formattedEvents = Object.values(appointments).map(appointment => ({
    //             start: moment(appointment.datetime, 'DD/MM/YYYY HH:mm').toDate(),
    //             end: moment(appointment.datetime, 'DD/MM/YYYY HH:mm').add(1, 'hours').toDate(),
    //             title: appointment.patientName ? `Wizyta: ${appointment.patientName}` : 'Dostępny termin'
    //         }));
    //         setEvents(formattedEvents);
    //     });
    //
    //     return () => doctorRef.off();
    // }, []);
    //
    // return <Calendar
    //     localizer={localizer}
    //     events={events}
    //     startAccessor="start"
    //     endAccessor="end"
    // />;
    return (
        <div className="login-container">
            <h2>Kalendarz</h2>


        </div>
    );
}

export default DoctorCalendar;
