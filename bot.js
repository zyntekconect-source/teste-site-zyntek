const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

// Memória de curto prazo dos clientes
const memoriaClientes = {}; 
const processando = {}; 

// 10 minutos de inatividade para encerrar (10 * 60 * 1000)
const TEMPO_INATIVIDADE = 10 * 60 * 1000; 

const aguardar = ms => new Promise(resolve => setTimeout(resolve, ms));

// Função que encerra o atendimento e reseta o estado
const encerrarAtendimento = async (chatId) => {
    if (memoriaClientes[chatId] && memoriaClientes[chatId].estado !== 0) {
        await client.sendMessage(chatId, 
            "Como não houve novas interações, estou encerrando este atendimento por aqui para manter nossa organização. " +
            "Caso precise de algo mais, basta mandar uma mensagem a qualquer momento. Até mais! 🤖\n\n_Zynk_AI_"
        );
        // Volta para o estado 0, mas mantém o nome salvo em memoriaClientes[chatId].nome
        memoriaClientes[chatId].estado = 0;
        memoriaClientes[chatId].timer = null;
    }
};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Sessão pronta. Escaneie o QR Code.');
});

client.on('ready', () => {
    console.log('Zynk está online e operando na infraestrutura!');
});

client.on('message', async (message) => {
    const chatId = message.from;
    if (chatId.includes('@g.us') || chatId === 'status@broadcast') return;
    if (processando[chatId]) return;

    // Inicialização da memória se o contato for novo
    if (!memoriaClientes[chatId]) {
        memoriaClientes[chatId] = { estado: 0, nome: null, projeto: '', timer: null };
    }

    // Reset do timer a cada mensagem recebida
    if (memoriaClientes[chatId].timer) clearTimeout(memoriaClientes[chatId].timer);
    memoriaClientes[chatId].timer = setTimeout(() => encerrarAtendimento(chatId), TEMPO_INATIVIDADE);

    processando[chatId] = true;

    try {
        // --- FLUXO DO BOT ---
        
        // Estado 0: Saudação Inicial ou Reconhecimento de Retorno
        if (memoriaClientes[chatId].estado === 0) {
            await aguardar(1000);
            if (memoriaClientes[chatId].nome) {
                await client.sendMessage(chatId, `Olá, ${memoriaClientes[chatId].nome}! Que bom te ver de volta. Como posso te ajudar hoje?`);
            } else {
                await client.sendMessage(chatId, "Olá! Aqui é a Zyntek. Sou o Zynk, assistente de IA da equipe. Como posso chamar você (ou sua empresa)?");
            }
            memoriaClientes[chatId].estado = 1;
        } 
        // Estado 1: Captura do Nome
        else if (memoriaClientes[chatId].estado === 1) {
            memoriaClientes[chatId].nome = message.body;
            memoriaClientes[chatId].estado = 2;
            await aguardar(1000);
            await client.sendMessage(chatId, `Prazer, ${memoriaClientes[chatId].nome}! 🤝\nMe conte de forma breve: qual é a sua ideia de projeto ou desafio tecnológico hoje?`);
        } 
        // Estado 2: Captura do Projeto
        else if (memoriaClientes[chatId].estado === 2) {
            memoriaClientes[chatId].projeto = message.body;
            memoriaClientes[chatId].estado = 3;
            await aguardar(1000);
            await client.sendMessage(chatId, "Entendido! Selecione sua prioridade:\n\n🔴 *1. Urgente*\n🟡 *2. Otimização*\n🟢 *3. Planejamento*\n\n(Responda apenas o número da opção)");
        }
        // Estado 3: Triagem Final
        else if (memoriaClientes[chatId].estado === 3) {
            const op = message.body;
            let status = op === '1' ? "🔴 Urgente" : op === '2' ? "🟡 Otimização" : op === '3' ? "🟢 Planejamento" : null;
            
            if (!status) {
                await client.sendMessage(chatId, "Por favor, escolha uma opção válida (1, 2 ou 3).");
            } else {
                memoriaClientes[chatId].estado = 4; // Fim do fluxo automático
                await aguardar(1000);
                await client.sendMessage(chatId, "Tudo anotado! Aqui está seu protocolo:");
                await client.sendMessage(chatId, 
                    "┏━━━━━━━━━━━━━━━━━━━━━┓\n           ZYNTEK.CONNECT \n┗━━━━━━━━━━━━━━━━━━━━━┛\n" +
                    `👤 *Cliente:* ${memoriaClientes[chatId].nome}\n` +
                    `💡 *Projeto:* ${memoriaClientes[chatId].projeto}\n` +
                    `⏱️ *Status:* ${status}\n━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    "🤖 _Zynk_AI desligando..._\n👤 _Aguardando especialista..._"
                );
            }
        }
    } catch (e) { console.error('Erro no bot:', e); }
    
    processando[chatId] = false;
});

client.initialize();