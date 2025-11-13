import { NavLink, useNavigate } from "react-router-dom";
import "./myHeader.css";
import homepage from "../../../assets/homepage.png";
import { Button } from "@mui/material";
import { userLogout } from "../../../redux/authState";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

function MyHeader(): JSX.Element {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userType = useSelector((state: RootState) => state.authState.userType);

    const login = () => {
        navigate("/login");
    };

    const logout = () => {
        dispatch(userLogout());
        localStorage.removeItem('token');
        navigate("/");
    };

    const renderAuthButton = () => {
        if (!userType || userType === '') {
            return <Button variant="contained" color="primary" onClick={login}>כניסה למערכת</Button>;
        } else {
            return <Button variant="contained" color="error" onClick={logout}>יציאה מהמערכת</Button>;
        }
    };

    return (
        <div className="myHeader">
            <h1>מערכת קופונים</h1>
            <div className="botton-padding">
                {renderAuthButton()}
            </div>
            <div style={{ position: "relative", textAlign: "right", paddingRight: "90px", bottom: "97px" }}>
                <NavLink to="/" style={{ fontFamily: "cursive" }}>
                    <img src={homepage} alt="דף הבית" style={{ width: "40px" }} />
                </NavLink>
            </div>
        </div>
    );
}

export default MyHeader;