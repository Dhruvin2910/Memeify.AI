import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  increment,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";
import Spinner2 from "../components/Spinner2";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import InfiniteScroll from "react-infinite-scroll-component";

const ExploreMemes = ({ user }) => {
  const [memes, setMemes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [likedMemes, setLikedMemes] = useState({});
  const [likedByUser, setLikedByUser] = useState({});
  const [sort, setSort] = useState("newest");
  const [lastVisible, setLastVisibleDoc] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  const handleSort = (memes, sortType) => {
    const sorted = [...memes]; // clone to avoid mutating original

    switch (sortType) {
      case "az":
        sorted.sort((a, b) => a.caption.localeCompare(b.caption));
        break;

      case "za":
        sorted.sort((a, b) => b.caption.localeCompare(a.caption));
        break;

      case "likes-asc":
        sorted.sort((a, b) => a.likes - b.likes);
        break;

      case "likes-desc":
        sorted.sort((a, b) => b.likes - a.likes);
        break;

      case "oldest":
        sorted.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
        break;

      case "newest":
        sorted.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        break;

      default:
        break;
    }

    return sorted;
  };

  const toggleLike = async (memeId) => {
    if (!user) return toast.error("Please log in to like memes!");

    const likeRef = doc(db, "memes", memeId, "likesBy", user.uid);
    const memeRef = doc(db, "memes", memeId);

    const alreadyLiked = likedByUser[memeId];

    try {
      if (alreadyLiked) {
        //Unlike
        await deleteDoc(likeRef);
        await updateDoc(memeRef, { likes: increment(-1) });

        setLikedMemes((prev) => ({
          ...prev,
          [memeId]: prev[memeId] - 1,
        }));
      } else {
        //like
        await setDoc(likeRef, { liked: true });
        await updateDoc(memeRef, { likes: increment(1) });

        setLikedMemes((prev) => ({
          ...prev,
          [memeId]: (prev[memeId] || 0) + 1,
        }));
      }
      //toggel local user like status
      setLikedByUser((prev) => ({
        ...prev,
        [memeId]: !alreadyLiked,
      }));
    } catch (err) {
      toast.error("Error updating like");
      console.log("Error updating like:", err);
    }
  };

  const fetchAllMemes = async (pageSize = 8) => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "memes"),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );

      const snapshot = await getDocs(q);

      const memesList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let userLiked = false;
          if (user) {
            const likeDoc = await getDoc(
              doc(db, "memes", docSnap.id, "likesBy", user.uid)
            );
            userLiked = likeDoc.exists();
          }
          return { id: docSnap.id, ...data, likes: data.likes || 0, userLiked };
        })
      );

      const likesCountObj = {};
      const likedStatusObj = {};
      memesList.forEach((m) => {
        likesCountObj[m.id] = m.likes;
        likedStatusObj[m.id] = m.userLiked;
      });

      setMemes(memesList);
      setLikedMemes(likesCountObj);
      setLikedByUser(likedStatusObj);
      setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1]);
    } catch (err) {
      toast.error("Error fetching memes");
      console.log("Error Fetching Memes: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMoreMemes = async (pageSize = 8) => {
    if (!lastVisible) return; // No more data

    try {
      const q = query(
        collection(db, "memes"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(pageSize)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return; // No more results

      const memesList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          let userLiked = false;
          if (user) {
            const likeDoc = await getDoc(
              doc(db, "memes", docSnap.id, "likesBy", user.uid)
            );
            userLiked = likeDoc.exists();
          }

          return {
            id: docSnap.id,
            ...data,
            likes: data.likes || 0,
            userLiked,
          };
        })
      );

      const likesCountObj = {};
      const likedStatusObj = {};
      memesList.forEach((m) => {
        likesCountObj[m.id] = m.likes;
        likedStatusObj[m.id] = m.userLiked;
      });

      // Append instead of replace
      setMemes((prev) => [...prev, ...memesList]);
      setLikedMemes((prev) => ({ ...prev, ...likesCountObj }));
      setLikedByUser((prev) => ({ ...prev, ...likedStatusObj }));
      setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1]);
    } catch (err) {
      toast.error("Error fetching more memes");
      console.log("Error fetching more memes:", err);
    }
  };

  useEffect(() => {
    fetchAllMemes();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    const fetchCount = async () => {
      const coll = collection(db, "memes");
      const snapshot = await getCountFromServer(coll);
      setTotalResults(snapshot.data().count);
    };
    fetchCount();
  }, []);

  const filteredMemes = handleSort(
    memes.filter((meme) =>
      meme.caption?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    sort
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-900 via-indigo-900 to-purple-900">
      <Navbar user={user} />

      {/* Page Title */}
      <div className="max-w-5xl mx-auto text-center my-6 py-3 rounded-lg bg-white/10 shadow-lg border border-white/20">
        <h1 className="text-3xl font-bold text-yellow-300">
          Explore Funny Memes
        </h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search memes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-3/4 md:w-1/2 px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
        />
        <select
          className="mx-5 px-2 py-2 rounded-lg shadow-lg bg-blue-500 text-white font-medium
             focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
             hover:scale-105 transition-transform duration-300 ease-in-out"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="az">A → Z</option>
          <option value="za">Z → A</option>
          <option value="likes-asc">Likes ↑</option>
          <option value="likes-desc">Likes ↓</option>
          <option value="oldest">Oldest</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* Meme List */}
      <div className="flex justify-center">
        {isLoading ? (
          <Spinner2 />
        ) : filteredMemes.length > 0 ? (
          <InfiniteScroll
            dataLength={memes.length}
            next={() => fetchMoreMemes(8)}
            hasMore={memes.length < totalResults}
            loader={
              <div className="flex justify-center my-4">
                <Spinner2 />
              </div>
            }
          >
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
              {filteredMemes.map((meme, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl p-3 hover:scale-105 hover:shadow-pink-500/20 transition-transform duration-300"
                >
                  {/* Meme Image */}
                  <img
                    src={meme.url}
                    alt="Meme"
                    className="max-h-[300px] w-full object-contain rounded-lg border border-white/20 cursor-pointer"
                    onDoubleClick={() => toggleLike(meme.id)}
                  />

                  {/* Like Button */}
                  <div className="flex justify-center mt-3 items-center gap-2">
                    <button
                      onClick={() => toggleLike(meme.id)}
                      className="p-2 rounded-full hover:bg-white/10 transition"
                    >
                      <i
                        className={`fa-heart text-2xl transition ${
                          likedByUser[meme.id]
                            ? "fa-solid text-pink-500"
                            : "fa-regular text-white"
                        }`}
                      ></i>
                    </button>
                    <span className="text-white font-semibold">
                      {likedMemes[meme.id] || 0}
                    </span>
                  </div>

                  {/* Caption */}
                  {meme.caption && (
                    <p className="text-center text-gray-200 mt-2 text-sm">
                      {meme.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <p className="text-white text-xl font-semibold mt-10">
            No memes found for "{searchTerm}".
          </p>
        )}
      </div>
    </div>
  );
};

export default ExploreMemes;
