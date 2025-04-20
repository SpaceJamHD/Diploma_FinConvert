import React, { useState, useEffect } from "react";
import Goals from "./Goals";
import axiosInstance from "../../../utils/axiosInstance";

const ParentComponent = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data } = await axiosInstance.get("/api/goals");
        setGoals(data);
      } catch (error) {
        console.error("Ошибка при загрузке целей:", error);
      }
    };

    fetchGoals();
  }, []);

  return <Goals goals={goals} setGoals={setGoals} />;
};

export default ParentComponent;
