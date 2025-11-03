import React from 'react';
import styles from './cooperation.module.css';

const Cooperation = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>THƯ MỜI HỢP TÁC</h1>

      <div className={styles.content}>
        <p>
          Lời đầu tiên, Công ty Đấu giá Hợp danh Khải Bảo xin gửi tới Quý cơ quan lời chúc sức khỏe và lời chào trân trọng nhất.
        </p>
        <p>
          Ngày ……/……/2025, Sở Tư pháp Thành phố Hồ Chí Minh đã chính thức ban hành Quyết định số ….. về việc phê duyệt tổ chức đấu giá tài sản đủ điều kiện thực hiện hình thức đấu giá trực tuyến (có bản sao Quyết định kèm theo Văn bản này).
        </p>
        <p>
          Như vậy, Công ty Đấu giá Hợp danh Khải Bảo trở thành tổ chức đấu giá tài sản đầu tiên trên cả nước được cơ quan có thẩm quyền phê duyệt đủ điều kiện thực hiện hình thức đấu giá trực tuyến theo quy định tại Luật đấu giá tài sản 2016.
        </p>
        <p>
          Ngày ……/……/2025, Công ty Đấu giá hợp danh Khải Bảo đã tổ chức buổi họp báo Công bố Quyết định về việc phê duyệt tổ chức đấu giá tài sản đủ điều kiện thực hiện hình thức đấu giá trực tuyến.
        </p>
        <p>
          Để xây dựng Trang thông tin điện tử đấu giá trực tuyến được Sở Tư pháp Thành phố Hồ Chí Minh thẩm định đủ điều kiện quy định tại Nghị định 62/2017/NĐ-CP và đưa vào sử dụng tốn kém rất nhiều thời gian, công sức và tiền bạc. Chính vì thế, chúng tôi thấy rằng cần phải chia sẻ việc sử dụng Trang thông tin điện tử Đấu giá trực tuyến trên tinh thần hài hòa lợi ích giữa các bên.
        </p>
        <p>
          Công ty Đấu giá Hợp danh Khải Bảo rất mong nhận được sự ủng hộ và hợp tác của Quý cơ quan về việc chia sẻ sử dụng Trang thông tin điện tử Đấu giá trực tuyến.
        </p>

        <div className={styles.contact}>
          <p><strong>Vui lòng liên hệ:</strong></p>
          <p>Công ty Đấu giá Hợp danh Khải Bảo:</p>
          <p>Trụ sở: Phòng 2.05 Lầu 2, Số 6 Lương Định Của, phường An Phú, Tp. Thủ Đức, Tp.HCM</p>
          <p>Điện thoại: 0862 707176 – Di động: 0968 101 550</p>
          <p>Email: info@daugiakhaibao.vn</p>
        </div>

        <p>Rất mong nhận được sự hợp tác của Quý cơ quan.</p>
        <p>Trân trọng cảm ơn.</p>
      </div>
    </div>
  );
};

export default Cooperation;
