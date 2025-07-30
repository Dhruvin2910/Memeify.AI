import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { getStorage, ref, getBlob } from "firebase/storage";

const History = ({ user }) => {
    const [memes, setMemes] = useState([]);

    useEffect(() => {
        if (!user) return;

        const fetchMemes = async () => {
            try {
                const q = query(
                    collection(db, 'memes'),
                    where('userId', '==', user.uid)
                );

                const snapshot = await getDocs(q);
                const memesList = snapshot.docs.map((doc) => doc.data());
                setMemes(memesList);
            } catch (err) {
                console.error('Error fetching memes:', err);
                toast.error('Failed to fetch your meme history.');
            }
        };

        fetchMemes();
    }, [user]);

    const handleDownload = (index) => {
        const imageUrl = memes[index].url;

        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `meme-${index + 1}.png`;
        document.body.appendChild(link); // Firefox fix
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = async (index) => {
        const imageUrl = memes[index].url;
    
        try {
            const storage = getStorage(); // Already initialized
            const fileRef = ref(storage, decodeURIComponent(new URL(imageUrl).pathname.split('/o/')[1].split('?alt=media')[0]));
    
            const blob = await getBlob(fileRef);
            const file = new File([blob], 'meme.png', { type: blob.type });
    
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Check out this meme!',
                    text: 'Found this funny meme, take a look!',
                    files: [file],
                });
            } else {
                await navigator.clipboard.writeText(imageUrl);
                toast.success('Link copied to clipboard (image sharing not supported on this device).');
            }
        } catch (err) {
            console.error(err);
            toast.error('Sharing failed. CORS issue or unsupported device.');
        }
    };
    
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            <Navbar user={user} />

            <div className="max-w-5xl mx-auto text-center my-6 w-full shadow-md bg-white bg-opacity-20 py-1 rounded-md">
                <h1 className="text-3xl font-bold text-orange-400 mb-2">Your Meme Gallery</h1>
            </div>

            <div className="flex flex-wrap justify-center p-4">
                {memes.map((meme, index) => (
                    <div key={index} className="relative hover:scale-105 transition-transform duration-300 m-4">
                        <img
                            src={meme.url}
                            alt="Meme..."
                            className="h-72 w-auto rounded-lg shadow-md border-white border-solid border-2"
                        />

                        <div className="absolute bottom-4 right-4 flex gap-2">
                            <button
                                onClick={() => handleDownload(index)}
                                className="bg-white/80 text-black p-2 rounded-md shadow-md hover:bg-white transition opacity-0 hover:opacity-100"
                                title="Download"
                            >
                                <i className="fa-solid fa-download fa-lg"></i>
                            </button>

                            <button
                                onClick={() => handleShare(index)}
                                className="bg-white/80 text-black p-2 rounded-md shadow-md hover:bg-white transition opacity-0 hover:opacity-100"
                                title="Share"
                            >
                                <i className="fa-solid fa-share-nodes fa-lg"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;
