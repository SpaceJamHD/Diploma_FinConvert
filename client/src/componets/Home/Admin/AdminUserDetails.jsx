import React from "react";
import { useParams } from "react-router-dom";

const AdminUserDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mt-5 text-light">
      <h2>Привіт, користувачу з ID: {id}</h2>
      <p>Тут буде детальна інформація про користувача.</p>
    </div>
  );
};

export default AdminUserDetails;
