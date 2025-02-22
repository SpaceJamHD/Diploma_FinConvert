import React, { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import ExpenseCategoryChart from "./ExpenseCategoryChart";
// import CurrencyDistributionChart from "./CurrencyDistributionChart";
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

const ChartTabs = ({ transactions, goal, balances }) => {
  const [key, setKey] = useState("categories");

  console.log(" Данные переданы в ChartTabs:");
  console.log(" Транзакции:", transactions);
  console.log(" Цель:", goal);
  console.log(" Баланс:", balances);

  return (
    <div className="chart-tabs-container">
      <Tabs
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-4 custom-tabs"
        variant="pills"
        fill
      >
        <Tab
          eventKey="categories"
          title={<span className="tab-title"> Категории трат</span>}
        >
          <ExpenseCategoryChart transactions={transactions} />
        </Tab>

        {/* <Tab eventKey="distribution" title=" Распределение валют">
          <CurrencyDistributionChart
            transactions={transactions}
            goal={goal}
            balances={balances}
          />
        </Tab> */}
      </Tabs>
    </div>
  );
};

export default ChartTabs;
