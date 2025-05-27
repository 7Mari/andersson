// Dados simulados (substituir por API real em produção)
let currentUser = null;
let tickets = [];
let messages = {};
let users = [
    { id: "user1", name: "João Silva", email: "joao@exemplo.com", password: "123456", role: "user" },
    { id: "tech1", name: "Técnico", email: "tecnico@exemplo.com", password: "123456", role: "tech" }
];

// Elementos do DOM
const DOM = {
    mainContent: document.getElementById('mainContent'),
    btnNewTicket: document.getElementById('btnNewTicket'),
    newTicketModal: document.getElementById('newTicketModal'),
    closeModal: document.getElementById('closeModal'),
    ticketForm: document.getElementById('ticketForm'),
    viewTicketModal: document.getElementById('viewTicketModal'),
    closeViewModal: document.getElementById('closeViewModal'),
    ticketDetails: document.getElementById('ticketDetails'),
    messagesList: document.getElementById('messagesList'),
    messageForm: document.getElementById('messageForm'),
    loginModal: document.getElementById('loginModal'),
    loginForm: document.getElementById('loginForm'),
    registerModal: document.getElementById('registerModal'),
    registerForm: document.getElementById('registerForm'),
    btnShowRegister: document.getElementById('btnShowRegister'),
    btnShowLogin: document.getElementById('btnShowLogin'),
    closeRegisterModal: document.getElementById('closeRegisterModal'),
    btnLogout: document.getElementById('btnLogout'),
    userName: document.getElementById('userName'),
    userAvatar: document.getElementById('userAvatar'),
    filePreview: document.getElementById('filePreview'),
    messageFilePreview: document.getElementById('messageFilePreview'),
    btnTickets: document.getElementById('btnTickets'),
    btnDashboard: document.getElementById('btnDashboard'),
    btnClients: document.getElementById('btnClients'),
    btnSettings: document.getElementById('btnSettings')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se há usuário logado
    const loggedUser = localStorage.getItem('helpdesk_user');
    if (loggedUser) {
        currentUser = JSON.parse(loggedUser);
        updateUserInfo();
        loadTickets();
    } else {
        showLoginModal();
    }
    
    // Carregar dados iniciais
    loadInitialData();
    
    // Event Listeners
    setupEventListeners();
});

function loadInitialData() {
    // Carregar tickets do localStorage ou criar dados iniciais
    if (!localStorage.getItem('helpdesk_tickets')) {
        const initialTickets = [
            {
                id: generateTicketId(),
                title: "Computador não liga",
                description: "Ao pressionar o botão de ligar, o computador não dá nenhum sinal de vida. Já verifiquei a conexão da energia e está tudo ok.",
                date: new Date().toLocaleDateString('pt-BR'),
                status: "open",
                priority: "high",
                category: "hardware",
                userId: "user1",
                files: []
            },
            {
                id: generateTicketId(),
                title: "Problema com acesso ao sistema",
                description: "Não consigo acessar o sistema interno da empresa. Aparece a mensagem 'Credenciais inválidas' mesmo com a senha correta.",
                date: new Date().toLocaleDateString('pt-BR'),
                status: "in-progress",
                priority: "medium",
                category: "software",
                userId: "user1",
                files: []
            },
            {
                id: generateTicketId(),
                title: "Internet lenta",
                description: "A conexão com a internet está extremamente lenta há dois dias, dificultando o trabalho.",
                date: new Date().toLocaleDateString('pt-BR'),
                status: "resolved",
                priority: "low",
                category: "network",
                userId: "user1",
                files: []
            }
        ];
        localStorage.setItem('helpdesk_tickets', JSON.stringify(initialTickets));
    }

    // Carregar mensagens do localStorage ou criar dados iniciais
    if (!localStorage.getItem('helpdesk_messages')) {
        const initialMessages = {
            [generateTicketId()]: [
                {
                    id: "msg" + Date.now(),
                    content: "Olá, já verifiquei o cabo de energia e está tudo conectado corretamente.",
                    date: new Date().toLocaleString('pt-BR'),
                    userId: "user1",
                    files: []
                },
                {
                    id: "msg" + Date.now(),
                    content: "Vou verificar o equipamento. Por favor, me informe a marca e modelo do computador.",
                    date: new Date().toLocaleString('pt-BR'),
                    userId: "tech1",
                    files: []
                }
            ]
        };
        localStorage.setItem('helpdesk_messages', JSON.stringify(initialMessages));
    }
}

