import React, { useState } from 'react';
import styles from './about.module.css';

const About = () => {
  const [activeSection, setActiveSection] = useState('letter');

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>CÔNG TY ĐẤU GIÁ HỢP DANH KHẢI BẢO</h1>
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeSection === 'letter' ? styles.active : ''}`}
          onClick={() => handleSectionChange('letter')}
        >
          THƯ NGỎ TỪ KHẢI BẢO
        </button>
        <button
          className={`${styles.tabButton} ${activeSection === 'intro' ? styles.active : ''}`}
          onClick={() => handleSectionChange('intro')}
        >
          GIỚI THIỆU CÔNG TY
        </button>
      </div>
      <div className={styles.content}>
        {activeSection === 'letter' && (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>THƯ NGỎ TỪ KHẢI BẢO</h2>
            <p><strong>Kính gửi: Quý khách hàng</strong></p>
            <p>
              Lời đầu, CÔNG TY ĐẤU GIÁ HỢP DANH KHẢI BẢO xin gửi đến Quý khách hàng lời chúc sức khỏe, thành công và thịnh vượng. Công ty xin cảm ơn Quý khách hàng đã tín nhiệm, tin dùng và đồng hành cùng sự phát triển của chúng tôi trong thời gian qua.
            </p>
            <p>
              Công ty Đấu giá Hợp danh Khải Bảo là một tổ chức đấu giá chuyên nghiệp được thành lập theo Luật đấu giá tài sản, được Sở Tư pháp Thành phố Hồ Chí Minh cấp Giấy chứng nhận đăng ký hoạt động số 41.02.0016/TP-ĐGTS-ĐKHĐ cấp chuyển đổi ngày 11/04/2018, cấp lại lần 3 ngày 14/03/2025.
            </p>
            <p>Công ty được pháp luật cho phép đấu giá các tài sản sau đây:</p>
            <ul className={styles.list}>
              <li>Tài sản nhà nước theo quy định của pháp luật về quản lý, sử dụng tài sản nhà nước;</li>
              <li>Tài sản được xác lập quyền sở hữu toàn dân theo quy định của pháp luật;</li>
              <li>Tài sản là quyền sử dụng đất theo quy định của pháp luật về đất đai;</li>
              <li>Tài sản bảo đảm theo quy định của pháp luật về giao dịch bảo đảm;</li>
              <li>Tài sản thi hành án theo quy định của pháp luật về thi hành án dân sự;</li>
              <li>Tài sản là tang vật, phương tiện vi phạm hành chính bị tịch thu sung quỹ nhà nước, tài sản kê biên để bảo đảm thi hành quyết định xử phạt vi phạm hành chính;</li>
              <li>Tài sản là hàng dự trữ quốc gia theo quy định của pháp luật về dự trữ quốc gia;</li>
              <li>Tài sản cố định của doanh nghiệp theo quy định của pháp luật về quản lý, sử dụng vốn nhà nước;</li>
              <li>Tài sản của doanh nghiệp, hợp tác xã bị tuyên bố phá sản;</li>
              <li>Tài sản hạ tầng đường bộ và quyền thu phí sử dụng tài sản hạ tầng đường bộ;</li>
              <li>Tài sản là quyền khai thác khoáng sản;</li>
              <li>Tài sản là quyền sử dụng, quyền sở hữu rừng sản xuất là rừng trồng;</li>
              <li>Tài sản là quyền sử dụng tần số vô tuyến điện;</li>
              <li>Tài sản là nợ xấu và tài sản bảo đảm của khoản nợ xấu;</li>
              <li>Tài sản khác mà pháp luật quy định phải bán thông qua đấu giá;</li>
              <li>Tài sản thuộc sở hữu của cá nhân, tổ chức tự nguyện lựa chọn bán thông qua đấu giá.</li>
            </ul>
            <p>
              Với năng lực của mình, chúng tôi sẽ mang lại dịch vụ đấu giá tài sản hiệu quả nhất, đảm bảo nhất cho Quý Khách hàng. Công ty hoạt động với tầm nhìn “Trở thành Công ty cung cấp dịch vụ Đấu giá hàng đầu Việt Nam”, với phương châm “Trao giá trị – Nhận niềm tin”.
            </p>
            <p>
              Chúng tôi sẽ không ngừng nâng cao dịch vụ nhằm mang lại lợi ích, sự hài lòng tốt nhất cho Quý Khách hàng. Trong quá trình hoạt động, chúng tôi rất mong nhận được sự hợp tác, hỗ trợ từ Quý Cơ quan, Ban, Ngành.
            </p>
            <p>
              <strong>Công ty Đấu giá Hợp danh Khải Bảo cảm ơn Quý Cơ quan, Ban, Ngành; Quý doanh nghiệp đã quan tâm.</strong>
            </p>
          </div>
        )}
        {activeSection === 'intro' && (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>GIỚI THIỆU CÔNG TY</h2>
            <p>
              Công ty Đấu giá Hợp danh Khải Bảo được chuyển đổi từ Công ty TNHH Tư vấn Đầu tư và Dịch vụ Tài chính Khải Bảo theo quy định tại Điều 80 Luật đấu giá tài sản 2016, được Sở Tư pháp Thành phố Hồ Chí Minh cấp giấy hoạt động số 41.02.0016/TP-ĐGTS-ĐKHĐ cấp chuyển đổi ngày 11/04/2018, cấp lại lần 2 ngày 24/02/2023.
            </p>
            <h3 className={styles.subTitle}>a. Thông tin về Công ty trước khi chuyển đổi:</h3>
            <ul className={styles.list}>
              <li><strong>Tên Tiếng Việt:</strong> CÔNG TY TNHH TƯ VẤN ĐẦU TƯ VÀ DỊCH VỤ TÀI CHÍNH KHẢI BẢO</li>
              <li><strong>Tên Tiếng Anh:</strong> KHAI BAO INVESTMENT ADVISORY AND FINANCIAL SERVICES COMPANY LIMITED</li>
              <li><strong>Tên viết tắt:</strong> KHAI BAO CO.,LTD</li>
              <li><strong>Trụ sở chính:</strong> Số 39-41, Lê Thạch, Phường 13, Quận 4, Thành phố Hồ Chí Minh, Việt Nam</li>
              <li><strong>Tổng Giám đốc:</strong> Ông Phạm Văn Khánh</li>
              <li><strong>Điện thoại:</strong> 0862 707176</li>
              <li><strong>Website:</strong> www.khaibao.com.vn</li>
              <li><strong>Email:</strong> daugiakhaibao@gmail.com</li>
              <li><strong>Mã số thuế:</strong> 0311552765</li>
              <li><strong>Số tài khoản:</strong> 140214851028092 tại Ngân hàng TMCP Xuất nhập khẩu Việt Nam – Chi nhánh Quận 4</li>
              <li><strong>Đăng ký doanh nghiệp:</strong> Số 0311552765 do Sở Kế hoạch đầu tư Tp. HCM cấp ngày 20/02/2012</li>
            </ul>
            <h3 className={styles.subTitle}>b. Thông tin về Công ty sau khi chuyển đổi:</h3>
            <ul className={styles.list}>
              <li><strong>Tên Tiếng Việt:</strong> CÔNG TY ĐẤU GIÁ HỢP DANH KHẢI BẢO</li>
              <li><strong>Tên Tiếng Anh:</strong> KHAI BAO PROPERTY AUCTION PARTNERSHIP COMPANY</li>
              <li><strong>Tên viết tắt:</strong> KHAIBAO PC</li>
              <li><strong>Trụ sở chính:</strong> Phòng 2.05 Lầu 2, Số 6 Lương Định Của, Phường An Phú, Tp. Thủ Đức, TP.HCM</li>
              <li><strong>Tổng Giám đốc:</strong> Ông Phạm Văn Khánh</li>
              <li><strong>Điện thoại:</strong> 0862 707176</li>
              <li><strong>Website:</strong> https://daugiakhaibao.vn</li>
              <li><strong>Email:</strong> info@daugiakhaibao.vn hoặc daugiakhaibao@gmail.com</li>
              <li><strong>Mã số thuế:</strong> 0315026481</li>
              <li><strong>Tài khoản số:</strong> 151618188 tại Ngân hàng TMCP Á Châu – CN Hòa Hưng</li>
              <li><strong>Đăng ký hoạt động:</strong> Số 41.02.0016/TP-ĐGTS-ĐKHĐ cấp chuyển đổi ngày 11/04/2018, cấp lại lần 2 ngày 24/02/2023</li>
            </ul>
            <p>
              Căn cứ quy định tại Điều 7 Nghị định 62/2017/NĐ-CP, Công ty Đấu giá Hợp danh Khải Bảo được kế thừa toàn bộ các quyền, lợi ích hợp pháp và nghĩa vụ trong hoạt động đấu giá tài sản của Công ty TNHH Tư vấn Đầu tư và Dịch vụ Tài chính Khải Bảo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;