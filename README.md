# 🌿 Thera – Your Soul Companion

*A soulful web app that listens, remembers, heals, and grows with you.*

---

## ✨ Vision

Thera is a safe, emotionally intelligent space designed for reflection, healing, and growth. It helps users process feelings, uncover emotional patterns, engage in soothing rituals, and visually watch their personal healing journey — like tending to a garden of the soul.

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [MVP Scope](#mvp-scope)
- [Installation](#installation)
- [Usage](#usage)
- [Demo Narrative](#demo-narrative)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Features

### 1. 🧠 Heart Memory Engine – AI That Remembers Your Pain

**Purpose:** Help users feel seen and understood by identifying recurring emotional themes.

- Journal by text or voice daily
- AI detects emotional tones, themes (e.g., "loneliness", "shame"), and patterns
- Patterns are labeled as **Wound Seeds**
- When a wound resurfaces, Thera reflects it gently:

  > “You’ve mentioned loneliness on weekends a few times. Want to explore where that comes from?”

**Core Stack:**  
TensorFlow, Whisper (voice-to-text), MongoDB, HuggingFace (RoBERTa), LangChain (retrieval)

---

### 2. 🌱 Healing Rituals – Daily Soul Actions

**Purpose:** Provide ritual-based soul care for emotional release and grounding.

| Ritual         | Action                          | Animation                             |
| -------------- | ------------------------------- | ------------------------------------- |
| Silence        | Breath + inspirational quote     | Fade-in quote + ripple effect         |
| Release        | Speak pain, watch it float away  | Leaf falls, paper burns, etc.         |
| Truth          | Answer deep prompt               | Calm typewriter animation             |
| Light          | Receive affirmations             | Glowing word animations               |
| Connection     | Prompt to message a friend       | Heartbeat glow pulse                  |

**Animation Tools:** Lottie, Framer Motion, GSAP  
**Scheduling:** Node.js cron jobs + user settings

---

### 3. 🎭 AI Soul Companion – Thera

**Purpose:** Thera is not just an assistant. She is a calming, empathetic companion.

- Choose your companion’s name, voice, and visual (orb, tree spirit, candle)
- TTS responses like:

  > “I’m here. Let’s sit in the quiet together.”

- Companion evolves over time (smiles, glows, blossoms)

**Tech:** Custom prompt engineering, TTS API, SVG + Framer Motion

---

### 4. 🛡️ Distress Detection + Emergency Mode

**Purpose:** Support during emotionally intense moments.

- TensorFlow scores journal entries for emotional weight
- Distress progress bar shows increasing emotional strain
- When full:
  - Quiet mode activates (e.g., breath guidance, journal)
  - User can call emergency contact or therapist

> “This entry feels heavy. Want to breathe together or reach out to someone?”

**Alerts:** Twilio, WhatsApp API  
**Detection:** TensorFlow + custom emotion classifier  
**UI:** React + Progress Indicators

---

### 5. 🌼 Soul Garden – Visualize Healing

**Purpose:** Show your healing as a peaceful, interactive garden.

- Each **Wound Seed** becomes a plant
- Rituals water it → plant sprouts → flower/fruits bloom
- Garden grows as emotional patterns are explored
- Each plant is clickable for reflective insights

**Tools:** Lottie, Canvas API, SVG, GSAP  
**Storage:** MongoDB (per-user visual + wound states)

---

### 6. 🧲 Motivational Hooks + Gamified Growth

**Purpose:** Encourage consistent emotional check-ins.

- **Streaks:** Maintain rituals and journaling daily
- **Rewards:**
  - New garden themes
  - Surprise affirmations or video content
- **Emotion-Based Content:**
  - Suggested motivational YouTube clips based on mood

| Emotion | Video Prompt                |
| ------- | --------------------------- |
| Sad     | “You’re not alone”          |
| Angry   | “Channel it into change”    |
| Hopeful | “Look how far you’ve come”  |

**Tools:** Firebase Cloud Messaging, YouTube API, Emotion filters  
**Frontend:** React carousel with emotional context

---

## 📸 Screenshots

Here are some glimpses of Thera in action:

**Homepage / Main Navigation:**
![Homepage](https://raw.githubusercontent.com/Aden1ke/Thera/main/docs/homepage.jpg)

**Chat with Thera (Soul Companion):**
![Chat Interface](https://raw.githubusercontent.com/Aden1ke/Thera/main/docs/chat_sample.jpg)

**Journal History:**
![Journal History](https://raw.githubusercontent.com/Aden1ke/Thera/main/docs/journal.jpg)

**User Profile:**
![User Profile](https://raw.githubusercontent.com/Aden1ke/Thera/main/docs/profile.jpg)

**Login Page:**
![Login Page](https://raw.githubusercontent.com/Aden1ke/Thera/main/docs/login.jpg)

**Sign Up Page:**
![Sign Up Page](https://raw.githubusercontent.com/Aden1ke/Thera/main/docs/signup.jpg)

---

## 🧪 MVP Scope 

| Feature                    | Stack                                |
| -------------------------- | ------------------------------------ |
| Journal input (text/voice) | React, Node.js, MongoDB, Whisper     |
| AI pattern detection       | TensorFlow, HuggingFace (RoBERTa)    |
| Daily ritual (1–2 types)   | React + Lottie/GSAP                  |
| Emotion progress bar       | React + TensorFlow classifier        |
| Soul garden (basic view)   | Canvas or SVG + Framer Motion        |
| Emergency contact          | MongoDB + optional Twilio integration|
| Notifications              | Node.js or Firebase                  |

---

## 💻 Tech Stack

**Frontend:**

- React.js
- Framer Motion / GSAP / Lottie for animation
- Canvas or SVG for custom visualizations

**Backend:**

- Node.js + Express.js
- MongoDB (Mongoose for modeling)
- LangChain (retrieval + memory connection)
- Chroma (vector DB, optional)

**AI & Voice:**

- Hugging Face (RoBERTa) for emotion classification
- TensorFlow (custom pattern & distress detection)
- OpenAI Whisper for speech-to-text
- Teachable Machine (for lightweight emotion detection via audio)

**Notifications & Alerts:**

- Twilio API / WhatsApp integration
- Firebase (for mobile/web notifications)

---

## 🧰 Installation

### Clone the repository:
https://github.com/Aden1ke/Thera.git

## Deployment
### General Deployment Notes
Separate Deployments: It's recommended to deploy your frontend and backend as separate services.
Environment Variables: Ensure all necessary environment variables are set correctly in your deployment environment (e.g., Vercel, Netlify for frontend; Heroku, Render, AWS, DigitalOcean for backend).
CORS: Adjust CORS origins in your backend (server.js and youTubeRoutes.js) to match your deployed frontend URL(s).
Database: Ensure your MongoDB database is accessible from your backend deployment.

#### .env for frontend
NEXT_PUBLIC_WS_ENDPOINT="ws://localhost:5000" # For local development
REACT_APP_BACKEND_URL="http://localhost:5000" # For local development


#### .env for backend
DEV_DB_URI="mongodb+srv://user_dev:password_dev@dev-cluster.abcdef.mongodb.net/?retryWrites=true&w=majority&appName=dev-cluster"
NODE_ENV=development
OPENAI_API_KEY="sk-fakeopenaiapikey0123456789abcdefghijklmnopqrstuvwxyz"
YOUTUBE_API_KEY="AIzaSyB_fakeyoutubeapikey1234567890"
JWT_SECRET="FakeSuperSecretKeyForJWTsUsedInProdOnlyPleaseDontShare"
FRONTEND_URL="http://localhost:3000" # For local development




```bash
git clone https://github.com/your-username/thera.git
cd thera




## ⚙️ Setup

### Backend

```bash
cd backend
npm install
npm run dev


### Frontend

```bash
cd backend
npm install
npm run dev


## 💻 Usage

1. Start both frontend and backend servers.

2. Sign up / log in to your Thera account.

3. Write or speak your thoughts to Thera.

4. Thera will:
   - Reflect emotional themes
   - Suggest rituals
   - Water your Soul Garden
   - Provide soothing presence
   - Send daily motivational nudges and grow over time

---

## License
This project is licensed under the MIT License.


