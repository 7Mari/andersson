// Banco de dados simulado
let graficoStatus = null;
let graficoCategorias = null;
let usuariosDB = JSON.parse(localStorage.getItem('usuariosDB')) || [];
let chamadosDB = JSON.parse(localStorage.getItem('chamadosDB')) || [];
let usuarioLogado = null;
let interacaoEditando = null;

// Elementos da página de login/cadastro
const loginContainer = document.getElementById('loginContainer');
const loginBox = document.getElementById('loginBox');
const registerBox = document.getElementById('registerBox');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

// Elementos do dashboard
const dashboardContainer = document.getElementById('dashboardContainer');
const userNameDisplay = document.getElementById('userNameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const todosChamadosLink = document.getElementById('todosChamadosLink');

// Eventos de navegação entre login e cadastro
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginBox.style.display = 'none';
    registerBox.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerBox.style.display = 'none';
    loginBox.style.display = 'block';
});

// Evento de login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const senha = document.getElementById('loginSenha').value.trim();
    
    if (!email || !senha) {
        showMessage(loginMessage, 'Por favor, preencha todos os campos', 'error');
        return;
    }
    
    const usuario = usuariosDB.find(user => user.email === email && user.senha === senha);
    
    if (usuario) {
        usuarioLogado = usuario;
        sessionStorage.setItem('usuarioLogado', JSON.stringify(usuario));
        entrarNoDashboard();
    } else {
        showMessage(loginMessage, 'E-mail ou senha incorretos', 'error');
    }
});

// Evento de cadastro
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('registerNome').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const senha = document.getElementById('registerSenha').value.trim();
    const tipo = document.getElementById('registerTipo').value;
    
    if (!nome || !email || !senha || !tipo) {
        showMessage(registerMessage, 'Por favor, preencha todos os campos', 'error');
        return;
    }
    
    const emailExiste = usuariosDB.some(user => user.email === email);
    
    if (emailExiste) {
        showMessage(registerMessage, 'Este e-mail já está cadastrado', 'error');
        return;
    }
    
    const novoUsuario = {
        id: Date.now().toString(),
        nome,
        email,
        senha,
        tipo
    };
    
    usuariosDB.push(novoUsuario);
    localStorage.setItem('usuariosDB', JSON.stringify(usuariosDB));
    
    showMessage(registerMessage, 'Cadastro realizado com sucesso!', 'success');
    registerForm.reset();
    
    // Mostrar formulário de login após cadastro
    setTimeout(() => {
        registerBox.style.display = 'none';
        loginBox.style.display = 'block';
        registerMessage.textContent = '';
        registerMessage.className = 'message';
    }, 2000);
});

// Função para entrar no dashboard
function entrarNoDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
    
    userNameDisplay.textContent = usuarioLogado.nome;
    
    // Ocultar/mostrar itens conforme tipo de usuário
    if (usuarioLogado.tipo === 'cliente') {
        document.querySelector('[data-section="abrir-chamado"]').parentElement.style.display = 'block';
        document.querySelector('[data-section="meus-chamados"]').parentElement.style.display = 'block';
        document.querySelector('[data-section="todos-chamados"]').parentElement.style.display = 'none';
        document.querySelector('[data-section="relatorios-tecnico"]').parentElement.style.display = 'none';
        
        document.querySelector('[data-section="meus-chamados"]').classList.add('active');
    } else {
        // Para técnicos
        document.querySelector('[data-section="abrir-chamado"]').parentElement.style.display = 'none';
        document.querySelector('[data-section="meus-chamados"]').parentElement.style.display = 'none';
        document.querySelector('[data-section="todos-chamados"]').parentElement.style.display = 'block';
        document.querySelector('[data-section="relatorios-tecnico"]').parentElement.style.display = 'block';
        
        document.querySelector('[data-section="todos-chamados"]').classList.add('active');
    }
    
    carregarChamados();
}

function carregarPainelAdmin() {
    if (!document.getElementById('painel-admin').classList.contains('active')) return;
    
    // Carregar técnicos no filtro
    const filtroTecnico = document.getElementById('filtroTecnicoAdmin');
    filtroTecnico.innerHTML = '<option value="todos">Todos Técnicos</option>';
    
    const tecnicos = usuariosDB.filter(u => u.tipo === 'tecnico');
    tecnicos.forEach(tecnico => {
        const option = document.createElement('option');
        option.value = tecnico.id;
        option.textContent = tecnico.nome;
        filtroTecnico.appendChild(option);
    });
    
    // Aplicar filtros
    document.getElementById('aplicarFiltroAdmin').addEventListener('click', aplicarFiltrosAdmin);
    
    // Carregar dados iniciais
    atualizarPainelAdmin();
}


