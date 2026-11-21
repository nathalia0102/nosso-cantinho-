import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Heart, Sparkles, MessageCircleHeart, Calendar, Send } from 'lucide-react';

// Substitui os valores abaixo pelos dados exatos do teu firebaseConfig no Firebase
const firebaseConfig = {
  apiKey: "COLOCA_A_TUA_API_KEY_AQUI",
  authDomain: "nosso-cantinho-efb0b.firebaseapp.com",
  projectId: "nosso-cantinho-efb0b",
  storageBucket: "nosso-cantinho-efb0b.appspot.com",
  messagingSenderId: "980477782188",
  appId: "1:980477782188:web:023587e2904fb8934a5709"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const START_DATE = new Date('2024-05-12T00:00:00');

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [author, setAuthor] = useState('Nathália');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    signInAnonymously(auth).catch((err) => console.error('Erro auth:', err));
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = Math.max(0, now - START_DATE);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setElapsed({ days, hours, minutes, seconds });
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'cantinho_mensagens'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(list);
    });
    return () => unsub();
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()  !user  sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'cantinho_mensagens'), {
        author,
        text: text.trim(),
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (err) {
      console.error('Erro ao enviar:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 text-rose-950 flex flex-col">
      <header className="pt-8 pb-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full shadow-sm border border-rose-100 text-rose-600 text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Nathália & Gustavo</span>
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-rose-900">
          Nosso Cantinho ❤️
        </h1>
        <p className="text-rose-700/80 text-sm mt-1 flex items-center justify-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>Desde 12 de maio de 2024</span>
        </p>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-4 pb-10 space-y-6">
        <section className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-md border border-rose-100 text-center">
