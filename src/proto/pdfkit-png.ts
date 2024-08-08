import PDFDocument from 'pdfkit';
import * as fs from 'fs';

function makePdf() {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('./src/proto/doc/1-file.pdf')); // write to PDF
  // doc.pipe(res); // HTTP response

  // add stuff to PDF here using methods described below...
  // doc.text('hello');

  // Scale proprotionally to the specified width
  doc
    .image('./src/proto/images/example2.png', 50, 15, { width: 400 })
    .text('Proportional to width', 0, 0);

  // finalize the PDF and end the stream
  doc.end();
}

makePdf();
