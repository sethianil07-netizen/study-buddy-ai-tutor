# 🎓 Study Buddy — AI Tutor

Study Buddy is an AI-powered study assistant designed to help students understand concepts, prepare for exams, revise topics, and organize their study sessions.

The chatbot uses Google's Gemini API to provide intelligent, conversational responses through a clean and interactive web interface.

---

## ✨ Features

- 🤖 AI-powered conversational study assistant
- 📚 Helps explain academic concepts
- 📝 Exam and revision assistance
- 📅 Study planning and scheduling support
- 💡 Motivation and study guidance
- 💬 Conversational follow-up questions
- ⚡ Quick-action buttons for common study tasks
- ⏳ Loading and error handling
- 🧹 Clear chat functionality
- 🔐 API key protected using environment variables

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### AI
- Google Gemini API
- Gemini Flash Lite

### Development Tools
- npm
- Git
- GitHub

---

## 🏗️ Project Architecture

```text
┌──────────────────────┐
│      Web Browser     │
│  HTML / CSS / JS     │
└──────────┬───────────┘
           │
           │ HTTP Request
           ▼
┌──────────────────────┐
│    Node.js Server    │
│       Express        │
└──────────┬───────────┘
           │
           │ API Request
           ▼
┌──────────────────────┐
│     Gemini API       │
│    AI Processing     │
└──────────┬───────────┘
           │
           │ AI Response
           ▼
┌──────────────────────┐
│      Chatbot UI      │
└──────────────────────┘
📁 Project Structure
study-buddy-ai-tutor/
│
├── index.html          # Main chatbot interface
├── style.css           # UI styling
├── script.js           # Frontend chatbot logic
├── server.js           # Node.js + Express backend
│
├── package.json        # Project dependencies and scripts
├── package-lock.json   # Dependency lock file
│
├── .env.example        # Example environment configuration
├── .gitignore          # Files excluded from Git
└── README.md           # Project documentation
🚀 Getting Started
1. Clone the repository
git clone https://github.com/YOUR-USERNAME/study-buddy-ai-tutor.git
2. Open the project directory
cd study-buddy-ai-tutor
3. Install dependencies
npm install
4. Configure the Gemini API

Create a .env file in the project root:

GEMINI_API_KEY=your_api_key_here

Replace your_api_key_here with your own Gemini API key.

⚠️ Never upload your .env file or expose your API key publicly.

5. Start the server
npm start

The application will run at:

http://localhost:3000

Open the address in your browser to use Study Buddy.

🔐 Environment Variables

The application uses an environment variable to keep the Gemini API key outside the source code.

Example:

GEMINI_API_KEY=your_api_key_here

The actual .env file is excluded from Git using .gitignore.

🎯 Purpose

The goal of Study Buddy is to provide students with an accessible AI-powered learning companion that can assist with everyday academic tasks.

Instead of relying only on predefined chatbot responses, Study Buddy communicates with Gemini to generate responses dynamically based on the user's questions and conversation.

🔮 Future Improvements

Potential future improvements include:

🧠 More advanced long-term conversation memory
📝 Interactive AI-generated quizzes
📊 Student progress tracking
📚 Subject-specific study modes
🎯 Personalized study plans
📄 PDF/document-based question answering
🎤 Voice input and output
📱 Improved mobile experience
👨‍💻 Author

Saksham Sethi

Built as part of an Artificial Intelligence Internship project.

📄 License

This project is intended for educational and portfolio purposes.
