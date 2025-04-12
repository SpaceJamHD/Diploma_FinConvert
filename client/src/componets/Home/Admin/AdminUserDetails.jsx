import React from "react";
import { useParams } from "react-router-dom";
import AdminUserGoals from "./AdminUserGoals";
import AdminUserHistory from "./AdminUserHistory";

const AdminUserDetails = () => {
  const { id } = useParams();

  return (
    <div className="container mt-5 text-light">
      <h2>Користувач ID: {id}</h2>

      <AdminUserGoals userId={id} />
      <hr className="text-secondary" />

      <AdminUserHistory userId={id} />
    </div>
  );
};

export default AdminUserDetails;