// Evento de logout
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('usuarioLogado');
    usuarioLogado = null;
    dashboardContainer.style.display = 'none';
    loginContainer.style.display = 'block';
    loginForm.reset();
});

// Verificar se há usuário logado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const usuarioSalvo = sessionStorage.getItem('usuarioLogado');

    if (usuarioSalvo) {
        usuarioLogado = JSON.parse(usuarioSalvo);
        entrarNoDashboard();
    }
});

// Navegação entre seções do dashboard
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        // Verificar permissões
        if (usuarioLogado.tipo === 'cliente' && 
            (link.getAttribute('data-section') === 'todos-chamados' || 
             link.getAttribute('data-section') === 'relatorios-tecnico')) {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();

        // Atualizar navegação
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const sectionId = link.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
        
        // Carregar conteúdo apropriado
        if (sectionId === 'meus-chamados' || sectionId === 'todos-chamados') {
            carregarChamados();
        } else if (sectionId === 'relatorios-tecnico') {
            carregarRelatoriosTecnico();
        }
    });
});

// Função para mostrar mensagens
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'message ' + type;
    
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 5000);
}

// ========== LÓGICA DE CHAMADOS ========== //

// Elementos do dashboard
const novoChamadoForm = document.getElementById('novoChamadoForm');
const listaMeusChamados = document.getElementById('listaMeusChamados');
const listaTodosChamados = document.getElementById('listaTodosChamados');
const chamadoModal = document.getElementById('chamadoModal');
const closeModal = document.querySelector('.close-modal');

// Evento para abrir novo chamado
if (novoChamadoForm) {
    novoChamadoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('chamadoTitulo').value.trim();
        const descricao = document.getElementById('chamadoDescricao').value.trim();
        const urgencia = document.getElementById('chamadoUrgencia').value;
        const categoria = document.getElementById('chamadoCategoria').value;

        if (!titulo || !descricao) {
            showMessage(document.getElementById('chamadoMessage'), 'Por favor, preencha todos os campos', 'error');
            return;
        }

        // Verificar se é técnico (proteção adicional)
        if (usuarioLogado.tipo === 'tecnico') {
            showMessage(document.getElementById('chamadoMessage'), 'Técnicos não podem abrir chamados', 'error');
            return;
        }
        
        const novoChamado = {
            id: Date.now().toString(),
            titulo,
            descricao,
            urgencia,
            categoria,
            status: 'aberto',
            cliente: {
                id: usuarioLogado.id,
                nome: usuarioLogado.nome,
                email: usuarioLogado.email
            },
            tecnico: null,
            dataAbertura: new Date().toISOString(),
            interacoes: []
        };
        
        chamadosDB.push(novoChamado);
        localStorage.setItem('chamadosDB', JSON.stringify(chamadosDB));
        
        showMessage(document.getElementById('chamadoMessage'), 'Chamado aberto com sucesso!', 'success');
        novoChamadoForm.reset();
        carregarChamados();
    });
}

// Carregar chamados
function carregarChamados() {
    if (!usuarioLogado) return;
    
    // Verificar qual seção está ativa
    const meusChamadosAtivo = document.getElementById('meus-chamados').classList.contains('active');
    const todosChamadosAtivo = document.getElementById('todos-chamados').classList.contains('active');
    
    if (meusChamadosAtivo && listaMeusChamados) {
        aplicarFiltroMeusChamados();
    }
    
    if (todosChamadosAtivo && listaTodosChamados && usuarioLogado.tipo === 'tecnico') {
        aplicarFiltroTodosChamados();
    }
}

// Variáveis para os gráficos
let graficoMeusStatus = null;
let graficoMinhasCategorias = null;

// Adicione esta função para carregar os relatórios
function carregarRelatoriosTecnico() {
    if (!document.getElementById('relatorios-tecnico').classList.contains('active')) return;
    
    // Configurar filtros
    document.getElementById('aplicarFiltroRelatorio').addEventListener('click', atualizarRelatoriosTecnico);
    
    // Carregar dados iniciais
    atualizarRelatoriosTecnico();
}

