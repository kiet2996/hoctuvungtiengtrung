// Khởi tạo danh sách từ vựng
let vocabList = []; 
let currentQuizIndex = 0;
let score = 0;
let totalQuestions = 0;
let answeredQuestions = 0;
let selectedHSK = 'all';
let countdownInterval = null;

// Hiển thị trang tương ứng khi người dùng nhấn vào menu
function showPage(pageId) {
    const pages = document.querySelectorAll('.container');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// Khởi tạo và bắt đầu quiz
function startQuiz() {
    totalQuestions = 0;
    score = 0;
    answeredQuestions = 0;
    currentQuizIndex = 0;
    const filteredVocab = vocabList.filter(word => word['HSK'] === selectedHSK || selectedHSK === 'all');
    totalQuestions = filteredVocab.length;
    if (totalQuestions === 0) {
        alert('Không có câu hỏi cho HSK đã chọn.');
        return;
    }
    displayQuestion(filteredVocab[currentQuizIndex]);
    document.getElementById('start-quiz-btn').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
}

// Hiển thị câu hỏi và 4 lựa chọn
function displayQuestion(word) {
    const questionContainer = document.getElementById('quiz-question');
    questionContainer.innerHTML = `<div><strong>Câu hỏi:</strong> Nghĩa tiếng Việt từ ${word['Tiếng Trung']}</div>`;
    
    const options = generateOptions(word['Tiếng Việt']);
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.textContent = option;
        optionButton.onclick = () => {
            startCountdown();  // Bắt đầu đếm ngược khi người dùng chọn
            checkAnswer(option, word['Tiếng Việt'], optionsContainer);
        };
        optionsContainer.appendChild(optionButton);
    });

    const questionStatus = document.getElementById('question-status');
    questionStatus.textContent = `Câu đã làm: ${answeredQuestions} / Tổng số câu: ${totalQuestions}`;
}

// Sinh các lựa chọn trả lời
function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    const allWords = vocabList.map(word => word['Tiếng Việt']);
    while (options.length < 4) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        if (!options.includes(randomWord)) {
            options.push(randomWord);
        }
    }
    return shuffle(options);
}

// Trộn các lựa chọn
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Kiểm tra câu trả lời
function checkAnswer(selectedOption, correctAnswer, optionsContainer) {
    const isCorrect = selectedOption === correctAnswer;
    const optionButtons = optionsContainer.querySelectorAll('button');
    optionButtons.forEach(button => {
        button.disabled = true; // Disable all buttons after selection
        if (button.textContent === correctAnswer) {
            button.style.backgroundColor = 'green'; // Dấu tích xanh cho đáp án đúng
        } else if (button.textContent === selectedOption) {
            button.style.backgroundColor = 'red'; // Dấu "X" đỏ cho đáp án sai
        }
    });

    if (isCorrect) score++;
    answeredQuestions++;

    setTimeout(() => {
        currentQuizIndex++;
        if (currentQuizIndex < totalQuestions) {
            displayQuestion(vocabList[currentQuizIndex]);
        } else {
            endQuiz();
        }
    }, 5000);
}

// Kết thúc quiz và hiển thị điểm số
function endQuiz() {
    alert(`Quiz hoàn thành! Điểm số của bạn là: ${score}/${totalQuestions}`);
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('start-quiz-btn').style.display = 'block';
}

// Bắt đầu đồng hồ đếm ngược
function startCountdown() {
    let timeLeft = 5; // Thời gian 5 giây
    const timerElement = document.getElementById('timer');
    clearInterval(countdownInterval);
    timerElement.style.opacity = 0;

    setTimeout(() => { timerElement.style.opacity = 1; }, 0); 
    
    countdownInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            timerElement.style.opacity = 0;
        } else {
            timerElement.textContent = `Thời gian: ${timeLeft}s`;
            timeLeft--;
        }
    }, 1000);
}

