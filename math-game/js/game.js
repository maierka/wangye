class GradeConfig {
  static configs = {
    1: {
      grade: 1,
      name: "一年级",
      operations: ["+", "-"],
      minNumber: 1,
      maxNumber: 10,
      questionCount: { practice: Infinity, challenge: 10, marathon: 20 }
    },
    2: {
      grade: 2,
      name: "二年级",
      operations: ["+", "-", "*"],
      minNumber: 1,
      maxNumber: 100,
      maxMultiplier: 5,
      questionCount: { practice: Infinity, challenge: 10, marathon: 20 }
    },
    3: {
      grade: 3,
      name: "三年级",
      operations: ["+", "-", "*", "/"],
      minNumber: 1,
      maxNumber: 1000,
      maxMultiplier: 9,
      questionCount: { practice: Infinity, challenge: 10, marathon: 20 }
    },
    4: {
      grade: 4,
      name: "四年级",
      operations: ["+", "-", "*", "/"],
      minNumber: 10,
      maxNumber: 10000,
      maxMultiplier: 99,
      minMultiplier: 10,
      questionCount: { practice: Infinity, challenge: 10, marathon: 20 }
    },
    5: {
      grade: 5,
      name: "五年级",
      operations: ["+", "-", "*", "/"],
      minNumber: 100,
      maxNumber: 100000,
      maxMultiplier: 99,
      minMultiplier: 10,
      questionCount: { practice: Infinity, challenge: 10, marathon: 20 }
    },
    6: {
      grade: 6,
      name: "六年级",
      operations: ["+", "-", "*", "/"],
      minNumber: 1000,
      maxNumber: 1000000,
      maxMultiplier: 999,
      minMultiplier: 100,
      questionCount: { practice: Infinity, challenge: 10, marathon: 20 }
    }
  };
}

class QuestionGenerator {
  static generate(gradeConfig) {
    const operation = gradeConfig.operations[Math.floor(Math.random() * gradeConfig.operations.length)];
    let num1, num2, answer;

    switch (operation) {
      case "+":
        return this.generateAddition(gradeConfig);
      case "-":
        return this.generateSubtraction(gradeConfig);
      case "*":
        return this.generateMultiplication(gradeConfig);
      case "/":
        return this.generateDivision(gradeConfig);
      default:
        return this.generateAddition(gradeConfig);
    }
  }

  static generateAddition(config) {
    let num1, num2;
    if (config.grade <= 2) {
      num1 = this.randomInt(config.minNumber, config.maxNumber);
      num2 = this.randomInt(config.minNumber, config.maxNumber - num1);
    } else {
      num1 = this.randomInt(config.minNumber, config.maxNumber);
      num2 = this.randomInt(config.minNumber, config.maxNumber);
    }
    return {
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2,
      operation: "+",
      num1,
      num2
    };
  }

  static generateSubtraction(config) {
    let num1, num2;
    if (config.grade <= 2) {
      num1 = this.randomInt(config.minNumber, config.maxNumber);
      num2 = this.randomInt(config.minNumber, num1);
    } else {
      num1 = this.randomInt(config.minNumber, config.maxNumber);
      num2 = this.randomInt(config.minNumber, num1);
    }
    return {
      question: `${num1} - ${num2} = ?`,
      answer: num1 - num2,
      operation: "-",
      num1,
      num2
    };
  }

  static generateMultiplication(config) {
    const maxMult = config.maxMultiplier || 9;
    const minMult = config.minMultiplier || 1;
    let num1, num2;
    
    if (config.grade <= 3) {
      num1 = this.randomInt(1, maxMult);
      num2 = this.randomInt(1, maxMult);
    } else {
      num1 = this.randomInt(minMult, maxMult);
      num2 = this.randomInt(2, Math.min(maxMult, 99));
    }
    
    return {
      question: `${num1} × ${num2} = ?`,
      answer: num1 * num2,
      operation: "*",
      num1,
      num2
    };
  }

