// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRJkkuMojNk0NDjZiLAW76_nL-3XcG7Jc",
  authDomain: "dsa-based-quize-applicat-90394.firebaseapp.com",
  projectId: "dsa-based-quize-applicat-90394",
  storageBucket: "dsa-based-quize-applicat-90394.firebasestorage.app",
  messagingSenderId: "934060030519",
  appId: "1:934060030519:web:3b54f93b794819602b9db2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// UI Elements
const signInContainer = document.getElementById("sign-in-container");
const chatContainer = document.getElementById("chat-container");
const googleSignInButton = document.getElementById("google-sign-in");
const signOutButton = document.getElementById("sign-out");
const messageInput = document.getElementById("message-input");
const sendMessageButton = document.getElementById("send-message");
const messagesContainer = document.getElementById("messages-container");

// Google Sign-In Functionality
googleSignInButton.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        const userCredential = await signInWithPopup(auth, provider);
        console.log("User signed in: ", userCredential.user);
        signInContainer.style.display = "none";
        chatContainer.style.display = "block";
        listenForMessages();
    } catch (error) {
        console.error("Error signing in: ", error);
    }
});

// Sign-Out Functionality
signOutButton.addEventListener("click", async () => {
    try {
        await signOut(auth);
        signInContainer.style.display = "block";
        chatContainer.style.display = "none";
        messagesContainer.innerHTML = ''; // Clear messages on sign-out
    } catch (error) {
        console.error("Error signing out: ", error);
    }
});

// Sending a Message
sendMessageButton.addEventListener("click", async () => {
    const message = messageInput.value;
    if (message.trim() !== "") {
        try {
            await addDoc(collection(db, "messages"), {
                text: message,
                user: auth.currentUser.displayName,
                timestamp: serverTimestamp(),
            });
            messageInput.value = "";
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    }
});

// Listening for Real-time Messages
function listenForMessages() {
    const messagesQuery = query(collection(db, "messages"), orderBy("timestamp"));
    onSnapshot(messagesQuery, (snapshot) => {
        messagesContainer.innerHTML = "";
        snapshot.forEach((doc) => {
            const message = doc.data();
            const messageElement = document.createElement("div");
            messageElement.classList.add("message");
            messageElement.innerHTML = `<strong>${message.user}</strong>: ${message.text}`;
            messagesContainer.appendChild(messageElement);
        });
    });
}
