import React, { useState, useEffect } from "react";
import { Button, Card, Spin, Input, Select, Result, Progress, Modal } from "antd";
import { useSelector, useDispatch } from "react-redux";
import ResumeUpload from "../components/ResumeUpload";
import { supabase } from '../utils/supabaseClient';
import localQuestions from '../questions.json';
import {
  startInterview,
  setInterviewQuestions,
  recordAnswer,
  resetInterview,
  setRole,
  setFinalReport
} from "../store/candidateSlice";

const { TextArea } = Input;
const TIMER_CONFIG = { Easy: 20, Medium: 60, Hard: 120 };

const ROLE_SUMMARIES = {
    full_stack_developer: "The candidate demonstrated a solid foundational knowledge of full-stack development concepts. Further evaluation on large-scale project architecture is recommended.",
    ml_engineer: "The candidate shows a good understanding of core machine learning principles. They would be a good fit for a team where they can grow their practical application skills.",
    software_developer: "The candidate has a strong grasp of general software development practices and data structures. Their problem-solving approach is logical and clear.",
    web_developer: "The candidate is proficient in fundamental web technologies, showing a good base for frontend or backend development roles.",
};

export default function Interviewee() {
  const dispatch = useDispatch();
  const candidate = useSelector((s) => s.candidate);
  const questions = useSelector((s) => s.candidate.interviewLog) || [];

  const [status, setStatus] = useState('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [showWelcomeBackModal, setShowWelcomeBackModal] = useState(false);

  // This hook now correctly detects a restored session
  useEffect(() => {
    if (candidate.interviewStarted && !candidate.summary) {
      setShowWelcomeBackModal(true);
      setStatus('interviewing');
    }
    // ✅ FIX: This dependency array tells the hook to re-run after the persisted state is loaded.
  }, [candidate.interviewStarted, candidate.summary]);

  // This useEffect hook manages the timer for each question
  useEffect(() => {
    if (status !== 'interviewing' || !questions[currentQuestionIndex] || showWelcomeBackModal) {
      return;
    }

    const initialTime = TIMER_CONFIG[questions[currentQuestionIndex].difficulty] || 30;
    setTimeLeft(initialTime);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          const isLast = currentQuestionIndex === questions.length - 1;
          if (isLast) {
            handleFinishInterview();
          } else {
            handleNextQuestion();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [currentQuestionIndex, status, showWelcomeBackModal]);

  const handleRoleChange = (value) => { dispatch(setRole(value)); };

  const onStartInterview = () => {
    const roleQuestions = localQuestions[candidate.role];
    if (roleQuestions) {
      dispatch(setInterviewQuestions(roleQuestions));
      dispatch(startInterview());
      setStatus('interviewing');
    } else {
      alert("Please select a role first.");
    }
  };

  const handleNextQuestion = () => {
    dispatch(recordAnswer({ questionIndex: currentQuestionIndex, answer: currentAnswer }));
    setCurrentAnswer("");
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleFinishInterview = async () => {
    if (status !== 'interviewing') return;
    setStatus('saving');

    dispatch(recordAnswer({ questionIndex: currentQuestionIndex, answer: currentAnswer }));
    
    const finalLog = questions.map((q, i) => i === currentQuestionIndex ? { ...q, answer: currentAnswer } : q);

    const answeredCount = finalLog.filter(q => q.answer.trim() !== "").length;
    let finalScore = 0;
    if (answeredCount <= 1) finalScore = 3;
    else if (answeredCount === 2) finalScore = 5;
    else if (answeredCount === 3) finalScore = 6;
    else if (answeredCount === 4) finalScore = 7;
    else if (answeredCount === 5) finalScore = 8;
    else if (answeredCount === 6) finalScore = 9;
    
    const summary = ROLE_SUMMARIES[candidate.role] || "The candidate completed the assessment.";

    dispatch(setFinalReport({ finalScore, summary }));

    await supabase.from('interviews').insert([{
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        role: candidate.role,
        resume_filename: candidate.resumeFileMeta?.name || 'N/A',
        interview_log: finalLog,
        final_score: finalScore,
        summary: summary,
    }]);

    setTimeout(() => {
        setStatus('summary');
    }, 1500);
  };

  if (status === 'saving') {
    return <Card><Spin size="large" tip="Generating AI summary and final score..." style={{ display: 'block', margin: '100px auto' }} /></Card>;
  }

  if (status === 'summary') {
    return (
        <Card>
            <Result
                status="success"
                title="Interview Complete!"
                subTitle="Your results have been submitted successfully."
                extra={[
                    <Button type="primary" key="home" onClick={() => { dispatch(resetInterview()); setStatus('setup'); setCurrentQuestionIndex(0); }}>
                        Back to Home
                    </Button>,
                ]}
            >
                <div>
                    <h2>Final Score: {candidate.finalScore}/10</h2>
                    <p><b>Summary:</b> {candidate.summary}</p>
                </div>
            </Result>
        </Card>
    );
  }

  if (status === 'interviewing') {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const totalTime = TIMER_CONFIG[currentQuestion.difficulty] || 30;
    return (
        <Card title={`Question ${currentQuestionIndex + 1} of ${questions.length}`}>
            <Progress percent={((totalTime - timeLeft) / totalTime) * 100} showInfo={false} status="active" />
            <div style={{ textAlign: 'center', margin: '10px 0', fontSize: '20px', color: timeLeft <= 10 ? 'red' : 'inherit' }}>
                Time Left: <strong>{timeLeft}s</strong>
            </div>
            <h3>{currentQuestion.question}</h3>
            <p><b>Difficulty:</b> {currentQuestion.difficulty}</p>
            <TextArea rows={10} value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} />
            <Button 
              type="primary" 
              style={{ marginTop: 16 }} 
              onClick={isLastQuestion ? handleFinishInterview : handleNextQuestion}
            >
                {isLastQuestion ? 'Finish & Submit Interview' : 'Next Question'}
            </Button>
        </Card>
    );
  }

  // Default 'setup' view
  return (
    <>
      <Card title="Interviewee Portal">
        <h3>Step 1: Upload Resume</h3>
        <ResumeUpload />
        <h3 style={{ marginTop: '24px' }}>Step 2: Select Your Role</h3>
        <Select
            placeholder="Select a role"
            style={{ width: '100%', marginBottom: 24 }}
            onChange={handleRoleChange}
            options={[
                { value: 'full_stack_developer', label: 'Full-Stack Developer' },
                { value: 'ml_engineer', label: 'ML Engineer' },
                { value: 'software_developer', label: 'Software Developer' },
                { value: 'web_developer', label: 'Web Developer' },
            ]}
        />
        <h3 style={{ marginTop: '24px' }}>Step 3: Start Interview</h3>
        <Button type="primary" disabled={!candidate.resumeFileMeta || !candidate.role} onClick={onStartInterview}>
            Start Interview
        </Button>
      </Card>

      <Modal
          title="Welcome Back!"
          open={showWelcomeBackModal}
          closable={false}
          footer={[
              <Button key="start_over" onClick={() => { dispatch(resetInterview()); setShowWelcomeBackModal(false); setStatus('setup'); }}>
                  Start Over
              </Button>,
              <Button key="continue" type="primary" onClick={() => setShowWelcomeBackModal(false)}>
                  Continue Interview
              </Button>,
          ]}
      >
          <p>It looks like you have an interview in progress. Would you like to continue where you left off or start over?</p>
      </Modal>
    </>
  );
}