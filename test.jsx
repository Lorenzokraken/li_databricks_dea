import { useState, useEffect } from "react";

const questions = [];
const CORRECT_PASSWORD = "Biricchino100€";

export default function DatabricksQuiz() {
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [mdQuestionCount, setMdQuestionCount] = useState(questions.length);

  const activeQuestions =
    parsedQuestions.length > 0 ? parsedQuestions : questions;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);

  const questionsToShow = quizStarted ? quizQuestions : activeQuestions;

  // Carica la sessione da localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem("quizSession");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setIsAuthenticated(session.isAuthenticated);
        if (session.isAuthenticated) {
          setQuizStarted(session.quizStarted);
          setSelectedQuestionCount(session.selectedQuestionCount);
          setCurrentQ(session.currentQ);
          setSelected(session.selected);
          setShowResult(session.showResult);
          setScore(session.score);
          setAnswered(session.answered);
          setQuizComplete(session.quizComplete);
          setQuizQuestions(session.quizQuestions);
        }
      } catch (e) {
        // Sessione invalida
      }
    }
  }, []);

  // Salva la sessione ogni volta che lo stato cambia
  useEffect(() => {
    if (isAuthenticated) {
      const session = {
        isAuthenticated,
        quizStarted,
        selectedQuestionCount,
        currentQ,
        selected,
        showResult,
        score,
        answered,
        quizComplete,
        quizQuestions,
      };
      localStorage.setItem("quizSession", JSON.stringify(session));
    }
  }, [
    isAuthenticated,
    quizStarted,
    selectedQuestionCount,
    currentQ,
    selected,
    showResult,
    score,
    answered,
    quizComplete,
    quizQuestions,
  ]);

  useEffect(() => {
    const jsonUrl =
      typeof import.meta !== "undefined" && import.meta.url
        ? new URL("./question.json", import.meta.url).href
        : "/question.json";

    fetch(jsonUrl)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setParsedQuestions(data);
          setMdQuestionCount(data.length);
        }
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  const q = questionsToShow[currentQ];

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setShowResult(true);
    const isCorrect = selected === q.correct;
    if (isCorrect) setScore((s) => s + 1);
    setAnswered([
      ...answered,
      { qId: q.id, selected, correct: q.correct, isCorrect },
    ]);
  };

  const handleNext = () => {
    if (currentQ < questionsToShow.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
    setQuizComplete(false);
    setQuizStarted(false);
    setSelectedQuestionCount(null);
  };

  const handleLogin = () => {
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordInput("");
    } else {
      alert("Password errata!");
      setPasswordInput("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    setQuizStarted(false);
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
    setQuizComplete(false);
    setSelectedQuestionCount(null);
    setQuizQuestions([]);
    localStorage.removeItem("quizSession");
  };

  const handleStartQuiz = (count) => {
    const shuffled = [...activeQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    setQuizQuestions(selected);
    setSelectedQuestionCount(count);
    setQuizStarted(true);
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
  };

  const getCategoryColor = (cat) => {
    const colors = {
      "Unity Catalog": "bg-purple-100 text-purple-800",
      "Lakeflow DLT": "bg-blue-100 text-blue-800",
      Workflows: "bg-green-100 text-green-800",
      DAB: "bg-orange-100 text-orange-800",
      "Auto Loader": "bg-cyan-100 text-cyan-800",
      "Delta Lake": "bg-red-100 text-red-800",
      Compute: "bg-yellow-100 text-yellow-800",
    };
    return colors[cat] || "bg-gray-100 text-gray-800";
  };

  if (!isAuthenticated) {
    const handleReset = () => {
      localStorage.clear();
      window.location.reload();
    };

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl bg-white shadow-sm p-8 text-center">
            <h1 className="text-3xl font-bold mb-6">🔐 Accesso Richiesto</h1>
            <p className="text-gray-600 mb-8">Inserisci la password per accedere al quiz</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition mb-3"
            >
              Accedi
            </button>
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-gray-400 text-white rounded-lg font-medium hover:bg-gray-500 transition text-sm"
            >
              Reset Dati
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
            >
              Esci
            </button>
          </div>
          <div className="rounded-xl bg-white shadow-sm p-8 text-center">
            <h1 className="text-3xl font-bold mb-6">Quiz Databricks</h1>
            <p className="text-gray-600 mb-8">
              Quante domande vuoi risolvere? Sono disponibili {activeQuestions.length} domande totali.
            </p>
            <div className="space-y-3">
              {[5, 10, 15, 20, activeQuestions.length].map((num) => (
                num <= activeQuestions.length && (
                  <button
                    key={num}
                    onClick={() => handleStartQuiz(num)}
                    className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    {num} domande
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questionsToShow.length) * 100);
    const passed = percentage >= 78;
    const requiredCorrect = Math.ceil(questionsToShow.length * 0.78);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
            >
              Esci
            </button>
          </div>
          <div
            className={`rounded-xl p-8 text-center ${passed ? "bg-green-50 border-2 border-green-200" : "bg-red-50 border-2 border-red-200"}`}
          >
            <div className="text-6xl mb-4">{passed ? "✅" : "📚"}</div>
            <h2 className="text-2xl font-bold mb-2">
              {passed ? "Ottimo lavoro!" : "Serve ancora studio"}
            </h2>
            <p className="text-4xl font-bold mb-2">
              {score}/{questionsToShow.length}
            </p>
            <p className="text-xl text-gray-600 mb-4">{percentage}%</p>
            <p className="text-sm text-gray-500 mb-6">
              {passed
                ? "Sei sopra la soglia del 78%. Pronto per prenotare l'esame."
                : `Target: >78% (${requiredCorrect}/${questionsToShow.length}). Rivedi gli argomenti sbagliati.`}
            </p>

            <div className="text-left bg-white rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Riepilogo per categoria:</h3>
              {Object.entries(
                answered.reduce((acc, a) => {
                  const cat = questionsToShow.find(
                    (q) => q.id === a.qId,
                  ).category;
                  if (!acc[cat]) acc[cat] = { correct: 0, total: 0 };
                  acc[cat].total++;
                  if (a.isCorrect) acc[cat].correct++;
                  return acc;
                }, {}),
              ).map(([cat, stats]) => (
                <div
                  key={cat}
                  className="flex justify-between items-center py-1"
                >
                  <span
                    className={`px-2 py-1 rounded text-xs ${getCategoryColor(cat)}`}
                  >
                    {cat}
                  </span>
                  <span
                    className={
                      stats.correct === stats.total
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stats.correct}/{stats.total}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ricomincia Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
          >
            Esci
          </button>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(q.category)}`}
            >
              {q.category}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {currentQ + 1}/{questionsToShow.length} • Score: {score}
            <div className="text-xs text-gray-400 mt-1">
              {`question.md: ${mdQuestionCount} domande`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQ + 1) / questionsToShow.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {q.question}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let optClass = "border-2 border-gray-200 hover:border-blue-300";

              if (showResult) {
                if (idx === q.correct) {
                  optClass = "border-2 border-green-500 bg-green-50";
                } else if (idx === selected && idx !== q.correct) {
                  optClass = "border-2 border-red-500 bg-red-50";
                }
              } else if (selected === idx) {
                optClass = "border-2 border-blue-500 bg-blue-50";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg transition ${optClass}`}
                >
                  <span className="font-medium text-gray-500 mr-3">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mb-4">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                selected === null
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Verifica
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              {currentQ < questionsToShow.length - 1
                ? "Prossima →"
                : "Vedi risultati"}
            </button>
          )}
        </div>

        {/* Explanation */}
        {showResult && (
          <div
            className={`rounded-lg p-4 mb-4 ${selected === q.correct ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}
          >
            <p className="font-medium mb-1">
              {selected === q.correct ? "✓ Corretto!" : "✗ Sbagliato"}
            </p>
            <p className="text-sm text-gray-700">{q.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
