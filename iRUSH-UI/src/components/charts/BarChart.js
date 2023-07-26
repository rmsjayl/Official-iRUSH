import React, { useState, useEffect } from "react";
import GRAPHSTYLE from "styles/components/graphs/graphs.module.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "react-chartjs-2";

const BarChart = ({ header, data }) => {
  const [chartData, setChartData] = useState(data);
  ChartJS.register(BarElement, CategoryScale, LinearScale);

  useEffect(() => {
    setChartData({
      labels: data.map((data) => `${data.firstName} ${data.lastName}`),
      datasets: [
        {
          data: data.map((data) => data.resolvedTickets),
          backgroundColor: [
            "#A4761C",
            "#C99023",
            "#E87F0F",
            "#FCA93E",
            "#FEC882",
            "#A4761C",
            "#C99023",
            "#E87F0F",
            "#B3FB91",
            "#92ED69",
            "#AEF0CD",
            "#75E8D1",
            "#41D6EA",
            "#B3FB91",
            "#92ED69",
            "#AEF0CD",
          ],
          barPercentage: 0.6,
          minBarLength: 2,
        },
      ],
    });
  }, [data]);

  return (
    <div className={GRAPHSTYLE.chart}>
      {chartData && chartData.datasets ? (
        <Bar
          data={chartData}
          height={200}
          width={900}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
                position: "bottom",
              },
              title: {
                display: true,
                text: header,
              },
            },
          }}
        />
      ) : (
        <div
          style={{
            textAlign: "center",
            fontWeight: "700",
            color: "rgba(0, 0, 0, 0.5)",
            textTransform: "uppercase",
            fontSize: "13px",
          }}
        >
          No data yet to display
        </div>
      )}
    </div>
  );
};

export default BarChart;
