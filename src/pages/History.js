import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const History = ({ user }) => {
    const [memes, setMemes] = useState([]);

    useEffect(() => {
        if(!user) return;

        const fetchMemes = async () => {
            try{
                const q = query(
                    collection(db, "memes"),
                    where("userId", "==", user.uid)
                );

                const snapshot = await getDocs(q);
                const memesList = snapshot.docs.map(doc => doc.data());
                setMemes(memesList);
            } catch (err) {
                console.error("Error fetching memes:", err);
                toast.error("Failed to fetch your meme history.");
            }
            
        }
        fetchMemes();
    }, [user])

  return (
    <div>
        <Navbar user={user} />
        {memes.map((meme, index) => (
            <div key={index} className='h-48 w-auto'>
                <img src={meme.url} alt="Meme..." className='h-48 w-auto' />
            </div>
        ))}
    </div>
  )
}

export default History
