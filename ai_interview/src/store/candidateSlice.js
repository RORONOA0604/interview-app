import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  email: '',
  phone: '',
  role: '',
  resumeFileMeta: null,
  interviewStarted: false,
  interviewLog: [], // Will store { question, difficulty, answer, score, feedback }
  finalScore: 0,
  summary: '',
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    resetInterview: () => initialState,
    setRole(state, action) {
      state.role = action.payload;
    },
    setCandidateField(state, action) {
      state[action.payload.key] = action.payload.value;
    },
    setResumeFileMeta(state, action) {
      state.resumeFileMeta = action.payload;
    },
    startInterview(state) {
      state.interviewStarted = true;
    },
    setInterviewQuestions(state, action) {
      state.interviewLog = action.payload.map(q => ({ ...q, answer: '', score: 0, feedback: '' }));
    },
    recordAnswer(state, action) {
      const { questionIndex, answer } = action.payload;
      if (state.interviewLog[questionIndex]) {
        state.interviewLog[questionIndex].answer = answer;
      }
    },
    recordScoreAndFeedback(state, action) {
      const { questionIndex, score, feedback } = action.payload;
      if (state.interviewLog[questionIndex]) {
        state.interviewLog[questionIndex].score = score;
        state.interviewLog[questionIndex].feedback = feedback;
      }
    },
    setFinalReport(state, action) {
        state.finalScore = action.payload.finalScore;
        state.summary = action.payload.summary;
    }
  },
});

export const {
  resetInterview,
  setRole,
  setCandidateField,
  setResumeFileMeta,
  startInterview,
  setInterviewQuestions,
  recordAnswer,
  recordScoreAndFeedback,
  setFinalReport,
} = candidateSlice.actions;

export default candidateSlice.reducer;