import React, { useState } from "react";
import register from "../assets/images/register.png";
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase_firestore";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
    const navigate = useNavigate();

    const handleLinkClick = () => {
    };

    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [isAccepted, setIsAccepted] = useState(false);
    const [registerError, setRegisterError] = useState(null);


    const handleRegister = async () => {
        try {
            if (!isAccepted) {
                setRegisterError("Please accept the Terms and Conditions.");
                return;
            }

            if (registerName.trim() === "") {
                setRegisterError("Enter a username");
                return;
            }

            if (registerEmail.trim() === "") {
                setRegisterError("Enter an email address");
                return;
            }

            if (registerPassword.trim() === "") {
                setRegisterError("Enter a password");
                return;
            }

            if (registerPassword.length < 8) {
                setRegisterError("Password should be at least 8 characters");
                return;
            }

            const emailRegex = /^[a-z0-9._-]+@gmail\.com$/;
            if (!emailRegex.test(registerEmail)) {
                setRegisterError("Invalid email format");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
            const user = userCredential.user;
            console.log("User registered:", user);

            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                name: registerName
            });
            
            setRegisterError("Successful Registration");
            
            navigate('/register');
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setRegisterError("Email already in use");
            } else if (error.code === "auth/invalid-email") {
                setRegisterError("Invalid email format");
            } else {
                setRegisterError(error.message);
            }
            console.error("Error registering user:", error);
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
                                <div className="col-lg-5" id="bg-register">
                                    <img
                                        src={register}
                                        alt="Background"
                                        className="rounded text-center"
                                        width="300px"
                                        height="300px"
                                        style={{ marginLeft: '25px' }}
                                        id="image"
                                    />
                                </div>
                                <div className="col-lg-7">
                                    <div className={`p-5 ps-4 ${theme}-theme-text`}>
                                        <form>
                                            <h3 className={theme === 'light' ? 'text-dark' : 'text-white'}>
                                                Register Here
                                            </h3>
                                            <h6 className={theme === 'light' ? 'text-dark' : 'text-white'} style={{ fontWeight: 400 }}>
                                                Please fill all field below
                                            </h6>
                                            <div className="mb-3 mt-4">
                                                <label htmlFor="inputname" className="form-label">
                                                    Name
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`form-control bg-${theme === 'light' ? 'white' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}
                                                    id="inputname"
                                                    onChange={(event) => { setRegisterName(event.target.value); }}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="exampleInputEmail1"
                                                    className="form-label"
                                                >
                                                    Email address
                                                </label>
                                                <input
                                                    type="email"
                                                    className={`form-control bg-${theme === 'light' ? 'white' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}
                                                    id="exampleInputEmail1"
                                                    aria-describedby="emailHelp"
                                                    onChange={(event) => { setRegisterEmail(event.target.value); }}
                                                />
                                                <div id="emailHelp" className={`form-text${theme === 'light' ? 'white' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}>
                                                    We'll never share your email with anyone else.
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label
                                                    htmlFor="exampleInputPassword1"
                                                    className="form-label"
                                                >
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    className={`form-control bg-${theme === 'light' ? 'white' : 'dark'} text-${theme === 'light' ? 'dark' : 'white'}`}
                                                    id="exampleInputPassword1"
                                                    onChange={(event) => { setRegisterPassword(event.target.value); }}
                                                />
                                            </div>
                                            <div className="mb-3 form-check">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="exampleCheck1"
                                                    onChange={() => setIsAccepted(!isAccepted)}
                                                />
                                                <label
                                                    className="form-check-label mb-3"
                                                    htmlFor="exampleCheck2"
                                                    style={{ fontSize: '13px' }}
                                                >
                                                    I Do Accept the Term and Conditions of your site
                                                </label>
                                            </div>

                                            <div className="pw">
                                                Already have an account? <br />
                                                <Link to="/" onClick={handleLinkClick}>
                                                    Log in
                                                </Link>
                                            </div>

                                            <div className="mb-3">
                                                <button
                                                    className="btn btn-cyan shadow"
                                                    type="button"
                                                    onClick={handleRegister}
                                                >
                                                    <b>Submit</b>
                                                </button>
                                            </div>
                                            <div className="mb-3">
                                                {registerError && <p className="text-danger">{registerError}</p>}
                                            </div>
                                        </form>
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
        </div>
    );
};

export default Register;
