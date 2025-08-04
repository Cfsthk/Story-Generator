// API 配置
let OPENROUTER_API_KEY = '';
const MODEL = 'deepseek/deepseek-chat-v3-0324:free';

// DOM 元素
const storyForm = document.getElementById('story-form');
const generateBtn = document.getElementById('generate-btn');
const outputSection = document.getElementById('output-section');
const storyText = document.getElementById('story-text');
const questionsContainer = document.getElementById('questions-container');
const loadingIndicator = document.getElementById('loading-indicator');

// 檢查API密鑰是否已設置
function checkAPIKey() {
    if (!OPENROUTER_API_KEY) {
        showAPIKeyModal();
        return false;
    }
    return true;
}

// 顯示API密鑰輸入模態框
function showAPIKeyModal() {
    const modal = document.createElement('div');
    modal.className = 'api-key-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>🔑 請輸入您的API密鑰</h2>
            <p>為了使用故事生成功能，請輸入您的OpenRouter API密鑰。</p>
            <div class="api-key-input-container">
                <input type="password" id="api-key-input" placeholder="請輸入您的API密鑰..." />
                <button id="save-api-key-btn" class="save-api-key-btn">保存並開始使用</button>
            </div>
            <div class="api-key-help">
                <p><strong>如何獲取API密鑰：</strong></p>
                <ol>
                    <li>訪問 <a href="https://openrouter.ai/" target="_blank">OpenRouter</a></li>
                    <li>註冊並登錄您的帳戶</li>
                    <li>在控制台中創建新的API密鑰</li>
                    <li>複製密鑰並粘貼到上面的輸入框中</li>
                </ol>
                <p><small>注意：您的API密鑰僅存儲在當前瀏覽器會話中，關閉頁面後會自動清除。</small></p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加事件監聽器
    const saveBtn = document.getElementById('save-api-key-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            OPENROUTER_API_KEY = apiKey;
            document.body.removeChild(modal);
            enableStoryForm();
        } else {
            alert('請輸入有效的API密鑰');
        }
    });
    
    // 按Enter鍵保存
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        }
    });
    
    // 聚焦到輸入框
    apiKeyInput.focus();
}

// 啟用故事表單
function enableStoryForm() {
    storyForm.style.display = 'block';
    generateBtn.disabled = false;
}

// 禁用故事表單
function disableStoryForm() {
    storyForm.style.display = 'none';
    generateBtn.disabled = true;
}

