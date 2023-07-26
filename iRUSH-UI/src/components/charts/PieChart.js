import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Legend, Title, Tooltip } from "chart.js";
import GRAPHSTYLE from "styles/components/graphs/graphs.module.css";
import { Pie } from "react-chartjs-2";

const PieChart = ({ header, data }) => {
  const [chartData, setChartData] = useState(data);
  ChartJS.register(ArcElement, Legend, Title, Tooltip);

  useEffect(() => {
    //delete all the duplicate data in the array or set a new array with unique values
    const categories = [
      ...new Set(data.map((ticket) => ticket.ticketCategory)),
    ];

    //find the length of each category
    const ticketCategoryData = [
      ...new Set(data.map((ticket) => ticket.ticketCategory)),
    ].map((category) => {
      return data.filter((ticket) => ticket.ticketCategory === category).length;
    });

    setChartData({
      labels: categories,
      datasets: [
        {
          data: ticketCategoryData.map((data) => {
            return data;
          }),
          //set the background color of each data in the given array
          backgroundColor: [
            "#fce278",
            "#a484b0",
            "#88a6c9",
            "#d43d51",
            "#00876c",
            "#64ad73",
            "#afd17c",
          ],
        },
      ],
    });
  }, [data]);

  return (
    <>
      <div className={GRAPHSTYLE.chart}>
        {chartData && chartData.datasets ? (
          <Pie
            data={chartData}
            height={300}
            width={300}
            options={{
              responsive: false,
              plugins: {
                legend: {
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
            className="chart-no-data"
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
    </>
  );
};

export default PieChart;
