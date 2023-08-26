import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import CreateNote from './components/CreateNote';
import { auth } from './components/firebase_db';

const App = () => {
    const [user, setUser] = useState(auth.currentUser);

    auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
    });

    const PrivateRoute = ({element }) => {
        if (user) {
            return element;
        } else {
            return <Navigate to="/" />;
        }
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<PrivateRoute element={<HomePage />} />} />
                <Route path="/create" element={<PrivateRoute element={<CreateNote />} />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;

