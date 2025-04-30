const API_BASE_URL = 'http://localhost:3000';

// Elementos do formulário de localidade
const formLocalidade = document.getElementById('formLocalidade');
const nomeInput = document.getElementById('nome');
const estadoInput = document.getElementById('estado');
const paisInput = document.getElementById('pais');
const localidadeMessage = document.getElementById('localidadeMessage');

// Elementos do formulário de registro
const formRegistro = document.getElementById('formRegistro');
const localidadeIdSelect = document.getElementById('localidadeId');
const dataInput = document.getElementById('data');
const horarioInput = document.getElementById('horario');
const temperaturaInput = document.getElementById('temperatura');
const registroMessage = document.getElementById('registroMessage');

// Elementos da seção de visualização
const filtroLocalidadeSelect = document.getElementById('filtroLocalidade');
const btnAtualizar = document.getElementById('btnAtualizar');
const registrosContainer = document.getElementById('registrosContainer');

// Carrega as localidades ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    carregarLocalidades();
    carregarRegistros();
    
    // Define a data atual como padrão
    const hoje = new Date().toISOString().split('T')[0];
    dataInput.value = hoje;
    
    // Define o horário atual como padrão
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    horarioInput.value = `${horas}:${minutos}`;
});

// Formulário de cadastro de localidade
formLocalidade.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = nomeInput.value;
    const estado = estadoInput.value;
    const pais = paisInput.value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/localidade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, estado, pais })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(localidadeMessage, 'Localidade cadastrada com sucesso!', 'success');
            formLocalidade.reset();
            carregarLocalidades();
        } else {
            showMessage(localidadeMessage, `Erro: ${data.mensagem || 'Falha ao cadastrar localidade'}`, 'error');
        }
    } catch (error) {
        showMessage(localidadeMessage, 'Erro ao conectar com o servidor', 'error');
        console.error(error);
    }
});

