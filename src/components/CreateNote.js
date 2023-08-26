import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import man from "../assets/images/man.jpg";
import logo from "../assets/images/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSun, faMoon, faTimes } from "@fortawesome/free-solid-svg-icons";
import { db, auth, dbFirestore } from "./firebase_db";
import { ref, push, onValue, update, remove } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import { getDoc, doc } from "firebase/firestore";

const CreateNote = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
    const [noteContent, setNoteContent] = useState("");
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [notesData, setNotesData] = useState([]);
    const [selectedNoteIndex, setSelectedNoteIndex] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [userEmail, setUserEmail] = useState("");
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

    const handleSaveNote = () => {
        const title = document.querySelector(".notes_tittle").value;
        if (title && noteContent) {
            const sanitizedContent = noteContent.replace(/<\/?p>/g, '').replace(/<br\s*\/?>/gi, '\n');

            const user = auth.currentUser;
            if (user) {
                const userEmail = user.email;

                const newNoteRef = push(ref(db, "notes"), {
                    title: title,
                    content: sanitizedContent,
                    userEmail: userEmail
                });

                console.log("Note saved with ID:", newNoteRef.key);
                setSaveSuccess(true);
            } else {
                console.log("User not logged in.");
            }
        } else {
            console.log("Please enter a title and content before saving.");
        }
    };

    const handleEditNote = (index) => {
        const selectedNote = notesData[index];
        setSelectedNoteIndex(index);
        document.querySelector(".nt.notes_tittle").value = selectedNote.title;
        setNoteContent(selectedNote.content);
    };

    const handleNewNote = () => {
        setNoteContent("");
        document.querySelector(".nt.notes_tittle").value = "";
        setSelectedNoteIndex(null);
        setUpdateSuccess(false);
        setSaveSuccess(false);
        setDeleteSuccess(false);
    };

    const handleUpdateNote = () => {
        if (selectedNoteIndex !== null) {
            const selectedNote = notesData[selectedNoteIndex];
            const updatedTitle = document.querySelector(".nt.notes_tittle").value;
            if (updatedTitle && noteContent) {
                const sanitizedContent = noteContent.replace(/<\/?p>/g, '');
                update(ref(db, `notes/${selectedNote.id}`), {
                    title: updatedTitle,
                    content: sanitizedContent
                });
                setNoteContent("");
                document.querySelector(".nt.notes_tittle").value = "";
                setSelectedNoteIndex(null);
                setUpdateSuccess(true);
            }
        }
    };

    const handleDeleteNote = (index) => {
        const selectedNote = notesData[index];
        remove(ref(db, `notes/${selectedNote.id}`));
        setDeleteSuccess(true);
    };

    const filteredNotes = notesData.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`layout-create ${theme}-theme`}>
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
                        <div className={`darklight theme-toggle-button ${theme}-theme`}>
                            <button className={`darklight-btn btn`} onClick={handleThemeToggle}>
                                {theme === 'light' ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
                            </button>
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
                                <button className="btn btn-cyan btn-block shadow" type="button" onClick={handleNewNote}>
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
                                filteredNotes.map((note, index) => (
                                    <div className={`note-content d-flex ${theme}-theme`} key={index}>
                                        <div className={`card shadow mb-3 ${theme === 'light' ? 'bg-light' : 'bg-dark'} ${theme === 'light' ? 'text-dark' : 'text-white'}`} style={{ width: "100%" }}>
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    <b>{note.title}</b>
                                                </h5>
                                                <p className="card-text">
                                                    {note.content}
                                                </p>
                                                <div className="card-actions">
                                                    <button
                                                        className={`btn btn-primary ${theme === 'dark' ? 'btn-outline-dark' : 'btn-outline-light'}`}
                                                        onClick={() => handleEditNote(index)}
                                                    >
                                                        Update Note
                                                    </button>
                                                    <button
                                                        className={`btn btn-danger ms-2 ${theme === 'dark' ? 'btn-outline-dark' : 'btn-outline-light'}`}
                                                        onClick={() => handleDeleteNote(index)}
                                                    >
                                                        Delete Note
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="col-lg-9">
                        <div className="icon text-end">
                            <h5>
                                <button
                                    className={`btn btn-success me-2 ${theme === 'dark' ? 'btn-outline-dark' : 'btn-outline-light'}`}
                                    onClick={handleSaveNote}
                                >
                                    Save New Note
                                </button>
                                {selectedNoteIndex !== null && (
                                    <button
                                        className={`btn-update btn btn-success ms-2 ${theme === 'dark' ? 'btn-outline-dark' : 'btn-outline-light'}`}
                                        onClick={handleUpdateNote}
                                    >
                                        Save Update
                                    </button>
                                )}
                            </h5>
                        </div>
                        {saveSuccess && (
                            <div className="success-message" style={{ color: 'green' }}>
                                Note saved successfully
                                <button
                                    className="close-btn"
                                    onClick={() => setSaveSuccess(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        )}

                        {updateSuccess && (
                            <div className="success-message" style={{ color: 'blue' }}>
                                Note updated successfully
                                <button
                                    className="close-btn"
                                    onClick={() => setUpdateSuccess(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        )}

                        {deleteSuccess && (
                            <div className="success-message" style={{ color: 'red' }}>
                                Note deleted successfully
                                <button
                                    className="close-btn"
                                    onClick={() => setDeleteSuccess(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                        )}

                        <div className="notes mt-2">
                            <input
                                type="text"
                                className={`nt notes_tittle form-control ${theme === 'dark' ? 'text-white' : 'text-dark'}`}
                                style={{ backgroundColor: theme === 'dark' ? '#272930' : '#ffffff' }}
                                placeholder="Enter a title..."
                            />
                        </div>
                        <div id="editor" className="side-note">
                            <ReactQuill
                                value={noteContent}
                                onChange={setNoteContent}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNote;
