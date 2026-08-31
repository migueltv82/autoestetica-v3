import PublicLayout from "../../components/layout/PublicLayout";
import InquiryForm from "../../components/contact/InquiryForm";
import PageTransition from "../../components/ui/PageTransition";

function Inquiry() {
  return (
    <PageTransition>
      <PublicLayout>
        <InquiryForm />
      </PublicLayout>
    </PageTransition>
  );
}

export default Inquiry;
