import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const Navigate = useNavigate();

  const startSessionTimer = () => {
    setTimeout(() => {
      signOut(auth)
        .then(() => {
          toast.error("Session expired. You've been logged out!");
          window.location.href = "/login";
        })
        .catch((err) => {
          console.error("Error signing out:", err);
        });
    }, 1000 * 60 * 15); // 15 minutes
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in Successfully!");
      startSessionTimer();
      Navigate("/");
    } catch (err) {
      console.log(err);
      toast.error("Invalid Credentials");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      Navigate('/home');
      toast.success(`Welcome ${user.displayName}`);
      console.log("User Info:", user);
    } catch (err) {
      console.error("Google Sign-in Error:", err);
      toast.error("Google Sign-in failed!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <Navbar />
      <div className="flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center">
            <img 
              src="https://i.imgflip.com/30b1gx.jpg" 
              alt="Meme" 
              className="w-32 h-32 object-cover rounded-full shadow-lg mb-4 border-4 border-blue-300"
            />
            <h2 className="text-2xl font-extrabold text-blue-700 text-center">Welcome Back, Meme Lord! 😎</h2>
            <p className="text-sm text-blue-500 text-center mb-6">Login to continue your meme journey 😂</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
          </form>

          <div className="text-center mt-4 text-sm text-blue-600">
            Don't have an account?{" "}
            <button 
              onClick={() => Navigate('/signup')} 
              className="text-blue-800 font-semibold hover:underline"
            >
              Sign up now
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition duration-200"
            >
              Sign in with Google
            </button>
            <button
              className="w-full border border-blue-300 py-2 rounded-xl text-blue-600 hover:bg-blue-50"
            >
              Forgot Password?
            </button>
          </div>

          <div className="text-center text-xs mt-6 text-blue-400">
            🧠 Memes make everything better!
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
