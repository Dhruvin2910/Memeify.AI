import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, getDoc, increment, getDocs } from 'firebase/firestore';
import Spinner2 from '../components/Spinner2';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const ExploreMemes = ({ user }) => {
    const [memes, setMemes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [likedMemes, setLikedMemes] = useState({});
    const [likedByUser, setLikedByUser] = useState({});

    const toggleLike = async (memeId) => {
        if(!user) return toast.error("Please log in to like memes!");

        const likeRef = doc(db, "memes", memeId, "likesBy", user.uid);
        const memeRef = doc(db, "memes", memeId);

        const alreadyLiked = likedByUser[memeId];

        try{
            if(alreadyLiked){
                //Unlike
                await deleteDoc(likeRef);
                await updateDoc(memeRef, { likes: increment(-1) });

                setLikedMemes((prev) => ({
                    ...prev,
                    [memeId]: prev[memeId] - 1
                }));  
            }else{
                //like
                await setDoc(likeRef, { liked: true });
                await updateDoc(memeRef, { likes: increment(1) });

                setLikedMemes((prev) => ({
                    ...prev,
                    [memeId]: (prev[memeId] || 0) + 1
                })); 
            }
           //toggel local user like status
           setLikedByUser((prev) => ({
                ...prev,
                [memeId]: !alreadyLiked
           }))
        }catch(err){
            toast.error("Error updating like")
            console.log("Error updating like:", err);
        }
    };
    


    useEffect(() => {
        const fetchAllMemes = async () => {
           try {
              setIsLoading(true);
              const snapshot = await getDocs(collection(db, "memes"));
     
              const memesList = await Promise.all(snapshot.docs.map(async (docSnap) => {
                 const data = docSnap.data();
     
                 // Check if current user liked this meme
                 let userLiked = false;
                 if (user) {
                    const likeDoc = await getDoc(doc(db, "memes", docSnap.id, "likesBy", user.uid));
                    userLiked = likeDoc.exists();
                 }
     
                 return {
                    id: docSnap.id,
                    ...data,
                    likes: data.likes || 0,
                    userLiked
                 };
              }));
     
              setMemes(memesList);
     
              // Store likes count
              const likesCountObj = {};
              const likedStatusObj = {};
              memesList.forEach(m => {
                 likesCountObj[m.id] = m.likes;
                 likedStatusObj[m.id] = m.userLiked;
              });
     
              setLikedMemes(likesCountObj);
              setLikedByUser(likedStatusObj);
              setIsLoading(false);
           } catch (err) {
              toast.error("Error fetching memes");
              console.log("Error Fetching Memes: ", err);
              setIsLoading(false);
           }
        };
        fetchAllMemes();
     }, [user]);
     

    const filteredMemes = memes.filter((meme) =>
        meme.caption?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-900 via-indigo-900 to-purple-900">
            <Navbar user={user}/>
            <div className="max-w-5xl mx-auto text-center my-6 w-full shadow-md bg-white bg-opacity-20 py-1 rounded-md">
                <h1 className="text-3xl font-bold text-yellow-300 mb-2">Explore Funny Memes</h1>
            </div>
            <div className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search memes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-3/4 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-xl font-semibold text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
            </div>

            <div className='flex justify-center items-center'>
                {isLoading ? (
                    <Spinner2 />
                ) : (
                    <div className="flex flex-wrap justify-center p-4">
                        {filteredMemes.map((meme, index) => (
                            <div
                                key={index}
                                className="relative group hover:scale-105 transition-transform duration-300 m-4 w-fit"
                            >
                                <img
                                    src={meme.url}
                                    alt="Meme"
                                    className="h-72 w-auto rounded-lg shadow-md border-white border-2"
                                    onDoubleClick={() => toggleLike(meme.id)}
                                />
                                <div className="flex justify-center mt-2 items-center gap-2">
                                    <button onClick={() => toggleLike(meme.id)}>
                                        <i
                                            className={`fa-heart text-2xl transition ${
                                                likedByUser[meme.id] ? 'fa-solid text-pink-500' : 'fa-regular text-white'
                                            }`}
                                        ></i>
                                    </button>
                                    <span className="text-white font-semibold">{likedMemes[meme.id] || 0}</span>
                                </div>
                                {/* Optional caption */}
                                <p className="text-center text-white mt-2 font-semibold">{meme.caption}</p>
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && filteredMemes.length === 0 && (
                    <p className="text-white text-xl font-semibold mt-10">No memes found for "{searchTerm}".</p>
                )}
            </div>
        </div>
    );
};

export default ExploreMemes;
