import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import VideoToText from './pages/VideoToText'
import LinkToText from './pages/LinkToText'
import LiveTranscription from './pages/LiveTranscription'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="video-to-text" element={<VideoToText />} />
        <Route path="link-to-text" element={<LinkToText />} />
        <Route path="live-transcription" element={<LiveTranscription />} />
      </Route>
    </Routes>
  )
}

export default App 