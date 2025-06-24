import React, { useState } from 'react';
import api from './api';
import '../styles/QuizPage.css';

export default function QuizPage() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const generateQuiz = async () => {
    try {
      const res = await api.post('/quizzes/generate/');
      setQuiz(res.data);
      setAnswers({});
      setSubmitted(false);
      setResult(null);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not generate quiz');
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await api.post(`/quizzes/${quiz.id}/submit/`, {
        answers
      });
      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit quiz.');
    }
  };

  return (
    <div className="quiz-page">
      <h2>Python AI Quiz</h2>

      <button onClick={generateQuiz}>Generate Quiz</button>

      {error && <p className="error">{error}</p>}

      {quiz && quiz.questions?.length > 0 && (
        <div className="quiz-questions">
          <h3>{quiz.title}</h3>
          <p>{quiz.description}</p>

          {quiz.questions.map((q, idx) => (
            <div key={q.id} className="quiz-question">
              <h4>{idx + 1}. {q.question_text}</h4>
              {q.choices.map((choice, i) => (
                <label key={i} className="quiz-choice">
                  <input
                    type="radio"
                    name={`question_${q.id}`}
                    value={choice}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    disabled={submitted}
                  />
                  {choice}
                </label>
              ))}
            </div>
          ))}

          {!submitted && (
            <button className="submit-btn" onClick={handleSubmit}>
              Submit Answers
            </button>
          )}

          {submitted && result && (
            <div className="quiz-result">
              <h4>Result</h4>
              <p>Score: {result.score}/{result.total}</p>
              <p>{result.passed ? '✅ Passed (Perfect Score)' : '❌ Not perfect, try again!'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