// Função para atualizar os relatórios com os filtros
function atualizarRelatoriosTecnico() {
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;
    
    // Filtrar apenas os chamados do técnico logado
    let meusChamados = chamadosDB.filter(c => c.tecnico && c.tecnico.id === usuarioLogado.id);
    
    // Aplicar filtros de data
    if (dataInicio) {
        meusChamados = meusChamados.filter(c => {
            const dataAbertura = new Date(c.dataAbertura);
            const dataInicioObj = new Date(dataInicio);
            return dataAbertura >= dataInicioObj;
        });
    }
    
    if (dataFim) {
        meusChamados = meusChamados.filter(c => {
            const dataAbertura = new Date(c.dataAbertura);
            const dataFimObj = new Date(dataFim);
            dataFimObj.setDate(dataFimObj.getDate() + 1); // Inclui o dia final
            return dataAbertura <= dataFimObj;
        });
    }
    
    // Calcular estatísticas
    const meusAbertos = meusChamados.filter(c => c.status === 'aberto').length;
    const meusAndamento = meusChamados.filter(c => c.status === 'andamento').length;
    const meusResolvidos = meusChamados.filter(c => c.status === 'resolvido').length;
    
    // Calcular tempo médio de resolução (em horas)
    let tempoTotal = 0;
    let chamadosResolvidosComTempo = 0;
    
    meusChamados.forEach(c => {
        if (c.status === 'resolvido' && c.interacoes.length > 0) {
            const dataAbertura = new Date(c.dataAbertura);
            const dataResolucao = new Date(c.interacoes[c.interacoes.length - 1].data);
            const diferenca = dataResolucao - dataAbertura;
            tempoTotal += diferenca / (1000 * 60 * 60); // Converter para horas
            chamadosResolvidosComTempo++;
        }
    });
    
    const tempoMedio = chamadosResolvidosComTempo > 0 ? (tempoTotal / chamadosResolvidosComTempo).toFixed(1) : 0;
    
    // Atualizar estatísticas na tela
    document.getElementById('meusAbertos').textContent = meusAbertos;
    document.getElementById('meusAndamento').textContent = meusAndamento;
    document.getElementById('meusResolvidos').textContent = meusResolvidos;
    document.getElementById('meuTempoMedio').textContent = `${tempoMedio}h`;
    
    // Atualizar gráficos
    atualizarGraficosTecnico(meusChamados);
}

