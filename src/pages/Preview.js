import React, { useCallback, useEffect, useRef, useState } from 'react';
import { db, storage } from '../firebase';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import LoadingBar from "react-top-loading-bar";

const Preview = ({ selectedCaption, selectedMeme, user,
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    fontColor, setFontColor,
    strokeColor,setStrokeColor,
    caption,setCaption,
    width, setWidth,
    textPosition, settextPosition,
    createdAt, memeId
 }) => {

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragoffset] = useState({ x: 0, y: 0 });
  
  const [progress, setProgress] = useState(0);

  const canvasRef = useRef(null);

  const wrapText = useCallback((ctx, text, x, y, maxWidth, lineHeights) => {
    // Fix: Add safety checks for parameters
    if (!ctx || !text || typeof x !== 'number' || typeof y !== 'number' || typeof maxWidth !== 'number' || typeof lineHeights !== 'number') {
      console.warn("Invalid parameters passed to wrapText:", { ctx: !!ctx, text, x, y, maxWidth, lineHeights });
      return;
    }
    
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
    if (!canvas) {
      console.warn("Canvas not available");
      return;
    }
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Canvas context not available");
      return;
    }

    const container = canvas.parentElement;
    if (!container) {
      console.warn("Canvas parent element not available");
      return;
    }
    
    const fixedHeight = container.offsetHeight;
    const fixedWidth = container.offsetWidth;

    canvas.height = fixedHeight;
    canvas.width = fixedWidth;

    ctx.clearRect(0, 0, fixedWidth, fixedHeight);
    ctx.drawImage(image, 0, 0, fixedWidth, fixedHeight);

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fontColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.textAlign = "center";

    // Fix: Add safety check for textPosition and caption
    const safeTextPosition = textPosition || { x: 250, y: 40 };
    const safeCaption = caption || selectedCaption || '';
    wrapText(ctx, safeCaption, safeTextPosition.x, safeTextPosition.y, width, fontSize + 6);
  }, [caption, selectedCaption, fontSize, textPosition, wrapText, width, fontColor, strokeColor, fontFamily]);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    
    let imageUrl = '';

    if (selectedMeme instanceof File) {
      imageUrl = URL.createObjectURL(selectedMeme);
    } else if (typeof selectedMeme === 'string') {
      imageUrl = selectedMeme;
    } else if (selectedMeme?.url) {
      imageUrl = selectedMeme.url;
    } else {
      console.warn("selectedMeme is not a valid image source:", selectedMeme);
      return;
    }

    image.src = imageUrl;

    image.onload = () => {
      drawMeme(image);
    };
  }, [selectedMeme, drawMeme]);

  // Sync caption with selectedCaption when it changes
  useEffect(() => {
    if (selectedCaption && selectedCaption !== caption) {
      setCaption(selectedCaption);
    }
  }, [selectedCaption, caption, setCaption]);

  useEffect(() => {
    // Fix: Add safety check for selectedMeme and its url property
    if (!selectedMeme || !selectedMeme.url) return;

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = selectedMeme.url;

    image.onload = () => {
      drawMeme(image);
    };
  }, [caption, fontSize, textPosition, selectedMeme?.url, selectedMeme, drawMeme]);

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Fix: Add safety check for textPosition
    const safeTextPosition = textPosition || { x: 250, y: 40 };
    const distance = Math.hypot(clickX - safeTextPosition.x, clickY - safeTextPosition.y);
    if (distance < 100) {
      setIsDragging(true);
      setDragoffset({ x: clickX - safeTextPosition.x, y: clickY - safeTextPosition.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    settextPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const uploadMeme = async (blob) => {
    setProgress(7);
    const auth = getAuth();
    const user = auth.currentUser;

    if(createdAt){
      await deleteDoc(doc(db, 'memes', memeId));
    }

    if (!user) {
      toast.error("Please login to save your meme!");
      console.error("No user found. Upload aborted.");
      return;
    }
    setProgress(20);
    const filePath = `memes/${user.uid}/${Date.now()}.png`;
    const storageRef = ref(storage, filePath);

    try {
      setProgress(40)
      const snapshot = await uploadBytes(storageRef, blob);
      console.log("Upload complete. Snapshot:", snapshot);
      setProgress(55);
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);
      setProgress(70);
      await addDoc(collection(db, 'memes'), {
        userId: user.uid,
        url: downloadURL,
        caption,
        fontSize,
        fontColor,
        strokeColor,
        width,
        fontFamily,
        position: textPosition || { x: 250, y: 40 },
        templateUrl: selectedMeme?.url || '',
        createdAt: new Date()
      });
      
      setProgress(90);
      toast.success("Meme saved successfully!");
      setProgress(100);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to save meme!");
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not available for download");
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas toBlob failed!");
        return;
      }

      try {
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
    if (!canvas) {
      toast.error("Canvas not available for saving");
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        console.error("Canvas toBlob failed!");
        return;
      }
      uploadMeme(blob);
    }, 'image/png'); 
  };

  const handleShare = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      toast.error("Canvas not available for sharing");
      return;
    }
  
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast.error("Sharing failed: image generation failed.");
        return;
      }
  
      const file = new File([blob], 'meme.png', { type: 'image/png' });
  
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Memeify - My Meme',
            text: 'Look at this meme I just made!',
            files: [file],
          });
          toast.success("Meme shared successfully!");
        } catch (err) {
          console.error("Sharing failed:", err);
          toast.error("Sharing failed.");
        }
      } else {
        toast.warn("Direct file sharing is not supported on your browser.");
        // Optional fallback: copy to clipboard or upload + share link
      }
    }, 'image/png');
  };
  
  return (
    <div className='bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900'>
      <div className="relative z-50">
        <Navbar user={user} />
      </div>
      
      <LoadingBar
          color="#f11946"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
        />
      <div>
        <div className='flex mt-8 ml-5'>
          <div>
          <h2 className='w-full bg-blue-500 border-gray-300 mb-3 flex items-center justify-center text-2xl font-bold tracking-wider text-white rounded-md py-2 shadow-md'>PREVIEW 👇</h2>
            <canvas
            className='h-96 w-96 border-red-400 border-2 shadow-md rounded-lg bg-amber-200-500 '
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          ></canvas> 
          </div>
          <div className='flex flex-col rounded-md w-1/2 ml-10 bg-lime-100 p-5 shadow-md'>
            <h2 className="text-2xl font-bold mb-4 text-red-600 shadow-lg bg-lime-200 px-2 py-2 flex justify-center rounded-lg">Customize Your Meme 🖼️</h2>
            <textarea
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter your caption..."
              rows={2}
              className='rounded-md text-black px-3 py-2 bg-lime-50 shadow-md'
            />

            <label className='m-3 flex flex-col'>
              <span className='bg-lime-200 round shadow-lg px-2 py-2 text-md font-semibold text-blue-900'>
                Font Size: <span className='text-black font-serif'>{fontSize}</span>
              </span>
              <input
                className='my-3'
                type="range"
                min={10}
                max={60}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </label>
            <label className='ml-3 mb-3 flex flex-col'>
              <span className='bg-lime-200 round shadow-lg px-2 py-2 text-md font-semibold text-blue-900'>
                Wrap Text: <span className='text-black font-serif'>{width}</span>
              </span>
              <input
                className='my-3'
                type="range"
                min={200}
                max={400}
                step={20}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </label>
            <div className='flex ml-3'>
              <span className='bg-lime-200 shadow-md px-2 py-2 text-md font-semibold text-blue-900 rounded-md'>
                Font Style:
              </span>
              <select
                className='mx-2 px-2 py-1 rounded-md shadow-md bg-lime-200'
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="Impact">Impact</option>
                <option value="Arial">Arial</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>
            
            <div className='flex ml-3 mt-2 item-center'>
              <span className='bg-lime-100 shadow-md px-2 py-2 text-md font-semibold text-blue-900 rounded-md mr-2'>
                Font Color:
              </span>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className='mt-2 mr-5 h-8 w-24 rounded-md bg-lime-100 shadow-md px-3'
              />
              <span className='bg-lime-100 shadow-md px-2 py-2 text-md font-semibold text-blue-900 rounded-md mr-2'>
                Border Color:
              </span>
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className='mt-2 mr-5 h-8 w-24 rounded-md bg-lime-100 shadow-md px-3'
              />
            </div>
            
            <p className="text-sm text-gray-700 mt-2 italic">
              Tip: Drag the caption on the meme preview to reposition it.
            </p>
          </div>
          <div className='w-1/4 mx-3'>
            <button
              className='bg-orange-400 flex font-semibold rounded-md shadow-md my-2 py-3 text-md px-2 hover:bg-white hover:border-2 hover:border-orange-400 border-solid w-full hover:text-orange-400 border-2 border-orange-400'
              onClick={handleDownload}
            >
              <p className='flex mx-3'>📥 Download Meme as Image</p>
            </button>

            <button
              className='bg-orange-400 flex justify-center font-semibold rounded-md shadow-md my-2 py-3 text-md px-2 hover:bg-white hover:border-2 hover:border-orange-400 border-solid w-full hover:text-orange-400 border-2 border-orange-400'
              onClick={handleSave}
            >
              <p className='flex mx-3'>💾 Save Meme</p>
            </button>
            <button
              className='bg-orange-400 font-semibold rounded-md shadow-md my-2 flex justify-center py-3 text-md px-2 hover:bg-white hover:border-2 hover:border-orange-400 border-solid w-full hover:text-orange-400 border-2 border-orange-400'
              onClick={handleShare}
            >
              💾 Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
