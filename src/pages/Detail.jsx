// Detail.js (pages/Detail.js)
import Header from "../header/header"; // Adjust path if needed
import AuctionPage from "../detail/detail"; // Fixed typo: detai -> detail (assuming file is detail.js)
import Footer from "../footer/footer";

const Detail = () => {
  return (
    <div>
      <Header />
      <AuctionPage />
      <Footer />
    </div>
  );
};

export default Detail;