import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Path } from './pages/Path'
import { Stage } from './pages/Stage'
import { Lesson } from './pages/Lesson'
import { Standards } from './pages/Standards'
import { Profile } from './pages/Profile'

export default function App() {
  return (
    <ProgressProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="path" element={<Path />} />
            <Route path="stage/:stageId" element={<Stage />} />
            <Route path="lesson/:lessonId" element={<Lesson />} />
            <Route path="standards" element={<Standards />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ProgressProvider>
  )
}