function setupEventListeners() {
    // Autenticação
    DOM.loginForm.addEventListener('submit', handleLogin);
    DOM.registerForm.addEventListener('submit', handleRegister);
    DOM.btnShowRegister.addEventListener('click', showRegisterModal);
    DOM.btnShowLogin.addEventListener('click', showLoginModal);
    DOM.btnLogout.addEventListener('click', handleLogout);
    
    // Tickets
    DOM.btnNewTicket.addEventListener('click', showNewTicketModal);
    DOM.closeModal.addEventListener('click', () => DOM.newTicketModal.style.display = 'none');
    DOM.closeViewModal.addEventListener('click', () => DOM.viewTicketModal.style.display = 'none');
    DOM.ticketForm.addEventListener('submit', handleNewTicket);
    
    // Mensagens
    DOM.messageForm.addEventListener('submit', handleNewMessage);
    
    // Navegação
    DOM.btnTickets.addEventListener('click', (e) => {
        e.preventDefault();
        loadTickets();
        setActiveMenuItem(DOM.btnTickets);
    });
    
    DOM.btnDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        showDashboard();
        setActiveMenuItem(DOM.btnDashboard);
    });
    
    // Arquivos
    document.getElementById('ticketFiles').addEventListener('change', handleFileSelect);
    document.getElementById('messageFiles').addEventListener('change', handleMessageFileSelect);
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === DOM.newTicketModal) DOM.newTicketModal.style.display = 'none';
        if (e.target === DOM.viewTicketModal) DOM.viewTicketModal.style.display = 'none';
        if (e.target === DOM.loginModal) DOM.loginModal.style.display = 'none';
        if (e.target === DOM.registerModal) DOM.registerModal.style.display = 'none';
    });
}

// Funções de autenticação
function showLoginModal() {
    DOM.loginModal.style.display = 'flex';
    DOM.registerModal.style.display = 'none';
    DOM.loginForm.reset();
}

