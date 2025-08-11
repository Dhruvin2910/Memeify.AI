import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  getDocs,
  deleteDoc,
  doc,
  limit,
  startAfter,
  getCountFromServer,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { getStorage, ref, getBlob } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Spinner2 from "../components/Spinner2";
import InfiniteScroll from "react-infinite-scroll-component";

const History = ({
  user,
  setCaption,
  setFontSize,
  settextPosition,
  setWidth,
  setFontFamily,
  setFontColor,
  setStrokeColor,
  setSelectedMeme,
  setCreatedAt,
  setMemeId,
}) => {
  const [memes, setMemes] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("");
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [totalResult, setTotalResults] = useState(0);


  useEffect(() => {
    if (!user) return;

    const fetchMemes = async (pageSize = 8) => {
      try {
        setIsLoading(true);
        const q = query(
          collection(db, "memes"),
          where("userId", "==", user.uid),
          limit(pageSize)
        );

        const snapshot = await getDocs(q);
        const memesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMemes(memesList);
        setIsLoading(false);
        setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1]);
      } catch (err) {
        console.error("Error fetching memes:", err);
        toast.error("Failed to fetch your meme history.");
      }
    };

    fetchMemes();
  }, [user]);

  const fetchMoreMemes = async (pageSize = 8) => {
    if (!lastVisibleDoc) return;

    try {
      setIsLoading(true);
      const q = query(
        collection(db, "memes"),
        where("userId", "==", user.uid),
        startAfter(lastVisibleDoc),
        limit(pageSize)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return;
      const memesList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMemes((prev) => [...prev, ...memesList]);
      setIsLoading(false);
      setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1]);
    } catch (err) {
      console.error("Error fetching memes:", err);
      toast.error("Failed to fetch your meme history.");
    }
  };
  useEffect(() => {
    if (!user) return;
  
    const fetchMemes = async (pageSize = 8) => {
      try {
        setIsLoading(true);
  
        // Main query for first batch
        const q = query(
          collection(db, "memes"),
          where("userId", "==", user.uid),
          limit(pageSize)
        );
        const snapshot = await getDocs(q);
        const memesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMemes(memesList);
        setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1]);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching memes:", err);
        toast.error("Failed to fetch your meme history.");
      }
    };
  
    const fetchTotalCount = async () => {
      try {
        const countQuery = query(
          collection(db, "memes"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getCountFromServer(countQuery);
        setTotalResults(snapshot.data().count);
      } catch (err) {
        console.error("Error getting total count:", err);
      }
    };
  
    fetchMemes();
    fetchTotalCount();
  }, [user]);
  

  const handleDownload = (index) => {
    const imageUrl = memes[index].url;

    const link = document.createElement("a");
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
      const fileRef = ref(
        storage,
        decodeURIComponent(
          new URL(imageUrl).pathname.split("/o/")[1].split("?alt=media")[0]
        )
      );

      const blob = await getBlob(fileRef);
      const file = new File([blob], "meme.png", { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Check out this meme!",
          text: "Found this funny meme, take a look!",
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success(
          "Link copied to clipboard (image sharing not supported on this device)."
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Sharing failed. CORS issue or unsupported device.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "memes", id));
      toast.success("Meme deleted successfully!");
      setMemes((prev) => prev.filter((meme) => meme.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete meme.");
    }
  };

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

  const filteredMemes = handleSort(
    memes.filter((meme) =>
      meme.caption?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    sort
  );

  const handleEdit = (index, id) => {
    setCaption(memes[index].caption);
    setFontSize(memes[index].fontSize);
    settextPosition(memes[index].position || { x: 250, y: 40 });
    setWidth(memes[index].width);
    setFontFamily(memes[index].fontFamily);
    setFontColor(memes[index].fontColor);
    setStrokeColor(memes[index].strokeColor);
    setSelectedMeme(memes[index].templateUrl);
    setCreatedAt(memes[index].createdAt);
    setMemeId(id);
    navigate("/preview");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navbar user={user} />

      <div className="max-w-5xl mx-auto text-center my-6 w-full shadow-md bg-white bg-opacity-20 py-1 rounded-md">
        <h1 className="text-3xl font-bold text-orange-400 mb-2">
          Your Meme Gallery
        </h1>
      </div>
      <div className="mb-6 flex justify-center">
        <input
          type="text"
          placeholder="Search memes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/2 px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-xl font-semibold text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
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
      <div className="flex justify-center items-center">
        <InfiniteScroll
          dataLength={memes.length}
          next={() => fetchMoreMemes(8)}
          hasMore={memes.length < totalResult}
          loader={
            <div className="flex justify-center my-4">
              <Spinner2 />
            </div>
          }
        >
          <div className="flex flex-wrap justify-center p-4">
            {filteredMemes.map((meme, index) => (
              <div
                key={index}
                className="relative group hover:scale-105 transition-transform duration-300 m-4 w-fit"
              >
                {/* Likes counter - top right */}
                <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded-full shadow flex items-center gap-1">
                  <i className="fa-solid fa-heart text-red-500"></i>
                  <span className="text-sm text-black font-medium">
                    {meme.likes ?? 0}
                  </span>
                </div>

                {/* Meme Image */}
                <img
                  src={meme.url}
                  alt="Meme..."
                  className="h-72 w-auto rounded-lg shadow-md border-white border-2"
                />

                {/* Bottom Overlay */}
                <div className="absolute bottom-0 left-0 right-0 rounded-lg bg-white/90 h-1/4 rounded-b-lg opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(index, meme.id)}
                      className="bg-black px-2 py-1 rounded-full shadow hover:scale-110 transition"
                      title="Edit"
                    >
                      <i className="fa-solid fa-edit fa-sm text-fuchsia-50"></i>
                    </button>
                    <button
                      onClick={() => handleDownload(index)}
                      className="bg-black px-2 py-1 rounded-full shadow hover:scale-110 transition"
                      title="Download"
                    >
                      <i className="fa-solid fa-download fa-sm text-fuchsia-50"></i>
                    </button>
                    <button
                      onClick={() => handleShare(index)}
                      className="bg-black px-2 py-1 rounded-full shadow hover:scale-110 transition"
                      title="Share"
                    >
                      <i className="fa-solid fa-share-nodes fa-sm text-fuchsia-50"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(meme.id)}
                      className="bg-black px-2 py-1 rounded-full shadow hover:scale-110 transition"
                      title="Delete"
                    >
                      <i className="fa-solid fa-trash fa-sm text-fuchsia-50"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>

        {!isLoading && filteredMemes.length === 0 && (
          <p className="text-white text-xl font-semibold mt-10">
            No memes found for "{searchTerm}".
          </p>
        )}
      </div>
    </div>
  );
};

export default History;
