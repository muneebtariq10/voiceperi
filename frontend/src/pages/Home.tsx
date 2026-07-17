import ContactUs from '@/components/ContactUs'
import FAQ from '@/components/FAQ'
import Feature from '@/components/Feature'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import HomeContent from '@/components/HomeContent'
import Pricing from '@/components/Pricing'
import UseCase from '@/components/UseCase'
import AboutUs from '@/components/AboutUs'

const Home = () => {
    return (
        <div className=''>

            <Header />
            <HomeContent />
            <Feature />
            <UseCase />
            <Pricing />
            <FAQ />
            <AboutUs />
            <ContactUs />
            <Footer />

        </div>

    )
}

export default Home