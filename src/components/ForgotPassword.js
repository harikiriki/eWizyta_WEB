import React, {useRef, useState} from 'react';
import {Form, Button, Card, Container, Alert} from 'react-bootstrap';
import {useAuth} from "../auth/AuthContext";
import {Link} from "react-router-dom";
import '../styles/loginStyle.css';

export default function ForgotPassword() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const {resetPassword} = useAuth()
    const [error, setError] = useState('')
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setMessage("")
            setError('')
            setLoading(true)
            await resetPassword(emailRef.current.value)
            setMessage('Sprawdź swoją skrzynkę pocztową i postępuj zgodnie z instrukcjami.')
        }catch {
            setError('Coś poszło nie tak, spróbuj zresetować hasło ponownie.')
        }
        setLoading(false)
    }

    return (
        <>
            <Container className="d-flex align-items-center justify-content-center" style={{minHeight: "80vh"}}>
                <div className="w-100" style={{maxWidth: "400px"}}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Nie pamiętasz hasła? Zresetuj je!</h2>
                            {error && <Alert variant={"danger"}>{error}</Alert> }
                            {message && <Alert variant={"success"}>{message}</Alert> }

                            <Form onSubmit={handleSubmit}>
                                <Form.Group id="email">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control type="email" ref={emailRef} required/>
                                </Form.Group>

                                <Button disabled={loading} className="w-100 mt-3" type="submit">Zresetuj hasło</Button>
                            </Form>
                            <div className="w-100 text-center mt-2">
                                Przypomniałeś sobie hasło? <Link to="/login">Zaloguj się</Link>
                            </div>
                            <div className="w-100 text-center mt-2">
                                Nie masz konta? <Link to="/register">Zarejestruj się!</Link>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </Container>

        </>
    );
}