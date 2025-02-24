import React, { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import ExpenseCategoryChart from "./ExpenseCategoryChart";
import GoalProgressChart from "./GoalProgressChart";
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
  const [key, setKey] = useState("categories");

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
          title={<span className="tab-title"> Категорії витрат</span>}
        >
          <ExpenseCategoryChart transactions={transactions} />
        </Tab>
        <Tab
          eventKey="goalProgress"
          title={<span className="tab-title"> Прогрес цілі</span>}
        >
          <GoalProgressChart
            goal={goal}
            transactions={transactions}
            exchangeRates={exchangeRates}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ChartTabs;
