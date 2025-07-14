import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import CaptionInput from '../components/CaptionGenerator';

const Home = (props) => {
let { user } = props;

const [username, setUsername] = useState('');
const navigate = useNavigate();

  //fetch username on user change
  useEffect(() => {   
    const fetchUsername = async () => {
      if(user){
        const useDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(useDocRef);

        if(userSnap.exists()) {
          setUsername(userSnap.data().username);
        }
      }
    }
    fetchUsername();
  },[user])

  const handleLogin = () => {
    navigate('/login');
  }

  const handleLogout = async () => {
    try{
      await signOut(auth);
      toast.success("User Logged out successfully!");
      navigate('/login');
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div>
      {user? (
        <div>
          <p>Hello, {username} </p>
          <button onClick={handleLogout} className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 m-10 font-semibold'>Logout</button>
        </div>
        ):(
          <button onClick={handleLogin} className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 m-10 font-semibold'>Login</button>
        )}
        <div>
          <CaptionInput />
        </div>
    </div>
  )
}

export default Home
