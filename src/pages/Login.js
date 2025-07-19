import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const Navigate = useNavigate();

    const startSessionTimer = () => {
      setTimeout(() => {
        signOut(auth).then(()=>{
          toast.error("Session expired. You've been logged out!");
          window.location.href = "/login";
        }).catch((err) => {
          console.err("Error signing out:", err);
        })
      }, 1000*60*15);
    }
    
    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Logged in Successfully!");
            startSessionTimer();
            Navigate("/");
        }catch(err){
            console.log(err);
            toast.error("Invalid Credentials")
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200">
      <div className="bg-white/90 rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center border-4 border-dashed border-yellow-400 relative">
        <img src="https://i.imgflip.com/30b1gx.jpg" alt="Meme" className="w-20 h-20 rounded-full border-4 border-pink-400 shadow-lg -mt-14 mb-2 object-cover" />
        <h2 className="text-2xl font-extrabold text-purple-700 mb-1 text-center">Welcome Back, Meme Lord!</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Login to continue your meme journey 😂</p>
        <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none bg-yellow-50 placeholder-gray-500 text-lg transition"
          />
          <input 
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border-2 border-yellow-300 focus:border-pink-400 focus:outline-none bg-yellow-50 placeholder-gray-500 text-lg transition"
          />
          <button type="submit" className="mt-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-white font-bold py-2 rounded-lg shadow-md hover:scale-105 transition-transform text-lg flex items-center justify-center gap-2">
            <span>Login</span>
          </button>
        </form>
        <div className="flex items-center gap-2 mt-3">
          <p className="text-gray-600 text-sm">Don't have an account?</p>
          <button
            onClick={() => Navigate('/signup')}
            type="button"
            className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white font-bold py-1 px-3 rounded-lg shadow hover:scale-105 transition-transform text-xs border-2 border-purple-300"
          >
            Sign up now
          </button>
        </div>
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-pink-300 text-pink-600 font-bold text-xs flex items-center gap-2">
          <span role="img" aria-label="meme">🧠</span> Memes make everything better!
        </div>
      </div>
    </div>
  )
}

export default Login

