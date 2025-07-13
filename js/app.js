// アプリの状態を管理
const state = {
    events: JSON.parse(localStorage.getItem('orderEvents')) || [],
    currentEventId: null,
    currentView: 'event-list' // 'event-list', 'event-edit', 'order-screen', 'summary-screen'
};

// DOM要素を取得
const elements = {
    // 画面要素
    screens: {
        eventList: document.getElementById('event-list'),
        eventEdit: document.getElementById('event-edit'),
        orderScreen: document.getElementById('order-screen'),
        summaryScreen: document.getElementById('summary-screen')
    },
    
    // イベント一覧画面
    newEventBtn: document.getElementById('new-event'),
    eventsContainer: document.getElementById('events-container'),
    noEvents: document.getElementById('no-events'),
    
    // イベント編集画面
    backToListBtn: document.getElementById('back-to-list'),
    eventNameInput: document.getElementById('event-name'),
    participantNameInput: document.getElementById('participant-name'),
    addParticipantBtn: document.getElementById('add-participant'),
    participantsList: document.getElementById('participants-list'),
    startOrderingBtn: document.getElementById('start-ordering'),
    
    // 注文入力画面
    backToEditBtn: document.getElementById('back-to-edit'),
    orderContainer: document.getElementById('order-container'),
    viewSummaryBtn: document.getElementById('view-summary'),
    
    // 集計画面
    backToOrdersBtn: document.getElementById('back-to-orders'),
    summaryContainer: document.getElementById('summary-container'),
    printSummaryBtn: document.getElementById('print-summary')
};

// アプリの初期化
function init() {
    // イベントリスナーの設定
    setupEventListeners();
    
    // 初期画面を表示
    showView('event-list');
    
    // イベント一覧を表示
    renderEventList();
}

// イベントリスナーの設定
function setupEventListeners() {
    // 新しいイベントボタン
    elements.newEventBtn.addEventListener('click', () => {
        // 新しいイベントの状態をリセット
        state.currentEventId = null;
        elements.eventNameInput.value = '';
        elements.participantsList.innerHTML = '';
        document.getElementById('edit-title').textContent = '新しいイベント';
        
        // イベント編集画面に移動
        showView('event-edit');
    });
    
    // 戻るボタン（一覧に戻る）
    elements.backToListBtn.addEventListener('click', () => {
        showView('event-list');
    });
    
    // 参加者追加ボタン
    elements.addParticipantBtn.addEventListener('click', addParticipant);
    elements.participantNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addParticipant();
    });
    
    // 注文を開始ボタン
    elements.startOrderingBtn.addEventListener('click', startOrdering);
    
    // 戻るボタン（編集に戻る）
    elements.backToEditBtn.addEventListener('click', () => {
        showView('event-edit');
    });
    
    // 集計を見るボタン
    elements.viewSummaryBtn.addEventListener('click', () => {
        showView('summary-screen');
        renderSummary();
    });
    
    // 戻るボタン（注文に戻る）
    elements.backToOrdersBtn.addEventListener('click', () => {
        showView('order-screen');
    });
    
    // 印刷ボタン
    elements.printSummaryBtn.addEventListener('click', () => {
        window.print();
    });
}

// ビューの切り替え
function showView(viewName) {
    // すべての画面を非表示
    Object.values(elements.screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // 現在のビューを更新
    state.currentView = viewName;
    
    // 指定されたビューを表示
    switch (viewName) {
        case 'event-list':
            elements.screens.eventList.classList.add('active');
            renderEventList();
            break;
        case 'event-edit':
            elements.screens.eventEdit.classList.add('active');
            elements.eventNameInput.focus();
            break;
        case 'order-screen':
            elements.screens.orderScreen.classList.add('active');
            renderOrderScreen();
            break;
        case 'summary-screen':
            elements.screens.summaryScreen.classList.add('active');
            renderSummary();
            break;
    }
}

// イベント一覧を表示
function renderEventList() {
    elements.eventsContainer.innerHTML = '';
    
    if (state.events.length === 0) {
        elements.noEvents.style.display = 'block';
        return;
    }
    
    elements.noEvents.style.display = 'none';
    
    state.events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `
            <span>${event.name} (${event.participants ? event.participants.length : 0}名)</span>
            <button class="btn primary order-btn" data-id="${event.id}">注文する</button>
        `;
        
        // 注文するボタンのイベントリスナー
        eventElement.querySelector('.order-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            state.currentEventId = event.id;
            showView('order-screen');
        });
        
        // イベントをクリックで編集
        eventElement.addEventListener('click', () => {
            state.currentEventId = event.id;
            editEvent(event.id);
        });
        
        elements.eventsContainer.appendChild(eventElement);
    });
}

