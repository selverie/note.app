import React, { useState } from "react";
import login from "../assets/images/login.png";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase_db';

const Login = () => {
    const navigate = useNavigate();

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState(null);

    const handleLinkClick = () => {

    };

    const handleLogin = async () => {
        setLoginError(null);
    
        if (!loginEmail) {
            setLoginError("Enter an email address");
            return;
        }
    
        if (!loginPassword) {
            setLoginError("Enter a password");
            return;
        }
    
        const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
    
        if (!gmailRegex.test(loginEmail)) {
            setLoginError("Invalid email format");
            return;
        }
    
        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            const user = userCredential.user;
            navigate('/home');
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                setLoginError("Unregistered Email");
            } else if (error.code === "auth/wrong-password") {
                setLoginError("Wrong Password");
            } else {
                setLoginError("An error occurred while logging in");
            }
        }
    };    

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <div className={`page ${theme}-theme`}>
            <div className="container">
                <div className="row align-items-center justify-content-center vh-100">
                    <div className="col-lg-9">
                        <div className="shadow rounded">
                            <div className="row align-items-center">
                                <div className="col-lg-5" id="bg-login">
                                    <img
                                        src={login}
                                        alt="Background"
                                        className="login"
                                        width="250px"
                                        height="250px"
                                        style={{ marginLeft: '50px' }}
                                        id="image"
                                    />
                                </div>
                                <div className={`col-lg-7 text-${theme === 'light' ? 'dark' : 'white'}`}>
                                    <div className={`p-5 ps-4 text-${theme === 'light' ? 'dark' : 'white'}`}>
                                        <form>
                                            <h3>Login</h3>
                                            <div className="mb-3">
                                                <label htmlFor="exampleInputEmail1" className="form-label">
                                                    Email address
                                                </label>
                                                <input
                                                    type="email"
                                                    className={`form-control bg-${theme === 'light' ? 'white' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}
                                                    id="exampleInputEmail1"
                                                    aria-describedby="emailHelp"
                                                    onChange={(event) => { setLoginEmail(event.target.value); }}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="exampleInputPassword1" className="form-label">
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    className={`form-control bg-${theme === 'light' ? 'white' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}
                                                    id="exampleInputPassword1"
                                                    onChange={(event) => { setLoginPassword(event.target.value); }}
                                                />
                                            </div>
                                            <div className="pw">
                                                No account yet? <br />
                                                <Link to="/register" onClick={handleLinkClick}>
                                                    Sign up
                                                </Link>
                                            </div>
                                            <div className="mb-3">
                                                <button
                                                    className={`btn btn-cyan shadow text-${theme === 'light' ? 'dark' : 'white'}`}
                                                    type="button"
                                                    onClick={handleLogin}
                                                >
                                                    <b>Login</b>
                                                </button>
                                            </div>
                                            <div className="mb-3">
                                                {loginError && <p className="text-danger">{loginError}</p>}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`theme-toggle-button ${theme}-theme`}>
                <button className="btn" onClick={handleThemeToggle}>
                    {theme === 'light' ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
                </button>
            </div>
        </div>
    );
};

export default Login;
