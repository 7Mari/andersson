// Dados simulados (substituir por API real em produção)
let currentUser = null;
let tickets = [];
let messages = {};
let files = {};

// Elementos do DOM
const mainContent = document.getElementById('mainContent');
const btnNewTicket = document.getElementById('btnNewTicket');
const newTicketModal = document.getElementById('newTicketModal');
const closeModal = document.getElementById('closeModal');
const ticketForm = document.getElementById('ticketForm');
const viewTicketModal = document.getElementById('viewTicketModal');
const closeViewModal = document.getElementById('closeViewModal');
const ticketDetails = document.getElementById('ticketDetails');
const messagesList = document.getElementById('messagesList');
const messageForm = document.getElementById('messageForm');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const registerModal = document.getElementById('registerModal');
const registerForm = document.getElementById('registerForm');
const btnShowRegister = document.getElementById('btnShowRegister');
const btnShowLogin = document.getElementById('btnShowLogin');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const btnLogout = document.getElementById('btnLogout');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const filePreview = document.getElementById('filePreview');
const messageFilePreview = document.getElementById('messageFilePreview');
const btnTickets = document.getElementById('btnTickets');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se há usuário logado (simulado)
    const loggedUser = localStorage.getItem('helpdesk_user');
    if (loggedUser) {
        currentUser = JSON.parse(loggedUser);
        updateUserInfo();
        loadTickets();
    } else {
        showLoginModal();
    }
    
    // Carregar dados iniciais (simulado)
    if (!localStorage.getItem('helpdesk_tickets')) {
        const initialTickets = [
            {
                id: "HD-2023-001",
                title: "Computador não liga",
                description: "Ao pressionar o botão de ligar, o computador não dá nenhum sinal de vida. Já verifiquei a conexão da energia e está tudo ok.",
                date: "15/10/2023",
                status: "open",
                priority: "high",
                category: "hardware",
                userId: "user1",
                files: []
            },
            {
                id: "HD-2023-002",
                title: "Problema com acesso ao sistema",
                description: "Não consigo acessar o sistema interno da empresa. Aparece a mensagem 'Credenciais inválidas' mesmo com a senha correta.",
                date: "12/10/2023",
                status: "in-progress",
                priority: "medium",
                category: "software",
                userId: "user1",
                files: []
            },
            {
                id: "HD-2023-003",
                title: "Internet lenta",
                description: "A conexão com a internet está extremamente lenta há dois dias, dificultando o trabalho.",
                date: "08/10/2023",
                status: "resolved",
                priority: "low",
                category: "network",
                userId: "user2",
                files: []
            }
        ];
        localStorage.setItem('helpdesk_tickets', JSON.stringify(initialTickets));
    }
    
    if (!localStorage.getItem('helpdesk_messages')) {
        const initialMessages = {
            "HD-2023-001": [
                {
                    id: "msg1",
                    content: "Olá, já verifiquei o cabo de energia e está tudo conectado corretamente.",
                    date: "15/10/2023 10:30",
                    userId: "user1",
                    files: []
                },
                {
                    id: "msg2",
                    content: "Vou verificar o equipamento. Por favor, me informe a marca e modelo do computador.",
                    date: "15/10/2023 11:15",
                    userId: "tech1",
                    files: []
                }
            ]
        };
        localStorage.setItem('helpdesk_messages', JSON.stringify(initialMessages));
    }
});

// Funções de autenticação
function showLoginModal() {
    loginModal.style.display = 'flex';
    registerModal.style.display = 'none';
}

function showRegisterModal() {
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulação de login
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Em produção, fazer requisição para API de login
    if (email && password) {
        // Simulando usuário logado
        currentUser = {
            id: "user1",
            name: "João Silva",
            email: email,
            role: "user"
        };
        
        localStorage.setItem('helpdesk_user', JSON.stringify(currentUser));
        updateUserInfo();
        loginModal.style.display = 'none';
        loadTickets();
    }
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulação de registro
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (password !== confirmPassword) {
        alert("As senhas não coincidem!");
        return;
    }
    
    // Em produção, fazer requisição para API de registro
    if (name && email && password) {
        alert("Registro realizado com sucesso! Faça login para continuar.");
        showLoginModal();
        registerForm.reset();
    }
});

btnShowRegister.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterModal();
});

btnShowLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginModal();
});

btnLogout.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('helpdesk_user');
    window.location.reload();
});