  static generateDivision(config) {
    const maxMult = config.maxMultiplier || 9;
    const minMult = config.minMultiplier || 1;
    
    if (config.grade <= 3) {
      const divisor = this.randomInt(2, maxMult);
      const quotient = this.randomInt(1, maxMult);
      const dividend = divisor * quotient;
      return {
        question: `${dividend} ÷ ${divisor} = ?`,
        answer: quotient,
        operation: "/",
        num1: dividend,
        num2: divisor
      };
    } else {
      const divisor = this.randomInt(minMult, maxMult);
      const quotient = this.randomInt(2, Math.min(maxMult, 999));
      const dividend = divisor * quotient;
      return {
        question: `${dividend} ÷ ${divisor} = ?`,
        answer: quotient,
        operation: "/",
        num1: dividend,
        num2: divisor
      };
    }
  }

  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

class StorageManager {
  static getUserProgress() {
    const defaultProgress = {
      gradeProgress: {},
      totalGames: 0,
      totalCorrect: 0,
      totalScore: 0,
      maxStreak: 0,
      badges: []
    };

    for (let i = 1; i <= 6; i++) {
      defaultProgress.gradeProgress[i] = { completed: 0, accuracy: 0, stars: 0, totalQuestions: 0, correctQuestions: 0 };
    }

    try {
      const saved = localStorage.getItem("mathGameProgress");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultProgress, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }

    return defaultProgress;
  }

  static saveUserProgress(progress) {
    try {
      localStorage.setItem("mathGameProgress", JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }

  static updateGradeProgress(grade, correct, total) {
    const progress = this.getUserProgress();
    const gradeProg = progress.gradeProgress[grade];
    
    gradeProg.totalQuestions += total;
    gradeProg.correctQuestions += correct;
    gradeProg.completed += total;
    gradeProg.accuracy = gradeProg.totalQuestions > 0 ? gradeProg.correctQuestions / gradeProg.totalQuestions : 0;
    
    if (gradeProg.accuracy >= 0.9) gradeProg.stars = 3;
    else if (gradeProg.accuracy >= 0.7) gradeProg.stars = 2;
    else if (gradeProg.accuracy >= 0.5) gradeProg.stars = 1;
    else gradeProg.stars = 0;

    progress.totalGames += 1;
    this.saveUserProgress(progress);
    
    return progress;
  }

  static addScore(score) {
    const progress = this.getUserProgress();
    progress.totalScore += score;
    this.saveUserProgress(progress);
    return progress;
  }

  static updateMaxStreak(streak) {
    const progress = this.getUserProgress();
    if (streak > progress.maxStreak) {
      progress.maxStreak = streak;
      this.saveUserProgress(progress);
    }
    return progress;
  }
}

class GameEngine {
  constructor() {
    this.currentGrade = 1;
    this.currentMode = "practice";
    this.score = 0;
    this.currentQuestion = 0;
    this.totalQuestions = 10;
    this.correctCount = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.isPlaying = false;
    this.timer = null;
    this.timeElapsed = 0;
    this.currentQuestionData = null;
    
    this.initElements();
    this.bindEvents();
    this.loadProgress();
  }

  initElements() {
    this.screens = {
      gradeSelection: document.getElementById("grade-selection"),
      modeSelection: document.getElementById("mode-selection"),
      gameScreen: document.getElementById("game-screen"),
      resultScreen: document.getElementById("result-screen")
    };

    this.elements = {
      totalScore: document.getElementById("total-score"),
      maxStreakDisplay: document.getElementById("max-streak"),
      selectedGradeName: document.getElementById("selected-grade-name"),
      gameModeBadge: document.getElementById("game-mode-badge"),
      timerContainer: document.getElementById("timer-container"),
      timer: document.getElementById("timer"),
      currentQuestion: document.getElementById("current-question"),
      totalQuestions: document.getElementById("total-questions"),
      currentScore: document.getElementById("current-score"),
      streakDisplay: document.getElementById("streak-display"),
      streakCount: document.getElementById("streak-count"),
      questionText: document.getElementById("question-text"),
      answerInput: document.getElementById("answer-input"),
      submitBtn: document.getElementById("submit-btn"),
      feedback: document.getElementById("feedback"),
      keypad: document.getElementById("keypad"),
      resultStars: document.getElementById("result-stars"),
      resultScore: document.getElementById("result-score"),
      resultAccuracy: document.getElementById("result-accuracy"),
      resultCorrect: document.getElementById("result-correct"),
      resultMaxStreak: document.getElementById("result-max-streak"),
      resultTimeRow: document.getElementById("result-time-row"),
      resultTime: document.getElementById("result-time"),
      gradeStarsContainers: document.querySelectorAll(".grade-stars")
    };
  }

  bindEvents() {
    document.querySelectorAll(".grade-card").forEach(card => {
      card.addEventListener("click", () => {
        this.currentGrade = parseInt(card.dataset.grade);
        this.selectMode();
      });
    });

    document.querySelectorAll(".mode-card").forEach(card => {
      card.addEventListener("click", () => {
        this.currentMode = card.dataset.mode;
        this.startGame();
      });
    });

    document.getElementById("back-to-grades").addEventListener("click", () => {
      this.showScreen("gradeSelection");
    });

    document.getElementById("back-from-game").addEventListener("click", () => {
      this.exitGame();
    });

    this.elements.submitBtn.addEventListener("click", () => this.checkAnswer());
    
    document.getElementById("keypad-submit").addEventListener("click", () => this.checkAnswer());

    document.querySelectorAll(".key[data-num]").forEach(key => {
      key.addEventListener("click", () => {
        this.elements.answerInput.value += key.dataset.num;
        this.elements.answerInput.focus();
      });
    });

    document.querySelector(".key-clear").addEventListener("click", () => {
      this.elements.answerInput.value = "";
      this.elements.answerInput.focus();
    });

    this.elements.answerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.checkAnswer();
      }
    });

