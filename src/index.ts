//IMPORTANDO BIBLIOTECAS
import { Message, Whatsapp, create } from "venom-bot"
import fs from 'fs';
import csv from 'csv-parser';
import { exec, ExecException } from 'child_process';
import * as path from 'path';

import { Browser, Page } from 'puppeteer';

const puppeteer = require('puppeteer');



interface CsvRow {
  link_photo: string;
  contact: string;
  message: string;
}

create({
  session: "marmoria-gpt",
  headless: false // default: true on prod

})
  .then(async (client: Whatsapp) => await start(client))
  .catch((err) => {
    console.log(err);
  })

// Função Startadora do bot e gerenciadora do corpo de execução
async function start(client: Whatsapp) {

  //Chamada client Bot HOT == QUANDO O USUARIO NOS ENVIA A MENSAGEM E NOS AGIMOS A PARTIR DISSO
  client.onMessage(async (message: Message) => {
    console.log(message)
    if (message.mimetype && message.mimetype.includes('image') && message.isGroupMsg === false) {
      console.log("Fotos Recebidas")
    }
    else if (message.isMedia && message.type === 'document') {
      // Check if the received message is a document (file)

      // Download the file
      const fileData = await client.decryptFile(message);

      if (message.mimetype === 'text/csv') {
        // Handle the CSV file here, e.g., save it to disk
        const fileName = 'src/data.csv';
        require('fs').writeFileSync(fileName, fileData);

        // Notify the user that the file has been downloaded
        client.sendText(message.from, `CSV file '${fileName}' downloaded.`);
      } else {
        client.sendText(message.from, 'Received file is not in CSV format.');
      }
    }
    else if (message.mimetype && message.mimetype.includes('csv') && message.isGroupMsg === false) {
      // Check if the received message is a document (file)
      const imageName = `${Date.now()}.jpg`; // Generate a unique filename
      const fileName = 'data.csv';
      const imageToPassFornecedor:string = path.join(__dirname, 'comparatives', fileName);
      // Download the file
      const fileData: any = await client.decryptFile(message);

      // Handle the CSV file here, e.g., save it to disk
      require('fs').writeFileSync(imageToPassFornecedor, fileData);

      // Notify the user that the file has been downloaded
      await client.sendText(message.from, `Arquivo CSV '${fileName}' baixado.`);

      await readCSVFile()
        .then(async (data) => {
          console.log(data); // Array of CsvRow objects from the CSV file
          await client.sendText(message.from, "Disparo de Campanhas: *INICIADO*");

          var index = 0;

          while (index < data.length) {
            await downloadImage(data[index]["link_photo"], `photo_${data[index]["contact"]}.png`);
            await client
              .sendImage(
                data[index]["contact"],
                `photos/photo_${data[index]["contact"]}.png`,
                'Produto.png',
                'Produto em Promoção'
              )
              .then((result) => {
                console.log('Result: ', result); //return object success
              })
              .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });
            await client.sendText(data[index]["contact"], data[index]["message"]);
            index += 1;
            console.log("Message Sends");
            await delay(15000);
            console.log("Check Another One");
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
    else if (message.isGroupMsg === false && message.body === "ativado") {
      await readCSVFile()
        .then(async (data) => {
          console.log(data); // Array of CsvRow objects from the CSV file
          await client.sendText(message.from, "Disparo de Campanhas: *INICIADO*");

          var index = 0;

          while (index < data.length) {
            await downloadImage(data[index]["link_photo"], `photo_${data[index]["contact"]}.png`);
            await client
              .sendImage(
                data[index]["contact"],
                `photos/photo_${data[index]["contact"]}.png`,
                'Produto.png',
                'Produto em Promoção'
              )
              .then((result) => {
                console.log('Result: ', result); //return object success
              })
              .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });
            await client.sendText(data[index]["contact"], data[index]["message"]);
            index += 1;
            console.log("Message Sends");
            await delay(15000);
            console.log("Check Another One");
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  })

  client.onStateChange((state) => {
    console.log('State changed: ', state);
    // force whatsapp take over
    if ('CONFLICT'.includes(state)) client.useHere();
    // detect disconnect on whatsapp
    if ('UNPAIRED'.includes(state)) console.log('logout');
  });

  var time: any = 0;
  client.onStreamChange((state) => {
    console.log('State Connection Stream: ' + state);
    clearTimeout(time);
    if (state === 'DISCONNECTED' || state === 'SYNCING') {
      time = setTimeout(async () => {
        await client.restartService();
      }, 80000);
    }
  });
}

const executePythonScript = async (imagePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pythonProcess = exec(
      `/bin/python3 /home/andre/Documentos/Bot-Sales/python_lab/verify_check_img.py ${imagePath}`,
      (error: ExecException | null, stdout: string, stderr: string) => {
        if (error) {
          console.error(`Erro: ${error}`);
          reject(error); // Rejeita a Promise em caso de erro
        } else {
          resolve(stdout); // Resolve a Promise com a saída do Python em caso de sucesso

          return stdout;
        }
      }
    );

    pythonProcess.on('exit', (code: number) => {
      if (code !== 0) {
        // Se o código de saída não for zero, algo deu errado na execução
        reject(new Error(`Erro na execução do Python, código de saída: ${code}`));
      }
    });

  })
};

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readCSVFile(): Promise<CsvRow[]> {
  return new Promise<CsvRow[]>((resolve, reject) => {
    const results: CsvRow[] = [];

    fs.createReadStream("src/data.csv")
      .pipe(csv())
      .on('data', (row: CsvRow) => {
        results.push({
          link_photo: row.link_photo,
          contact: row.contact,
          message: row.message,
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function downloadImage(link_photo: string, path_photo: string) {
  const browser: Browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  const page: Page = await browser.newPage();

  try {
    await page.goto(link_photo);
    await delay(30000);
    await page.screenshot({ path: `photos/${path_photo}` });
  } catch (error) {
    console.error('Error while downloading image:', error);
  } finally {
    await browser.close();
  }
}

