import React, { useCallback, useEffect, useRef, useState } from 'react';
import { db, storage } from '../firebase';
import { getAuth } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const Preview = ({ selectedCaption, selectedMeme, user }) => {

  const [caption, setCaption] = useState(selectedCaption);
  const [fontSize, setFontSize] = useState(30);
  const [textPosition, settextPosition] = useState({ x: 250, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragoffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  const wrapText = useCallback((ctx, text, x, y, maxWidth, lineHeights) => {
    const words = text.split(' ');
    let line = '';

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line, x, y);
        ctx.strokeText(line, x, y);
        line = words[i] + ' ';
        y += lineHeights;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    ctx.strokeText(line, x, y);
  }, []);

  const drawMeme = useCallback((image) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const fixedWidth = 500;
    const fixedHeight = 500;

    canvas.width = fixedWidth;
    canvas.height = fixedHeight;

    ctx.clearRect(0, 0, fixedWidth, fixedHeight);
    ctx.drawImage(image, 0, 0, fixedWidth, fixedHeight);

    ctx.font = `${fontSize}px Impact`;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.textAlign = "center";

    wrapText(ctx, caption, textPosition.x, textPosition.y, 400, fontSize + 6);
  }, [caption, fontSize, textPosition, wrapText]);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = selectedMeme.url;

    image.onload = () => {
      drawMeme(image);
    };
  }, [selectedMeme, drawMeme]);

  useEffect(() => {
    if (!selectedMeme?.url) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = selectedMeme.url;

    image.onload = () => {
      drawMeme(image);
    };
  }, [caption, fontSize, textPosition, selectedMeme.url, drawMeme]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const distance = Math.hypot(clickX - textPosition.x, clickY - textPosition.y);
    if (distance < 100) {
      setIsDragging(true);
      setDragoffset({ x: clickX - textPosition.x, y: clickY - textPosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    settextPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const uploadMeme = async (blob) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast.error("Please login to save your meme!");
      console.error("No user found. Upload aborted.");
      return;
    }

    const filePath = `memes/${user.uid}/${Date.now()}.png`;
    const storageRef = ref(storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, blob);
      console.log("Upload complete. Snapshot:", snapshot);

      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);

      await addDoc(collection(db, 'memes'), {
        userId: user.uid,
        url: downloadURL,
        caption,
        fontSize,
        position: textPosition,
        createdAt: new Date()
      });

      toast.success("Meme saved successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to save meme!");
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas toBlob failed!");
        return;
      }

      try{
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = URL.createObjectURL(blob);
        link.click();

        toast.success("Meme Download successfully!");
      } catch (err) {
        console.log("Download Error: ", err);
        toast.error("Downloading error!");
      }
    
    }, 'image/png');
  };

  const handleSave = () => {
    const canvas = canvasRef.current;

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas toBlob failed!");
        return;
      }
      uploadMeme(blob);
    }, 'image/png'); 
  }

  return (
    <div>
        <Navbar user={user}/>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="shadow-lg rounded-lg bg-white p-4 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="border border-gray-300 rounded-lg mb-4 cursor-grab active:cursor-grabbing"
            style={{ background: '#f9fafb' }}
          ></canvas>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2 mb-4 text-center text-lg"
            placeholder="Enter your caption..."
          />

          <label className="flex flex-col items-center w-full mb-4">
            <span className="mb-1 text-gray-700 font-medium">
              Font Size: <span className="font-bold">{fontSize}</span>
            </span>
            <input
              type="range"
              min={10}
              max={60}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
          </label>

          <button
            onClick={handleDownload}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 shadow-md mt-2"
          >
            Download Meme
          </button>
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 shadow-md mt-2"
          >
            Save Meme
          </button>
        </div>
      </div>
    </div>
    
  );
};

export default Preview;