function updateUserInfo() {
    if (currentUser) {
        userName.textContent = currentUser.name;
        userAvatar.textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
}

// Funções de tickets
function loadTickets() {
    // Em produção, fazer requisição para API
    tickets = JSON.parse(localStorage.getItem('helpdesk_tickets')) || [];
    messages = JSON.parse(localStorage.getItem('helpdesk_messages')) || {};
    
    renderTicketsList();
}

function renderTicketsList(filter = 'all') {
    let filteredTickets = tickets;
    
    if (currentUser.role === 'user') {
        filteredTickets = tickets.filter(ticket => ticket.userId === currentUser.id);
    }
    
    if (filter !== 'all') {
        filteredTickets = filteredTickets.filter(ticket => ticket.status === filter);
    }
    
    mainContent.innerHTML = `
        <div class="tickets-header">
            <h2 class="tickets-title">Meus Chamados</h2>
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
        ticketsList.innerHTML = '<p>Nenhum chamado encontrado.</p>';
    } else {
        filteredTickets.forEach(ticket => {
            const ticketItem = document.createElement('li');
            ticketItem.className = 'ticket-item';
            ticketItem.dataset.id = ticket.id;
            
            const statusClasses = {
                'open': 'status-open',
                'in-progress': 'status-in-progress',
                'resolved': 'status-resolved'
            };
            
            const priorityClasses = {
                'high': 'priority-high',
                'medium': 'priority-medium',
                'low': 'priority-low'
            };
            
            const statusText = {
                'open': 'Aberto',
                'in-progress': 'Em andamento',
                'resolved': 'Resolvido'
            };
            
            const priorityText = {
                'high': 'Alta',
                'medium': 'Média',
                'low': 'Baixa'
            };
            
            ticketItem.innerHTML = `
                <div class="ticket-header">
                    <span class="ticket-id">${ticket.id}</span>
                    <span class="ticket-date">${ticket.date}</span>
                </div>
                <h3 class="ticket-title">${ticket.title}</h3>
                <p class="ticket-description">${ticket.description}</p>
                <div class="ticket-footer">
                    <span class="ticket-status ${statusClasses[ticket.status]}">${statusText[ticket.status]}</span>
                    <span class="ticket-priority ${priorityClasses[ticket.priority]}">Prioridade: ${priorityText[ticket.priority]}</span>
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

btnTickets.addEventListener('click', (e) => {
    e.preventDefault();
    loadTickets();
});

// Modal de novo ticket
btnNewTicket.addEventListener('click', (e) => {
    e.preventDefault();
    newTicketModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    newTicketModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === newTicketModal) {
        newTicketModal.style.display = 'none';
    }
    if (e.target === viewTicketModal) {
        viewTicketModal.style.display = 'none';
    }
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
    if (e.target === registerModal) {
        registerModal.style.display = 'none';
    }
});

// Preview de arquivos
document.getElementById('ticketFiles').addEventListener('change', handleFileSelect);
document.getElementById('messageFiles').addEventListener('change', handleMessageFileSelect);

function handleFileSelect(e) {
    filePreview.innerHTML = '';
    Array.from(e.target.files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert('Arquivo muito grande. O tamanho máximo é 5MB.');
            return;
        }
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.innerHTML = `
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
            alert('Arquivo muito grande. O tamanho máximo é 5MB.');
            return;
        }
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-preview-item';
        fileItem.innerHTML = `
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

// Formulário de ticket
ticketForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Em produção, enviar para API
    const newId = `HD-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(3, '0')}`;
    const filesInput = document.getElementById('ticketFiles');
    const ticketFiles = Array.from(filesInput.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // Em produção, enviar arquivo para servidor e guardar apenas a referência
        url: URL.createObjectURL(file)
    }));
    
    const newTicket = {
        id: newId,
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
    
    newTicketModal.style.display = 'none';
    ticketForm.reset();
    filePreview.innerHTML = '';
    
    renderTicketsList();
    alert(`Chamado ${newId} criado com sucesso!`);
});

// Visualização de ticket
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

closeViewModal.addEventListener('click', () => {
    viewTicketModal.style.display = 'none';
});

// Formulário de mensagem
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticketId = messageForm.dataset.ticketId;
    const content = document.getElementById('messageContent').value;
    const filesInput = document.getElementById('messageFiles');
    
    if (!ticketId || !content) return;
    
    // Em produção, enviar para API
    const messageFiles = Array.from(filesInput.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // Em produção, enviar arquivo para servidor e guardar apenas a referência
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
});

// Funções auxiliares
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