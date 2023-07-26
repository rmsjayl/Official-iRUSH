import React, { useState, useEffect } from "react";
import GRAPHSTYLE from "styles/components/graphs/graphs.module.css";
import { Chart as ChartJS, ArcElement, Legend, Title, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

const DoughnutChart2 = ({ header, data }) => {
  ChartJS.register(ArcElement, Legend, Title, Tooltip);
  const [chartData, setChartData] = useState(data);

  useEffect(() => {
    const getClientUnitRequestData = (data) => {
      return [...new Set(data.map((ticket) => ticket.clientUnit))].map(
        (clientUnit) => {
          return data.filter((ticket) => ticket.clientUnit === clientUnit)
            .length;
        }
      );
    };

    const getClientUnitRequestDataLabels = (data) => {
      const unitLabels = [...new Set(data.map((ticket) => ticket.clientUnit))];
      const valuesToReplace = ["AND", "and", "OF", "of", "THE", "the"];
      const pattern = new RegExp(valuesToReplace.join("|"), "gi");

      const labels = unitLabels.map((label) => {
        const splitStr = label.split(" ");
        let firstChar = "";
        for (let i = 0; i < splitStr.length; i++) {
          firstChar += splitStr[i].replace(pattern, "").charAt(0);
        }
        return firstChar;
      });

      return labels;
    };

    //make an array of the clientUnit and get the first letter of each word
    const clientUnit = [
      ...new Set(data.map((ticket) => ticket.clientUnit)),
    ].map((clientUnit) => {
      const splitStr = clientUnit.split(" ");
      const valuesToReplace = ["OF", "AND", "THE", "of", "and", "the"];
      const pattern = new RegExp(valuesToReplace.join("|"), "gi");
      let firstChar = "";
      for (let i = 0; i < splitStr.length; i++) {
        firstChar += splitStr[i].replace(pattern, "").charAt(0);
      }
      return firstChar;
    });

    const generateColor = () => {
      const color = [];
      for (let i = 0; i < clientUnit.length; i++) {
        if (clientUnit[i] === "CICS") {
          color.push("#d21e1f");
        } else if (clientUnit[i] === "AMV-CA") {
          color.push("#ee5758");
        } else if (clientUnit[i] === "FE") {
          color.push("#636272");
        } else if (clientUnit[i] === "IPEA") {
          color.push("#ffe288");
        } else if (clientUnit[i] === "CRS") {
          color.push("#5fc5ca");
        } else if (clientUnit[i] === "FCL") {
          color.push("#0d8627");
        } else if (clientUnit[i] === "CA") {
          color.push("#0d8627");
        } else if (clientUnit[i] === "CE") {
          color.push("#e87a25");
        } else if (clientUnit[i] === "CCBM") {
          color.push("#e8c32d");
        } else if (clientUnit[i] === "CTHM") {
          color.push("#368430");
        } else if (clientUnit[i] === "FAL") {
          color.push("#15236c");
        } else if (clientUnit[i] === "CFAD") {
          color.push("#721414");
        } else if (clientUnit[i] === "GS") {
          color.push("#2b91ff");
        } else if (clientUnit[i] === "GSL") {
          color.push("#9c1416");
        } else if (clientUnit[i] === "FAL") {
          color.push("#15236c");
        } else if (clientUnit[i] === "FMS") {
          color.push("#f3da7d");
        } else if (clientUnit[i] === "CM") {
          color.push("#e86790");
        } else if (clientUnit[i] === "CN") {
          color.push("#134b0e");
        } else if (clientUnit[i] === "FP") {
          color.push("#7937bf");
        } else if (clientUnit[i] === "FP-EFP") {
          color.push("#1d2780");
        } else if (clientUnit[i] === "FST") {
          color.push("#d7d6db");
        } else if (clientUnit[i] === "SHS") {
          color.push("#e0c037");
        } else if (clientUnit[i] === "JHS") {
          color.push("#4e3823");
        } else if (clientUnit[i] === "EHS") {
          color.push("#303030");
        }
      }
      return color;
    };

    setChartData({
      labels: getClientUnitRequestDataLabels(data),
      datasets: [
        {
          data: getClientUnitRequestData(data),
          backgroundColor: generateColor(),
          barPercentage: 0.6,
          minBarLength: 2,
        },
      ],
    });
  }, [data]);

  return (
    <div className={GRAPHSTYLE.chart}>
      {chartData && chartData.datasets ? (
        <Doughnut
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
  );
};

export default DoughnutChart2;
