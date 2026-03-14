import { useState, useEffect } from "react";
import DatabricksLogo from "./Databricks-logo.svg.png";

const questions = [];
const CORRECT_PASSWORD = "Biricchino100€";
const MAX_QUESTIONS_PER_SESSION = 25;
const PASSING_THRESHOLD = 0.78;

const CATEGORY_COLORS = {
  "Unity Catalog": "bg-purple-100 text-purple-800",
  "Lakeflow DLT": "bg-blue-100 text-blue-800",
  Workflows: "bg-green-100 text-green-800",
  DAB: "bg-orange-100 text-orange-800",
  "Auto Loader": "bg-cyan-100 text-cyan-800",
  "Delta Lake": "bg-red-100 text-red-800",
  Compute: "bg-yellow-100 text-yellow-800",
  "DLT / Lakeflow": "bg-indigo-100 text-indigo-800",
  "Databricks Asset Bundles": "bg-pink-100 text-pink-800",
  "Spark Optimization": "bg-emerald-100 text-emerald-800",
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-800";

const LogoutButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
  >
    Esci
  </button>
);

export default function DatabricksQuiz() {
  const [parsedQuestions, setParsedQuestions] = useState([]);

  const activeQuestions =
    parsedQuestions.length > 0 ? parsedQuestions : questions;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState([]);
  const [quizComplete, setQuizComplete] = useState(false);

  // Carica la sessione da localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem("quizSession");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setIsAuthenticated(session.isAuthenticated);
        if (session.isAuthenticated) {
          setQuizStarted(session.quizStarted);
          setCurrentQ(session.currentQ);
          setSelected(session.selected);
          setShowResult(session.showResult);
          setScore(session.score);
          setAnswered(session.answered);
          setQuizComplete(session.quizComplete);
          if (session.parsedQuestions && session.parsedQuestions.length > 0) {
            setParsedQuestions(session.parsedQuestions);
          }
        }
      } catch (e) {
        // Sessione invalida
      }
    }
  }, []);

  // Salva la sessione quando cambia lo stato del quiz
  const saveSession = () => {
    if (isAuthenticated) {
      const session = {
        isAuthenticated,
        quizStarted,
        currentQ,
        selected,
        showResult,
        score,
        answered,
        quizComplete,
        parsedQuestions,
      };
      localStorage.setItem("quizSession", JSON.stringify(session));
    }
  };

  useEffect(() => {
    saveSession();
  }, [
    isAuthenticated,
    quizStarted,
    currentQ,
    selected,
    showResult,
    score,
    answered,
    quizComplete,
    parsedQuestions,
  ]);

  const handleLogin = () => {
    if (passwordInput === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordInput("");
    } else {
      alert("Password errata!");
      setPasswordInput("");
    }
  };

  const resetQuizState = () => {
    setQuizStarted(false);
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswered([]);
    setQuizComplete(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasswordInput("");
    resetQuizState();
    localStorage.removeItem("quizSession");
  };

  useEffect(() => {
    // Se la sessione ha già domande salvate, non ricaricare da JSON
    const savedSession = localStorage.getItem("quizSession");
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.parsedQuestions && session.parsedQuestions.length > 0) {
          return; // Domande già caricate dalla sessione
        }
      } catch (e) {
        // continua a caricare da JSON
      }
    }

    if (parsedQuestions.length > 0) return;

    const jsonUrl =
      typeof import.meta !== "undefined" && import.meta.url
        ? new URL("../question.json", import.meta.url).href
        : "/question.json";

    fetch(jsonUrl)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Fisher-Yates shuffle and select max questions
          const shuffled = [...data];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          const selected = shuffled.slice(0, MAX_QUESTIONS_PER_SESSION);
          setParsedQuestions(selected);
          setMdQuestionCount(data.length);
        }
      })
      .catch(() => {
        // keep defaults
      });
  }, []);

  const q = activeQuestions[currentQ];

  // Show loading state if no questions are loaded yet
  if (!parsedQuestions.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Caricamento domande...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    const handleReset = () => {
      localStorage.clear();
      window.location.reload();
    };

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto w-full">
          <div className="rounded-xl bg-gray-800 shadow-lg p-8 text-center border border-gray-700">
            <h1 className="text-3xl font-bold mb-6 text-white">🔐 Accesso Richiesto</h1>
            <p className="text-gray-400 mb-8">Inserisci la password per accedere al quiz</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              className="w-full px-4 py-3 border-2 border-gray-600 rounded-lg mb-4 bg-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleLogin}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition mb-3"
            >
              Accedi
            </button>
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition text-sm"
            >
              Reset Dati
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show start screen if quiz hasn't started
  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-900 p-6 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center w-full">
          <div className="flex justify-end mb-4">
            <LogoutButton onClick={handleLogout} />
          </div>
          <div className="flex justify-center mb-8">
            <img
              src={DatabricksLogo}
              alt="Databricks"
              className="h-16 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-6">Databricks Quiz</h1>
          <p className="text-gray-300 mb-4">
            Test di preparazione su Databricks con {questions.length} domande totali
          </p>
          <p className="text-gray-400 mb-8">
            In ogni sessione rispondi a 25 domande casuali
          </p>
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <p className="text-gray-300 mb-2">📊 Soglia di superamento: {Math.round(PASSING_THRESHOLD * 100)}%</p>
            <p className="text-gray-400 text-sm">
              I risultati verranno salvati in JSON per il ripasso
            </p>
          </div>
          <button
            onClick={() => setQuizStarted(true)}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition"
          >
            Avvia Quiz 🚀
          </button>
        </div>
      </div>
    );
  }

  // Show error if question not loaded
  if (!q) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Errore nel caricamento della domanda...</p>
        </div>
      </div>
    );
  }

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
    if (currentQ < activeQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestart = () => {
    resetQuizState();
  };

  const getCategorySummary = (answered, activeQuestions) => {
    return Object.entries(
      answered.reduce((acc, a) => {
        const question = activeQuestions.find((q) => q.id === a.qId);
        const cat = question?.category || "Unknown";
        if (!acc[cat]) acc[cat] = { correct: 0, total: 0 };
        acc[cat].total++;
        if (a.isCorrect) acc[cat].correct++;
        return acc;
      }, {}),
    );
  };

  const downloadResults = () => {
    const results = {
      timestamp: new Date().toISOString(),
      score: `${score}/${activeQuestions.length}`,
      percentage: Math.round((score / activeQuestions.length) * 100),
      passed: Math.round((score / activeQuestions.length) * 100) >= 78,
      questions: answered.map((a) => {
        const question = activeQuestions.find((q) => q.id === a.qId);
        return {
          id: question.id,
          category: question.category,
          question: question.question,
          options: question.options,
          correctAnswer: question.options[question.correct],
          userAnswer: question.options[a.selected],
          isCorrect: a.isCorrect,
          explanation: question.explanation,
        };
      }),
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `quiz-results-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (quizComplete) {
    const percentage = Math.round((score / activeQuestions.length) * 100);
    const passed = percentage >= PASSING_THRESHOLD * 100;
    const requiredCorrect = Math.ceil(activeQuestions.length * 0.78);

    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end mb-4">
            <LogoutButton onClick={handleLogout} />
          </div>
          <div
            className={`rounded-xl p-8 text-center ${
              passed ? "bg-green-900 border-2 border-green-700" : "bg-red-900 border-2 border-red-700"
            }`}
          >
            <div className="text-6xl mb-4">{passed ? "✅" : "📚"}</div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              {passed ? "Ottimo lavoro!" : "Serve ancora studio"}
            </h2>
            <p className="text-4xl font-bold mb-2 text-white">
              {score}/{activeQuestions.length}
            </p>
            <p className="text-xl mb-4 text-gray-300">{percentage}%</p>
            <p className="text-sm mb-6 text-gray-400">
              {passed
                ? `Sei sopra la soglia del ${Math.round(PASSING_THRESHOLD * 100)}%. Pronto per prenotare l'esame.`
                : `Target: >${Math.round(PASSING_THRESHOLD * 100)}% (${requiredCorrect}/${activeQuestions.length}). Rivedi gli argomenti sbagliati.`}
            </p>

            <div className="text-left rounded-lg p-4 mb-6 bg-gray-800">
              <h3 className="font-semibold mb-3 text-white">Riepilogo per categoria:</h3>
              {getCategorySummary(answered, activeQuestions).map(([cat, stats]) => (
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

            <div className="flex gap-3 justify-center">
              <button
                onClick={downloadResults}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                📥 Scarica Risultati JSON
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Ricomincia Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-4">
          <LogoutButton onClick={handleLogout} />
        </div>

        {/* Logo Header */}
        <div className="flex justify-center mb-8">
          <img
            src={DatabricksLogo}
            alt="Databricks"
            className="h-12 object-contain"
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span
            className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(q.category)}`}
          >
            {q.category}
          </span>
          <div className="text-sm text-gray-400">
            {currentQ + 1}/{activeQuestions.length} • Score: {score}
            <div className="text-xs mt-1 text-gray-500">
              {`${questions.length} domande`}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-2 mb-6 bg-gray-700">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${((currentQ + 1) / activeQuestions.length) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="rounded-xl shadow-sm p-6 mb-4 bg-gray-800">
          <h2 className="text-lg font-medium mb-6 text-white">
            {q.question}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let optClass;

              if (showResult) {
                if (idx === q.correct) {
                  optClass = "border-2 border-green-600 bg-green-900/30";
                } else if (idx === selected && idx !== q.correct) {
                  optClass = "border-2 border-red-600 bg-red-900/30";
                } else {
                  optClass = "border-2 border-gray-600";
                }
              } else if (selected === idx) {
                optClass = "border-2 border-blue-600 bg-blue-900/30";
              } else {
                optClass = "border-2 border-gray-600 hover:border-blue-500";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg transition text-white ${optClass}`}
                >
                  <span className="font-medium mr-3 text-gray-400">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showResult && (
          <div
            className={`rounded-lg p-4 mb-4 ${
              selected === q.correct
                ? "bg-green-900/30 border border-green-600"
                : "bg-amber-900/30 border border-amber-600"
            }`}
          >
            <p className="font-medium mb-1 text-white">
              {selected === q.correct ? "✓ Corretto!" : "✗ Sbagliato"}
            </p>
            <p className="text-sm text-gray-300">{q.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {!showResult ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                selected === null
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
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
              {currentQ < activeQuestions.length - 1
                ? "Prossima →"
                : "Vedi risultati"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
