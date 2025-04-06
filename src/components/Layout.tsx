import { Outlet, NavLink } from 'react-router-dom'

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Speech to Text App</h1>
            <nav>
              <ul className="flex space-x-6">
                <li>
                  <NavLink 
                    to="/"
                    className={({ isActive }) => 
                      isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                    }
                    end
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/video-to-text"
                    className={({ isActive }) => 
                      isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                    }
                  >
                    Video to Text
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/link-to-text"
                    className={({ isActive }) => 
                      isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                    }
                  >
                    Link to Text
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/live-transcription"
                    className={({ isActive }) => 
                      isActive ? "font-bold border-b-2 border-white" : "hover:text-blue-200"
                    }
                  >
                    Live Transcription
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Speech to Text App by Lee Hoi Ying 22049482S</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout 