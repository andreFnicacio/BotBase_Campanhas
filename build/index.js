"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const venom_bot_1 = require("venom-bot");
const openai_1 = require("./lib/openai");
const redis_1 = require("./lib/redis");
const initPrompt_1 = require("./utils/initPrompt");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const https = __importStar(require("https"));
function completion(messages) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const completion = yield openai_1.openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            temperature: 0,
            max_tokens: 256,
            messages,
        });
        return (_a = completion.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content;
    });
}
// Criando a instancia WhatsApp com Venom-bot
(0, venom_bot_1.create)({
    session: "serpens-gpt",
    headless: false // default: true on prod
})
    .then((client) => __awaiter(void 0, void 0, void 0, function* () { return yield start(client); }))
    .catch((err) => {
    console.log(err);
});
// Função Startadora do bot e gerenciadora do corpo de execução
function start(client) {
    return __awaiter(this, void 0, void 0, function* () {
        //Definindo variaveis estaticas
        const storeName = "Pisante Calçados";
        let readingPhone = '';
        let imageToPass = '';
        const myUsersClientToday = [];
        const myArray = ["18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43"];
        //Chamada client Bot HOT == QUANDO O USUARIO NOS ENVIA A MENSAGEM E NOS AGIMOS A PARTIR DISSO
        client.onMessage((message) => __awaiter(this, void 0, void 0, function* () {
            console.log(message);
            if (!message.body || message.isGroupMsg || message.body === undefined)
                return;
            //Variaveis dinamicas
            const customerPhone = `+${message.from.replace("@c.us", "")}`;
            const customerAdmPhone = message.from;
            const customerName = message.author;
            const customerKey = `customer:${customerPhone}:chat`;
            const orderCode = `#sk-${("00000" + Math.random()).slice(-5)}`;
            const lastChat = JSON.parse((yield redis_1.redis.get(customerKey)) || "{}");
            const customerChat = (lastChat === null || lastChat === void 0 ? void 0 : lastChat.status) === "open"
                ? lastChat
                : {
                    status: "open",
                    ativo: "",
                    orderCode,
                    chatAt: new Date().toISOString(),
                    customer: {
                        name: customerName,
                        phone: customerPhone,
                        phoneAtgpt: "",
                        numbProduct: ""
                    },
                    messages: [
                        {
                            role: "system",
                            content: (0, initPrompt_1.initPrompt)(storeName, orderCode),
                        },
                    ],
                    orderSummary: "",
                };
            console.debug(customerPhone, "👤", message.body);
            if (message.mimetype && message.mimetype.includes('image')) {
                const imageName = `${Date.now()}.jpg`; // Generate a unique filename
                const imageToPassFornecedor = path.join(__dirname, 'comparatives', imageName);
                imageToPass = path.join(__dirname, 'comparatives', imageName);
                console.log(`Image saved: ${imageToPassFornecedor}`);
                // Download and save the image
                const buffer = yield client.decryptFile(message);
                fs.writeFileSync(imageToPassFornecedor, buffer);
                customerChat.customer.phoneAtgpt = message.from;
                customerChat.ativo = "true";
                customerChat.messages.push({
                    role: "user",
                    content: "Acabei de te enviar a foto do produto que eu escolhi",
                });
                const content = "Estamos aguardando a confimação do produto no estoque!" || "Não entendi...";
                customerChat.messages.push({
                    role: "assistant",
                    content,
                });
                redis_1.redis.set(customerKey, JSON.stringify(customerChat));
                // Replace 'pythonScript.py' with the path to your Python script
                // const pythonOutput = await executePythonScript(customerChat.customer.phoneAtgpt);
                // Now you can use pythonOutput and perform the next action here
                // console.log('Saída do Python:', JSON.parse(pythonOutput));
                // const pathComparatives = JSON.parse(pythonOutput);
                if (myArray.includes(message.caption)) {
                    yield client
                        .sendText(customerChat.customer.phoneAtgpt, 'Estamos entrando em contato com nosso Fornecedor! Aguarde um momento por favor 😁')
                        .then((result) => {
                        console.log('Result: '); //return object success
                    })
                        .catch((erro) => {
                        console.error('Error when sending: ', erro); //return object error
                    });
                    yield client
                        .sendImage('55129911642370@c.us', imageToPassFornecedor, '👟', `Olá tudo bem ? estou com o pedido de numero ${orderCode}. Preciso que verifique se ele existe na numeração ${message.caption}\nEnvie *Confirmado* caso esse produto exista no estoque!`)
                        .then((result) => {
                        console.log('Result: '); // return object success
                    })
                        .catch((erro) => {
                        console.error('Error when sending: ', erro); // return object error
                    });
                }
                else {
                    yield client;
                    yield client
                        .sendImage(readingPhone, "/home/oem/Documentos/Bots/Serpens/food-gpt/src/WhatsApp Image 2023-09-15 at 15.00.02.jpeg", '👟', `Opa tivemos um engano.\nÉ so seguir o exemplo acima e me enviar a foto do produto novamente com a numeração desejada na legenda da foto ok ?!😁`)
                        .then((result) => {
                        console.log('Result: '); // return object success
                    })
                        .catch((erro) => {
                        console.error('Error when sending: ', erro); // return object error
                    });
                }
            }
            else if (message.body.toLowerCase() === "confirmado" || message.body.toLowerCase() === "confirmar" && message.from && message.from === "55129911642370@c.us" && message.isGroupMsg === false) {
                const customerChat = (lastChat === null || lastChat === void 0 ? void 0 : lastChat.ativo) === "true"
                    ? lastChat
                    : {
                        status: "open",
                        ativo: "",
                        orderCode,
                        chatAt: new Date().toISOString(),
                        customer: {
                            name: customerName,
                            phone: customerPhone,
                            phoneAtgpt: "",
                            numbProduct: ""
                        },
                        messages: [
                            {
                                role: "system",
                                content: (0, initPrompt_1.initPrompt)(storeName, orderCode),
                            },
                        ],
                        orderSummary: "",
                    };
                yield client
                    .sendText("55129911642370@c.us", 'Ok, obrigado 😁')
                    .then((result) => {
                    console.log('Result: '); //return object success
                })
                    .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });
                yield client
                    .sendImage(message.from, imageToPass, '👟', `Maravilha!! 😎\nNos temos seu produto em nosso estoque, confirme se é esse produto mesmo e envie *continuar* para seguirmos no atendimento.`)
                    .then((result) => {
                    console.log('Result: '); // return object success
                })
                    .catch((erro) => {
                    console.error('Error when sending: ', erro); // return object error
                });
                customerChat.ativo = "falso";
                customerChat.messages.push({
                    role: "user",
                    content: "O produto existe no estoque.",
                });
                const content = "Que otimo!! Ainda temos seu produto no estoque, gostaria de continuar comprando ?" || "Não entendi...";
                customerChat.messages.push({
                    role: "assistant",
                    content,
                });
                console.debug(customerPhone, "🤖", content);
                redis_1.redis.set(customerKey, JSON.stringify(customerChat));
            }
            else if (message.body.toLowerCase() === "continuar") {
                readingPhone = message.from;
                customerChat.messages.push({
                    role: "user",
                    content: "Eu desejo continuar comprando.",
                });
                const content = (yield completion(customerChat.messages)) || "Não entendi...";
                customerChat.messages.push({
                    role: "assistant",
                    content,
                });
                redis_1.redis.set(customerKey, JSON.stringify(customerChat));
                console.debug(customerPhone, "🤖", content);
                yield client.sendText(message.from, content);
            }
            else if (message.body.toLowerCase() === "/entregas" || message.body.toLowerCase() === "/entrega" && message.isGroupMsg === false) {
                yield client
                    .sendImage(message.from, "/home/oem/Documentos/Bots/Serpens/food-gpt/src/calcados/adidas 34 ao 39 (5).jpg", '👟', `
        1. **Entrega 1** 📦
           - *Endereço*: Rua das Flores, 123
           - *Bairro*: Jardim Primavera
           - *Bairro*: #
           - *Cidade*: Cruzeiro
           - Numero do produto*: 41
           - *Estado*: São Paulo
           - *Responsável*: Maria Silva
           - *Valor dos Itens*: R$ 130,00
           - *Resumo*: Entrega realizada com sucesso para Maria Silva em Cruzeiro.\n\n
        `)
                    .then((result) => {
                    console.log('Result: '); // return object success
                })
                    .catch((erro) => {
                    console.error('Error when sending: ', erro); // return object error
                });
                yield client
                    .sendImage(message.from, "/home/oem/Documentos/Bots/Serpens/food-gpt/src/calcados/WhatsApp Image 2023-07-26 at 15.36.38 (4).jpg", '👟', `
        2. *Entrega 2* 📦
           - *Endereço*: Avenida da Paz, 456
           - *Bairro*: Centro
           - *Cidade*: Lorena
           - *Numero do produto*: 39    
           - *Estado*: São Paulo
           - *Responsável*: João Santos
           - *Valor dos Itens*: R$ 130,00
           - *Resumo*: João Santos recebeu seus produtos em Lorena.\n\n
        `)
                    .then((result) => {
                    console.log('Result: '); // return object success
                })
                    .catch((erro) => {
                    console.error('Error when sending: ', erro); // return object error
                });
                yield client
                    .sendImage(message.from, "/home/oem/Documentos/Bots/Serpens/food-gpt/src/calcados/WhatsApp Image 2023-08-23 at 18.44.44.jpg", '👟', `
        3. *Entrega 3* 📦
           - *Endereço*: Rua das Estrelas, 789
           - *Bairro*: Vila Celestial
           - *Cidade*: Canas
           - *Numero do produto*: 40           
           - *Estado*: São Paulo
           - *Responsável*: Ana Rodrigues
           - *Valor dos Itens*: R$ 130,00
           - *Resumo*: Entrega concluída com sucesso para Ana Rodrigues em Canas.\n\n
        `)
                    .then((result) => {
                    console.log('Result: '); // return object success
                })
                    .catch((erro) => {
                    console.error('Error when sending: ', erro); // return object error
                });
                yield client
                    .sendText(message.from, 'Lista de entregas *HOJE*! 🚚')
                    .then((result) => {
                    console.log('Result: '); //return object success
                })
                    .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });
            }
            else if (message.from !== "55129911642370@c.us" && message.body.toLowerCase() !== "/entregas" && message.isGroupMsg === false) {
                //readingPhone = message.from
                //customerChat.messages.push({
                //  role: "user",
                //  content: message.body,
                //})
                //const content =
                //  (await completion(customerChat.messages)) || "Não entendi..."
                //customerChat.messages.push({
                //  role: "assistant",
                //  content,
                //})
                //console.debug(customerPhone, "🤖", content)
                //await client.sendText(message.from, content)
                //redis.set(customerKey, JSON.stringify(customerChat))
                console.log(message);
            }
        }));
    });
}
function SendMessageWhatsApp(data) {
    console.log("DATA ON SERVICES:", data);
    const options = {
        host: "graph.facebook.com",
        path: "/v17.0/125960627270370/messages",
        method: "POST",
        body: data,
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer EAAKtMELxKCgBOZCeUpZCm38FMZCkFFzhhNEHGFWchYlqfYVRbUJCqAMoW5UJP966rTf1aecPJtucZCrbVoRrahk3v6SP1OOdQzEADPM3E4P5Dh3FvoWetVIPKVL4BySo1RXGTptinKtJB4lpjpHNt2BIpqqUrE3SqVFe0dfpixQSjupZBznXFMlzoh6zUsBW9"
        }
    };
    const req = https.request(options, res => {
        res.on("data", d => {
            console.log(d);
            process.stdout.write(d);
        });
    });
    req.on("error", error => {
        console.log(error);
    });
    req.write(data);
    req.end();
}
const executePythonScript = (imagePath) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const pythonProcess = (0, child_process_1.exec)(`/bin/python3 /home/andre/Documentos/Bot-Sales/python_lab/verify_check_img.py ${imagePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Erro: ${error}`);
                reject(error); // Rejeita a Promise em caso de erro
            }
            else {
                resolve(stdout); // Resolve a Promise com a saída do Python em caso de sucesso
                return stdout;
            }
        });
        pythonProcess.on('exit', (code) => {
            if (code !== 0) {
                // Se o código de saída não for zero, algo deu errado na execução
                reject(new Error(`Erro na execução do Python, código de saída: ${code}`));
            }
        });
    });
});
