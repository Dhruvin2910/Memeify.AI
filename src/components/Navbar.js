import { getDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { toast } from 'react-toastify';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [username, setUserName] = useState('');

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
      navigate('/login');
    } catch (err) {
      console.error('SignOut Error:', err);
      toast.error('Something went wrong!');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleHistory = () => {
    console.log(user);
    if(!user){
        toast.error("Login to check history...");
        return;
    }
    navigate('/history');
  }

  const handlePreview = () => {
    navigate('/preview');
  }

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white/80 shadow-md border-b-4 border-yellow-400 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <img
          src={logo}
          alt="logo"
          className="w-10 h-10 rounded-full border-2 border-pink-400 shadow" // Increased size from w-10 h-10 to w-14 h-14
        />
        <span className="text-xl font-extrabold text-purple-700 tracking-tight">Memeify</span>
      </div>
      <div>
        <button 
          onClick={handleHistory}
          className="px-4 py-2 mx-2 rounded-lg text-purple-700 bg-purple-300 font-semibold shadow transition-colors hover:border-2 hover:border-purple-500 hover:bg-white"
        >
          History
        </button>
        <button 
          onClick={handlePreview}
          className="px-4 py-2 mx-2 rounded-lg text-purple-700 bg-purple-300 font-semibold shadow transition-colors hover:border-2 hover:border-purple-500 hover:bg-white"
        >
          Preview
        </button>
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
          Login
        </button>
      )}
    </nav>
  );
};

export default Navbar;
