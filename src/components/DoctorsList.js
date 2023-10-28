import React, { useState, useEffect, useContext } from "react";
import { Card, CardContent, Button, Avatar } from '@mui/material';
import Typography from '@mui/material/Typography';
import { database, storage } from '../firebaseConfig/Firebase';


function DoctorsList() {
    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        const doctorsRef = database.ref("Doctors");
        doctorsRef.on("value", (snapshot) => {
            let doctorList = [];
            snapshot.forEach((childSnapshot) => {
                let doctorData = childSnapshot.val();
                doctorList.push({
                    ...doctorData,
                    uid: childSnapshot.key
                });
            });
            setDoctors(doctorList);
        });
    }, []);

    return (
        <div>
            {doctors.map((doctor, index) => (
                <DoctorCard key={index} doctor={doctor} />
            ))}
        </div>
    );
}

function DoctorCard({ doctor }) {
    const [imageSrc, setImageSrc] = useState(null);
    const [avgGrade, setAvgGrade] = useState("0.0");

    useEffect(() => {
        const fileName = `profileImage_${doctor.uid}.jpg`;
        const profilePictureRef = storage.ref(`profileImages/${fileName}`);
        profilePictureRef.getDownloadURL()
            .then((url) => {
                setImageSrc(url);
            })
            .catch(() => {
                setImageSrc(storage.ref(`profileImages/baseline_person.png`));
            });

        const doctorRef = database.ref(`Doctors/${doctor.uid}`);
        doctorRef.on("value", (snapshot) => {
            const totalGrade = snapshot.child("totalGrade").val() || 0;
            const ratingCount = snapshot.child("ratingCount").val() || 0;
            if (ratingCount > 0) {
                setAvgGrade((totalGrade / ratingCount).toFixed(1));
            }
        });
    }, [doctor]);

    return (
        <Card>
            <CardContent>
                <Avatar alt={`${doctor.name} ${doctor.lastName}`} src={imageSrc} />
                <Typography>Lek. {doctor.name}</Typography>
                <Typography>{doctor.lastName}</Typography>
                <Typography>{doctor.specialization}</Typography>
                <Typography>{avgGrade}</Typography>
                <Typography>{doctor.price}</Typography>
                <Button onClick={() => {
                    // funkcjonalność "Umów wizytę"
                }}>
                    Umów wizytę
                </Button>
            </CardContent>
        </Card>
    );
}

export default DoctorsList;
