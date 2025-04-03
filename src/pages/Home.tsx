import { Link } from 'react-router-dom'

const FeatureCard = ({ title, description, link, icon }: {
  title: string;
  description: string;
  link: string;
  icon: string;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="mb-4 text-gray-700">{description}</p>
      <Link 
        to={link} 
        className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Try it now
      </Link>
    </div>
  )
}

const Home = () => {
  const features = [
    {
      title: 'Video to Text',
      description: 'Upload a video file and get accurate transcription in minutes.',
      link: '/video-to-text',
      icon: '🎬'
    },
    {
      title: 'Link to Text',
      description: 'Convert audio from a video or audio URL into text automatically.',
      link: '/link-to-text',
      icon: '🔗'
    },
    {
      title: 'Live Transcription',
      description: 'Get real-time transcription from your microphone input.',
      link: '/live-transcription',
      icon: '🎙️'
    }
  ]

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Speech to Text Conversion Made Easy</h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Convert speech to text using our powerful and accurate transcription tools. 
          Upload videos, provide links, or use real-time microphone input.
        </p>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </section>
    </div>
  )
}

export default Home 