const { createServer } = require('http')

const server = createServer(() => {})

server.listen(3000);

const {
  writeFileSync
} = require('fs');
const Discord = require('discord.js');
const {
  createCanvas,
  loadImage
} = require('canvas');

const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', async (message) => {
  if (message.content.startsWith('b!catcake')) {
    let canvas = createCanvas(200, 270);
    let ctx = canvas.getContext('2d');
    ctx.font = `30px Monsterrat`;
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    loadImage('кот.png').then((image) => {
      ctx.drawImage(image, 50, 20, 70, 70);
    });
    loadImage('pancake.png').then((image) => {
      ctx.drawImage(image, 50, 120, 70, 70);
    });
    ctx.fillStyle = '#111111';
    ctx.fillText('+', 70, 120);
    ctx.fillText('=', 70, 220);
    ctx.fillText(message.content.slice(9).trim(), 70 - (message.content.slice(9).trim().length * 4.5), 250);
    let attachment = new Discord.MessageAttachment(canvas.createPNGStream(), 'image.png')
    let embed = new Discord.MessageEmbed({
      "title": "Котоблин",
      "color": 11088434,
      "image": {
        "data": canvas.toBuffer()
      }
    }).setTitle('Котоблин').setColor(11088434).attachFiles(attachment).setImage('attachment://image.png');;
    message.channel.send(embed);
  }
  // if (message.content.startsWith('b!statistics')) {
  //   let canvas = createCanvas(400, 200);
  //   let ctx = canvas.getContext('2d');
  //   ctx.fillStyle = '#e34a4d';
  //   diagram.createRows([170, 120, 150]);
  //   diagram.lastx = 0;
  //   let attachment = new Discord.MessageAttachment(canvas.createPNGStream(), 'image.png')
  //   let embed = new Discord.MessageEmbed({
  //     "title": "Котоблин",
  //     "color": 11088434,
  //     "image": {
  //       "data": canvas.toBuffer()
  //     }
  //   }).setTitle(`Statistics for ${message.guild.name}`).setColor('#e34a4d').attachFiles(attachment).setImage('attachment://image.png');;
  //   message.channel.send(embed);
  // }
});

client.login(process.env.TOKEN);

writeFileSync('blah blah', 'sqwdfefg');
