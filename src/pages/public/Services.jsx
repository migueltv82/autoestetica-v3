import PublicLayout from "../../components/layout/PublicLayout";
import ServicesGrid from "../../components/services/ServicesGrid";
import PageTransition from "../../components/ui/PageTransition";

function Services() {
  return (
    <PageTransition>
      <PublicLayout>
        <ServicesGrid />
      </PublicLayout>
    </PageTransition>
  );
}

export default Services;
