import {
  ChartConfiguration,
  Chart
  // ChartData
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartCallback, ChartJSNodeCanvas } from 'chartjs-node-canvas';
// import { promises as fs } from 'fs';
import * as fs from 'fs';
// import uniqolor from 'uniqolor';

const backgroundColour = 'white';
const width = 800;
const height = 600;
const type = 'svg'; // 'svg' or 'pdf'

const getTimeString = () => {
  const now = new Date();
  const fileDate = now.toISOString().slice(0, -13);
  const fileTime = now.toLocaleTimeString().replace(/:/g, '_').replace(' ', '');
  return `${fileDate}${fileTime}`;
};

async function main(): Promise<void> {
  Chart.register(ChartDataLabels);

  const dataValues = [300, 50, 100, 210];
  // DoughNut Chart
  const data = {
    labels: [['Windows', '7'], ['Windows', '8'], ['Windows', '9'], ['Mac OS X']],
    datasets: [
      {
        label: 'Endpoint Count  & OS Version', // ---> displayed in legend
        data: dataValues,
        backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
        barThickness: 35,
        maxBarThickness: 40,
        minBarLength: 2
        // hoverOffset: 4
      }
    ]
  };

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
  // const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'Jul'];
  // const bgColors: string[] = [];

  // labels.forEach(() => bgColors.push(uniqolor.random({ format: 'rgb' }).color));

  // const data: ChartData = {
  //   labels: labels,
  //   datasets: [
  //     {
  //       // axis: 'y',
  //       label: 'My First Dataset',
  //       data: [65, 59, 80, 81, 56, 55, 40],
  //       backgroundColor: bgColors
  //       // [
  //       //   'rgba(255, 99, 132, 0.2)',
  //       //   'rgba(255, 159, 64, 0.2)',
  //       //   'rgba(255, 205, 86, 0.2)',
  //       //   'rgba(75, 192, 192, 0.2)',
  //       //   'rgba(54, 162, 235, 0.2)',
  //       //   'rgba(153, 102, 255, 0.2)',
  //       //   'rgb(201, 203, 207)'
  //       // ]
  //       // borderColor: [
  //       //   'rgb(255, 99, 132)',
  //       //   'rgb(255, 159, 64)',
  //       //   'rgb(255, 205, 86)',
  //       //   'rgb(75, 192, 192)',
  //       //   'rgb(54, 162, 235)',
  //       //   'rgb(153, 102, 255)',
  //       //   'rgb(201, 203, 207)'
  //       // ],
  //       // borderWidth: 1
  //     }
  //   ]
  // };

  const titleFontSize = 24;

  const configuration: ChartConfiguration = {
    type: 'bar',
    data: data,
    options: {
      indexAxis: 'x', // y for horizontal barchart, default: x
      plugins: {
        title: {
          display: true,
          text: ``,
          // position: 'top',
          color: '#000',
          font: {
            size: titleFontSize,
            weight: 'bold'
          },
          padding: {
            bottom: 40
          }
        },
        // subtitle: {  // subtitle object cannot be arranged to be inline with title
        //   display: true,
        //   text: `${dataValues.reduce((a, b) => a + b, 0)}`,
        //   // position: 'top',
        //   color: '#FF0000',
        //   font: {
        //     size: 24,
        //     weight: 'bold'
        //   }
        // },
        legend: {
          display: false
          // position: 'bottom',
          // labels: {
          //   color: '#000',
          //   font: {
          //     // size: 24,
          //     style: 'normal',
          //     weight: 'bold'
          //   }
          // }
        },
        datalabels: {
          display: true,
          // color: '#FF0000',
          anchor: 'end',
          align: 'top',
          padding: {
            bottom: -20
          },
          font: {
            // weight: 'bold',
            size: 10
          },
          formatter: Math.round
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          grid: {
            borderColor: 'white',
            display: true,
            tickLength: 0
          }
        }
      }
    },
    plugins: [
      {
        id: 'background-colour',
        beforeDraw: (chart) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.fillStyle = 'white'; // this is background color
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      },
      {
        id: 'custom-sub-title',
        afterDraw: (chart) => {
          const ctx = chart.ctx;
          const titleStartX = width / 2 - 100;
          ctx.save();
          ctx.font = `bold ${titleFontSize}px arial`;
          ctx.fillStyle = 'black';
          ctx.fillText(`Title`, titleStartX, 22);
          // const canvas = chart.canvas;
          // console.log('measure text', ctx.measureText('Title'));
          const textWidth = ctx.measureText(`Title`).width;
          ctx.fillStyle = 'red';
          ctx.fillText(
            `${dataValues.reduce((a, b) => a + b, 0)}`,
            titleStartX + textWidth + 15,
            22
          );
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
  fs.writeFileSync(`./src/proto/images/16-barChart-h-${getTimeString()}.svg`, buffer, 'base64');
}

main();
