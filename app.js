import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, onSnapshot, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBRJkkuMojNk0NDjZiLAW76_nL-3XcG7Jc",
  authDomain: "dsa-based-quize-applicat-90394.firebaseapp.com",
  projectId: "dsa-based-quize-applicat-90394",
  storageBucket: "dsa-based-quize-applicat-90394.appspot.com",
  messagingSenderId: "934060030519",
  appId: "1:934060030519:web:3b54f93b794819602b9db2"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

let currentUser = null;
let currentChatUser = null;

window.showLogin = () => {
  document.getElementById('register').classList.add('hidden');
  document.getElementById('login').classList.remove('hidden');
};

window.showRegister = () => {
  document.getElementById('login').classList.add('hidden');
  document.getElementById('register').classList.remove('hidden');
};

window.registerUser = async () => {
  const username = document.getElementById('regUsername').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;

  if (!username || !email || !password) return alert("All fields required.");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, "users", uid), { username, email });
    alert("Registered successfully!");
    showLogin();
  } catch (e) {
    alert(e.message);
  }
};

window.loginUser = async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    alert(e.message);
  }
};

window.logoutUser = async () => {
  await signOut(auth);
  location.reload();
};

window.goBack = () => {
  document.getElementById('chat').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
};

function getChatId(user1, user2) {
  return [user1, user2].sort().join('_');
}

window.startChat = (user) => {
  currentChatUser = user;
  document.getElementById('chatWith').innerText = user.username;
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('chat').classList.remove('hidden');

  const chatLog = document.getElementById('chatLog');
  chatLog.innerHTML = '';

  const chatId = getChatId(currentUser.uid, user.uid);
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef);

  onSnapshot(q, (snapshot) => {
    chatLog.innerHTML = '';
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.className = 'chat-msg';
      div.innerHTML = `<strong>${msg.senderName}</strong>: ${msg.text} <span class="chat-time">${msg.time}</span>`;
      chatLog.appendChild(div);
    });
    chatLog.scrollTop = chatLog.scrollHeight;
  });
};

window.sendMessage = async () => {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text || !currentChatUser) return;

  const chatId = getChatId(currentUser.uid, currentChatUser.uid);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  await addDoc(collection(db, "chats", chatId, "messages"), {
    senderId: currentUser.uid,
    senderName: currentUser.username,
    text,
    time,
    timestamp: Date.now()
  });

  input.value = '';
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      currentUser = { ...docSnap.data(), uid };
      document.getElementById('register').classList.add('hidden');
      document.getElementById('login').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      document.getElementById('currentUser').innerText = currentUser.username;

      // Load users
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const list = document.getElementById('userList');
      list.innerHTML = '';
      snapshot.forEach(doc => {
        const userData = doc.data();
        if (doc.id !== uid) {
          const div = document.createElement('div');
          div.className = 'user-item';
          div.innerText = userData.username;
          div.onclick = () => startChat({ ...userData, uid: doc.id });
          list.appendChild(div);
        }
      });
    }
  }
});

document.getElementById('chatInput').addEventListener("keyup", (e) => {
  if (e.key === "Enter") sendMessage();
});