// 参加者を追加
function addParticipant() {
    const name = elements.participantNameInput.value.trim();
    
    if (!name) {
        alert('参加者名を入力してください。');
        return;
    }
    
    const participantItem = document.createElement('li');
    participantItem.className = 'participant-item';
    participantItem.dataset.name = name;
    participantItem.innerHTML = `
        <span>${name}</span>
        <button class="btn danger remove-participant">削除</button>
    `;
    
    // 削除ボタンのイベントリスナー
    participantItem.querySelector('.remove-participant').addEventListener('click', (e) => {
        e.stopPropagation();
        participantItem.remove();
    });
    
    elements.participantsList.appendChild(participantItem);
    elements.participantNameInput.value = '';
    elements.participantNameInput.focus();
}

// イベントを編集
function editEvent(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    
    state.currentEventId = eventId;
    elements.eventNameInput.value = event.name;
    elements.participantsList.innerHTML = '';
    
    // 参加者を表示
    if (event.participants && event.participants.length > 0) {
        event.participants.forEach(participant => {
            const participantItem = document.createElement('li');
            participantItem.className = 'participant-item';
            participantItem.dataset.name = participant;
            participantItem.innerHTML = `
                <span>${participant}</span>
                <button class="btn danger remove-participant">削除</button>
            `;
            
            // 削除ボタンのイベントリスナー
            participantItem.querySelector('.remove-participant').addEventListener('click', (e) => {
                e.stopPropagation();
                participantItem.remove();
            });
            
            elements.participantsList.appendChild(participantItem);
        });
    }
    
    document.getElementById('edit-title').textContent = 'イベントを編集';
    showView('event-edit');
}

// 注文を開始
function startOrdering() {
    const eventName = elements.eventNameInput.value.trim();
    
    if (!eventName) {
        alert('イベント名を入力してください。');
        return;
    }
    
    // 参加者を取得
    const participants = [];
    document.querySelectorAll('.participant-item').forEach(item => {
        participants.push(item.dataset.name);
    });
    
    if (participants.length === 0) {
        alert('参加者を1人以上追加してください。');
        return;
    }
    
    // イベントを保存または更新
    const eventData = {
        id: state.currentEventId || Date.now().toString(),
        name: eventName,
        participants: participants,
        orders: {}
    };
    
    // 既存の注文を保持
    const existingEvent = state.events.find(e => e.id === state.currentEventId);
    if (existingEvent && existingEvent.orders) {
        eventData.orders = existingEvent.orders;
    }
    
    // イベントを更新または追加
    const eventIndex = state.events.findIndex(e => e.id === state.currentEventId);
    if (eventIndex !== -1) {
        state.events[eventIndex] = eventData;
    } else {
        state.events.push(eventData);
        state.currentEventId = eventData.id;
    }
    
    // ローカルストレージに保存
    saveToLocalStorage();
    
    // 注文画面に移動
    showView('order-screen');
}