// Função para atualizar os gráficos do técnico
function atualizarGraficosTecnico(chamados) {
    // Dados para gráfico de status
    const statusCounts = {
        aberto: chamados.filter(c => c.status === 'aberto').length,
        andamento: chamados.filter(c => c.status === 'andamento').length,
        resolvido: chamados.filter(c => c.status === 'resolvido').length
    };
    
    // Dados para gráfico de categorias
    const categoriasCounts = {
        hardware: chamados.filter(c => c.categoria === 'hardware').length,
        software: chamados.filter(c => c.categoria === 'software').length,
        rede: chamados.filter(c => c.categoria === 'rede').length
    };
    
    // Configurações dos gráficos
    const ctxStatus = document.getElementById('graficoMeusStatus').getContext('2d');
    const ctxCategorias = document.getElementById('graficoMinhasCategorias').getContext('2d');
    
    // Destruir gráficos existentes
    if (graficoMeusStatus) graficoMeusStatus.destroy();
    if (graficoMinhasCategorias) graficoMinhasCategorias.destroy();
    
    // Criar gráfico de status
    graficoMeusStatus = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Abertos', 'Em Andamento', 'Resolvidos'],
            datasets: [{
                data: [statusCounts.aberto, statusCounts.andamento, statusCounts.resolvido],
                backgroundColor: [
                    '#cf5a4d',
                    '#f0bf70',
                    '#2ecc71'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Criar gráfico de categorias
    graficoMinhasCategorias = new Chart(ctxCategorias, {
        type: 'bar',
        data: {
            labels: ['Hardware', 'Software', 'Rede'],
            datasets: [{
                label: 'Chamados por Categoria',
                data: [categoriasCounts.hardware, categoriasCounts.software, categoriasCounts.rede],
                backgroundColor: [
                    '#7d6aaa',
                    '#6a8aaa',
                    '#6aaa7d'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Função simplificada para aplicar filtro aos meus chamados
function aplicarFiltroMeusChamados() {
    if (!usuarioLogado || !listaMeusChamados) return;
    
    const filtroStatus = document.getElementById('filtroStatus')?.value || 'todos';
    const filtroCategoria = document.getElementById('filtroCategoria')?.value || 'todos';

    let chamadosFiltrados = chamadosDB.filter(chamado => {
        // Verificar se o chamado pertence ao usuário logado
        const pertenceAoUsuario = chamado.cliente.id === usuarioLogado.id || 
                                (usuarioLogado.tipo === 'tecnico' && chamado.tecnico?.id === usuarioLogado.id);
        
        // Aplicar filtro de status
        const statusMatch = filtroStatus === 'todos' || chamado.status === filtroStatus;
        
        // Aplicar filtro de categoria
        const categoriaMatch = filtroCategoria === 'todos' || chamado.categoria === filtroCategoria;
        
        return pertenceAoUsuario && statusMatch && categoriaMatch;
    });
    
    // Ordenar por data (mais recente primeiro)
    chamadosFiltrados.sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));
    
    // Renderizar chamados
    renderizarChamados(listaMeusChamados, chamadosFiltrados);
}

// Função simplificada para aplicar filtro a todos os chamados (para técnicos)
function aplicarFiltroTodosChamados() {
    if (!usuarioLogado || usuarioLogado.tipo !== 'tecnico' || !listaTodosChamados) return;
    
    const filtroStatus = document.getElementById('filtroStatusTodos')?.value || 'todos';
    const filtroCategoria = document.getElementById('filtroCategoriaTodos')?.value || 'todos';

    // Filtrar todos os chamados (não apenas os do usuário)
    let chamadosFiltrados = [...chamadosDB];
    
    // Aplicar filtro de status se não for "todos"
    if (filtroStatus !== 'todos') {
        chamadosFiltrados = chamadosFiltrados.filter(chamado => chamado.status === filtroStatus);
    }

    // Aplicar filtro de categoria se não for "todos"
    if (filtroCategoria !== 'todos') {
        chamadosFiltrados = chamadosFiltrados.filter(chamado => chamado.categoria === filtroCategoria);
    }
    
    // Ordenar por data (mais recente primeiro)
    chamadosFiltrados.sort((a, b) => new Date(b.dataAbertura) - new Date(a.dataAbertura));
    
    // Renderizar chamados
    renderizarChamados(listaTodosChamados, chamadosFiltrados);
}

// Função para renderizar chamados em uma lista
function renderizarChamados(elementoLista, chamados) {
    if (!elementoLista) {
        console.error("Elemento lista não encontrado");
        return;
    }
    
    console.log("Chamados para renderizar:", chamados); // Debug
    
    if (!chamados || chamados.length === 0) {
        elementoLista.innerHTML = '<p class="no-results">Nenhum chamado encontrado</p>';
        return;
    }
    
    elementoLista.innerHTML = chamados.map(chamado => {
        try {
            return criarCardChamado(chamado);
        } catch (e) {
            console.error("Erro ao criar card para chamado:", chamado, e);
            return "";
        }
    }).join('');
    
    // Adicionar eventos de clique
    elementoLista.querySelectorAll('.chamado-card').forEach(card => {
        card.addEventListener('click', () => {
            const chamadoId = card.getAttribute('data-id');
            abrirModalChamado(chamadoId);
        });
    });
}

// Criar card de chamado
function criarCardChamado(chamado) {
    const statusClass = `status-${chamado.status}`;
    const urgenciaText = chamado.urgencia.charAt(0).toUpperCase() + chamado.urgencia.slice(1);
    const categoriaText = chamado.categoria.charAt(0).toUpperCase() + chamado.categoria.slice(1);
    const dataFormatada = new Date(chamado.dataAbertura).toLocaleDateString();
    
    return `
        <div class="chamado-card" data-id="${chamado.id}">
            <div class="chamado-header">
                <span class="chamado-titulo">${chamado.titulo}</span>
                <span class="chamado-status ${statusClass}">${formatarStatus(chamado.status)}</span>
            </div>
            <div class="chamado-info">
                <span class="chamado-urgencia">Urgência: ${urgenciaText}</span>
                <span class="chamado-categoria">Categoria: ${categoriaText}</span>
            </div>
            <div class="chamado-descricao">${chamado.descricao.substring(0, 100)}${chamado.descricao.length > 100 ? '...' : ''}</div>
            <div class="chamado-data">Aberto em: ${dataFormatada}</div>
        </div>
    `;
}

// Formatador de status
function formatarStatus(status) {
    const statusMap = {
        aberto: 'Aberto',
        andamento: 'Em Andamento',
        resolvido: 'Resolvido'
    };
    return statusMap[status] || status;
}

function formatarTipoUsuario(tipo) {
    const tipos = {
        tecnico: 'técnico',
        cliente: 'cliente'
    };
    return tipos[tipo] || tipo;
}

// Função para remover uma interação
function removerInteracao(chamadoId, interacaoIndex) {
    const chamadoIndex = chamadosDB.findIndex(c => c.id === chamadoId);
    if (chamadoIndex === -1) return false;

    const chamado = chamadosDB[chamadoIndex];
    if (interacaoIndex < 0 || interacaoIndex >= chamado.interacoes.length) return false;

    const interacao = chamado.interacoes[interacaoIndex];
    
    // Verificar permissões
    const podeRemover = usuarioLogado.tipo === 'tecnico' || 
                      (usuarioLogado.id === interacao.autor.id && usuarioLogado.tipo === interacao.autor.tipo);
    
    if (!podeRemover) {
        alert('Você não tem permissão para remover esta interação');
        return false;
    }

    // Remover a interação
    chamado.interacoes.splice(interacaoIndex, 1);
    localStorage.setItem('chamadosDB', JSON.stringify(chamadosDB));
    
    // Atualizar o modal
    abrirModalChamado(chamadoId);
    return true;
}

// Função para editar uma interação
function editarInteracao(chamadoId, interacaoIndex) {
    const chamado = chamadosDB.find(c => c.id === chamadoId);
    if (!chamado) return false;

    if (interacaoIndex < 0 || interacaoIndex >= chamado.interacoes.length) return false;

    const interacao = chamado.interacoes[interacaoIndex];
    
    // Verificar permissões
    const podeEditar = usuarioLogado.id === interacao.autor.id && usuarioLogado.tipo === interacao.autor.tipo;
    
    if (!podeEditar) {
        alert('Você só pode editar suas próprias interações');
        return false;
    }

    // Armazenar a interação que está sendo editada
    interacaoEditando = { chamadoId, interacaoIndex };
    
    // Preencher o formulário com a mensagem atual
    document.getElementById('interacaoMensagem').value = interacao.mensagem;
    
    // Alterar o botão para "Atualizar"
    const form = document.getElementById('interacaoChamadoForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Atualizar';
    
    // Remover o listener antigo se existir
    form.replaceWith(form.cloneNode(true));
    
    // Adicionar novo listener
    document.getElementById('interacaoChamadoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        atualizarInteracao();
    });
    
    return true;
}

// Função para atualizar uma interação
function atualizarInteracao() {
    if (!interacaoEditando) return false;
    
    const { chamadoId, interacaoIndex } = interacaoEditando;
    const chamado = chamadosDB.find(c => c.id === chamadoId);
    if (!chamado) return false;

    const mensagem = document.getElementById('interacaoMensagem').value.trim();
    if (!mensagem) return false;

    // Atualizar a mensagem
    chamado.interacoes[interacaoIndex].mensagem = mensagem;
    chamado.interacoes[interacaoIndex].data = new Date().toISOString(); // Atualizar data
    
    localStorage.setItem('chamadosDB', JSON.stringify(chamadosDB));
    
    // Resetar o estado de edição
    interacaoEditando = null;
    
    // Atualizar o modal
    abrirModalChamado(chamadoId);
    return true;
}

// Abrir modal com detalhes do chamado
function abrirModalChamado(chamadoId) {
    const chamado = chamadosDB.find(c => c.id === chamadoId);
    if (!chamado) return;
    
    document.getElementById('modalTitulo').textContent = chamado.titulo;
    
    const urgenciaText = chamado.urgencia.charAt(0).toUpperCase() + chamado.urgencia.slice(1);
    const categoriaText = chamado.categoria.charAt(0).toUpperCase() + chamado.categoria.slice(1);
    const dataFormatada = new Date(chamado.dataAbertura).toLocaleString();
    
    document.getElementById('modalConteudo').innerHTML = `
        <div class="chamado-info">
            <p><strong>Status:</strong> <span class="status-${chamado.status}">${formatarStatus(chamado.status)}</span></p>
            <p><strong>Urgência:</strong> ${urgenciaText}</p>
            <p><strong>Categoria:</strong> ${categoriaText}</p>
            <p><strong>Aberto em:</strong> ${dataFormatada}</p>
            <p><strong>Cliente:</strong> ${chamado.cliente.nome}</p>
            ${chamado.tecnico ? `<p><strong>Técnico responsável:</strong> ${chamado.tecnico.nome}</p>` : ''}
        </div>
        <div class="chamado-descricao-completa">
            <h3>Descrição completa</h3>
            <p>${chamado.descricao}</p>
        </div>
        <div class="chamado-interacoes">
            <h3>Histórico de Interações</h3>
            ${chamado.interacoes.length > 0 ? 
                chamado.interacoes.map((interacao, index) => `
                    <div class="interacao-item">
                        <div class="interacao-header">
                            <div class="interacao-autor ${interacao.autor.tipo === 'tecnico' ? 'interacao-tecnico' : ''}">
                                ${interacao.autor.nome} (${formatarTipoUsuario(interacao.autor.tipo)})
                            </div>
                            <div class="interacao-data">
                                ${new Date(interacao.data).toLocaleString()}
                            </div>
                            ${(usuarioLogado.id === interacao.autor.id && usuarioLogado.tipo === interacao.autor.tipo) ? 
                                `<div class="interacao-acoes">
                                    <button class="btn-editar-interacao" data-chamado-id="${chamadoId}" data-interacao-index="${index}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-remover-interacao" data-chamado-id="${chamadoId}" data-interacao-index="${index}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>` : ''}
                        </div>
                        <div class="interacao-mensagem">
                            ${interacao.mensagem}
                        </div>
                    </div>
                `).join('') : 
                '<p>Nenhuma interação registrada ainda.</p>'}
        </div>
    `;
    
    // Mostrar modal
    chamadoModal.style.display = 'flex';

    // Adicionar eventos aos botões de remoção
    document.querySelectorAll('.btn-remover-interacao').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chamadoId = btn.getAttribute('data-chamado-id');
            const interacaoIndex = parseInt(btn.getAttribute('data-interacao-index'));
            
            if (confirm('Tem certeza que deseja remover esta interação?')) {
                removerInteracao(chamadoId, interacaoIndex);
            }
        });
    });

    // Adicionar eventos aos botões de edição
    document.querySelectorAll('.btn-editar-interacao').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const chamadoId = btn.getAttribute('data-chamado-id');
            const interacaoIndex = parseInt(btn.getAttribute('data-interacao-index'));
            editarInteracao(chamadoId, interacaoIndex);
        });
    });

    // Limpar área de interação
    document.getElementById('modalInteracao').innerHTML = '';

    // Se for técnico

    
    if (usuarioLogado.tipo === 'tecnico') {
        if (chamado.status === 'aberto') {
            // Botão para assumir chamado
            document.getElementById('modalInteracao').innerHTML = `
                <form id="assumirChamadoForm">
                    <button type="submit" class="btn">Assumir Chamado</button>
                </form>
            `;
            
            document.getElementById('assumirChamadoForm').addEventListener('submit', (e) => {
                e.preventDefault();
                assumirChamado(chamadoId);
            });
        } else if (chamado.status === 'andamento' && chamado.tecnico.id === usuarioLogado.id) {
            // Área para interação e resolução
            document.getElementById('modalInteracao').innerHTML = `
                <form id="interacaoChamadoForm">
                    <div class="form-group">
                        <label for="interacaoMensagem">Adicionar Interação:</label>
                        <textarea id="interacaoMensagem" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn">Enviar Interação</button>
                        <button type="button" id="resolverChamadoBtn" class="btn">Resolver Chamado</button>
                    </div>
                </form>
            `;
            
            document.getElementById('interacaoChamadoForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const mensagem = document.getElementById('interacaoMensagem').value.trim();
                if (mensagem) {
                    if (interacaoEditando) {
                        atualizarInteracao();
                    } else {
                        adicionarInteracao(chamadoId, mensagem);
                    }
                }
            });
            
            document.getElementById('resolverChamadoBtn').addEventListener('click', () => {
                resolverChamado(chamadoId);
            });
        }
    } else if (usuarioLogado.tipo === 'cliente' && chamado.cliente.id === usuarioLogado.id) {
        // Cliente pode adicionar comentário se chamado não estiver resolvido
        if (chamado.status !== 'resolvido') {
            document.getElementById('modalInteracao').innerHTML = `
                <form id="interacaoChamadoForm">
                    <div class="form-group">
                        <label for="interacaoMensagem">Adicionar Comentário:</label>
                        <textarea id="interacaoMensagem" rows="3" required></textarea>
                    </div>
                    <button type="submit" class="btn">${interacaoEditando ? 'Atualizar' : 'Enviar Comentário'}</button>
                </form>
            `;
            
            document.getElementById('interacaoChamadoForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const mensagem = document.getElementById('interacaoMensagem').value.trim();
                if (mensagem) {
                    if (interacaoEditando) {
                        atualizarInteracao();
                    } else {
                        adicionarInteracao(chamadoId, mensagem);
                    }
                }
            });
        }
    }
}

