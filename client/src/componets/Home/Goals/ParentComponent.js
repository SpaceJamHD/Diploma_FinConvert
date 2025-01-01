import React, { useState, useEffect } from "react";
import Goals from "./Goals";

const ParentComponent = () => {
  const [goals, setGoals] = useState([]);

  // Загрузка данных из API при загрузке компонента
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("/api/goals", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Ошибка при загрузке целей");
        }
        const data = await response.json();
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
