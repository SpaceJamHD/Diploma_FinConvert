import React from "react";
import { Routes, Route } from "react-router-dom";
import LossAnalysis from "../AnalyticsCharts/LossAnalysis";
import "../../../styles/HomePage.css";
import "../../../styles/bootstrap/css/bootstrap.min.css";

const AnalyticsPage = () => {
  return (
    <div className="container">
      <h1>Аналитика</h1>
      <Routes>
        <Route path="/" element={<LossAnalysis />} />{" "}
      </Routes>
    </div>
  );
};

export default AnalyticsPage;
