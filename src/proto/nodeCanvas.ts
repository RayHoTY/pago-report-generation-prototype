import {
  createCanvas
  //  loadImage
} from 'canvas';
import * as fs from 'fs';

function canvasRun() {
  const canvas = createCanvas(600, 300, 'svg');
  const ctx = canvas.getContext('2d');
  // Write "Awesome!"
  ctx.font = '30px Arial';
  ctx.rotate(0.1);
  ctx.fillText('Awesome!', 50, 100);

  // Draw line under text
  const text = ctx.measureText('Awesome!');
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.lineTo(50, 102);
  ctx.lineTo(50 + text.width, 102);
  ctx.stroke();

  //   // Draw cat with lime helmet
  //   loadImage('./src/proto/images/lime-cat.jpg').then((image) => {
  //     ctx.drawImage(image, 50, 0, 70, 70);

  //     console.log('<img src="' + canvas.toDataURL() + '" />');
  //   });

  fs.writeFileSync('./src/proto/images/out.svg', canvas.toBuffer());
}

canvasRun();