// Formulário de registro climático
formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const Localidades_id_localidades = localidadeIdSelect.value;
    const data = dataInput.value;
    const horario = horarioInput.value;
    const temperatura = parseFloat(temperaturaInput.value);
    
    try {
        const response = await fetch(`${API_BASE_URL}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                Localidades_id_localidades,
                data,
                horario,
                temperatura 
            })
        });
        
        const dataResponse = await response.json();
        
        if (response.ok) {
            showMessage(registroMessage, 'Registro climático cadastrado com sucesso!', 'success');
            formRegistro.reset();
            carregarRegistros();
        } else {
            showMessage(registroMessage, `Erro: ${dataResponse.mensagem || 'Falha ao cadastrar registro'}`, 'error');
        }
    } catch (error) {
        showMessage(registroMessage, 'Erro ao conectar com o servidor', 'error');
        console.error(error);
    }
});

// Botão de atualizar registros
btnAtualizar.addEventListener('click', carregarRegistros);

// Filtro de localidades
filtroLocalidadeSelect.addEventListener('change', carregarRegistros);

// Função para carregar localidades nos selects
async function carregarLocalidades() {
    try {
        const response = await fetch(`${API_BASE_URL}/localidade`);
        const localidades = await response.json();
        
        // Limpa e preenche o select do formulário de registro
        localidadeIdSelect.innerHTML = '';
        const optionPadrao = document.createElement('option');
        optionPadrao.value = '';
        optionPadrao.textContent = 'Selecione uma localidade';
        localidadeIdSelect.appendChild(optionPadrao);
        
        // Limpa e preenche o select do filtro
        filtroLocalidadeSelect.innerHTML = '';
        const optionTodas = document.createElement('option');
        optionTodas.value = '';
        optionTodas.textContent = 'Todas';
        filtroLocalidadeSelect.appendChild(optionTodas);
        
        localidades.forEach(local => {
            // Para o formulário de registro
            const option = document.createElement('option');
            option.value = local.id_Localidades;
            option.textContent = `${local.nome}, ${local.estado} - ${local.pais}`;
            localidadeIdSelect.appendChild(option);
            
            // Para o filtro
            const optionFiltro = option.cloneNode(true);
            filtroLocalidadeSelect.appendChild(optionFiltro);
        });
    } catch (error) {
        console.error('Erro ao carregar localidades:', error);
        localidadeIdSelect.innerHTML = '<option value="">Erro ao carregar localidades</option>';
        filtroLocalidadeSelect.innerHTML = '<option value="">Erro ao carregar localidades</option>';
    }
}

// Função para carregar registros
// Função principal para carregar registros
async function carregarRegistros() {
    try {
        // 1. Carrega todas as localidades
        const localidades = await carregarLocalidades();
        
        // 2. Carrega todos os registros
        const registros = await carregarDadosRegistros();
        
        // 3. Faz a associação entre registros e localidades
        const registrosCompletos = associarLocalidades(registros, localidades);
        
        // 4. Exibe os registros
        exibirRegistros(registrosCompletos);
    } catch (error) {
        console.error('Erro:', error);
        registrosContainer.innerHTML = `<p class="error">Erro ao carregar dados: ${error.message}</p>`;
    }
}

// Função auxiliar para carregar localidades
async function carregarLocalidades() {
    const response = await fetch(`${API_BASE_URL}/localidade`);
    if (!response.ok) throw new Error('Erro ao carregar localidades');
    return await response.json();
}

// Função auxiliar para carregar registros
async function carregarDadosRegistros() {
    const response = await fetch(`${API_BASE_URL}/registro`);
    if (!response.ok) throw new Error('Erro ao carregar registros');
    return await response.json();
}

// Função para associar localidades aos registros
function associarLocalidades(registros, localidades) {
    return registros.map(registro => {
        // Encontra a localidade correspondente (testando várias possibilidades de nomes de campos)
        const localEncontrado = localidades.find(local => 
            (local.id_localidades && registro.Localidades_id_Localidades && local.id_localidades == registro.Localidades_id_Localidades) ||
            (local.id_Localidades && registro.Localidades_id_Localidades && local.id_Localidades == registro.Localidades_id_Localidades) ||
            (local.id && registro.Localidades_id_Localidades && local.id == registro.Localidades_id_Localidades) ||
            (local.ID && registro.localidade_ID && local.ID == registro.localidade_ID)
        );

        return {
            ...registro,
            localidade: localEncontrado ? 
                `${localEncontrado.nome}, ${localEncontrado.estado} - ${localEncontrado.pais}` : 
                'Local não encontrado'
        };
    });
}

// Função para exibir registros formatados
function exibirRegistros(registros) {
    registrosContainer.innerHTML = registros.length === 0 ? 
        '<p>Nenhum registro encontrado.</p>' : 
        registros.map(formatarRegistro).join('');
}

// Função para formatar cada registro individualmente
function formatarRegistro(registro) {
    return `
        <div class="registro-item">
            <h3>${registro.localidade}</h3>
            <p><strong>Data:</strong> ${formatarData(registro.data)}</p>
            <p><strong>Horário:</strong> ${formatarHorario(registro.horario)}</p>
            <p><strong>Temperatura:</strong> ${registro.temperatura} °C</p>
        </div>
    `;
}

// Função para formatar data corretamente
function formatarData(dataString) {
    // Se for um objeto Date ou string ISO
    if (dataString instanceof Date || dataString.includes('T')) {
        const date = new Date(dataString);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    
    // Se já estiver no formato YYYY-MM-DD
    if (dataString.includes('-')) {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    
    // Se não reconhecer o formato, retorna como está
    return dataString;
}

// Função para formatar horário
function formatarHorario(horario) {
    // Remove segundos e milissegundos se existirem
    return horario ? horario.toString().split(':').slice(0, 2).join(':') : '';
}

function exibirRegistros(registros) {
    if (registros.length === 0) {
        registrosContainer.innerHTML = '<p>Nenhum registro encontrado.</p>';
        return;
    }
    
    registrosContainer.innerHTML = '';
    
    registros.forEach(reg => {
        const registroDiv = document.createElement('div');
        registroDiv.className = 'registro-item';
        
        // Corrige a formatação da data
        const dataFormatada = formatarData(reg.data);
        
        registroDiv.innerHTML = `
            <h3>${reg.localidade}</h3>
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Horário:</strong> ${formatarHorario(reg.horario)}</p>
            <p><strong>Temperatura:</strong> ${reg.temperatura} °C</p>
        `;
        
        registrosContainer.appendChild(registroDiv);
    });
}

// Função para formatar a data corretamente
function formatarData(dataString) {
    // Se a data já estiver no formato ISO (YYYY-MM-DD)
    if (dataString.includes('-')) {
        const [ano, mes, dia] = dataString.split('-');
        return `${dia}/${mes}/${ano}`;
    }
    
    // Se for uma data ISO com timezone (2025-03-25T03:00:00.000Z)
    if (dataString.includes('T')) {
        const date = new Date(dataString);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
    }
    
    return dataString; // Retorna como está se não reconhecer o formato
}

// Função para formatar o horário
function formatarHorario(horario) {
    // Se for um horário ISO (18:00:00.000Z)
    if (horario.includes('.')) {
        return horario.split('.')[0];
    }
    return horario;
}

// Função auxiliar para formatar data
function formatarData(dataString) {
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Função para exibir mensagens
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Limpa a mensagem após 5 segundos
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 5000);
}