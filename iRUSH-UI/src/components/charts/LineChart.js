import React, { useState, useEffect } from "react";
import GRAPHSTYLE from "styles/components/graphs/graphs.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ header, data }) => {
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    const createdAtData = [
      ...new Set(
        data.map((ticket) => moment(ticket.createdAt).format("YYYY-MM-DD"))
      ),
    ].sort((a, b) => {
      return moment(a, "YYYY-MM-DD").diff(moment(b, "YYYY-MM-DD"));
    });

    const ticketCategoryData = [
      ...new Set(
        data.map((ticket) => moment(ticket.createdAt).format("YYYY-MM-DD"))
      ),
    ]
      .sort((a, b) => {
        return moment(a, "YYYY-MM-DD").diff(moment(b, "YYYY-MM-DD"));
      })
      .map((createdAt) => {
        return data.filter(
          (ticket) =>
            moment(ticket.createdAt).format("YYYY-MM-DD") === createdAt
        ).length;
      });

    setChartData({
      labels: createdAtData,
      datasets: [
        {
          data: ticketCategoryData.map((data) => {
            return data;
          }),
          backgroundColor: ["rgba(254, 192, 15)"],
        },
      ],
    });
  }, [data]);

  return (
    <>
      <div className={GRAPHSTYLE.chart}>
        {chartData && chartData.datasets ? (
          <Line
            data={chartData}
            height={200}
            width={900}
            options={{
              responsive: false,
              plugins: {
                legend: {
                  display: false,
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
    </>
  );
};

export default LineChart;
