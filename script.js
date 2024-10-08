let currentInterval;
let currentAudio;

const panicMethods = [
    
    {
        title: "단계별 공황발작 대처법",
        steps: [
            { text: "멈춰서기 (STOP 기술 사용)", duration: 20 },
            { text: "호흡 조절하기", duration: 30 },
            { text: "근육 이완하기", duration: 30 },
            { text: "현재에 집중하기", duration: 30 },
            { text: "자기격려하기", duration: 20 },
            { text: "비합리적 생각 바꾸기", duration: 30 },
            { text: "점진적 노출", duration: 20 },
            { text: "도움 요청하기", duration: 20 }
        ]
    }
];

const meditationPrograms = [
    { title: "호흡 명상", duration: 300 },
    { title: "바디스캔 명상", duration: 600 },
    { title: "걷기 명상", duration: 900 },
    { title: "자애 명상", duration: 600 }
];

const symptomCategories = ['불안', '우울', '공황', '기타'];
let communityPosts = [];

function showSection(section) {
    if (!isUserLoggedIn() && section !== 'main') {
        alert('로그인이 필요한 서비스입니다.');
        showPopup('login');
        return;
    }

    stopCurrentActivity();
    const content = document.getElementById('content');
    switch(section) {
        case 'main':
            showMainPage();
            break;
        case 'panic':
            showPanicPage();
            break;
        case 'meditation':
            showMeditationPage();
            break;
        case 'walk':
            showWalkPage();
            break;
        case 'diary':
            showDiaryPage();
            break;
        case 'community':
            showCommunityPage();
            break;
    }
}

function showMainPage() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h2>오늘의 기분은 어떠신가요?</h2>
    <div id="mood-buttons">
      <button class="mood-button mood-1" onclick="selectMood(1)">😢</button>
      <button class="mood-button mood-2" onclick="selectMood(2)">😐</button>
      <button class="mood-button mood-3" onclick="selectMood(3)">🙂</button>
      <button class="mood-button mood-4" onclick="selectMood(4)">😄</button>
      <button class="mood-button mood-5" onclick="selectMood(5)">😍</button>
    </div>
    <div id="character-container">
      <img id="comforting-character" src="image.png" alt="Comforting Character">
      <div id="speech-bubble" class="hidden">
        <p id="comfort-message"></p>
      </div>
    </div>
    <h2>이번 달 기분 달력</h2>
    <div id="calendar"></div>
  `;
  updateCalendar();
  showComfortMessage();  // 추가
}

function showPanicPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>공황 대처 방법</h2>
        <button onclick="startPanicMethod(0)">5-4-3-2-1 그라운딩 기법</button>
        <button onclick="startPanicMethod(1)">단계별 공황발작 대처법</button>
        <div id="panic-content" class="hidden">
            <div id="panic-text"></div>
            <div id="panic-timer"></div>
            <div id="panic-progress">
                <div id="panic-progress-bar"></div>
            </div>
        </div>
        <button onclick="showSection('main')">메인으로 돌아가기</button>
    `;
}

function showMeditationPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>명상</h2>
        <p>원하는 명상 프로그램을 선택하세요:</p>
        ${meditationPrograms.map((program, index) => 
            `<button onclick="startMeditation(${index})">${program.title} (${program.duration / 60}분)</button>`
        ).join('')}
        <div id="meditation-content" class="hidden">
            <div id="meditation-text"></div>
            <div id="meditation-timer"></div>
            <div id="meditation-progress">
                <div id="meditation-progress-bar"></div>
            </div>
        </div>
        <button onclick="showSection('main')">메인으로 돌아가기</button>
    `;
}

function showWalkPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>산책</h2>
        <p>30분 산책을 통해 이완하세요. 근처 산책 루트를 추천해드립니다.</p>
        <button onclick="startWalk()">산책 시작</button>
        <button onclick="recommendWalkRoute()">산책 루트 추천</button>
        <div id="walk-content" class="hidden">
            <div id="walk-text"></div>
            <div id="walk-timer"></div>
            <div id="walk-progress">
                <div id="walk-progress-bar"></div>
            </div>
        </div>
        <div id="walk-challenge"></div>
        <button onclick="showSection('main')">메인으로 돌아가기</button>
    `;
    updateWalkChallenge();
}

function showDiaryPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>감정 일기</h2>
        <select id="emotion-select">
            <option value="">오늘의 감정을 선택하세요</option>
            <option value="happy">행복</option>
            <option value="sad">슬픔</option>
            <option value="angry">분노</option>
            <option value="anxious">불안</option>
        </select>
        <textarea id="gratitude-input" placeholder="오늘 감사한 일"></textarea>
        <textarea id="regret-input" placeholder="후회되었던 일"></textarea>
        <textarea id="panic-input" placeholder="공황 일지"></textarea>
        <input type="file" id="photo-upload" accept="image/*">
        <button onclick="saveDiary()">저장</button>
        <button onclick="showSection('main')">메인으로 돌아가기</button>
    `;
}

function showCommunityPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>커뮤니티</h2>
        <button onclick="showNewPostForm()">새 글 작성</button>
        <div id="category-filter">
            ${symptomCategories.map(category => 
                `<button onclick="filterPosts('${category}')">${category}</button>`
            ).join('')}
            <button onclick="filterPosts('all')">전체보기</button>
        </div>
        <div id="posts-container"></div>
    `;
    displayPosts();
}

function stopCurrentActivity() {
    if (currentInterval) {
        clearInterval(currentInterval);
        currentInterval = null;
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    ['panic-content', 'meditation-content', 'walk-content'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.classList.add('hidden');
    });
}

async function selectMood(mood) {
    const today = new Date().toISOString().split('T')[0];
    const moods = await localforage.getItem('moods') || {};
    moods[today] = mood;
    await localforage.setItem('moods', moods);
    updateCalendar();
}

async function updateCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (let i = 0; i < firstDay.getDay(); i++) {
        calendar.appendChild(document.createElement('div'));
    }

    const moods = await localforage.getItem('moods') || {};
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;

        const date = new Date(today.getFullYear(), today.getMonth(), i).toISOString().split('T')[0];
        if (moods[date]) {
            day.classList.add(`mood-${moods[date]}`);
        }

        calendar.appendChild(day);
    }
}

function startPanicMethod(methodIndex) {
    stopCurrentActivity();
    const method = panicMethods[methodIndex];
    let currentStep = 0;
    let timeLeft = method.steps[currentStep].duration;

    const panicContent = document.getElementById('panic-content');
    const panicText = document.getElementById('panic-text');
    const panicTimer = document.getElementById('panic-timer');
    const panicProgressBar = document.getElementById('panic-progress-bar');

    panicContent.classList.remove('hidden');

    currentAudio = new Audio('https://example.com/calming-classical-music.mp3');
    currentAudio.loop = true;
    currentAudio.play();

    function updatePanicUI() {
        if (currentStep >= method.steps.length) {
            stopCurrentActivity();
            panicText.textContent = "완료되었습니다. 기분이 나아지셨기를 바랍니다.";
            panicTimer.textContent = "";
            panicProgressBar.style.width = "100%";
            return;
        }

        const step = method.steps[currentStep];
        panicText.textContent = step.text;
        panicTimer.textContent = `${timeLeft}초`;
        const progress = (step.duration - timeLeft) / step.duration * 100;
        panicProgressBar.style.width = `${progress}%`;

        timeLeft--;

        if (timeLeft < 0) {
            currentStep++;
            if (currentStep < method.steps.length) {
                timeLeft = method.steps[currentStep].duration;
            }
        }
    }

    updatePanicUI();
    currentInterval = setInterval(updatePanicUI, 1000);
}

