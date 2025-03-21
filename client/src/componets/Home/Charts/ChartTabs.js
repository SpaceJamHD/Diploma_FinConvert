import React, { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import GoalProgressChart from "./GoalProgressChart";
import GoalSpeedChart from "./GoalSpeedChart";
import MostUsedCurrenciesChart from "./MostUsedCurrenciesChart";
import TopUpFrequencyChart from "./TopUpFrequencyChart";
import "../../../styles/goal.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const ChartTabs = ({ transactions, goal, balances, exchangeRates }) => {
  const [key, setKey] = useState("histogram");

  return (
    <div className="chart-tabs-container">
      <Tabs
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-4 custom-tabs"
        variant="pills"
        fill
      >
        <Tab eventKey="speed" title="Швидкість досягнення">
          {key === "speed" && (
            <GoalSpeedChart goal={goal} transactions={transactions} />
          )}
        </Tab>
        <Tab
          eventKey="chart"
          title={<span className="tab-title">Прогрес (Лінійний графік)</span>}
        >
          {key === "chart" && (
            <GoalProgressChart
              goal={goal}
              transactions={transactions}
              exchangeRates={exchangeRates}
            />
          )}
        </Tab>
        <Tab eventKey="currencies" title="Найбільш використовувані валюти">
          {key === "currencies" && (
            <MostUsedCurrenciesChart transactions={transactions} />
          )}
        </Tab>
        <Tab eventKey="frequency" title="Частота поповнень">
          {key === "frequency" && (
            <TopUpFrequencyChart transactions={transactions} />
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default ChartTabs;
