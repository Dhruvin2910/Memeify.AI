import { getDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { toast } from 'react-toastify';
import { signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ user, scrollToSection, refs }) => {
  const [username, setUserName] = useState('');
  const { worksRef, demoRef, faqRef } = refs || {};
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const buttonText = currentPath === '/signup' ? 'Login' : 'Signup';

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          setUserName(userSnap.data().username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('User Logged out successfully!');
      navigate('/');
    } catch (err) {
      console.error('SignOut Error:', err);
      toast.error('Something went wrong!');
    }
  };

  const handleHistory = () => {
    if (!user) {
      toast.error('Login to check history...');
      return;
    }
    navigate('/history');
  };

  const handleLogin = () => {
    if (currentPath === '/signup') {
      navigate('/login');
    } else {
      navigate('/signup');
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-8 py-2 bg-white/80 shadow-md border-b-4 border-yellow-400 sticky z-10">
      <div className="flex items-center gap-4">
        <img
          src={logo}
          alt="logo"
          className="w-10 h-10 rounded-full border-2 border-pink-400 shadow"
        />
        <span className="text-xl font-extrabold text-purple-700 tracking-tight">Memeify</span>

        {user ? (
          <div>
            <button
              onClick={() => navigate('/home')}
              className="ml-10 text-purple-500 font-semibold font-serif text-xl hover:shadow-md px-2 py-2 rounded-lg active:shadow-lg active:scale-105 transition-transform"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/preview')}
              className="mx-3 text-purple-500 font-semibold font-serif text-xl hover:shadow-md px-2 py-2 rounded-lg active:shadow-lg active:scale-105 transition-transform"
            >
              Preview
            </button>
            <button
              onClick={handleHistory}
              className="mx-3 text-purple-500 font-semibold font-serif text-xl hover:shadow-md px-2 py-2 rounded-lg active:shadow-lg active:scale-105 transition-transform"
            >
              My Memes
            </button>
            <button
              onClick={()=>navigate('/exploreMeme')}
              className="mx-3 text-purple-500 font-semibold font-serif text-xl hover:shadow-md px-2 py-2 rounded-lg active:shadow-lg active:scale-105 transition-transform"
            >
              Explore Memes
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => scrollToSection?.(worksRef)}
              className="ml-10 text-purple-500 font-semibold font-serif text-xl hover:shadow-md px-2 py-2 rounded-lg active:shadow-lg active:scale-105 transition-transform"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection?.(demoRef)}
              className="mx-3 text-purple-500 font-semibold font-serif text-xl hover:shadow-md px-2 py-2 rounded-lg active:shadow-lg active:scale-105 transition-transform"
            >
              Explore Memes
            </button>
            <button
              onClick={() => scrollToSection?.(faqRef)}
              className="mx-3 text-purple-500 font-semibold font-serif text-xl hover:shadow-md px-2 py-2 rounded-lg active:shadow-lg active:scale-105 transition-transform"
            >
              FAQ's
            </button>
          </div>
        )}
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-purple-700">Hello, {username}</span>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold border-2 border-yellow-300"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition-transform font-semibold border-2 border-yellow-300"
        >
          {buttonText}
        </button>
      )}
    </nav>
  );
};

export default Navbar;