function startMeditation(programIndex) {
    stopCurrentActivity();
    const program = meditationPrograms[programIndex];
    let timeLeft = program.duration;

    const meditationContent = document.getElementById('meditation-content');
    const meditationText = document.getElementById('meditation-text');
    const meditationTimer = document.getElementById('meditation-timer');
    const meditationProgressBar = document.getElementById('meditation-progress-bar');

    meditationContent.classList.remove('hidden');

    function updateMeditationUI() {
        if (timeLeft <= 0) {
            stopCurrentActivity();
            meditationText.textContent = "명상이 끝났습니다. 평온한 마음을 유지하세요.";
            meditationTimer.textContent = "";
            meditationProgressBar.style.width = "100%";
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        meditationText.textContent = `${program.title} 명상 중...`;
        meditationTimer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        const progress = (program.duration - timeLeft) / program.duration * 100;
        meditationProgressBar.style.width = `${progress}%`;

        timeLeft--;
    }

    updateMeditationUI();
    currentInterval = setInterval(updateMeditationUI, 1000);
}

function startWalk() {
    stopCurrentActivity();
    let timeLeft = 1800; // 30 minutes

    const walkContent = document.getElementById('walk-content');
    const walkText = document.getElementById('walk-text');
    const walkTimer = document.getElementById('walk-timer');
    const walkProgressBar = document.getElementById('walk-progress-bar');

    walkContent.classList.remove('hidden');

    function updateWalkUI() {
        if (timeLeft <= 0) {
            stopCurrentActivity();
            walkText.textContent = "산책이 끝났습니다. 오늘의 목표를 달성하셨네요!";
            walkTimer.textContent = "";
            walkProgressBar.style.width = "100%";
            updateWalkChallenge(true);
            return;
        }

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        walkText.textContent = "산책 중...";
        walkTimer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        const progress = (1800 - timeLeft) / 1800 * 100;
        walkProgressBar.style.width = `${progress}%`;

        timeLeft--;
    }

    updateWalkUI();
    currentInterval = setInterval(updateWalkUI, 1000);
}

async function saveDiary() {
    const emotion = document.getElementById('emotion-select').value;
    const gratitude = document.getElementById('gratitude-input').value;
    const regret = document.getElementById('regret-input').value;
    const panic = document.getElementById('panic-input').value;
    const photoFile = document.getElementById('photo-upload').files[0];

    const entry = {
        date: new Date().toISOString(),
        emotion,
        gratitude,
        regret,
        panic,
        photo: photoFile ? await readFileAsDataURL(photoFile) : null
    };

    const entries = await localforage.getItem('diaryEntries') || [];
    entries.push(entry);
    await localforage.setItem('diaryEntries', entries);

    alert('감정 일기가 저장되었습니다.');
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function updateWalkChallenge(completed = false) {
    const walkChallenge = document.getElementById('walk-challenge');
    const today = new Date().toISOString().split('T')[0];
    let challenges = await localforage.getItem('walkChallenges') || {};

    if (completed) {
        challenges[today] = true;
        await localforage.setItem('walkChallenges', challenges);
    }

    const completedDays = Object.values(challenges).filter(Boolean).length;
    walkChallenge.innerHTML = `
        <h3>산책 챌린지</h3>
        <p>목표: 7일 연속 30분 산책</p>
        <p>현재: ${completedDays}일 달성</p>
        <progress value="${completedDays}" max="7"></progress>
    `;
}

function recommendWalkRoute() {
    alert("근처 산책 루트를 추천해드립니다: 동네 공원 한 바퀴 (약 2km)");
}

function showPopup(type) {
    const popup = document.getElementById('popup');
    const popupForm = document.getElementById('popup-form');
    popup.style.display = 'block';

    if (type === 'login') {
        popupForm.innerHTML = `
            <h2>로그인</h2>
            <input type="email" id="login-email" placeholder="이메일" required>
            <input type="password" id="login-password" placeholder="비밀번호" required>
            <button onclick="login()">로그인</button>
            <button onclick="googleLogin()">구글로 로그인</button>
        `;
    } else if (type === 'signup') {
        popupForm.innerHTML = `
            <h2>회원가입</h2>
            <input type="email" id="signup-email" placeholder="이메일" required>
            <input type="password" id="signup-password" placeholder="비밀번호" required>
            <input type="password" id="signup-confirm-password" placeholder="비밀번호 확인" required>
            <button onclick="signup()">회원가입</button>
            <button onclick="googleLogin()">구글로 회원가입</button>
        `;
    }
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    window.firebaseSignInWithEmailAndPassword(window.firebaseAuth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('로그인 성공:', user);
            alert('로그인 성공!');
            closePopup();
            updateAuthButtons();
        })
        .catch((error) => {
            console.error('로그인 실패:', error);
            alert('로그인 실패: ' + error.message);
        });
}

function signup() {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    window.firebaseCreateUserWithEmailAndPassword(window.firebaseAuth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('회원가입 성공:', user);
            alert('회원가입 성공!');
            closePopup();
            updateAuthButtons();
        })
        .catch((error) => {
            console.error('회원가입 실패:', error);
            alert('회원가입 실패: ' + error.message);
        });
}

