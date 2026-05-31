import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Layouts
import MainLayout from '@components/layouts/MainLayout'

// Pages
import HomePage from '@pages/Home'
import ArchitecturePage from '@pages/Architecture'
import DatabasePage from '@pages/Database'
import WorkflowPage from '@pages/Workflows'
import SecurityPage from '@pages/Security'
import UIUXPage from '@pages/UX-Design'
import InfrastructurePage from '@pages/Infrastructure'
import APIPage from '@pages/API'
import RoadmapPage from '@pages/Roadmap'

import './styles/global.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/database" element={<DatabasePage />} />
          <Route path="/workflows" element={<WorkflowPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/ui-ux" element={<UIUXPage />} />
          <Route path="/infrastructure" element={<InfrastructurePage />} />
          <Route path="/api" element={<APIPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App
