import Header from "./components/Header";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import About from "./components/About";
import Projects from "./components/Projects";
import Founder from "./components/Founder";
import Gallery from "./components/Gallery";
import Donate from "./components/Donate";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import DonationStatusModal from "./components/DonationStatusModal";
import MobileDonateButton from "./components/MobileDonateButton";
import { siteContent as content } from "./content/site";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero image={content.heroImage} />
        <Stats stats={content.stats} />
        <About image={content.aboutImage} />
        <Projects projects={content.projects} />
        <Founder image={content.founderImage} />
        <Gallery images={content.gallery} />
        <Donate whatsapp={content.contact.whatsapp} />
        <Contact contact={content.contact} />
      </main>
      <Footer orgName={content.contact.orgName} />
      <MobileDonateButton />
      <DonationStatusModal />
    </>
  );
}
