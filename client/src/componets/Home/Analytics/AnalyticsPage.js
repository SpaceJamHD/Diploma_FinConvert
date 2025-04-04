import React from "react";
import SpreadLossChart from "./SpreadLossChart";
import GoalsDistributionChart from "./GoalsDistributionChart";
import ForecastAdvice from "./ForecastAdvice";
import ExchangeDirectionsChart from "./ExchangeDirectionsChart";

const AnalyticsPage = () => {
  const chartHeight = "540px";

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <ExchangeDirectionsChart />
      </div>

      <div
        className="d-flex flex-wrap gap-4 mb-4"
        style={{
          justifyContent: "space-between",
          alignItems: "stretch",
        }}
      >
        <div style={{ flex: "1 1 48%", height: chartHeight }}>
          <div style={{ height: "100%" }}>
            <GoalsDistributionChart />
          </div>
        </div>

        <div style={{ flex: "1 1 48%", height: chartHeight }}>
          <div style={{ height: "100%" }}>
            <ForecastAdvice />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <SpreadLossChart />
      </div>
    </div>
  );
};

export default AnalyticsPage;
