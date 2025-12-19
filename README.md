# 🧠 Antigravity AI Quiz Builder

![Banner](https://img.shields.io/badge/AI--Quiz--Builder-Powered%20by%20OpenAI-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

An ultra-modern, high-security AI-powered quiz platform designed for educators and hosts. Create engaging quizzes from raw topics or PDF documents in seconds, host live sessions with real-time feedback, and maintain academic integrity with built-in anti-cheat mechanisms.

---

## ✨ Key Features

### 🤖 AI-Powered Quiz Generation
- **Prompt to Quiz**: Simply type a topic or specific instructions to generate high-quality MCQs.
- **PDF Upload**: Upload textbooks, research papers, or notes, and let the AI extract questions automatically.
- **Customizable**: Control the number of questions and time limits per session.

### 🛡️ Secure Proctoring (Anti-Cheat)
- **Tab/Window Detection**: Real-time alerts to the host when a student switches tabs or minimizes the browser.
- **Resize Monitoring**: Detects if students are trying to split-screen to search for answers.
- **Focus Alerts**: Notifies the host if the game window loses focus (clicks away).
- **Violation Logging**: Tracks the number and type of violations per student for final evaluation.

### 📊 Professional Management
- **Live Host Dashboard**: See student progress, scores, and cheating alerts in real-time.
- **Excel Export**: Hosts can download a complete leaderboard with names, marks, and violation counts.
- **Word Export for Students**: Students can download a professionally formatted document containing all questions and correct solutions for study.
- **Pin-Based Entry**: Secure game rooms accessible via unique 6-digit PINs.

### 🎨 Premium User Experience
- **Glassmorphism UI**: A sleek, dark-themed aesthetic with vibrant gradients and smooth animations.
- **Responsive Design**: Flawlessly works on desktops, tablets, and phones.
- **Interactive Feedback**: Real-time animations for correct/incorrect answers and final marks.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Real-time**: Socket.io
- **Database**: MongoDB (Mongoose)
- **AI**: OpenAI / OpenRouter (GPT-3.5 Turbo / Higher)
- **Exporting**: SheetJS (XLSX), Docx, File-Saver
- **PDF Processing**: PDF-Parse

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- OpenAI API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cout-arya/quiz-generator.git
   cd quiz-generator
   ```

2. **Server Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   OPENAI_API_KEY=your_api_key
   JWT_SECRET=your_secret_key
   ```
   Start the server:
   ```bash
   npm run dev
   ```

3. **Client Setup**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

---

## 📸 Screenshots

| Landing Page | Host Dashboard | Player Game |
|:---:|:---:|:---:|
| ✨ Aesthetic & Modern | 📊 Real-time Monitoring | 🎮 Engagement Focused |

*(Screenshots coming soon)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Created with ❤️ by **Antigravity AI**