// 生成故事的函數
async function generateStory(prompt, retryCount = 0) {
    if (!checkAPIKey()) return null;
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Story Generator'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: '你是一個專門為香港小學生創作故事的AI助手。請用中文繁體書面語創作故事，加入適當的成語和優美的詞藻。故事應該富有想像力、正面積極，並包含豐富的情節發展。每個年齡組別的故事長度、情節和詞彙要求如下：\n' +
                        '- 7歲以下：最少300字，3個情節發展，使用簡單詞彙，短句，避免複雜成語\n' +
                        '- 8-12歲：最少500字，4個情節發展，使用中等難度詞彙，可加入基本成語\n' +
                        '- 12歲以上：最少600字，5個情節發展，可使用較複雜詞彙和成語\n\n' +
                        '請注意：\n' +
                        '1. 不要使用標題或小標題\n' +
                        '2. 不要將故事分成章節\n' +
                        '3. 詞彙難度必須嚴格符合目標年齡組別\n' +
                        '4. 直接以故事內容開始，不要加入"從前有個..."等固定開場白\n' +
                        '5. 故事應該是連貫的段落，不要使用編號或標題來分隔\n' +
                        '6. 故事中加入反轉情節，增加故事的趣味性'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });

        if (response.status === 429) {
            // 處理請求過於頻繁的錯誤
            if (retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // 指數退避：1秒、2秒、4秒
                console.log(`API限制，等待${delay/1000}秒後重試...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return generateStory(prompt, retryCount + 1);
            } else {
                throw new Error('API請求過於頻繁，請稍後再試');
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API錯誤:', response.status, errorText);
            
            if (response.status === 401) {
                throw new Error('API密鑰無效，請檢查您的密鑰');
            } else if (response.status === 429) {
                throw new Error('API請求過於頻繁，請稍後再試');
            } else {
                throw new Error(`故事生成失敗 (${response.status})`);
            }
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('故事生成錯誤:', error);
        throw error;
    }
}

// 生成理解問題的函數
async function generateQuestions(story, age, retryCount = 0) {
    if (!checkAPIKey()) return null;
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Story Generator'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: '你是一個專門設計故事理解問題的助手。請使用中文繁體書面語設計問題，確保問題的用詞優美得體，並能引導學生深入思考故事內容。每個問題必須包含4個選項（A、B、C、D）和正確答案。請嚴格按照指定格式輸出問題。\n\n' +
                        '注意事項：\n' +
                        '1. 每個選項必須以大寫字母（A、B、C、D）開頭，後面加上句點\n' +
                        '2. 填空題必須使用【】標記填空處\n' +
                        '3. 答案必須以「答案：」開頭\n' +
                        '4. 詞語解釋必須包含詞義說明和例句'
                    },
                    {
                        role: 'user',
                        content: `請根據以下故事設計10條問題，嚴格按照以下格式輸出：

每個問題的格式示例：
問題1：[問題內容]
A. [選項A內容]
B. [選項B內容]
C. [選項C內容]
D. [選項D內容]
答案：[A/B/C/D]

填充題1：這個【】真是令人驚嘆。
答案：奇景（造句：山頂的日出是一個令人難忘的奇景。）

詞語解釋：[需要解釋的詞語]
答案：[詞語的意思]（造句：[使用該詞語的例句]）

請設計：
1. 7條理解問題（圍繞故事情節、人物性格、主題寓意等）
2. 2條填充題（從故事中選擇較複雜的詞語或片語，用【】標記填空處）
3. 1條詞語解釋題（解釋故事中的一個成語或較複雜詞語）

要求：
1. 所有問題必須使用書面語表達
2. 選項內容要合理，避免明顯的錯誤選項
3. 填空題必須來自原文，並提供造句示例
4. 詞語解釋必須包含完整的解釋和恰當的例句
5. 問題的難度要適合${age}歲的學生

故事內容：${story}`
                    }
                ]
            })
        });

        if (response.status === 429) {
            // 處理請求過於頻繁的錯誤
            if (retryCount < 3) {
                const delay = Math.pow(2, retryCount) * 1000; // 指數退避：1秒、2秒、4秒
                console.log(`問題生成API限制，等待${delay/1000}秒後重試...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return generateQuestions(story, age, retryCount + 1);
            } else {
                throw new Error('API請求過於頻繁，請稍後再試');
            }
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('問題生成API錯誤:', response.status, errorText);
            
            if (response.status === 401) {
                throw new Error('API密鑰無效，請檢查您的密鑰');
            } else if (response.status === 429) {
                throw new Error('API請求過於頻繁，請稍後再試');
            } else {
                throw new Error(`問題生成失敗 (${response.status})`);
            }
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('問題生成錯誤:', error);
        throw error;
    }
}

// 顯示問題的函數
function displayQuestions(questions) {
    const questionLines = questions.split('\n').filter(line => line.trim() !== '');
    let questionsHTML = '';
    let currentQuestion = null;
    let currentOptions = [];
    let currentAnswer = '';
    let questionType = '';

    questionLines.forEach((line, index) => {
        const questionMatch = line.match(/^(問題\d+：|填充題\d*：|詞語解釋：)/);
        if (questionMatch) {
            if (currentQuestion) {
                questionsHTML += generateQuestionHTML(questionType, currentQuestion, currentOptions, currentAnswer);
                currentOptions = [];
                currentAnswer = '';
            }
            currentQuestion = line;
            questionType = questionMatch[1];
        } else if (line.match(/^[A-D]\./)) {
            currentOptions.push(line);
        } else if (line.startsWith('答案：')) {
            currentAnswer = line.replace('答案：', '').trim();
            if (index === questionLines.length - 1 || questionLines[index + 1].match(/^(問題\d+：|填充題\d*：|詞語解釋：)/)) {
                questionsHTML += generateQuestionHTML(questionType, currentQuestion, currentOptions, currentAnswer);
                currentQuestion = null;
                currentOptions = [];
                currentAnswer = '';
                questionType = '';
            }
        }
    });

    questionsContainer.innerHTML = questionsHTML;

    // 添加顯示答案按鈕的事件監聽器
    document.querySelectorAll('.show-answer-btn').forEach(button => {
        button.addEventListener('click', function() {
            const answerText = this.nextElementSibling;
            answerText.classList.toggle('visible');
            this.textContent = answerText.classList.contains('visible') ? '隱藏答案' : '顯示答案';
        });
    });
}

