import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import SVGtoPDF from 'svg-to-pdfkit';

function makePdf() {
  const doc = new PDFDocument();

  // Define your SVG content
  const svg = fs.readFileSync('./src/proto/images/4-doughnut.svg', 'utf8');

  // SVG options
  const options = {
    width: 400,
    height: 300
  };

  // Pipe the pdf into a file
  doc.pipe(fs.createWriteStream('./src/proto/doc/6-file-doughnut.pdf')); // write to PDF

  // SVGtoPDF
  // doc [PDFDocument] = the PDF document created with PDFKit
  // svg [SVGElement or string] = the SVG object or XML code
  // x, y [number] = the position where the SVG will be added
  // options [Object] = >
  //   - width, height [number] = initial viewport, by default it's the page dimensions
  //   - preserveAspectRatio [string] = override alignment of the SVG content inside its viewport
  //   - useCSS [boolean] = use the CSS styles computed by the browser (for SVGElement only)
  //   - fontCallback [function] = function called to get the fonts, see source code
  //   - imageCallback [function] = same as above for the images (for Node.js)
  //   - documentCallback [function] = same as above for the external SVG documents
  //   - colorCallback [function] = function called to get color, making mapping to CMYK possible
  //   - warningCallback [function] = function called when there is a warning
  //   - assumePt [boolean] = assume that units are PDF points instead of SVG pixels
  //   - precision [number] = precision factor for approximative calculations (default = 3)
  SVGtoPDF(doc, svg, 0, 0, options);

  // Scale proprotionally to the specified width
  doc.text('Horizontal BarChart', 0, 0);

  // finalize the PDF and end the stream
  doc.end();
}

makePdf();
