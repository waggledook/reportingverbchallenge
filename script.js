class ReportingVerbGame {
    constructor(sentences) {
        this.originalSentences = sentences;
        this.sentences = this.shuffle([...sentences]);
        this.currentIndex = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.timer = 120; // 2 minutes
        this.interval = null;
        this.gameActive = false;
        this.reviewMode = false;
        this.initUI();
    }

    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    initUI() {
        console.log("Game script is running!");

        // Set the page title
        document.title = "Reporting Verb Challenge";


        document.body.innerHTML = `
        <style>
            body {
                font-family: 'Poppins', sans-serif;
                background: linear-gradient(135deg, #2E3192, #1BFFFF);
                color: white;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            #game-container {
                background: rgba(0, 0, 0, 0.8);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
                text-align: center;
            }
            p {
                font-size: 18px;
            }
            input {
                padding: 10px;
                font-size: 16px;
                border-radius: 5px;
                border: none;
                outline: none;
                text-align: center;
            }
            input.correct {
                border: 2px solid #00FF00;
                background-color: rgba(0, 255, 0, 0.2);
            }
            input.incorrect {
                border: 2px solid #FF0000;
                background-color: rgba(255, 0, 0, 0.2);
            }
            button {
                padding: 10px 20px;
                font-size: 18px;
                margin-top: 10px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: 0.3s;
            }
            button:hover {
                opacity: 0.8;
            }
            #start {
                background: #28a745;
                color: white;
            }
            #restart {
                background: #007bff;
                color: white;
                display: none;
            }
            #review {
                background: #ffc107;
                color: black;
                display: none;
            }
            #timer-bar {
                width: 100%;
                height: 10px;
                background: red;
                transition: width 1s linear;
            }
            /* Add this section for the "Download Report" button */
            #downloadReport {
                display: none; /* Start off hidden */
                padding: 10px 20px;
                font-size: 18px;
                margin-top: 20px;
                background: #ff6f61;
                color: white;
                border-radius: 5px;
            }
        </style>
        <div id="game-container">
            <h1>Reporting Verb Challenge</h1> <!-- Change this from Inversion Sentence Challenge -->
            <div id="timer-bar"></div>
            <p id="timer">Time left: 120s</p>
            <p id="sentence"></p>
            <input type="text" id="answer" autofocus>
            <p id="feedback"></p>
            <p>Score: <span id="score">0</span></p>
            <button id="start">Start Game</button>
            <button id="restart">Restart</button>
            <button id="review">Review Mistakes</button>
            <!-- This is the Download Report button -->
            <button id="downloadReport">Download Report</button>
        </div>
    `;

        document.getElementById("start").addEventListener("click", () => this.startGame());
        document.getElementById("restart").addEventListener("click", () => this.restartGame());
        document.getElementById("review").addEventListener("click", () => this.startReview());
        this.setupInputListener();
    }


    setupInputListener() {
        document.getElementById("answer").addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                this.checkAnswer();
            }
        });
    }

    startGame() {
        this.gameActive = true;
        this.reviewMode = false;
        this.currentIndex = 0;
        this.score = 0;
        this.wrongAnswers = [];
        this.sentences = this.shuffle([...this.originalSentences]);
        this.timer = 120; // Reset timer to 2 minutes
        clearInterval(this.interval);
        document.getElementById("start").style.display = "none";
        document.getElementById("restart").style.display = "block";
        document.getElementById("review").style.display = "none";
        document.getElementById("score").textContent = this.score;
        document.getElementById("feedback").textContent = "";
        document.getElementById("timer-bar").style.width = "100%";
        document.getElementById("answer").value = "";
        document.getElementById("answer").focus();
        this.updateSentence();
        this.startTimer();
    }

    updateSentence() {
        if (this.currentIndex < this.sentences.length) {
            // Show original sentence without inversion, followed by the incomplete version
            const originalSentence = this.sentences[this.currentIndex].sentence;
            const incompleteSentence = this.sentences[this.currentIndex].incompleteSentence;
            document.getElementById("sentence").textContent = `${originalSentence}\n\n${incompleteSentence}`;
            document.getElementById("answer").value = "";
        } else {
            this.endGame();
        }
    }

    checkAnswer() {
    if (!this.gameActive && !this.reviewMode) return;

    const input = document.getElementById("answer");
    const userInput = input.value.trim().toLowerCase();
    const currentSet = this.reviewMode ? this.wrongAnswers : this.sentences;

    const currentSentence = currentSet[this.currentIndex];
    
    // Ensure correctAnswers is an array
    if (!currentSentence || !Array.isArray(currentSentence.correctAnswers) || currentSentence.correctAnswers.length === 0) {
        console.error("Missing correct answers for sentence:", currentSentence);
        return; // Exit if correctAnswers is missing or empty
    }

    const correctAnswers = currentSentence.correctAnswers;
    
    // Normalize the answers for comparison
    const normalizedCorrectAnswers = correctAnswers.map(answer => answer.toLowerCase());

    // Check if the user input matches any of the correct answers
    if (normalizedCorrectAnswers.includes(userInput)) {
        if (!this.reviewMode) {
            this.score += 10;
            document.getElementById("score").textContent = this.score;
        }
        input.classList.add("correct");
    } else {
        if (!this.reviewMode) {
            this.score -= 1;
            document.getElementById("score").textContent = this.score;
        }
        input.classList.add("incorrect");
        document.getElementById("feedback").textContent = `Incorrect: Correct answer(s) are '${correctAnswers.join(", ")}'`;

        // Store incorrect answers for review mode
        if (!this.reviewMode) {
            this.wrongAnswers.push({
                sentence: currentSentence.sentence,
                incompleteSentence: currentSentence.incompleteSentence,
                correctAnswers: correctAnswers, // Ensure this is stored as an array
                userAnswer: userInput || "(no answer)"
            });
        }
    }

    if (this.reviewMode) {
        setTimeout(() => {
            input.classList.remove("correct", "incorrect");
            this.currentIndex++;
            this.showReviewSentence();
        }, 1000);
    } else {
        this.currentIndex++;
        setTimeout(() => {
            input.classList.remove("correct", "incorrect");
            this.updateSentence();
        }, 1000);
    }
}


    startTimer() {
        this.interval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
                document.getElementById("timer").textContent = `Time left: ${this.timer}s`;
                document.getElementById("timer-bar").style.width = (this.timer / 120) * 100 + "%";
            } else {
                clearInterval(this.interval);
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
    this.gameActive = false;
    clearInterval(this.interval);
    document.getElementById("review").style.display = this.wrongAnswers.length > 0 ? "block" : "none";

    // Show the download report button if mistakes were made
    if (this.wrongAnswers.length > 0) {
        const reportButton = document.getElementById("downloadReport");
        if (reportButton) {
            reportButton.style.display = "block"; // Show the download report button
            reportButton.addEventListener("click", () => this.generateReport()); // Attach click event
        }
    }
}

    startReview() {
        if (this.wrongAnswers.length === 0) return;
        this.reviewMode = true;
        this.currentIndex = 0;
        this.showReviewSentence();
    }

    showReviewSentence() {
    if (this.currentIndex < this.wrongAnswers.length) {
        const currentMistake = this.wrongAnswers[this.currentIndex];

        // Display the original sentence and the gapped sentence
        const originalSentence = currentMistake.sentence;
        const incompleteSentence = currentMistake.incompleteSentence;

        // Combine both sentences for display
        const displayText = `${originalSentence}\n\n${incompleteSentence}`;

        // Show the combined text
        document.getElementById("sentence").textContent = displayText;

        // Reset the input field (ready for the next round if needed)
        document.getElementById("answer").value = "";
        document.getElementById("feedback").textContent = ""; // Clear feedback
    } else {
        // When review is complete, show message and reset review mode
        document.getElementById("sentence").textContent = "Review complete!";
        document.getElementById("answer").style.display = "none";
        document.getElementById("feedback").textContent = "";
        this.reviewMode = false; // Reset review mode
        this.currentIndex = 0; // Reset index
    }
}
    generateReport() {
    if (this.wrongAnswers.length === 0) {
        alert("No mistakes were made. Great job!");
        return;
    }

    let reportText = "Reporting Verb Challenge - Mistakes Report\n\n";

    this.wrongAnswers.forEach(mistake => {
        const userAnswer = mistake.userAnswer || "(no answer)";
        const correctAnswer = mistake.correctAnswers.join(", ");  // Join multiple answers with commas if needed

        // Replace the blank in the original sentence with the user's answer
        const userSentence = mistake.incompleteSentence.replace("______", userAnswer);

        // Replace the blank in the original sentence with the correct answer
        const correctSentence = mistake.incompleteSentence.replace("______", correctAnswer);

        // Add the original sentence, user's answer, and correct answer to the report
        reportText += `Original sentence: "${mistake.sentence}"\n`;  // Display the original sentence
        reportText += `You wrote: "${userSentence}"\n`;  // Show user's incorrect answer in the sentence
        reportText += `The correct answer is: "${correctSentence}"\n\n`;  // Show correct answer in the sentence
    });

    // Create a Blob and generate a download link for the report
    const blob = new Blob([reportText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporting_verb_game_report.txt";  // Report file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up
}

    restartGame() {
        this.gameActive = false;
        this.reviewMode = false;
        clearInterval(this.interval);

        // Reset game variables
        this.currentIndex = 0;
        this.score = 0;
        this.timer = 120;
        this.wrongAnswers = [];
        this.sentences = this.shuffle([...this.originalSentences]);

        // Reset UI
        document.getElementById("score").textContent = this.score;
        document.getElementById("feedback").textContent = "";
        document.getElementById("sentence").textContent = "";
        document.getElementById("answer").value = "";
        document.getElementById("timer").textContent = "Time left: 120s";
        document.getElementById("timer-bar").style.width = "100%";

        // Show start button
        document.getElementById("review").style.display = "none";
        document.getElementById("restart").style.display = "none";
        document.getElementById("start").style.display = "block";
    }
}

// Sentences with negative adverbial prompts for inversion
const sentences = [
    { 
        sentence: "Sorry I’m late", 
        incompleteSentence: "He ________ late.", 
        correctAnswers: ["apologised for being","apologized for being"]
    },
    { 
        sentence: "I didn’t break the vase", 
        incompleteSentence: "He ________ the vase.", 
        correctAnswers: ["denied breaking","denied having broken"]
    },
    { 
        sentence: "I’ll love you forever.", 
        incompleteSentence: "She ________ him for ever.", 
        correctAnswers: ["promised to love"]
    },
    { 
        sentence: "He told her 'Don’t walk on your own at night.'", 
        incompleteSentence: "He ________ on her own at night.", 
        correctAnswers: ["warned her not to walk"]
    },
    { 
        sentence: "She asked him, 'Would you like to come to a concert?'", 
        incompleteSentence: "She ________ concert.", 
        correctAnswers: ["invited him to a","invited him to go to a"]
    },
    { 
        sentence: "I was sorry I hadn’t bought the jacket", 
        incompleteSentence: "She ________ the jacket.", 
        correctAnswers: ["regretted not buying","regretted not having bought"]
    },
    { 
        sentence: "He told her,'You ate all the biscuits!'", 
        incompleteSentence: "He ________ all the biscuits.", 
        correctAnswers: ["accused her of eating","accused her of having eaten"]
    },
    { 
        sentence: "He told him 'We’ll kill you if you don’t give us the money.'", 
        incompleteSentence: "He ________ if he didn’t give them all the money.", 
        correctAnswers: ["threatened to kill him"]
    },
    { 
        sentence: "I won’t eat the cabbage!", 
        incompleteSentence: "He ________ the cabbage.", 
        correctAnswers: ["refused to eat"]
    },
    { 
        sentence: "The teacher told them, 'Remember to bring your dictionary to class'", 
        incompleteSentence: "She ________ their dictionaries to class.", 
        correctAnswers: ["reminded them to bring"]
    },
    { 
        sentence: "I broke the window.", 
        incompleteSentence: "He ________ the window.", 
        correctAnswers: ["admitted breaking","admitted having broken"]
    },
    { 
        sentence: "I’ll help you with your suitcase.", 
        incompleteSentence: "She ________ him with his suitcase.", 
        correctAnswers: ["offered to help"]
    },
    { 
        sentence: "He told her 'I think you should go to the doctor'", 
        incompleteSentence: "He ________ to the doctor.", 
        correctAnswers: ["advised her to go"]
    },
    { 
        sentence: "Let’s go to a Chinese restaurant tonight", 
        incompleteSentence: "She ________ a Chinese restaurant.", 
        correctAnswers: ["suggested going to"]
    },
    { 
        sentence: "I’m going to pay for the drinks – it’s my turn.", 
        incompleteSentence: "He ________ the drinks.", 
        correctAnswers: ["insisted on paying for"]
    },
    { 
        sentence: "You must see the Tower of London!", 
        incompleteSentence: "She ________ the Tower of London.", 
        correctAnswers: ["recommended seeing"]
    },
    { 
        sentence: "It's true. I'm the one who wrote the letter", 
        incompleteSentence: "He ________ the letter.", 
        correctAnswers: ["admitted writing","admitted having written"]
    },
    { 
        sentence: "I'm sorry I broke your phone, it was an accident", 
        incompleteSentence: "He ________ my phone.", 
        correctAnswers: ["apologised for breaking","apologized for breaking"]
    },
    { 
        sentence: "She told me, 'Don't touch it! It's dangerous'", 
        incompleteSentence: "She ________ it.", 
        correctAnswers: ["warned me not to touch"]
    },
    { 
        sentence: "She told me 'If I were you, I'd tell him the truth.'", 
        incompleteSentence: "She ________ the truth.", 
        correctAnswers: ["advised me to tell him"]
    },
    { 
        sentence: "He told me 'Give me the bag or I'll shoot you'", 
        incompleteSentence: "He ________ me.", 
        correctAnswers: ["threatened to shoot"]
    },
    { 
        sentence: "Ok, no problem, I'll do it", 
        incompleteSentence: "He ________ it.", 
        correctAnswers: ["agreed to do"]
    },
    { 
        sentence: "I'm sorry no, I won't help you.", 
        incompleteSentence: "She ________ him.", 
        correctAnswers: ["refused to help"]
    },
    { 
        sentence: "Why don't we get a drink after class?", 
        incompleteSentence: "She ________ after class.", 
        correctAnswers: ["suggested getting a drink"]
    },
    { 
        sentence: "He told her, 'You cheated in the exam! I saw you!'", 
        incompleteSentence: "He ________ in the exam.", 
        correctAnswers: ["accused her of cheating","accused her of having cheated"]
    },
    { 
        sentence: "I'm so sorry I forgot your birthday!", 
        incompleteSentence: "He ________ her birthday.", 
        correctAnswers: ["apologised for forgetting","apologized for forgetting"]
    },
    { 
        sentence: "He told him, 'Remember to call me as soon as you get your results'", 
        incompleteSentence: "He ________ him as soon as he got his results.", 
        correctAnswers: ["reminded him to call"]
    },
    { 
        sentence: "It was a mistake, I shouldn't have shouted at Kim.", 
        incompleteSentence: "He ________ at Kim.", 
        correctAnswers: ["regretted shouting","regretted having shouted"]
    },
    { 
        sentence: "It wasn't me! I didn't break the remote", 
        incompleteSentence: "He ________ the remote control.", 
        correctAnswers: ["denied breaking","denied having broken"]
    },
    { 
        sentence: "He told her, 'I would try reading more books in English'", 
        incompleteSentence: "He ________ more books in English", 
        correctAnswers: ["advised her to read"]
    },
    { 
        sentence: "Sure! I'll come on holiday with you", 
        incompleteSentence: "He ________ on holiday with me.", 
        correctAnswers: ["agreed to come"]
    },
    { 
        sentence: "He told her, 'I'll help you with your bags if they're heavy'", 
        incompleteSentence: "He ________ with her bags.", 
        correctAnswers: ["offered to help her"]
    },
    { 
        sentence: "He told me, 'Well done on passing your exams!'", 
        incompleteSentence: "He ________ my exams.", 
        correctAnswers: ["congratulated me on passing","congratulated me on having passed"]
    }
];


const game = new ReportingVerbGame(sentences);