// Fechar modal
closeModal.addEventListener('click', () => {
    chamadoModal.style.display = 'none';
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target === chamadoModal) {
        chamadoModal.style.display = 'none';
    }
});

// Técnico assume o chamado
function assumirChamado(chamadoId) {
    const chamadoIndex = chamadosDB.findIndex(c => c.id === chamadoId);
    if (chamadoIndex === -1) return;
    
    // Atualizar status e técnico responsável
    chamadosDB[chamadoIndex].status = 'andamento';
    chamadosDB[chamadoIndex].tecnico = {
        id: usuarioLogado.id,
        nome: usuarioLogado.nome,
        email: usuarioLogado.email
    };
    
    // Adicionar interação automática
    chamadosDB[chamadoIndex].interacoes.push({
        autor: {
            id: usuarioLogado.id,
            nome: usuarioLogado.nome,
            tipo: usuarioLogado.tipo
        },
        mensagem: 'Chamado assumido pelo técnico.',
        data: new Date().toISOString()
    });
    
    localStorage.setItem('chamadosDB', JSON.stringify(chamadosDB));
    
    // Atualizar interface
    abrirModalChamado(chamadoId);
    carregarChamados();
}

// Adicionar interação ao chamado
function adicionarInteracao(chamadoId, mensagem) {
    const chamadoIndex = chamadosDB.findIndex(c => c.id === chamadoId);
    if (chamadoIndex === -1) return;
    
    chamadosDB[chamadoIndex].interacoes.push({
        autor: {
            id: usuarioLogado.id,
            nome: usuarioLogado.nome,
            tipo: usuarioLogado.tipo
        },
        mensagem,
        data: new Date().toISOString()
    });
    
    localStorage.setItem('chamadosDB', JSON.stringify(chamadosDB));
    
    // Atualizar modal e limpar campo
    abrirModalChamado(chamadoId);
    document.getElementById('interacaoMensagem').value = '';
}