function showRegisterModal() {
    DOM.loginModal.style.display = 'none';
    DOM.registerModal.style.display = 'flex';
    DOM.registerForm.reset();
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulação de autenticação
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('helpdesk_user', JSON.stringify(user));
        updateUserInfo();
        DOM.loginModal.style.display = 'none';
        loadTickets();
        showAlert('success', 'Login realizado com sucesso!');
    } else {
        showAlert('error', 'Email ou senha incorretos!');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showAlert('error', 'As senhas não coincidem!');
        return;
    }
    
    if (password.length < 6) {
        showAlert('error', 'A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    // Verificar se email já existe
    if (users.some(u => u.email === email)) {
        showAlert('error', 'Este email já está cadastrado!');
        return;
    }
    
    // Criar novo usuário
    const newUser = {
        id: 'user' + Date.now(),
        name,
        email,
        password,
        role: 'user'
    };
    
    users.push(newUser);
    currentUser = newUser;
    localStorage.setItem('helpdesk_user', JSON.stringify(newUser));
    updateUserInfo();
    DOM.registerModal.style.display = 'none';
    loadTickets();
    showAlert('success', 'Registro realizado com sucesso! Bem-vindo!');
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('helpdesk_user');
    window.location.reload();
}

function updateUserInfo() {
    if (currentUser) {
        DOM.userName.textContent = currentUser.name;
        DOM.userAvatar.textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        document.body.classList.remove('logged-out');
    } else {
        document.body.classList.add('logged-out');
    }
}

// Funções de tickets
function loadTickets(filter = 'all') {
    tickets = JSON.parse(localStorage.getItem('helpdesk_tickets')) || [];
    messages = JSON.parse(localStorage.getItem('helpdesk_messages')) || {};
    
    renderTicketsList(filter);
}

function renderTicketsList(filter = 'all') {
    let filteredTickets = tickets;
    
    if (currentUser.role === 'user') {
        filteredTickets = tickets.filter(ticket => ticket.userId === currentUser.id);
    }
    
    if (filter !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === filter);
    }
    
    DOM.mainContent.innerHTML = `
        <div class="tickets-header">
            <h2 class="tickets-title"><i class="fas fa-ticket-alt"></i> Meus Chamados</h2>
            <div class="tickets-filter">
                <select id="filterStatus">
                    <option value="all">Todos os status</option>
                    <option value="open">Abertos</option>
                    <option value="in-progress">Em andamento</option>
                    <option value="resolved">Resolvidos</option>
                </select>
            </div>
        </div>
        <ul class="tickets-list" id="ticketsList"></ul>
    `;
    
    const ticketsList = document.getElementById('ticketsList');
    const filterStatus = document.getElementById('filterStatus');
    
    if (filteredTickets.length === 0) {
        ticketsList.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Nenhum chamado encontrado.</p></div>';
    } else {
        filteredTickets.forEach(ticket => {
            const ticketItem = document.createElement('li');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.id = ticket.id;
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-date">${ticket.date}</span>
                </div>
                <h3 class="ticket-title">${ticket.title}</h3>
                <p class="ticket-description">${ticket.description}</p>
                <div class="ticket-footer">
                    <span class="ticket-status ${getStatusClass(ticket.status)}">${getStatusText(ticket.status)}</span>
                    <span class="ticket-priority ${getPriorityClass(ticket.priority)}">${getPriorityText(ticket.priority)}</span>
                </div>
            `;
            
            ticketItem.addEventListener('click', () => viewTicket(ticket.id));
            ticketsList.appendChild(ticketItem);
        });
    }
    
    filterStatus.value = filter;
    filterStatus.addEventListener('change', (e) => {
        renderTicketsList(e.target.value);
    });
}

function showNewTicketModal() {
    if (!currentUser) {
        showLoginModal();
        return;
    }
    
    DOM.ticketForm.reset();
    DOM.filePreview.innerHTML = '';
    DOM.newTicketModal.style.display = 'flex';
}

function handleNewTicket(e) {
    e.preventDefault();
    
    const filesInput = document.getElementById('ticketFiles');
    const ticketFiles = Array.from(filesInput.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
    }));
    
    const newTicket = {
        id: generateTicketId(),
        title: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'open',
        priority: document.getElementById('ticketPriority').value,
        category: document.getElementById('ticketCategory').value,
        userId: currentUser.id,
        files: ticketFiles
    };
    
    tickets.unshift(newTicket);
    localStorage.setItem('helpdesk_tickets', JSON.stringify(tickets));
    
    DOM.newTicketModal.style.display = 'none';
    DOM.ticketForm.reset();
    DOM.filePreview.innerHTML = '';
    
    renderTicketsList();
    showAlert('success', `Chamado ${newTicket.id} criado com sucesso!`);
}

function viewTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const ticketMessages = messages[ticketId] || [];
    
    ticketDetails.innerHTML = `
        <div class="ticket-view-header">
            <h2>${ticket.title} <span class="ticket-id">${ticket.id}</span></h2>
            <div class="ticket-meta">
                <span class="ticket-date">Aberto em: ${ticket.date}</span>
                <span class="ticket-status ${getStatusClass(ticket.status)}">${getStatusText(ticket.status)}</span>
                <span class="ticket-priority ${getPriorityClass(ticket.priority)}">Prioridade: ${getPriorityText(ticket.priority)}</span>
                <span class="ticket-category">Categoria: ${getCategoryText(ticket.category)}</span>
            </div>
        </div>
        
        <div class="ticket-view-description">
            <h3><i class="fas fa-info-circle"></i> Descrição</h3>
            <p>${ticket.description}</p>
        </div>
        
        ${ticket.files.length > 0 ? `
        <div class="ticket-view-files">
            <h3><i class="fas fa-paperclip"></i> Anexos</h3>
            <div class="files-list">
                ${ticket.files.map(file => `
                    <div class="file-item">
                        <i class="fas fa-file"></i>
                        <a href="${file.url}" target="_blank">${file.name}</a>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    `;
    
    messagesList.innerHTML = '';
    ticketMessages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-user">${msg.userId === currentUser.id ? 'Você' : 'Técnico'}</span>
                <span class="message-date">${msg.date}</span>
            </div>
            <div class="message-content">${msg.content}</div>
            ${msg.files.length > 0 ? `
            <div class="message-files">
                ${msg.files.map(file => `
                    <div class="file-item">
                        <i class="fas fa-file"></i>
                        <a href="${file.url}" target="_blank">${file.name}</a>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        `;
        messagesList.appendChild(messageElement);
    });
    
    // Scroll para baixo da lista de mensagens
    messagesList.scrollTop = messagesList.scrollHeight;
    
    viewTicketModal.style.display = 'flex';
    messageForm.dataset.ticketId = ticketId;
}

function handleNewMessage(e) {
    e.preventDefault();
    const ticketId = messageForm.dataset.ticketId;
    const content = document.getElementById('messageContent').value;
    const filesInput = document.getElementById('messageFiles');
    
    if (!ticketId || !content) return;
    
    const messageFiles = Array.from(filesInput.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
    }));
    
    const newMessage = {
        id: 'msg' + Date.now(),
        content: content,
        date: new Date().toLocaleString('pt-BR'),
        userId: currentUser.id,
        files: messageFiles
    };
    
    if (!messages[ticketId]) {
        messages[ticketId] = [];
    }
    
    messages[ticketId].push(newMessage);
    localStorage.setItem('helpdesk_messages', JSON.stringify(messages));
    
    // Atualizar visualização
    viewTicket(ticketId);
    
    // Limpar formulário
    document.getElementById('messageContent').value = '';
    filesInput.value = '';
    messageFilePreview.innerHTML = '';
}

// Funções auxiliares
function generateTicketId() {
    const now = new Date();
    return `HD-${now.getFullYear()}-${String(tickets.length + 1).padStart(3, '0')}`;
}

function getStatusClass(status) {
    return {
        'open': 'status-open',
        'in-progress': 'status-in-progress',
        'resolved': 'status-resolved'
    }[status];
}

function getStatusText(status) {
    return {
        'open': 'Aberto',
        'in-progress': 'Em andamento',
        'resolved': 'Resolvido'
    }[status];
}

function getPriorityClass(priority) {
    return {
        'high': 'priority-high',
        'medium': 'priority-medium',
        'low': 'priority-low'
    }[priority];
}

function getPriorityText(priority) {
    return {
        'high': 'Alta',
        'medium': 'Média',
        'low': 'Baixa'
    }[priority];
}

function getCategoryText(category) {
    return {
        'hardware': 'Hardware',
        'software': 'Software',
        'network': 'Rede',
        'other': 'Outros'
    }[category];
}

function handleFileSelect(e) {
    filePreview.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showAlert('error', 'Arquivo muito grande. O tamanho máximo é 5MB.');
            return;
        }
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.innerHTML = `
            <i class="fas fa-file"></i>
            ${file.name} (${formatFileSize(file.size)})
            <button type="button" data-name="${file.name}">&times;</button>
        `;
        filePreview.appendChild(fileItem);
    });
    
    // Adicionar eventos aos botões de remover
    filePreview.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileName = btn.dataset.name;
            const dt = new DataTransfer();
            const input = document.getElementById('ticketFiles');
            
            Array.from(input.files).forEach(file => {
                if (file.name !== fileName) dt.items.add(file);
            });
            
            input.files = dt.files;
            btn.parentElement.remove();
        });
    });
}

