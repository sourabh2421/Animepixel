import { Routes, Route } from 'react-router-dom'
import Navbar from './components/navbar'
import Hero from './components/hero'
import WhyChooseUs from './components/WhyChooseUs'
import TrendingPosts from './components/TrendingPosts'
import Footer from './components/Footer'
import ShareButton from './components/ShareButton'
import ScrollToTop from './components/ScrollToTop'
import ErrorBoundary from './components/ErrorBoundary'
import Signup from './innerComponents/signup'
import PaidPackage from './innerComponents/paidpackage'
import HelpCenter from './innerComponents/HelpCenter'
import ContactUs from './innerComponents/ContactUs'
import FAQ from './innerComponents/FAQ'
import TermsOfService from './innerComponents/TermsOfService'
import PrivacyPolicy from './innerComponents/PrivacyPolicy'
import CookiePolicy from './innerComponents/CookiePolicy'
import SearchResults from './innerComponents/SearchResults'
import AnimeSearch from './innerComponents/AnimeSearch'
import WatchAnime from './innerComponents/WatchAnime'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cr-dark">
        <ScrollToTop />
        <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Hero />
              <WhyChooseUs />
              <TrendingPosts />
              <Footer />
              <ShareButton />
            </>
          }
        />
        <Route path="/signup" element={<><ShareButton /><Signup /></>} />
        <Route path="/paidpackage" element={<><ShareButton /><PaidPackage /></>} />
        <Route path="/help" element={<><ShareButton /><HelpCenter /></>} />
        <Route path="/contact" element={<><ShareButton /><ContactUs /></>} />
        <Route path="/faq" element={<><ShareButton /><FAQ /></>} />
        <Route path="/terms" element={<><ShareButton /><TermsOfService /></>} />
        <Route path="/privacy" element={<><ShareButton /><PrivacyPolicy /></>} />
        <Route path="/cookies" element={<><ShareButton /><CookiePolicy /></>} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/anime-search" element={<AnimeSearch />} />
        <Route path="/watch/:id" element={<ErrorBoundary><WatchAnime /></ErrorBoundary>} />
      </Routes>
    </div>
    </ErrorBoundary>
  )
}

export default App