// Técnico resolve o chamado
function resolverChamado(chamadoId) {
    const chamadoIndex = chamadosDB.findIndex(c => c.id === chamadoId);
    if (chamadoIndex === -1) return;
    
    // Atualizar status
    chamadosDB[chamadoIndex].status = 'resolvido';
    
    // Adicionar interação automática
    chamadosDB[chamadoIndex].interacoes.push({
        autor: {
            id: usuarioLogado.id,
            nome: usuarioLogado.nome,
            tipo: usuarioLogado.tipo
        },
        mensagem: 'Chamado resolvido pelo técnico.',
        data: new Date().toISOString()
    });
    
    localStorage.setItem('chamadosDB', JSON.stringify(chamadosDB));
    
    // Atualizar interface
    abrirModalChamado(chamadoId);
    carregarChamados();
}

// Eventos de filtro
document.addEventListener('DOMContentLoaded', () => {
    // Evento para filtro de "Meus Chamados"
    document.getElementById('filtroStatus')?.addEventListener('change', () => {
        aplicarFiltroMeusChamados();
    });

    document.getElementById('filtroCategoria')?.addEventListener('change', () => {
        aplicarFiltroMeusChamados();
    });
    
    // Evento para filtro de "Todos os Chamados"
    document.getElementById('filtroStatusTodos')?.addEventListener('change', () => {
        aplicarFiltroTodosChamados();
    });

    document.getElementById('filtroCategoriaTodos')?.addEventListener('change', () => {
        aplicarFiltroTodosChamados();
    });
});