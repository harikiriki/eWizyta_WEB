import '../styles/navbarStyle.css';
import {Link, useMatch, useResolvedPath} from "react-router-dom"
import {useAuth} from "../auth/AuthContext";

export default function Navbar() {
    const { currentUser } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/" className="site-title">eWizyta</Link>
            <ul className="nav-links">
                {!currentUser && (
                    <>
                        <CustomLinkItem to="/login">Logowanie</CustomLinkItem>
                        <CustomLinkItem to="/register">Rejestracja</CustomLinkItem>
                        <CustomLinkItem to="/register-doctor">Dla profesjonalistów</CustomLinkItem>
                    </>
                )}
                {currentUser && (
                    <>
                        <CustomLinkItem to="/history">Historia wizyt</CustomLinkItem>
                        <CustomLinkItem to="/user-profile">Profil użytkownika</CustomLinkItem>
                    </>
                )}
            </ul>
        </nav>
    );
}

function CustomLinkItem({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });

    return (
        <li className={isActive && isActive.pathname === resolvedPath.pathname ? "active" : ""}>
            <CustomLink to={to} {...props}>
                {children}
            </CustomLink>
        </li>
    );
}

function CustomLink({ to, children, ...props }) {
    return <Link to={to} {...props}>{children}</Link>;
}
