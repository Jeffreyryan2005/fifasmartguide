# FIFA 26 Smart Guide

A GenAI-enabled solution designed for **PromptWars Challenge 4** to enhance stadium operations and the overall tournament experience during the FIFA World Cup 2026.

## 🎯 Chosen Vertical
**Multilingual Assistance, Accessibility & Crowd Management**
This solution is crafted for fans, providing them with an inclusive, accessible, and intelligent assistant to navigate the stadium seamlessly.

## 🧠 Approach and Logic
The application is built with a focus on real-world usability, performance, and accessibility. 

- **Frontend (Vanilla HTML/CSS/JS)**: Chosen to ensure zero-bloat, maximum efficiency, and rapid load times even on poor cellular networks in crowded stadiums. The design incorporates a premium aesthetic with full support for High Contrast mode.
- **Backend (Node.js/Express)**: Provides a lightweight, secure API layer.
- **Generative AI (Google Gemini)**: Powers the conversational interface, tailored via system prompts to act as a knowledgeable FIFA World Cup assistant. It processes fan queries about facilities, gates, and accessibility routes.
- **Accessibility (A11y) First**: Implements ARIA labels, semantic HTML, keyboard navigability, and Text-to-Speech (Web Speech API) for visually impaired fans.

## ⚙️ How the Solution Works
1. **Multilingual Chatbot**: Fans can select their preferred language. The user's query is sent to the Express backend, which securely forwards it to the Gemini API (`gemini-2.5-flash`). The AI returns a concise, helpful response translated appropriately.
2. **Crowd Management Dashboard**: Simulates real-time telemetry from stadium gates. It visualizes crowd density and wait times, helping fans dynamically choose the fastest or safest route.
3. **Inclusive Features**: A built-in "High Contrast" toggle and a "Text-to-Speech" button ensure that all fans, regardless of ability, can access vital stadium information.

## 🔒 Security & Efficiency Focus
- **Security**: Utilizes `helmet` for secure HTTP headers, `cors` for safe cross-origin requests, and `express-rate-limit` to prevent abuse of the AI API endpoints.
- **Efficiency**: No bulky frontend frameworks. The entire client payload is incredibly small, heavily cached, and responsive.

## 📝 Assumptions Made
1. **API Keys**: It is assumed that a valid `GEMINI_API_KEY` is provided in the `.env` environment during runtime.
2. **Crowd Data**: The real-time crowd data is currently simulated but structured to consume real IoT telemetry data from gate sensors via a standard JSON payload.
3. **Client Support**: The client device supports the Web Speech API (supported by ~95% of modern browsers).

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by editing the `.env` file and inserting your Gemini API Key:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=3000
   ```

### Running the App
Start the server:
```bash
npm run dev # or node server.js
```
Navigate to `http://localhost:3000` in your web browser.

### Running Tests
To validate the backend logic and API routes:
```bash
npm test
```