function logout() {
    window.firebaseSignOut(window.firebaseAuth).then(() => {
        console.log('로그아웃 성공');
        alert('로그아웃 되었습니다.');
        updateAuthButtons();
    }).catch((error) => {
        console.error('로그아웃 실패:', error);
        alert('로그아웃 실패: ' + error.message);
    });
}

function googleLogin() {
    const provider = new window.firebaseGoogleAuthProvider();
    window.firebaseSignInWithPopup(window.firebaseAuth, provider)
        .then((result) => {
            const user = result.user;
            console.log('구글 로그인 성공:', user);
            alert('구글 로그인 성공!');
            closePopup();
            updateAuthButtons();
        }).catch((error) => {
            console.error('구글 로그인 실패:', error);
            alert('구글 로그인 실패: ' + error.message);
        });
}

function updateAuthButtons() {
    const authButtons = document.getElementById('auth-buttons');
    window.firebaseOnAuthStateChanged(window.firebaseAuth, (user) => {
        if (user) {
            authButtons.innerHTML = `
                <span>${user.email}</span>
                <button onclick="logout()">로그아웃</button>
            `;
        } else {
            authButtons.innerHTML = `
                <button onclick="showPopup('login')">로그인</button>
                <button onclick="showPopup('signup')">회원가입</button>
            `;
        }
    });
}

function isUserLoggedIn() {
    return window.firebaseAuth.currentUser !== null;
}

function showNewPostForm() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>새 글 작성</h2>
        <select id="post-category">
            ${symptomCategories.map(category => 
                `<option value="${category}">${category}</option>`
            ).join('')}
        </select>
        <input type="text" id="post-title" placeholder="제목" required>
        <textarea id="post-content" placeholder="내용" required></textarea>
        <button onclick="submitPost()">게시</button>
        <button onclick="showCommunityPage()">취소</button>
    `;
}

function submitPost() {
    const category = document.getElementById('post-category').value;
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const author = window.firebaseAuth.currentUser.email;

    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }

    const newPost = {
        id: Date.now(),
        category,
        title,
        content,
        author,
        likes: 0,
        comments: []
    };

    communityPosts.push(newPost);
    savePosts();
    showCommunityPage();
}

function displayPosts(category = 'all') {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    const filteredPosts = category === 'all' 
        ? communityPosts 
        : communityPosts.filter(post => post.category === category);

    filteredPosts.forEach(post => {
        postsContainer.innerHTML += `
            <div class="post">
                <h3>${post.title}</h3>
                <p>카테고리: ${post.category}</p>
                <p>작성자: ${post.author}</p>
                <p>${post.content}</p>
                <button onclick="likePost(${post.id})">좋아요 (${post.likes})</button>
                <button onclick="showComments(${post.id})">댓글 (${post.comments.length})</button>
            </div>
        `;
    });
}

function likePost(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        savePosts();
        displayPosts();
    }
}

function showComments(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;

    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <h3>댓글</h3>
        <div id="comments-container"></div>
        <textarea id="new-comment" placeholder="댓글을 입력하세요"></textarea>
        <button onclick="addComment(${postId})">댓글 작성</button>
        <button onclick="showCommunityPage()">뒤로가기</button>
    `;

    const commentsContainer = document.getElementById('comments-container');
    post.comments.forEach(comment => {
        commentsContainer.innerHTML += `
            <div class="comment">
                <p>${comment.author}: ${comment.content}</p>
            </div>
        `;
    });
}

