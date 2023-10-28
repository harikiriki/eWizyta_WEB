import {AppBar, Toolbar, Typography} from "@mui/material";
import {Link} from "react-router-dom";


const Navbar = () => {


    return (
        <div>
            <AppBar position="static">
                <Toolbar variant="dense" sx={{justifyContent: "space-between"}}>
                    <Link to="login">
                        <Typography variant="h6">
                            Zaloguj się
                        </Typography>
                    </Link>
                    <Link to="register">
                        <Typography variant="h6">
                            Zarejestruj się
                        </Typography>
                    </Link>
                </Toolbar>
            </AppBar>
        </div>

    );


}

export default Navbar;