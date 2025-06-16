import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TableManagement from './pages/TableManagement'
import FieldConfig from './pages/FieldConfig'
import FormEditor from './pages/FormEditor'
import FormViewer from './pages/FormViewer'

const App: React.FC = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="tables/:tableId" element={<TableManagement />} />
          <Route path="tables/:tableId/fields" element={<FieldConfig />} />
          <Route path="forms/:formId/edit" element={<FormEditor />} />
          <Route path="forms/:formId/view" element={<FormViewer />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App 