import React, { useState, useEffect } from "react";
import "../style/Global.css";
import man from "../assets/images/man.jpg";
import logo from "../assets/images/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSun, faMoon, faFileAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom';
import { db, auth, dbFirestore } from "./firebase_db";
import { ref, onValue } from "firebase/database";
import { getDoc, doc } from "firebase/firestore";

const HomePage = () => {
    const navigate = useNavigate();
    const [notesData, setNotesData] = useState([]);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [userEmail, setUserEmail] = useState("");
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUserEmail(user.email);

                const userDocRef = doc(dbFirestore, "users", user.uid);
                const userDocSnapshot = await getDoc(userDocRef);
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    setUserName(userData.name);
                }
            } else {
                setUserEmail("");
                setUserName("");
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const notesRef = ref(db, "notes");
        onValue(notesRef, (snapshot) => {
            const notes = [];
            snapshot.forEach((childSnapshot) => {
                const note = {
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                };
                notes.push(note);
            });
            setNotesData(notes);
        });
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserEmail(user.email);
            } else {
                setUserEmail("");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error(error.message);
        }
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleSubmit = () => {
        navigate('/create');
    };

    const filteredNotes = notesData.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`layout-home layout ${theme}-theme`}>
            <div className={`layoutnavbar ${theme}-theme`}>
                <nav className={`navbar navbar-expand-lg ${theme === 'light' ? 'navbar-light bg-light' : 'navbar-dark bg-dark'}`}>
                    <div className="container-fluid">
                        <a className="navbar-brand" href="index.html">
                            <img
                                src={logo}
                                alt="Logo"
                                width={30}
                                height={24}
                                style={{ marginBottom: '5px', marginLeft: '10px' }}
                                className="d-inline-block align-text-center"
                            />
                            <b className="ms-1">Hima Notes</b>
                        </a>

                        <div className="dropdown">
                            <a
                                href="#"
                                className={`dropdown-profil ${dropdownVisible ? 'show' : ''}`}
                                id="navbarDropdown"
                                role="button"
                                onClick={toggleDropdown}
                            >
                                <img src={man} alt="foto" className="foto-profile" style={{ marginBottom: '2px' }} />
                            </a>

                            <ul className={`dropdown-menu dropdown-menu-end ${dropdownVisible ? 'show' : ''}`} style={{ right: 'unset', left: '-200px', width: '230px', marginTop: '30px', backgroundColor: theme === 'dark' ? '#343a40' : '#ffffff', boxShadow: 'none', padding: '0', border: 'none' }}>
                                <div className={`card ${theme === 'dark' ? 'bg-dark text-white' : 'bg-light'}`} style={{ borderRadius: '0.5rem', overflow: 'hidden' }}>
                                    <div className="card-body">
                                        <h5 className={`card-title ${theme === 'dark' ? 'text-white' : 'text-dark'}`} style={{ fontSize: '18px' }}>
                                            {userName}
                                            <button className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'} btn-sm`} style={{ fontSize: '9px', float: 'right' }} onClick={toggleDropdown}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </h5>
                                        <p style={{ fontWeight: 400, color: theme === 'dark' ? '#a0a0a0' : '#000000', fontSize: '15.5px', marginBottom: '10px' }}>{userEmail}</p>
                                        <button className={`btn ${theme === 'dark' ? 'btn-outline-light' : 'btn-outline-dark'}`} style={{ fontSize: '11px' }} onClick={handleLogout}>
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </ul>

                        </div>
                    </div>
                </nav>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-3">
                        <div className="sidebar">
                            <div className="searchbar">
                                <form className="d-flex p-2" role="search">
                                    <input
                                        className={`form-control search-input shadow ${theme === 'dark' ? 'text-white' : 'text-dark'}`}
                                        type="search"
                                        placeholder="Search"
                                        style={{ backgroundColor: theme === 'dark' ? '#272930' : '#ffffff' }}
                                        aria-label="Search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </form>
                            </div>
                            <div className="button_add_notes d-flex p-5">
                                <button className="btn btn-cyan btn-block shadow" type="button" onClick={handleSubmit}>
                                    <FontAwesomeIcon icon={faPenToSquare} className="me-2" />
                                    New Notes
                                </button>
                            </div>
                            {filteredNotes.length === 0 ? (
                                <div className={`note-content d-flex ${theme}-theme`}>
                                    <div className={`card shadow mb-3 ${theme === 'light' ? 'bg-light' : 'bg-dark'} ${theme === 'light' ? 'text-dark' : 'text-white'}`} style={{ width: "100%" }}>
                                        <div className="card-body">
                                            <p className="card-text">No notes available</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                filteredNotes.map((note) => (
                                    <div className={`note-content d-flex ${theme}-theme`} key={note.id}>
                                        <div className={`card shadow mb-3 ${theme === 'light' ? 'bg-white text-dark' : 'bg-dark text-white'}`} style={{ width: "100%" }}>
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    <b>{note.title}</b>
                                                </h5>
                                                <p className="card-text">
                                                    {note.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className={`text-blank text-center ${theme}-theme`}>
                            <FontAwesomeIcon icon={faFileAlt} size="5x" className="mb-3" />
                            <h4><b>Select a Note to View</b></h4>
                            <h6>
                                Choose a note from the list on the left to view its contents, or
                                create <br />
                                a new note to add to your collection.
                            </h6>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`darklight theme-toggle-button ${theme}-theme`}>
                <button className="darklight-btn btn" onClick={handleThemeToggle}>
                    {theme === 'light' ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
                </button>
            </div>
        </div>
    );
};

export default HomePage;