    document.getElementById("retry-btn").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("change-grade-btn").addEventListener("click", () => {
      this.showScreen("gradeSelection");
    });
  }

  loadProgress() {
    const progress = StorageManager.getUserProgress();
    this.elements.totalScore.textContent = progress.totalScore;
    this.elements.maxStreakDisplay.textContent = progress.maxStreak;
    
    this.renderGradeStars();
  }

  renderGradeStars() {
    const progress = StorageManager.getUserProgress();
    
    this.elements.gradeStarsContainers.forEach(container => {
      const grade = parseInt(container.dataset.grade);
      const gradeProg = progress.gradeProgress[grade];
      const stars = gradeProg ? gradeProg.stars : 0;
      
      container.innerHTML = "";
      for (let i = 0; i < 3; i++) {
        const star = document.createElement("span");
        star.className = "star" + (i < stars ? " active" : "");
        star.textContent = "⭐";
        container.appendChild(star);
      }
    });
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => screen.classList.remove("active"));
    this.screens[screenName].classList.add("active");
    
    if (screenName === "gradeSelection") {
      this.renderGradeStars();
      const progress = StorageManager.getUserProgress();
      this.elements.totalScore.textContent = progress.totalScore;
      this.elements.maxStreakDisplay.textContent = progress.maxStreak;
    }
  }

  selectMode() {
    const config = GradeConfig.configs[this.currentGrade];
    this.elements.selectedGradeName.textContent = config.name;
    this.showScreen("modeSelection");
  }

  startGame() {
    const config = GradeConfig.configs[this.currentGrade];
    this.score = 0;
    this.currentQuestion = 0;
    this.correctCount = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.isPlaying = true;
    this.timeElapsed = 0;
    this.totalQuestions = config.questionCount[this.currentMode];

    this.elements.gameModeBadge.textContent = this.getModeName(this.currentMode);
    this.elements.currentScore.textContent = "0";
    this.elements.streakDisplay.style.display = "none";
    
    if (this.currentMode === "challenge" || this.currentMode === "marathon") {
      this.elements.timerContainer.style.display = "flex";
      this.elements.totalQuestions.parentElement.parentElement.style.display = "block";
      this.elements.totalQuestions.textContent = this.totalQuestions;
      this.startTimer();
    } else {
      this.elements.timerContainer.style.display = "none";
      this.elements.currentQuestion.parentElement.parentElement.style.display = "none";
    }

    this.showScreen("gameScreen");
    this.nextQuestion();
  }

  getModeName(mode) {
    const names = {
      practice: "练习模式",
      challenge: "挑战模式",
      marathon: "马拉松模式"
    };
    return names[mode] || "练习模式";
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    
    this.timer = setInterval(() => {
      this.timeElapsed++;
      this.elements.timer.textContent = this.formatTime(this.timeElapsed);
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  nextQuestion() {
    if (this.currentMode !== "practice" && this.currentQuestion >= this.totalQuestions) {
      this.endGame();
      return;
    }

    this.currentQuestion++;
    const config = GradeConfig.configs[this.currentGrade];
    this.currentQuestionData = QuestionGenerator.generate(config);

    this.elements.currentQuestion.textContent = this.currentQuestion;
    this.elements.questionText.textContent = this.currentQuestionData.question;
    this.elements.answerInput.value = "";
    this.elements.answerInput.focus();
    this.elements.feedback.className = "feedback";
    
    this.animateQuestion();
  }

  animateQuestion() {
    const container = document.querySelector(".question-container");
    container.style.animation = "none";
    setTimeout(() => {
      container.style.animation = "bounceIn 0.5s ease-out";
    }, 10);
  }

  checkAnswer() {
    if (!this.isPlaying) return;

    const userAnswer = parseInt(this.elements.answerInput.value);
    if (isNaN(userAnswer)) {
      this.showFeedback("请输入答案!", false);
      return;
    }

    const isCorrect = userAnswer === this.currentQuestionData.answer;
    
    if (isCorrect) {
      this.correctCount++;
      this.streak++;
      if (this.streak > this.maxStreak) {
        this.maxStreak = this.streak;
      }
      
      const points = 10 + (this.streak * 2);
      this.score += points;
      
      this.showFeedback(this.getCorrectMessage(), true);
      this.updateStreakDisplay();
    } else {
      this.streak = 0;
      this.showFeedback(this.getIncorrectMessage(), false);
      this.elements.streakDisplay.style.display = "none";
    }

    this.elements.currentScore.textContent = this.score;

    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }

  showFeedback(message, isCorrect) {
    this.elements.feedback.textContent = message;
    this.elements.feedback.className = "feedback show " + (isCorrect ? "correct" : "incorrect");
  }

  getCorrectMessage() {
    const messages = [
      "太棒了! 🎉",
      "真聪明! 🌟",
      "答对了! ✨",
      "好厉害! 💪",
      "继续加油! 🚀",
      "完美! 👏"
    ];
    
    if (this.streak >= 5) {
      return `🔥 连击 x${this.streak}! 太厉害了!`;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  getIncorrectMessage() {
    const correctAnswer = this.currentQuestionData.answer;
    return `正确答案是 ${correctAnswer}，下次加油! 💪`;
  }

  updateStreakDisplay() {
    if (this.streak >= 3) {
      this.elements.streakDisplay.style.display = "inline-block";
      this.elements.streakCount.textContent = this.streak;
    } else {
      this.elements.streakDisplay.style.display = "none";
    }
  }

  endGame() {
    this.stopTimer();
    this.isPlaying = false;

    const accuracy = this.totalQuestions > 0 ? (this.correctCount / this.totalQuestions * 100).toFixed(1) : 0;
    const stars = this.calculateStars(accuracy);

    StorageManager.updateGradeProgress(this.currentGrade, this.correctCount, this.totalQuestions);
    StorageManager.addScore(this.score);
    StorageManager.updateMaxStreak(this.maxStreak);

    this.displayResults(accuracy, stars);
    this.showScreen("resultScreen");
  }

  calculateStars(accuracy) {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    if (accuracy >= 50) return 1;
    return 0;
  }

  displayResults(accuracy, stars) {
    this.elements.resultStars.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const star = document.createElement("span");
      star.className = "star";
      star.textContent = i < stars ? "⭐" : "☆";
      this.elements.resultStars.appendChild(star);
    }

    this.elements.resultScore.textContent = this.score;
    this.elements.resultAccuracy.textContent = accuracy + "%";
    this.elements.resultCorrect.textContent = `${this.correctCount}/${this.totalQuestions}`;
    this.elements.resultMaxStreak.textContent = this.maxStreak;

    if (this.currentMode === "challenge" || this.currentMode === "marathon") {
      this.elements.resultTimeRow.style.display = "flex";
      this.elements.resultTime.textContent = this.formatTime(this.timeElapsed);
    } else {
      this.elements.resultTimeRow.style.display = "none";
    }
  }

  exitGame() {
    this.stopTimer();
    this.isPlaying = false;
    this.showScreen("gradeSelection");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.game = new GameEngine();
});