function addComment(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;

    const commentContent = document.getElementById('new-comment').value;
    if (!commentContent) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    post.comments.push({
        author: window.firebaseAuth.currentUser.email,
        content: commentContent
    });

    savePosts();
    showComments(postId);
}

function filterPosts(category) {
    displayPosts(category);
}

function savePosts() {
    localforage.setItem('communityPosts', communityPosts);
}

function loadPosts() {
    localforage.getItem('communityPosts').then(posts => {
        if (posts) {
            communityPosts = posts;
        }
    });
}

const comfortMessages = [
  "당신은 잘하고 있어요.",
  "힘든 시간도 지나갈 거예요.",
  "오늘 하루도 수고 많으셨어요.",
  "당신은 소중한 사람이에요.",
  "한 걸음씩 천천히 나아가세요.",
  "깊은 숨을 쉬어보세요.",
  "당신은 혼자가 아닙니다.",
  "지금 이 순간에 집중해보세요.",
  "작은 것에 감사해보세요.",
  "당신의 감정은 모두 valid해요."
];

function showComfortMessage() {
  const character = document.getElementById('comforting-character');
  const speechBubble = document.getElementById('speech-bubble');
  const comfortMessage = document.getElementById('comfort-message');

  character.addEventListener('click', () => {
    const randomMessage = comfortMessages[Math.floor(Math.random() * comfortMessages.length)];
    comfortMessage.textContent = randomMessage;
    speechBubble.classList.remove('hidden');

    // 3초 후 말풍선 숨기기
    setTimeout(() => {
      speechBubble.classList.add('hidden');
    }, 3000);
  });
}

function initApp() {
  showMainPage();
  updateAuthButtons();
  loadPosts();
  showComfortMessage();  // 추가
}

function recordPanicSymptoms() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>공황 증상 기록</h2>
        <form id="panic-symptom-form">
            <input type="date" id="symptom-date" required>
            <input type="time" id="symptom-time" required>
            <input type="number" id="symptom-duration" placeholder="지속 시간(분)" required>
            <select id="symptom-intensity" required>
                <option value="">증상 강도 선택</option>
                <option value="1">1 - 매우 약함</option>
                <option value="2">2 - 약함</option>
                <option value="3">3 - 보통</option>
                <option value="4">4 - 강함</option>
                <option value="5">5 - 매우 강함</option>
            </select>
            <textarea id="symptom-description" placeholder="증상 설명" required></textarea>
            <button type="submit">기록 저장</button>
        </form>
    `;

    document.getElementById('panic-symptom-form').addEventListener('submit', savePanicSymptom);
}

async function savePanicSymptom(event) {
    event.preventDefault();
    const symptom = {
        date: document.getElementById('symptom-date').value,
        time: document.getElementById('symptom-time').value,
        duration: document.getElementById('symptom-duration').value,
        intensity: document.getElementById('symptom-intensity').value,
        description: document.getElementById('symptom-description').value
    };

    let symptoms = await localforage.getItem('panicSymptoms') || [];
    symptoms.push(symptom);
    await localforage.setItem('panicSymptoms', symptoms);

    alert('공황 증상이 기록되었습니다.');
    showPanicPage();
}

// 호흡 조절 연습 기능
function startBreathingExercise() {
    stopCurrentActivity();
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>호흡 조절 연습</h2>
        <div id="breathing-instruction"></div>
        <div id="breathing-timer"></div>
        <button onclick="stopBreathingExercise()">종료</button>
    `;

    let phase = 'inhale';
    let count = 4;

    function updateBreathingUI() {
        const instruction = document.getElementById('breathing-instruction');
        const timer = document.getElementById('breathing-timer');

        instruction.textContent = phase === 'inhale' ? '들이쉬세요' : '내쉬세요';
        timer.textContent = count;

        count--;
        if (count < 0) {
            phase = phase === 'inhale' ? 'exhale' : 'inhale';
            count = phase === 'inhale' ? 4 : 6;
        }
    }

    updateBreathingUI();
    currentInterval = setInterval(updateBreathingUI, 1000);
}

