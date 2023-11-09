import React, { useState, useEffect } from 'react'

// Helper function to generate an array with days of the month
function generateCalendarDays(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}

// Funkcja komponentu kalendarza
export function Calendar() {
    const [selectedDay, setSelectedDay] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // miesiąc jako liczba od 0 do 11

    const days = generateCalendarDays(currentYear, currentMonth);

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setIsModalOpen(true); // Otwórz okno modalne
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Zamknij okno modalne
    };

    return (
        <div>
            <h2>Kalendarz</h2>
            <div className="calendar">
                {days.map(day => (
                    <button key={day} onClick={() => handleDayClick(day)}>
                        {day}
                    </button>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal">
                    <h3>Umów wizytę na dzień: {selectedDay}</h3>
                    <button onClick={handleCloseModal}>Anuluj</button>
                    <button>Umów wizytę</button>
                </div>
            )}
        </div>
    );
}
