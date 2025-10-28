import React from 'react';
import styles from './guide.module.css';

const Guide = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>HƯỚNG DẪN SỬ DỤNG</h1>
      <p className={styles.subtitle}>Đấu giá trực tuyến phải đảm bảo khách quan, an toàn, an ninh mạng 22/05/2017</p>

      <div className={styles.content}>
        <p>
          Tại Nghị định 62/2017/NĐ-CP quy định chi tiết một số điều và biện pháp thi hành Luật đấu giá tài sản, Chính phủ đã quy định cụ thể về hình thức đấu giá trực tuyến.
        </p>
        <p>
          Theo đó, tổ chức đấu giá tài sản sở hữu trang thông tin điện tử đấu giá trực tuyến của tổ chức mình hoặc ký hợp đồng với tổ chức đấu giá tài sản khác có trang thông tin điện tử đấu giá trực tuyến để tổ chức cuộc đấu giá bằng hình thức đấu giá trực tuyến.
        </p>
        <p>
          Trường hợp cuộc đấu giá do Hội đồng đấu giá tài sản thực hiện hoặc trường hợp tổ chức mà Nhà nước sở hữu 100% vốn điều lệ do Chính phủ thành lập để xử lý nợ xấu của các tổ chức tín dụng thực hiện thì Hội đồng đấu giá tài sản, tổ chức mà Nhà nước sở hữu 100% vốn điều lệ do Chính phủ thành lập để xử lý nợ xấu của các tổ chức tín dụng ký hợp đồng với tổ chức đấu giá tài sản có trang thông tin điện tử đấu giá trực tuyến để tổ chức cuộc đấu giá.
        </p>
        <p>
          Đấu giá viên được tổ chức đấu giá tài sản phân công, thành viên được Hội đồng đấu giá tài sản, tổ chức mà Nhà nước sở hữu 100% vốn điều lệ do Chính phủ thành lập để xử lý nợ xấu của các tổ chức tín dụng phân công chịu trách nhiệm tổ chức thực hiện cuộc đấu giá trực tuyến.
        </p>
        <p>
          Trình tự thực hiện đấu giá trực tuyến: Nghị định cũng quy định cụ thể trình tự thực hiện cuộc đấu giá bằng hình thức đấu giá trực tuyến. Theo đó, tổ chức đấu giá tài sản đăng tải Quy chế cuộc đấu giá trên trang thông tin điện tử đấu giá trực tuyến.
        </p>
        <p>
          Khi đăng ký tham gia đấu giá, người tham gia đấu giá được cấp một tài khoản truy cập được hướng dẫn về cách sử dụng tài khoản, cách trả giá và các nội dung cần thiết khác trên trang thông tin điện tử đấu giá trực tuyến để thực hiện việc đấu giá trực tuyến.
        </p>
      </div>
    </div>
  );
};

export default Guide;
