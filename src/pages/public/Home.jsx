import PublicLayout from "../../components/layout/PublicLayout";
import Hero from "../../components/home/Hero";
import ServicesPreview from "../../components/home/ServicesPreview";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import CtaBanner from "../../components/home/CtaBanner";
import PageTransition from "../../components/ui/PageTransition";

function Home() {
  return (
    <PageTransition>
      <PublicLayout>
        <Hero />
        <ServicesPreview />
        <WhyChooseUs />
        <CtaBanner />
      </PublicLayout>
    </PageTransition>
  );
}

export default Home;