// 注文画面を表示
function renderOrderScreen() {
    const event = state.events.find(e => e.id === state.currentEventId);
    if (!event) {
        showView('event-list');
        return;
    }
    
    document.getElementById('order-title').textContent = event.name;
    elements.orderContainer.innerHTML = '';
    
    if (!event.participants || event.participants.length === 0) {
        elements.orderContainer.innerHTML = '<p>参加者がいません。イベント編集画面で参加者を追加してください。</p>';
        return;
    }
    
    // 参加者ごとの注文入力欄を作成
    event.participants.forEach(participant => {
        const participantOrders = event.orders[participant] || [];
        
        const participantElement = document.createElement('div');
        participantElement.className = 'order-participant';
        participantElement.dataset.participant = participant;
        
        participantElement.innerHTML = `
            <h3>${participant}</h3>
            <div class="order-items">
                ${participantOrders.map((order, index) => `
                    <div class="order-item">
                        <span>${order}</span>
                        <button class="btn danger remove-order" data-participant="${participant}" data-index="${index}">
                            削除
                        </button>
                    </div>
                `).join('')}
            </div>
            <div class="add-order">
                <input type="text" class="input order-input" placeholder="注文を入力" data-participant="${participant}">
                <button class="btn primary add-order-btn" data-participant="${participant}">追加</button>
            </div>
        `;
        
        elements.orderContainer.appendChild(participantElement);
    });
    
    // 注文追加ボタンのイベントリスナー
    document.querySelectorAll('.add-order-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const participant = e.target.dataset.participant;
            const input = document.querySelector(`.order-input[data-participant="${participant}"]`);
            addOrder(participant, input);
        });
    });
    
    // Enterキーで注文を追加
    document.querySelectorAll('.order-input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const participant = e.target.dataset.participant;
                addOrder(participant, e.target);
            }
        });
    });
    
    // 注文削除ボタンのイベントリスナー
    document.querySelectorAll('.remove-order').forEach(button => {
        button.addEventListener('click', (e) => {
            const participant = e.target.dataset.participant;
            const orderIndex = parseInt(e.target.dataset.index);
            removeOrder(participant, orderIndex);
        });
    });
}

// 注文を追加
function addOrder(participant, inputElement) {
    const orderText = inputElement.value.trim();
    
    if (!orderText) {
        inputElement.focus();
        return;
    }
    
    const event = state.events.find(e => e.id === state.currentEventId);
    if (!event) return;
    
    // 注文を追加
    if (!event.orders[participant]) {
        event.orders[participant] = [];
    }
    
    event.orders[participant].push(orderText);
    saveToLocalStorage();
    
    // 注文リストを更新
    renderOrderScreen();
    
    // 入力フィールドにフォーカスを戻す
    inputElement.focus();
}

// 注文を削除
function removeOrder(participant, orderIndex) {
    const event = state.events.find(e => e.id === state.currentEventId);
    if (!event || !event.orders[participant]) return;
    
    event.orders[participant].splice(orderIndex, 1);
    saveToLocalStorage();
    renderOrderScreen();
}

// 集計を表示
function renderSummary() {
    const event = state.events.find(e => e.id === state.currentEventId);
    if (!event) {
        showView('event-list');
        return;
    }
    
    elements.summaryContainer.innerHTML = '';
    
    // 商品ごとの注文を集計
    const summary = {};
    
    // 注文を集計
    Object.entries(event.orders).forEach(([participant, orders]) => {
        orders.forEach(order => {
            if (!summary[order]) {
                summary[order] = {
                    count: 0,
                    participants: []
                };
            }
            
            summary[order].count++;
            summary[order].participants.push(participant);
        });
    });
    
    // 集計結果を表示
    if (Object.keys(summary).length === 0) {
        elements.summaryContainer.innerHTML = '<p>注文がありません。</p>';
        return;
    }
    
    Object.entries(summary).forEach(([item, data]) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'summary-item';
        
        itemElement.innerHTML = `
            <h3>${item} (合計: ${data.count}個)</h3>
            <div class="summary-participants">
                ${data.participants.map(participant => `
                    <div class="summary-participant">・${participant}</div>
                `).join('')}
            </div>
        `;
        
        elements.summaryContainer.appendChild(itemElement);
    });
}

// ローカルストレージに保存
function saveToLocalStorage() {
    localStorage.setItem('orderEvents', JSON.stringify(state.events));
}

// アプリを初期化
document.addEventListener('DOMContentLoaded', init);
