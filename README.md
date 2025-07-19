# 🎭 Memeify.AI - AI Meme Generator Web App

Memefy is a web-based AI meme generator that helps users create memes effortlessly. Simply enter a topic, choose from smart AI-generated captions, select a meme template, and customize or download your meme—all in one seamless flow.

## 🚀 Features

* 🔍 **Topic-Based Caption Generation**: Enter a meme topic and receive multiple witty AI-generated captions using OpenAI GPT.
* 🧠 **Smart Caption Selection**: Users can view 4–5 caption suggestions, with options to edit or regenerate them.
* 🖼️ **Meme Template Gallery**: Browse through a list of static meme templates to choose the one that fits best.
* ✍️ **Auto-fill Meme Text**: Selected captions are auto-inserted as top/bottom text on the meme canvas.
* 🖌️ **Customization**: Modify captions, reposition text, or tweak styling directly in the meme canvas.
* 💾 **Download Your Meme**: Once satisfied, download your meme as an image instantly.
* 🔐 **User Authentication**: Secure signup/login using Firebase Authentication (email and password based).
* 🧾 **Real-Time Username Validation**: Check for existing usernames using Firestore queries during signup.

## 🛠️ Tech Stack

* **Frontend**: React.js, Tailwind CSS
* **Backend (optional API)**: Express.js (for secure GPT access)
* **Authentication**: Firebase Auth
* **Database**: Firestore (used for storing usernames or other user info)
* **AI Integration**: OpenAI GPT API (for caption generation)
* **Meme Templates**: Static assets or fetched from an external API (like Imgflip or custom set)

## 📷 Workflow Overview

1. **Enter Topic** – User enters a meme topic (e.g., "Monday mornings").
2. **Caption Generation** – App sends this to GPT via API and receives 4–5 funny captions.
3. **Select/Edit Caption** – User chooses a caption or edits it manually.
4. **Choose Meme Template** – User selects a meme template.
5. **Auto-fill & Customize** – Caption is auto-inserted, user can edit top/bottom text.
6. **Download Meme** – User downloads the final meme as an image.

## 📁 Project Structure

```
memefy/
│
├── public/                  # Static files & templates
├── src/
│   ├── components/          # CaptionGenerator, TemplateSelector, MemeCanvas
│   ├── pages/               # Home, Login, Signup
│   ├── firebase/            # Firebase config and auth functions
│   ├── App.js               # Main component
│   └── index.js             # React entry point
├── .env                     # API keys and secrets
├── package.json
└── README.md
```

## 🔧 Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/yourusername/memefy.git
   cd memefy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file with:

   ```env
   REACT_APP_OPENAI_API_KEY=your_openai_key
   REACT_APP_FIREBASE_API_KEY=your_firebase_key

4. **Start the app**

   ```bash
   npm run dev
   ```

## 🛡️ Security Notice

Avoid exposing your OpenAI API key directly in the frontend. Use a secure backend API or serverless function to handle GPT requests.

## 📌 Future Enhancements

* Add drag-and-drop text positioning
* Add trending meme templates from API
* Save meme history for logged-in users
* Dark mode toggle

---

