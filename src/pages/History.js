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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100">
        <Navbar user={user} />

        <div className="max-w-5xl mx-auto text-center my-6 w-full shadow-md bg-black bg-opacity-50 py-1 rounded-md">
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Your Meme Gallery</h1>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
            {memes.map((meme, index) => (
            <div key={index} className="">
                <img src={meme.url} alt="Meme..." className="h-72 w-auto rounded-lg shadow-md border-white border-solid border-2" />
        </div>
        ))}
    </div>
</div>

  )
}

export default History
