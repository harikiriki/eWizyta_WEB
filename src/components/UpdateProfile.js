import React, {useRef, useState} from 'react';
import {Form, Button, Card, Container, Alert} from 'react-bootstrap';
import {useAuth} from "../auth/AuthContext";
import {Link, useNavigate} from "react-router-dom";
import '../styles/registerStyle.css';

export default function UpdateProfile() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const passwordConfirmRef = useRef()
    const nameRef = useRef()
    const lastNameRef = useRef()
    const phoneRef = useRef()
    const birthDateRef = useRef()
    const genderRef = useRef()

    const {currentUser, updateProfile} = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    function handleSubmit(e) {
        e.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            return setError('Hasła do siebie nie pasują.');
        }

        setLoading(true);
        setError('');
        console.log(currentUser);


        updateProfile(
            emailRef.current.value,
            passwordRef.current.value,
            nameRef.current.value,
            lastNameRef.current.value,
            phoneRef.current.value,
            birthDateRef.current.value,
            genderRef.current.value
        )
            .then(() => {
                navigate("/userProfile"); // Przekieruj użytkownika po udanej aktualizacji
            })
            .catch(() => {
                setError('Aktualizacja danych konta nie powiodła się.');
            })
            .finally(() => {
                setLoading(false);
            });
    }

    return (
        <>
            <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "80vh"}}>
                <div className="w-100" style={{maxWidth: "500px"}}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Zaktualizuj swój profil</h2>
                            {error && <Alert variant={"danger"}>{error}</Alert> }
                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control type="email" ref={emailRef} required
                                    defaultValue={currentUser.email}/>
                                </Form.Group>
                                <Form.Group id="password">
                                    <Form.Label>Hasło</Form.Label>
                                    <Form.Control type="password" ref={passwordRef}
                                    placeholder="Zostaw puste, jeśli chcesz zostawić takie samo hasło"/>
                                </Form.Group>
                                <Form.Group id="passwordConfirm">
                                    <Form.Label>Powtórz hasło</Form.Label>
                                    <Form.Control type="password" ref={passwordConfirmRef}
                                                  placeholder="Zostaw puste, jeśli chcesz zostawić takie samo hasło"/>
                                </Form.Group>
                                <Form.Group id="name">
                                    <Form.Label>Imię</Form.Label>
                                    <Form.Control type="text" ref={nameRef} required defaultValue={currentUser ? currentUser.name : ""} />
                                </Form.Group>
                                <Form.Group id="lastName">
                                    <Form.Label>Nazwisko</Form.Label>
                                    <Form.Control type="text" ref={lastNameRef} required
                                                  defaultValue={currentUser.lastName}/>
                                </Form.Group>
                                <Form.Group id="phone">
                                    <Form.Label>Numer telefonu</Form.Label>
                                    <Form.Control type="text" ref={phoneRef} required
                                                  defaultValue={currentUser.phone}/>
                                </Form.Group>
                                <Form.Group id="birthDate">
                                    <Form.Label>Data urodzenia</Form.Label>
                                    <Form.Control type="text" ref={birthDateRef} required
                                                  defaultValue={currentUser.birthDate}/>
                                </Form.Group>
                                <Form.Group id="gender">
                                    <Form.Label>Płeć</Form.Label>
                                    <Form.Control type="text" ref={genderRef} required
                                                  defaultValue={currentUser.gender}/>
                                </Form.Group>
                                <Button disabled={loading} className="w-100 mt-3" type="submit">Zaktualizuj dane</Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="w-100 text-center mt-2">
                        <Link to="/userProfile">Anuluj</Link>
                    </div>
                </div>
            </Container>

        </>
    );
}