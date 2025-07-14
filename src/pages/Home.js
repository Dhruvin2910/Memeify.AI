import React from 'react'
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    }

  return (
    <div>
      <button onClick={handleLogin} className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 m-10 font-semibold'>Login</button>
    </div>
  )
}

export default Home
