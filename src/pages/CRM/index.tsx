import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Opportunities from './Opportunities';
import FollowRecords from './FollowRecords';
import CustomerTransfer from './CustomerTransfer';

const CRM: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/crm/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/follow-records" element={<FollowRecords />} />
      <Route path="/customer-transfer" element={<CustomerTransfer />} />
    </Routes>
  );
};

export default CRM; 