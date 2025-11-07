import React from 'react';
import { useParams } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';
import Header from '../header/header';
import Footer from '../footer/footer';

const PDFViewerPage = () => {
  const { fileName } = useParams();

  // Map file names to titles and paths
  const pdfFiles = {
    'CHINH-SACH-BAO-VE': {
      title: 'Chính Sách Bảo Vệ Thông Tin Người Dùng',
      path: '/assets/files/CHINH-SACH-BAO-VE.pdf'
    },
    'DIEU-KHOAN-CHINH-SACH': {
      title: 'Điều Khoản Và Chính Sách Chung',
      path: '/assets/files/DIEU-KHOAN-CHINH-SACH.pdf'
    },
    'HUONG-DAN-DANG-KY': {
      title: 'Hướng Dẫn Đăng Ký Tài Khoản Đấu Giá',
      path: '/assets/files/HUONG-DAN-DANG-KY.pdf'
    },
    'Phuong-an-giai-quyet-khieu-nai-to-cao': {
      title: 'Phương Án Giải Quyết Khiếu Nại Tố Cáo',
      path: '/assets/files/Phuong-an-giai-quyet-khieu-nai-to-cao.pdf'
    }
  };

  const pdfData = pdfFiles[fileName];

  if (!pdfData) {
    return (
      <div>
        <Header />
        <div style={{
          textAlign: 'center',
          padding: '50px',
          color: '#d32f2f',
          fontSize: '18px'
        }}>
          File PDF không tồn tại hoặc không thể truy cập.
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div style={{ padding: '20px 0' }}>
        <PDFViewer
          pdfUrl={pdfData.path}
          title={pdfData.title}
        />
      </div>
      <Footer />
    </div>
  );
};

export default PDFViewerPage;