// 生成單個問題的HTML
function generateQuestionHTML(type, question, options, answer) {
    let html = `<div class="question-item">`;

    if (type.includes('填充題')) {
        const match = answer.match(/(.+?)（造句：(.+?)）/);
        if (match) {
            const word = match[1];
            const sentence = match[2];
            const questionText = sentence.replace(word, '【】');
            html += `
                <h3>填充題</h3>
                <p>${questionText}</p>
                <button class="show-answer-btn">顯示答案</button>
                <div class="answer-text">${word}</div>
            `;
        } else {
            const questionText = question.replace(/【.*?】/g, '<span class="blank">_____</span>');
            html += `
                <h3>填充題</h3>
                <p>${questionText}</p>
                <button class="show-answer-btn">顯示答案</button>
                <div class="answer-text">${answer}</div>
            `;
        }
    } else if (type.includes('詞語解釋')) {
        html += `
            <h3>詞語解釋</h3>
            <p>${question}</p>
            <button class="show-answer-btn">顯示答案</button>
            <div class="answer-text">${answer}</div>
        `;
    } else {
        html += `
            <h3>${question}</h3>
            <div class="question-options">
                ${options.map(option => `<div class="question-option">${option}</div>`).join('')}
            </div>
            <button class="show-answer-btn">顯示答案</button>
            <div class="answer-text">正確答案：${answer}</div>
        `;
    }

    html += `</div>`;
    return html;
}

// 設置輸入框不保存歷史記錄
document.querySelectorAll('input[type="text"]').forEach(input => {
    input.setAttribute('autocomplete', 'off');
});

// 頁面加載時禁用表單並顯示API密鑰輸入
document.addEventListener('DOMContentLoaded', () => {
    disableStoryForm();
    showAPIKeyModal();
});

// 處理表單提交
storyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 檢查API密鑰
    if (!checkAPIKey()) {
        return;
    }

    const character = document.getElementById('character').value;
    const location = document.getElementById('location').value;
    const time = document.getElementById('time').value;
    const event = document.getElementById('event').value;
    const age = document.querySelector('input[name="age"]:checked').value;

    // 顯示加載狀態
    loadingIndicator.classList.remove('hidden');
    generateBtn.disabled = true;
    outputSection.classList.remove('hidden');
    storyText.innerHTML = '';
    questionsContainer.innerHTML = '';

    // 更新加載文本
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = '正在創作故事...';
    }

    try {
        let ageGroup = '';
        let episodes = '';
        if (age <= 7) {
            ageGroup = '幼童';
            episodes = '兩個';
        } else if (age <= 12) {
            ageGroup = '兒童';
            episodes = '三個';
        } else {
            ageGroup = '青少年';
            episodes = '四個';
        }

        const prompt = `請為${ageGroup}創作一個有趣的故事，包含${episodes}情節發展。故事主角是${character}，故事發生在${location}，時間是${time}，主要情節是${event}。請用書面語表達，適當加入成語和優美詞藻。確保故事有完整的開始、發展和結局，並帶出正面的價值觀。

重要要求：
1. 不要加入任何標題或小標題
2. 不要將故事分成章節
3. 請確保使用的詞彙適合${ageGroup}的理解能力
4. 直接以故事內容開始，不要加入"從前有個..."等開場白
5. 故事應該是連貫的段落，不要使用編號或標題來分隔`;

        let story = await generateStory(prompt);
        
        if (!story) {
            throw new Error('故事生成失敗，請檢查API密鑰');
        }

        // 清理故事文本，移除標題和章節
        story = story.replace(/^(.{0,30})[：:]\s*$/gm, '');
        story = story.replace(/^第[一二三四五六七八九十\d]+[章節].*$/gm, '');
        story = story.replace(/^[《【「『].*[》】」』]$/gm, '');
        story = story.replace(/^\*\*.*\*\*$/gm, '');
        story = story.replace(/^#+\s+.*$/gm, '');
        story = story.replace(/\n\s*\n/g, '\n');

        // 轉換為段落並顯示
        storyText.innerHTML = story.split('\n')
            .filter(para => para.trim() !== '')
            .map(para => `<p>${para}</p>`)
            .join('');

        // 更新加載文本
        if (loadingText) {
            loadingText.textContent = '正在生成理解問題...';
        }

        // 生成理解問題
        const questions = await generateQuestions(story, age);
        if (questions) {
            displayQuestions(questions);
        } else {
            questionsContainer.innerHTML = '<p class="error-message">問題生成失敗，但故事已成功生成。</p>';
        }

    } catch (error) {
        console.error('Error:', error);
        
        let errorMessage = '對不起，故事創作失敗了...';
        
        if (error.message.includes('API請求過於頻繁')) {
            errorMessage = 'API請求過於頻繁，請稍等幾秒後再試。';
        } else if (error.message.includes('API密鑰無效')) {
            errorMessage = 'API密鑰無效，請檢查您的密鑰是否正確。';
        } else if (error.message.includes('故事生成失敗')) {
            errorMessage = '故事生成失敗，請檢查您的網絡連接和API密鑰。';
        }
        
        storyText.innerHTML = `<p class="error-message">${errorMessage}</p>`;
        questionsContainer.innerHTML = '';
    } finally {
        loadingIndicator.classList.add('hidden');
        generateBtn.disabled = false;
    }
});