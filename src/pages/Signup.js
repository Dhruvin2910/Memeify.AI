import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { auth, db } from '../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
 

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmpassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        if(password !== confirmpassword)
        {
            toast.error("Confirm Password does not match!");
            return;
        }
        try{
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                username: username,
                createdAt: new Date(),
            });
            toast.success("Account Created Successfully!");
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmpassword('');
            navigate('/login');
        }catch(err){
            console.log(err);
            toast.error(err.message || "Something went wrong!");
        } 
    }

  return (
    <div className="min-h-screen items-center justify-center bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200">
      <Navbar />
      <div className="bg-white/90 rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center border-4 border-dashed border-yellow-400 relative">
        <img src="https://i.imgflip.com/30b1gx.jpg" alt="Meme" className="w-20 h-20 rounded-full border-4 border-pink-400 shadow-lg -mt-14 mb-2 object-cover" />
        <h2 className="text-2xl font-extrabold text-purple-700 mb-1 text-center">Sign Up & Become a Meme Lord!</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Create your account to join the meme-verse 🚀</p>
        <form onSubmit={handleSignup} className="w-full flex flex-col gap-3">
          <input
            type="text"
            placeholder="Enter a username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none bg-yellow-50 placeholder-gray-500 text-lg transition"
          />
          <input
            type="email"
            placeholder="Enter your email"
            onChange={e => setEmail(e.target.value)}
            value={email}
            required
            className="px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none bg-yellow-50 placeholder-gray-500 text-lg transition"
          />
          <input
            type="password"
            placeholder="Enter a password"
            onChange={e => setPassword(e.target.value)}
            value={password}
            required
            className="px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none bg-yellow-50 placeholder-gray-500 text-lg transition"
          />
          <input
            type="password"
            placeholder="Confirm your password"
            onChange={e => setConfirmpassword(e.target.value)}
            value={confirmpassword}
            required
            className="px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none bg-yellow-50 placeholder-gray-500 text-lg transition"
          />
          <button type="submit" className="mt-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white font-bold py-2 rounded-lg shadow-md hover:scale-105 transition-transform text-lg flex items-center justify-center gap-2">
            <span>Create Account</span>
          </button>
        </form>
        <button
          onClick={() => navigate('/login')}
          type="button"
          className="mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-transform text-base flex items-center justify-center gap-2 border-2 border-purple-300"
        >
          <span>Already have an account? Login</span>
          <span role="img" aria-label="login">👉</span>
        </button>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-pink-300 text-pink-600 font-bold text-xs flex items-center gap-2">
          <span role="img" aria-label="meme">🧠</span> Memes make everything better!
        </div>
      </div>
    </div>
  )
}

export default Signup
