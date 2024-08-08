import { ChartConfiguration } from 'chart.js';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';
// import { promises as fs } from 'fs';
import * as fs from 'fs';

const backgroundColour = 'white';
const width = 800;
const height = 600;
const type = 'svg'; // 'svg' or 'pdf'

async function main(): Promise<void> {
  // // DoughNut Chart
  //   const data = {
  //     labels: ['Red', 'Blue', 'Yellow'],
  //     datasets: [
  //       {
  //         label: 'My First Dataset',
  //         data: [300, 50, 100],
  //         backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
  //         hoverOffset: 4
  //       }
  //     ]
  //   };

  //   // LineChart
  //   const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'Jul'];
  //   const data = {
  //     labels: labels,
  //     datasets: [
  //       {
  //         label: 'My First Dataset',
  //         data: [65, 59, 80, 81, 56, 55, 40],
  //         fill: false,
  //         borderColor: 'rgb(75, 192, 192)',
  //         tension: 0.1
  //       }
  //     ]
  //   };

  //   // Bar Chart
  //   const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'Jul'];
  //   const data = {
  //     labels: labels,
  //     datasets: [
  //       {
  //         label: 'My First Dataset',
  //         data: [65, 59, 80, 81, 56, 55, 40],
  //         backgroundColor: [
  //           'rgba(255, 99, 132, 0.2)',
  //           'rgba(255, 159, 64, 0.2)',
  //           'rgba(255, 205, 86, 0.2)',
  //           'rgba(75, 192, 192, 0.2)',
  //           'rgba(54, 162, 235, 0.2)',
  //           'rgba(153, 102, 255, 0.2)',
  //           'rgba(201, 203, 207, 0.2)'
  //         ],
  //         borderColor: [
  //           'rgb(255, 99, 132)',
  //           'rgb(255, 159, 64)',
  //           'rgb(255, 205, 86)',
  //           'rgb(75, 192, 192)',
  //           'rgb(54, 162, 235)',
  //           'rgb(153, 102, 255)',
  //           'rgb(201, 203, 207)'
  //         ],
  //         borderWidth: 1
  //       }
  //     ]
  //   };

  // Horizontal Bar Chart
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'Jul'];
  const data = {
    labels: labels,
    datasets: [
      {
        axis: 'y',
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1
      }
    ]
  };
  const configuration: ChartConfiguration = {
    type: 'bar',
    data: data,
    options: {
      indexAxis: 'y' // for horizontal barchart
    },
    plugins: [
      {
        id: 'background-colour',
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }
    ]
  };
  const chartCallback: ChartCallback = (ChartJS) => {
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.maintainAspectRatio = false;
  };
  const chartJSNodeCanvas = new ChartJSNodeCanvas({
    type,
    width,
    height,
    backgroundColour,
    chartCallback
  });

  const buffer = chartJSNodeCanvas.renderToBufferSync(configuration);
  fs.writeFileSync('./src/proto/images/7-barChart-h.svg', buffer, 'base64');
}
main();