function stopBreathingExercise() {
    stopCurrentActivity();
    showPanicPage();
}

// 점진적 근육 이완법 기능
function startProgressiveRelaxation() {
    stopCurrentActivity();
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>점진적 근육 이완법</h2>
        <div id="relaxation-instruction"></div>
        <div id="relaxation-timer"></div>
        <button onclick="stopProgressiveRelaxation()">종료</button>
    `;

    const muscleGroups = [
        '손과 팔', '얼굴', '목과 어깨', '가슴과 복부', '다리와 발'
    ];
    let currentGroup = 0;
    let phase = 'tense';
    let count = 5;

    function updateRelaxationUI() {
        const instruction = document.getElementById('relaxation-instruction');
        const timer = document.getElementById('relaxation-timer');

        if (currentGroup >= muscleGroups.length) {
            stopProgressiveRelaxation();
            return;
        }

        instruction.textContent = `${muscleGroups[currentGroup]}을(를) ${phase === 'tense' ? '긴장시키세요' : '이완하세요'}`;
        timer.textContent = count;

        count--;
        if (count < 0) {
            if (phase === 'tense') {
                phase = 'relax';
                count = 10;
            } else {
                currentGroup++;
                phase = 'tense';
                count = 5;
            }
        }
    }

    updateRelaxationUI();
    currentInterval = setInterval(updateRelaxationUI, 1000);
}

function stopProgressiveRelaxation() {
    stopCurrentActivity();
    showPanicPage();
}

// 그라운딩 기법 연습 기능
function startGroundingTechnique() {
    stopCurrentActivity();
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>5-4-3-2-1 그라운딩 기법</h2>
        <div id="grounding-instruction"></div>
        <div id="grounding-timer"></div>
        <button onclick="stopGroundingTechnique()">종료</button>
    `;

    const steps = [
        { text: "보이는 것 5가지를 말해보세요", duration: 30 },
        { text: "들리는 것 4가지를 말해보세요", duration: 30 },
        { text: "만질 수 있는 것 3가지를 말해보세요", duration: 30 },
        { text: "맡을 수 있는 냄새 2가지를 말해보세요", duration: 20 },
        { text: "맛볼 수 있는 것 1가지를 말해보세요", duration: 20 },
        { text: "깊게 숨을 쉬세요", duration: 30 }
    ];
    let currentStep = 0;

    function updateGroundingUI() {
        const instruction = document.getElementById('grounding-instruction');
        const timer = document.getElementById('grounding-timer');

        if (currentStep >= steps.length) {
            stopGroundingTechnique();
            return;
        }

        instruction.textContent = steps[currentStep].text;
        timer.textContent = steps[currentStep].duration;

        steps[currentStep].duration--;
        if (steps[currentStep].duration < 0) {
            currentStep++;
        }
    }

    updateGroundingUI();
    currentInterval = setInterval(updateGroundingUI, 1000);
}

function stopGroundingTechnique() {
    stopCurrentActivity();
    showPanicPage();
}

// showPanicPage 함수 수정
function showPanicPage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>공황 대처 방법</h2>
        <button onclick="startPanicMethod(1)">단계별 공황발작 대처법</button>
        <button onclick="recordPanicSymptoms()">공황 증상 기록</button>
        <button onclick="startBreathingExercise()">호흡 조절 연습</button>
        <button onclick="startProgressiveRelaxation()">점진적 근육 이완법</button>
        <button onclick="startGroundingTechnique()">5-4-3-2-1 그라운딩 기법</button>
        <div id="panic-content" class="hidden">
            <div id="panic-text"></div>
            <div id="panic-timer"></div>
            <div id="panic-progress">
                <div id="panic-progress-bar"></div>
            </div>
        </div>
        <button onclick="showSection('main')">메인으로 돌아가기</button>
    `;
}

window.onload = initApp;
