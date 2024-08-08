import * as fs from 'fs';
import PDFDocument from 'pdfkit-table';
import SVGtoPDF from 'svg-to-pdfkit';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

function makeTableAndChart() {
  // start pdf document
  const doc = new PDFDocument({ margin: 30, size: 'A4' });

  // to save on server
  doc.pipe(fs.createWriteStream('./src/proto/table-pdfs/doc-table-79.pdf'));

  // Define your SVG content
  const svg = fs.readFileSync('./src/proto/images/4-doughnut.svg', 'utf8');

  const svgOptions = {
    width: 200,
    preserveAspectRatio: 'true',
    assumePt: false
  };

  SVGtoPDF(doc, svg, 0, -340, svgOptions);
  // -----------------------------------------------------------------------------------------------------
  // Simple Table with Array
  // -----------------------------------------------------------------------------------------------------
  const tableArray = {
    headers: ['Country', 'Conversion rate', 'Trend'],
    rows: [
      ['Switzerland', '12%', '+1.12%'],
      ['France', '67%', '-0.98%'],
      [
        'England',
        '33%',
        '+4.44777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777777%'
      ]
    ]
  };

  const options = {
    x: 250,
    y: 15,
    padding: [8], // [a] - left and right padding
    divider: {
      header: { disabled: false, width: 2, opacity: 1 },
      horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
      vertical: { disabled: false, width: 0.5, opacity: 0.5 }
    },
    width: 300,
    // hideHeader: true,
    prepareHeader: () => doc.font('Helvetica-Bold').fontSize(12),
    prepareRow: (
      _row: any,
      indexColumn: number | undefined,
      _indexRow: number | undefined,
      _rectRow: Rect | undefined,
      rectCell: Rect | undefined
    ) => {
      // console.log('===================================================');
      // console.log('row: ', row);
      // console.log('indexColumn: ', indexColumn);
      // console.log('indexRow: ', indexRow);
      // console.log('rectRow: ', rectRow);
      // console.log('rectCell: ', rectCell);
      // console.log('===================================================\n');
      if (rectCell && indexColumn) {
        const { x, y, /* width, */ height } = rectCell;

        doc.font('Helvetica').fontSize(8);
        // Draw vertical borders
        doc
          .lineWidth(0.5)
          .moveTo(x, y)
          .lineTo(x, y + height)
          .stroke();
      } // {Function}
      return doc;
    }
  };

  // const lastColumnIndex = tableArray.headers.length - 1;

  doc.table(tableArray, options);

  // done
  doc.end();
}

makeTableAndChart();