// Hiển thị danh sách từ vựng
function renderVocabList() {
    const searchTerm = document.getElementById('search-vocab').value.toLowerCase();
    selectedHSK = document.getElementById('hsk-sort').value;

    const filteredVocab = vocabList.filter((word) => {
        const matchesSearch = word['Tiếng Trung'].toLowerCase().includes(searchTerm) ||
            word['Pinyin'].toLowerCase().includes(searchTerm) ||
            word['Tiếng Việt'].toLowerCase().includes(searchTerm);
        const matchesHSK = selectedHSK === 'all' ? true : word['HSK'] === selectedHSK;
        return matchesSearch && matchesHSK;
    });

    const tableBody = document.querySelector('#vocab-table tbody');
    tableBody.innerHTML = '';

    filteredVocab.forEach((word) => {
        const row = `
            <tr data-id="${word['id']}">
                <td>${word['Tiếng Trung'] || ''}</td>
                <td>${word['Pinyin'] || ''}</td>
                <td>${word['Tiếng Việt'] || ''}</td>
                <td>${word['HSK'] || ''}</td>
                <td><button onclick="toggleLearnedStatus(${word['id']})">${word['Learned'] ? 'Đã học' : 'Chưa học'}</button></td>
                <td>${word['Ví dụ'] || ''}</td>
            </tr>`;
        tableBody.innerHTML += row;
    });
}

// Toggle trạng thái học
function toggleLearnedStatus(wordId) {
    const word = vocabList.find(w => w['id'] === wordId);
    if (!word) return;

    word['Learned'] = !word['Learned'];
    localStorage.setItem('vocabList', JSON.stringify(vocabList)); // Lưu lại danh sách vào localStorage

    renderVocabList();
}

// Xử lý tải file Excel
function handleFileUpload() {
    const fileInput = document.getElementById('file-input-upload');
    const file = fileInput.files[0];
    if (!file) {
        alert('Vui lòng chọn một file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            vocabList = XLSX.utils.sheet_to_json(sheet);
            localStorage.setItem('vocabList', JSON.stringify(vocabList));
            alert('Tải lên thành công!');
            renderVocabList();
            renderFlashcards();
        } catch (error) {
            alert('Đã xảy ra lỗi khi tải lên file.');
        }
    };
    reader.readAsArrayBuffer(file);
}

// Hiển thị flashcards và cập nhật trạng thái học
function renderFlashcards() {
    const flashcardsContainer = document.getElementById('flashcards-container');
    flashcardsContainer.innerHTML = ''; // Clear any existing flashcards

    const filteredVocab = vocabList.filter(word => word['HSK'] === selectedHSK || selectedHSK === 'all');

    if (filteredVocab.length === 0) {
        flashcardsContainer.innerHTML = '<p>Không có từ vựng nào để hiển thị.</p>';
        return;
    }

    filteredVocab.forEach((word) => {
        const flashcard = document.createElement('div');
        flashcard.classList.add('flashcard');
        flashcard.dataset.id = word['id'];

        const flashcardInner = document.createElement('div');
        flashcardInner.classList.add('flashcard-inner');

        const front = document.createElement('div');
        front.classList.add('flashcard-front');
        front.innerHTML = `<div><strong>${word['Tiếng Trung']}</strong><br><em>${word['Pinyin']}</em></div>`;

        const back = document.createElement('div');
        back.classList.add('flashcard-back');
        back.innerHTML = `
            <div><strong>Tiếng Việt:</strong> ${word['Tiếng Việt']}</div>
            <div><strong>Ví dụ:</strong> ${word['Ví dụ'] || 'Chưa có ví dụ'}</div>
            <div><strong>HSK:</strong> ${word['HSK']}</div>
        `;

        flashcardInner.appendChild(front);
        flashcardInner.appendChild(back);
        flashcard.appendChild(flashcardInner);

        flashcard.onclick = () => flashcard.classList.toggle('flipped');
        
        flashcardsContainer.appendChild(flashcard);
    });
}

// Load danh sách từ vựng từ localStorage
function loadVocabList() {
    const storedVocabList = localStorage.getItem('vocabList');
    if (storedVocabList) {
        vocabList = JSON.parse(storedVocabList);
        renderVocabList();
        renderFlashcards();
    }
}

// Gọi hàm khi trang được tải
window.onload = loadVocabList;
