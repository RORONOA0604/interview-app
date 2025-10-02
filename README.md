# AI Interview Platform

## ✨ Features

[cite_start]The application is split into two main interfaces: one for the interviewee and a dashboard for the interviewer[cite: 3].

### 👤 Interviewee Portal

-   [cite_start]**Resume Upload:** Candidates can upload a PDF or DOCX resume to begin the process[cite: 6, 16].
-   [cite_start]**Automated Field Extraction:** A Python/FastAPI backend automatically parses the candidate's Name, Email, and Phone number from the resume[cite: 7, 16].
-   [cite_start]**Missing Field Prompts:** If any required field is not found, the app prompts the user to enter it manually before the interview can start[cite: 7, 17].
-   [cite_start]**Role-Based Questions:** Candidates select their desired role (e.g., Full-Stack Developer, ML Engineer) to receive a relevant set of questions from a predefined question bank[cite: 19].
-   [cite_start]**Timed Interview Flow:** The interview consists of 6 questions (2 Easy, 2 Medium, 2 Hard) presented one at a time[cite: 20, 21].
-   [cite_start]**Per-Question Timers:** Each question is timed based on its difficulty: 20s for Easy, 60s for Medium, and 120s for Hard[cite: 25].
-   [cite_start]**Auto-Submission:** If the timer runs out, the current answer is automatically submitted, and the interview proceeds to the next question[cite: 26].
-   **Session Persistence:** All progress, including answers and the current question, is saved locally. [cite_start]If the user refreshes or closes the page, they are greeted with a "Welcome Back" modal allowing them to resume the interview[cite: 11, 12, 39, 40].
-   [cite_start]**Final Report:** After the final question, a deterministic score and a role-based summary are generated and displayed[cite: 28].

### 👨‍💼 Interviewer Dashboard

-   [cite_start]**Candidate Overview:** Displays a list of all candidates who have completed the interview[cite: 34].
-   [cite_start]**Search & Sort:** The dashboard includes a real-time search bar and the ability to sort candidates by their final score[cite: 9, 36].
-   [cite_start]**Detailed View:** Clicking on a candidate opens a detailed modal showing their profile information, final summary, and the complete history of questions and answers from their session[cite: 10, 35].

---

## 🛠️ Tech Stack

-   **Frontend:** React, Redux (with Redux Toolkit & `redux-persist`), Ant Design
-   **Backend:** Python, FastAPI
-   **Database:** Supabase (PostgreSQL)
-   **Deployment:** Vercel

---

## 🚀 How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/RORONOA0604/interview-app.git](https://github.com/RORONOA0604/interview-app.git)
    cd interview-app
    ```

2.  **Setup the Backend (`/api` folder):**
    - Navigate to the API directory: `cd api`
    - Install dependencies: `pip install -r requirements.txt`
    - Run the backend server: `uvicorn main:app --reload`
    - The backend will be running on `http://127.0.0.1:8000`.

3.  **Setup the Frontend (Root folder):**
    - Navigate back to the root directory: `cd ..`
    - Install dependencies: `npm install`
    - Create a `.env` file in the root folder and add your Supabase credentials:
      ```
      VITE_SUPABASE_URL="your-supabase-url"
      VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
      ```
    - Run the frontend: `npm run dev`
    - The application will be available at `http://localhost:5173`.

---

## 🔑 Environment Variables

To run this project, you will need to create a `.env` file in the root directory for the frontend and add the following variables:

-   `VITE_SUPABASE_URL`: Your project's URL from the Supabase dashboard.
-   `VITE_SUPABASE_ANON_KEY`: Your project's `anon` public key from the Supabase dashboard.
