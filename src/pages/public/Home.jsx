import PublicLayout from "../../components/layout/PublicLayout";
import Hero from "../../components/home/Hero";
import ServicesPreview from "../../components/home/ServicesPreview";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import CtaBanner from "../../components/home/CtaBanner";

function Home() {
  return (
    <PublicLayout>
      <Hero />
      <ServicesPreview />
      <WhyChooseUs />
      <CtaBanner />
    </PublicLayout>
  );
}

export default Home;