function handleMessageFileSelect(e) {
    messageFilePreview.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showAlert('error', 'Arquivo muito grande. O tamanho máximo é 5MB.');
            return;
        }
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.innerHTML = `
            <i class="fas fa-file"></i>
            ${file.name} (${formatFileSize(file.size)})
            <button type="button" data-name="${file.name}">&times;</button>
        `;
        messageFilePreview.appendChild(fileItem);
    });
    
    // Adicionar eventos aos botões de remover
    messageFilePreview.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const fileName = btn.dataset.name;
            const dt = new DataTransfer();
            const input = document.getElementById('messageFiles');
            
            Array.from(input.files).forEach(file => {
                if (file.name !== fileName) dt.items.add(file);
            });
            
            input.files = dt.files;
            btn.parentElement.remove();
        });
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function setActiveMenuItem(item) {
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    item.classList.add('active');
}

function showDashboard() {
    DOM.mainContent.innerHTML = `
        <div class="dashboard">
            <h2><i class="fas fa-chart-bar"></i> Dashboard</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total de Chamados</h3>
                    <p>${tickets.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Chamados Abertos</h3>
                    <p>${tickets.filter(t => t.status === 'open').length}</p>
                </div>
                <div class="stat-card">
                    <h3>Em Andamento</h3>
                    <p>${tickets.filter(t => t.status === 'in-progress').length}</p>
                </div>
                <div class="stat-card">
                    <h3>Resolvidos</h3>
                    <p>${tickets.filter(t => t.status === 'resolved').length}</p>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="ticketsChart"></canvas>
            </div>
        </div>
    `;
    
    // Inicializar gráfico (simplificado)
    const ctx = document.getElementById('ticketsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Abertos', 'Em Andamento', 'Resolvidos'],
            datasets: [{
                label: 'Chamados por Status',
                data: [
                    tickets.filter(t => t.status === 'open').length,
                    tickets.filter(t => t.status === 'in-progress').length,
                    tickets.filter(t => t.status === 'resolved').length
                ],
                backgroundColor: [
                    '#f39c12',
                    '#3498db',
                    '#2ecc71'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}