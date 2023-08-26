import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, push, onValue, update, remove } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCKKAHwqkVPGI2W4mGDZSIMQaCAEp0-ft4",
    authDomain: "noteapp-9c6d8.firebaseapp.com",
    databaseURL: "https://noteapp-9c6d8-default-rtdb.firebaseio.com",
    projectId: "noteapp-9c6d8",
    storageBucket: "noteapp-9c6d8.appspot.com",
    messagingSenderId: "784010458502",
    appId: "1:784010458502:web:690f222c0153ba3b296807",
    measurementId: "G-KKVN9CL6TW"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Create auth and database instances
const auth = getAuth(app);
const db = getDatabase(app);
const dbFirestore = getFirestore();

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userFolderRef = ref(db, `usersLogin/${user.uid}`);
        onValue(userFolderRef, (snapshot) => {
            if (!snapshot.exists()) {
                update(userFolderRef, {
                    email: user.email

                });
            }
        });
    }
});

const createNote = (title, content) => {
    const user = auth.currentUser;
    if (user) {
        const userNotesRef = ref(db, `users/${user.uid}/notes`);
        const newNoteRef = push(userNotesRef, {
            title: title,
            content: content
        });
        return newNoteRef.key;
    }
    return null;
};

const readNotes = (callback) => {
    const notesRef = ref(db, "notes");
    onValue(notesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const noteList = Object.entries(data).map(([id, note]) => ({
                id,
                title: note.title,
                content: note.content
            }));
            callback(noteList);
        } else {
            callback([]);
        }
    });
};

const updateNote = (id, title, content) => {
    const noteRef = ref(db, `notes/${id}`);
    update(noteRef, {
        title: title,
        content: content
    });
};

const deleteNote = (id) => {
    const noteRef = ref(db, `notes/${id}`);
    remove(noteRef);
};

export { auth, db, dbFirestore, createNote, readNotes, updateNote, deleteNote };