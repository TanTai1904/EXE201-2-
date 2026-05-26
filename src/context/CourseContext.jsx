import React, { createContext, useContext, useState, useEffect } from 'react';

const CourseContext = createContext();

// Seed data representing blockchain and financial education courses
const INITIAL_COURSES = [
  {
    id: 'C01',
    title: 'Phần 1: ETF & Chứng chỉ quỹ',
    category: 'ETF',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '5 phút',
    progress: 0,
    tags: ['ETF', 'Cơ bản'],
    description: 'ETF & Chứng chỉ quỹ cho người mới bắt đầu. Tiết kiệm thời gian, đa dạng hóa tối đa.',
    lessons: [
      {
        id: 'L1.1',
        title: 'ETF & Chứng chỉ quỹ cho người mới',
        videoUrl: 'https://www.youtube.com/embed/i8EsBpEezBc',
        reading: 'Nội dung bài học:\nETF (Exchange-Traded Fund) là một loại quỹ đầu tư được giao dịch trên sàn chứng khoán giống như cổ phiếu. Thay vì mua riêng lẻ từng cổ phiếu, nhà đầu tư có thể mua một ETF để sở hữu nhiều loại tài sản cùng lúc.\n\nVí dụ:\nMột ETF có thể bao gồm cổ phiếu của Apple, Microsoft, Google và Amazon. Khi mua ETF, người dùng đang đầu tư vào cả danh mục thay vì một công ty duy nhất.\n\nLợi ích của ETF:\n- Đa dạng hóa danh mục đầu tư\n- Giảm rủi ro hơn so với mua một cổ phiếu riêng lẻ\n- Chi phí thấp hơn nhiều quỹ truyền thống\n- Phù hợp với người mới bắt đầu\n\nRủi ro cần biết:\n- ETF vẫn chịu ảnh hưởng bởi biến động thị trường\n- Không đảm bảo lợi nhuận\n- Một số ETF có phí quản lý\n\nVí dụ thực tế:\nNếu một người chỉ mua cổ phiếu của 1 công ty và công ty đó giảm mạnh, họ có thể lỗ nhiều. Nhưng ETF giúp chia tiền vào nhiều công ty khác nhau nên rủi ro thấp hơn.\n\nNguồn tham khảo:\n- Investopedia – ETF Definition\n- SEC Investor.gov – ETF Basics'
      }
    ],
    quizzes: [
      {
        question: 'ETF là gì?',
        options: [
          'A. Ví điện tử',
          'B. Quỹ đầu tư giao dịch trên sàn',
          'C. Tiền điện tử',
          'D. Tài khoản tiết kiệm'
        ],
        answerIndex: 1,
        explanation: 'ETF (Exchange-Traded Fund) là quỹ đầu tư được giao dịch trên sàn chứng khoán tương tự như một mã cổ phiếu thông thường.'
      },
      {
        question: 'Ưu điểm lớn của ETF là gì?',
        options: [
          'A. Không có rủi ro',
          'B. Đảm bảo lợi nhuận',
          'C. Đa dạng hóa đầu tư',
          'D. Giá luôn tăng'
        ],
        answerIndex: 2,
        explanation: 'Ưu điểm lớn nhất của ETF là đa dạng hóa. Sở hữu chứng chỉ quỹ giúp phân bổ vốn vào hàng chục doanh nghiệp lớn cùng lúc.'
      },
      {
        question: 'ETF thường phù hợp với đối tượng nào?',
        options: [
          'A. Chỉ chuyên gia tài chính',
          'B. Người mới bắt đầu đầu tư',
          'C. Chỉ doanh nghiệp lớn',
          'D. Người không muốn học tài chính'
        ],
        answerIndex: 1,
        explanation: 'ETF rất thích hợp với người mới bắt đầu vì nó không yêu cầu quá nhiều kỹ năng phân tích báo cáo tài chính từng mã cổ phiếu đơn lẻ.'
      },
      {
        question: 'Khi mua ETF, nhà đầu tư đang làm gì?',
        options: [
          'A. Chỉ mua một cổ phiếu duy nhất',
          'B. Mua nhiều loại tài sản trong cùng một quỹ',
          'C. Gửi tiết kiệm ngân hàng',
          'D. Mua tiền điện tử'
        ],
        answerIndex: 1,
        explanation: 'Nhà đầu tư đang gián tiếp sở hữu một phần của tất cả các tài sản nằm trong danh mục cơ cấu của quỹ đó.'
      },
      {
        question: 'Điều nào sau đây là rủi ro của ETF?',
        options: [
          'A. ETF không bao giờ giảm giá',
          'B. ETF không chịu ảnh hưởng thị trường',
          'C. ETF vẫn có thể biến động theo thị trường',
          'D. ETF luôn sinh lời'
        ],
        answerIndex: 2,
        explanation: 'Vì ETF đầu tư vào các tài sản trên sàn chứng khoán, giá trị của nó vẫn biến động tăng giảm theo thị trường chung.'
      }
    ]
  },
  {
    id: 'C02',
    title: 'Phần 2: Lãi kép',
    category: 'Savings',
    thumbnail: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '5 phút',
    progress: 0,
    tags: ['Lãi kép', 'Cơ bản'],
    description: 'Khám phá sức mạnh của lãi kép và lý do tại sao bắt đầu tích lũy sớm tạo ra sự khác biệt khổng lồ.',
    lessons: [
      {
        id: 'L2.1',
        title: 'Sức mạnh của lãi kép',
        videoUrl: 'https://www.youtube.com/embed/_CbicTTCkjg',
        reading: 'Nội dung bài học:\nLãi kép là quá trình mà tiền lãi bạn kiếm được tiếp tục tạo ra thêm tiền lãi mới theo thời gian. Đây được xem là một trong những yếu tố quan trọng nhất trong đầu tư dài hạn.\n\nVí dụ:\nBạn đầu tư 1 triệu đồng với lợi nhuận 10%/năm.\n- Sau năm đầu tiên, bạn có 1.100.000 đồng.\n- Năm tiếp theo, lợi nhuận sẽ được tính trên 1.100.000 đồng chứ không còn là 1 triệu đồng ban đầu.\n\nTheo thời gian, số tiền sẽ tăng trưởng nhanh hơn nhờ hiệu ứng “lãi sinh lãi”.\n\nVì sao lãi kép quan trọng?\n- Giúp tài sản tăng trưởng mạnh theo thời gian\n- Người đầu tư sớm có lợi thế lớn hơn\n- Phù hợp với chiến lược đầu tư dài hạn\n\nVí dụ thực tế:\nMột sinh viên bắt đầu đầu tư từ năm 20 tuổi với số tiền nhỏ mỗi tháng thường có lợi thế lớn hơn người bắt đầu ở tuổi 30 dù đầu tư nhiều tiền hơn.\n\nKey Takeaways:\n- Thời gian là yếu tố quan trọng trong đầu tư\n- Bắt đầu sớm giúp tối đa hóa lợi nhuận\n- Lãi kép hoạt động hiệu quả nhất trong dài hạn\n\nNguồn tham khảo:\n- Investor.gov – Compound Interest\n- Investopedia – Compound Interest'
      }
    ],
    quizzes: [
      {
        question: 'Lãi kép hoạt động như thế nào?',
        options: [
          'A. Chỉ tính lãi trên số tiền ban đầu',
          'B. Lãi tiếp tục sinh ra thêm lãi mới',
          'C. Không liên quan đến đầu tư',
          'D. Chỉ áp dụng cho ngân hàng'
        ],
        answerIndex: 1,
        explanation: 'Lãi kép sinh ra do lãi thu được của chu kỳ trước được gộp chung vào vốn để tiếp tục sinh lãi ở các chu kỳ sau.'
      },
      {
        question: 'Yếu tố nào quan trọng nhất để tận dụng lãi kép?',
        options: [
          'A. Mua cổ phiếu đắt tiền',
          'B. Đầu tư thật nhiều trong thời gian ngắn',
          'C. Thời gian đầu tư dài hạn',
          'D. Giao dịch liên tục mỗi ngày'
        ],
        answerIndex: 2,
        explanation: 'Thời gian chính là yếu tố nhân cấp số mũ cho lãi kép. Đầu tư định kỳ trong thời gian dài giúp tiền tăng trưởng vượt bậc.'
      },
      {
        question: 'Điều gì xảy ra nếu bắt đầu đầu tư sớm?',
        options: [
          'A. Không có khác biệt',
          'B. Có nhiều thời gian hơn để lãi kép phát huy hiệu quả',
          'C. Luôn giàu ngay lập tức',
          'D. Không cần tiết kiệm nữa'
        ],
        answerIndex: 1,
        explanation: 'Đầu tư sớm cho bạn thời gian tích lũy dài hơn, giúp đòn bẩy lãi chồng lãi phát huy tối đa sức mạnh.'
      },
      {
        question: 'Lãi kép hiệu quả nhất trong trường hợp nào?',
        options: [
          'A. Đầu tư ngắn hạn vài ngày',
          'B. Đầu tư dài hạn và đều đặn',
          'C. Rút tiền liên tục',
          'D. Chỉ giữ tiền mặt'
        ],
        answerIndex: 1,
        explanation: 'Sự kiên trì, đầu tư đều đặn kết hợp kỳ hạn dài hạn là môi trường tốt nhất để gia tăng tích lũy.'
      },
      {
        question: 'Ví dụ nào thể hiện lãi kép?',
        options: [
          'A. Chỉ nhận lãi một lần duy nhất',
          'B. Lợi nhuận được tái đầu tư để tạo thêm lợi nhuận mới',
          'C. Không có tăng trưởng theo thời gian',
          'D. Tiêu toàn bộ tiền lãi ngay lập tức'
        ],
        answerIndex: 1,
        explanation: 'Khi lãi suất tích lũy được giữ lại trong danh mục và tiếp tục được sinh lời cùng vốn gốc, đó chính là lãi kép.'
      }
    ]
  },
  {
    id: 'C03',
    title: 'Phần 3: Đa dạng hóa danh mục',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80',
    duration: '5 phút',
    level: 'Trung bình',
    difficulty: 'Trung bình',
    timeEstimated: '5 phút',
    progress: 0,
    tags: ['Rủi ro', 'Đa dạng hóa'],
    description: 'Đa dạng hóa là chiến lược phân bổ tiền đầu tư vào nhiều loại tài sản khác nhau nhằm giảm rủi ro.',
    lessons: [
      {
        id: 'L3.1',
        title: 'Đừng bỏ tất cả trứng vào một giỏ',
        videoUrl: 'https://www.youtube.com/embed/siR5Fbz1We8',
        reading: 'Nội dung bài học:\nĐa dạng hóa là chiến lược phân bổ tiền đầu tư vào nhiều loại tài sản khác nhau nhằm giảm rủi ro.\n\nVí dụ:\nThay vì đầu tư toàn bộ tiền vào một công ty, người dùng có thể chia vào ETF, cổ phiếu, tiết kiệm hoặc trái phiếu. Nếu một khoản đầu tư giảm giá mạnh, các khoản khác có thể giúp giảm thiểu thiệt hại tổng thể.\n\nLợi ích của đa dạng hóa:\n- Giảm rủi ro\n- Ổn định danh mục đầu tư\n- Hạn chế ảnh hưởng từ một ngành hoặc công ty\n\nVí dụ thực tế:\nNếu chỉ đầu tư vào một công ty công nghệ và công ty đó gặp khủng hoảng, nhà đầu tư có thể lỗ nặng. Nhưng nếu đầu tư vào nhiều ngành khác nhau, mức ảnh hưởng sẽ nhỏ hơn.\n\nKey Takeaways:\n- Không nên “all-in” vào một tài sản\n- Đa dạng hóa giúp quản lý rủi ro tốt hơn\n- ETF thường hỗ trợ đa dạng hóa hiệu quả\n\nNguồn tham khảo:\n- SEC Investor.gov – Diversification\n- Investopedia – Diversification'
      }
    ],
    quizzes: [
      {
        question: 'Mục tiêu chính của đa dạng hóa là gì?',
        options: [
          'A. Tăng rủi ro',
          'B. Giảm rủi ro đầu tư',
          'C. Tránh đóng thuế',
          'D. Đầu tư nhanh hơn'
        ],
        answerIndex: 1,
        explanation: 'Đa dạng hóa giúp giảm thiểu thiệt hại lớn khi một trong các kênh đầu tư riêng lẻ bị biến động bất lợi.'
      },
      {
        question: 'Ví dụ nào thể hiện đa dạng hóa?',
        options: [
          'A. Đầu tư toàn bộ tiền vào một cổ phiếu',
          'B. Chỉ giữ tiền mặt',
          'C. Chia tiền vào nhiều loại tài sản khác nhau',
          'D. Chỉ đầu tư tiền điện tử'
        ],
        answerIndex: 2,
        explanation: 'Chia tiền vào các lớp tài sản khác nhau như tiết kiệm, chứng chỉ quỹ, cổ phiếu là cách đa dạng hóa điển hình.'
      },
      {
        question: 'Đa dạng hóa giúp hạn chế điều gì?',
        options: [
          'A. Tăng chi tiêu cá nhân',
          'B. Ảnh hưởng khi một khoản đầu tư giảm mạnh',
          'C. Việc tiết kiệm',
          'D. Mọi loại thuế'
        ],
        answerIndex: 1,
        explanation: 'Đa dạng hóa hoạt động như tấm đệm giảm xóc khi một danh mục đầu tư nhất định có sự suy giảm giá trị.'
      },
      {
        question: 'ETF thường được xem là công cụ hỗ trợ đa dạng hóa vì:',
        options: [
          'A. Chỉ đầu tư vào một công ty',
          'B. Bao gồm nhiều tài sản khác nhau',
          'C. Không liên quan đến thị trường',
          'D. Không có biến động giá'
        ],
        answerIndex: 1,
        explanation: 'Bản thân quỹ ETF đã sở hữu một rổ nhiều loại tài sản khác nhau giúp người mua phân tán rủi ro ngay lập tức.'
      },
      {
        question: 'Điều nào KHÔNG phải là đa dạng hóa?',
        options: [
          'A. Đầu tư vào nhiều ngành nghề',
          'B. Kết hợp ETF và tiết kiệm',
          'C. All-in vào một cổ phiếu duy nhất',
          'D. Chia tiền vào nhiều loại tài sản'
        ],
        answerIndex: 2,
        explanation: 'Đầu tư toàn bộ số tiền vào một mã cổ phiếu duy nhất (All-in) là hình thức tập trung rủi ro cao nhất, ngược lại với đa dạng hóa.'
      }
    ]
  },
  {
    id: 'C04',
    title: 'Phần 4: Tâm lý đầu tư',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    duration: '4 phút',
    level: 'Trung bình',
    difficulty: 'Trung bình',
    timeEstimated: '4 phút',
    progress: 0,
    tags: ['Tâm lý', 'Trung bình'],
    description: 'Cảm xúc ảnh hưởng lớn đến quyết định đầu tư. Học cách kiểm soát cảm xúc, FOMO và hoảng loạn.',
    lessons: [
      {
        id: 'L4.1',
        title: 'Kiểm soát cảm xúc khi đầu tư',
        videoUrl: 'https://www.youtube.com/embed/gS-H1-t7KSA',
        reading: 'Nội dung bài học:\nCảm xúc là một trong những yếu tố ảnh hưởng lớn đến quyết định đầu tư. Khi thị trường tăng mạnh, nhiều người dễ bị FOMO (sợ bỏ lỡ cơ hội). Khi thị trường giảm, họ có thể hoảng loạn và bán tài sản. Những quyết định dựa trên cảm xúc thường dẫn đến rủi ro cao.\n\nNhững cảm xúc phổ biến:\n- FOMO\n- Sợ thua lỗ\n- Quá tự tin\n- Hoảng loạn khi thị trường giảm\n\nCách kiểm soát cảm xúc:\n- Có kế hoạch đầu tư rõ ràng\n- Đầu tư dài hạn\n- Không ra quyết định chỉ vì tin tức ngắn hạn\n\nVí dụ thực tế:\nNhiều người mua tài sản khi giá tăng quá cao vì thấy người khác kiếm lời, nhưng sau đó lại bán tháo khi thị trường giảm.\n\nKey Takeaways:\n- Đầu tư không chỉ là kiến thức mà còn là tâm lý\n- Quyết định cảm tính dễ gây thua lỗ\n- Kỷ luật là yếu tố quan trọng\n\nNguồn tham khảo:\n- Investopedia – Behavioral Finance\n- Forbes – FOMO Investing'
      }
    ],
    quizzes: [
      {
        question: 'FOMO trong đầu tư là gì?',
        options: [
          'A. Một loại cổ phiếu',
          'B. Sợ bỏ lỡ cơ hội đầu tư',
          'C. Một quỹ ETF',
          'D. Một loại thuế'
        ],
        answerIndex: 1,
        explanation: 'FOMO (Fear of Missing Out) là tâm lý sợ bỏ lỡ cơ hội kiếm lợi nhuận khi thấy đám đông đang hào hứng.'
      },
      {
        question: 'Điều nào giúp hạn chế đầu tư theo cảm xúc?',
        options: [
          'A. Theo trend liên tục',
          'B. Mua bán mỗi ngày',
          'C. Có kế hoạch đầu tư rõ ràng',
          'D. Đầu tư theo bạn bè'
        ],
        answerIndex: 2,
        explanation: 'Lập và tuân thủ kế hoạch đầu tư một cách kỷ luật là giải pháp tốt nhất loại bỏ yếu tố cảm xúc ngắn hạn.'
      },
      {
        question: 'Khi thị trường giảm mạnh, nhiều người thường làm gì?',
        options: [
          'A. Hoảng loạn bán tài sản',
          'B. Không quan tâm gì',
          'C. Luôn kiếm được lợi nhuận',
          'D. Không bị ảnh hưởng cảm xúc'
        ],
        answerIndex: 0,
        explanation: 'Tâm lý hoảng sợ mất sạch tài sản khiến nhiều người chọn cách bán tháo tại mức giá thấp nhất.'
      },
      {
        question: 'Điều nào là ví dụ của đầu tư cảm tính?',
        options: [
          'A. Phân tích kỹ trước khi đầu tư',
          'B. Đầu tư dài hạn có kế hoạch',
          'C. Mua tài sản chỉ vì thấy người khác kiếm lời',
          'D. Theo dõi mục tiêu tài chính cá nhân'
        ],
        answerIndex: 2,
        explanation: 'Mua theo phong trào mà không có hiểu biết hay kế hoạch tự chủ là hành vi đầu tư cảm tính.'
      },
      {
        question: 'Yếu tố quan trọng giúp nhà đầu tư ổn định hơn là gì?',
        options: [
          'A. Kỷ luật đầu tư',
          'B. Theo mọi tin đồn thị trường',
          'C. Giao dịch liên tục',
          'D. Đầu tư theo mạng xã hội'
        ],
        answerIndex: 0,
        explanation: 'Kỷ luật đầu tư giúp bạn vững tin vào chiến lược dài hạn thay vì bị lay động bởi các tin đồn hay biến động nhất thời.'
      }
    ]
  },
  {
    id: 'C05',
    title: 'Phần 5: Lạm phát',
    category: 'Inflation',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
    duration: '4 phút',
    level: 'Cơ bản',
    difficulty: 'Dễ',
    timeEstimated: '4 phút',
    progress: 0,
    tags: ['Lạm phát', 'Cơ bản'],
    description: 'Lạm phát là hiện tượng giá hàng hóa tăng dần, làm giảm sức mua của tiền mặt theo thời gian.',
    lessons: [
      {
        id: 'L5.1',
        title: 'Tiền mất giá theo thời gian',
        videoUrl: 'https://www.youtube.com/embed/9QRF5xcm9jI',
        reading: 'Nội dung bài học:\nLạm phát là hiện tượng giá hàng hóa và dịch vụ tăng theo thời gian, khiến sức mua của tiền giảm xuống.\n\nVí dụ:\nMột ly cà phê giá 20.000 đồng hôm nay, có thể tăng lên 30.000 đồng trong vài năm tới. Điều này có nghĩa là cùng một số tiền nhưng mua được ít hàng hóa hơn.\n\nVì sao lạm phát quan trọng?\n- Ảnh hưởng trực tiếp đến tiết kiệm\n- Tiền để yên quá lâu có thể mất giá trị\n- Đầu tư dài hạn giúp chống lại lạm phát tốt hơn\n\nVí dụ thực tế:\nNếu bạn giữ tiền mặt trong nhiều năm mà không đầu tư hoặc tiết kiệm có lãi, giá trị thực tế của tiền có thể giảm.\n\nKey Takeaways:\n- Lạm phát làm giảm sức mua\n- Tiết kiệm đơn thuần có thể không đủ\n- Đầu tư giúp tài sản tăng trưởng theo thời gian\n\nNguồn tham khảo:\n- IMF – Inflation Basics\n- Investopedia – Inflation'
      }
    ],
    quizzes: [
      {
        question: 'Lạm phát ảnh hưởng như thế nào đến tiền?',
        options: [
          'A. Tăng sức mua',
          'B. Giảm sức mua theo thời gian',
          'C. Không thay đổi gì',
          'D. Tăng lương tự động'
        ],
        answerIndex: 1,
        explanation: 'Lạm phát làm tăng mức giá chung của hàng hóa dịch vụ, khiến cùng một lượng tiền mua được ít đồ hơn (giảm sức mua).'
      },
      {
        question: 'Ví dụ nào thể hiện lạm phát?',
        options: [
          'A. Price hàng hóa tăng theo thời gian',
          'B. Tiền được nhân đôi ngay lập tức',
          'C. Thuế giảm',
          'D. Giá mọi thứ giảm mạnh'
        ],
        answerIndex: 0,
        explanation: 'Giá của hàng hóa (như ly cà phê, tô phở) tăng dần qua các năm chính là biểu hiện thực tế của lạm phát.'
      },
      {
        question: 'Nếu giữ tiền mặt quá lâu mà không đầu tư, điều gì có thể xảy ra?',
        options: [
          'A. Tiền tăng giá trị nhanh chóng',
          'B. Sức mua của tiền giảm dần',
          'C. Không bị ảnh hưởng gì',
          'D. Tiền tự động sinh lời cao'
        ],
        answerIndex: 1,
        explanation: 'Tiền mặt để yên sẽ không tự sinh lời để bù đắp sự trượt giá của hàng hóa, từ đó làm giảm sức mua thực tế.'
      },
      {
        question: 'Lạm phát ảnh hưởng trực tiếp đến điều gì?',
        options: [
          'A. Sức mua của người dùng',
          'B. Màu sắc tiền tệ',
          'C. Số lượng tài khoản ngân hàng',
          'D. Internet'
        ],
        answerIndex: 0,
        explanation: 'Lạm phát làm giảm trực tiếp lượng hàng hóa mà túi tiền của một người tiêu dùng có thể mua được.'
      },
      {
        question: 'Giải pháp nào thường được dùng để chống lại tác động của lạm phát?',
        options: [
          'A. Chỉ giữ toàn bộ tiền mặt',
          'B. Không tiết kiệm gì',
          'C. Đầu tư dài hạn hợp lý',
          'D. Ngừng quản lý tài chính'
        ],
        answerIndex: 2,
        explanation: 'Đầu tư dài hạn vào các tài sản sinh lời (như chứng chỉ quỹ, bất động sản, cổ phiếu) thường tạo lợi nhuận vượt trên tỷ lệ lạm phát.'
      }
    ]
  }
];

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState(() => {
    const saved = localStorage.getItem('saveplus_courses');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(c => {
        const initial = INITIAL_COURSES.find(ic => ic.id === c.id);
        if (initial) {
          return {
            ...c,
            title: initial.title,
            lessons: initial.lessons,
            quizzes: initial.quizzes,
            description: initial.description,
            thumbnail: initial.thumbnail,
            duration: initial.duration,
            level: initial.level,
            difficulty: initial.difficulty,
            tags: initial.tags
          };
        }
        return c;
      });
    }
    return INITIAL_COURSES;
  });

  const [userProgress, setUserProgress] = useState(() => {
    const saved = localStorage.getItem('saveplus_user_course_progress');
    return saved ? JSON.parse(saved) : {}; // e.g. { C01: { lessonsRead: ['L1.1'], progressPercent: 50, score: 0 } }
  });

  useEffect(() => {
    localStorage.setItem('saveplus_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('saveplus_user_course_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  const addCourse = (newCourse) => {
    const freshCourse = {
      id: 'C' + (courses.length + 1).toString().padStart(2, '0'),
      progress: 0,
      lessons: newCourse.lessons || [],
      quizzes: newCourse.quizzes || [],
      ...newCourse
    };
    setCourses(prev => [...prev, freshCourse]);
  };

  const updateCourse = (updated) => {
    setCourses(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
  };

  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const recordLessonRead = (courseId, lessonId) => {
    setUserProgress(prev => {
      const courseProg = prev[courseId] || { lessonsRead: [], progressPercent: 0, quizCompleted: false };
      const nextRead = courseProg.lessonsRead.includes(lessonId) 
        ? courseProg.lessonsRead 
        : [...courseProg.lessonsRead, lessonId];
      
      const course = courses.find(c => c.id === courseId);
      const totalLessons = course ? course.lessons.length : 1;
      const isQuizCompleted = courseProg.quizCompleted || false;
      
      const lessonsProgress = Math.round((nextRead.length / totalLessons) * 50);
      const quizProgress = isQuizCompleted ? 50 : 0;
      const progressPercent = Math.min(100, lessonsProgress + quizProgress);

      return {
        ...prev,
        [courseId]: {
          ...courseProg,
          lessonsRead: nextRead,
          progressPercent
        }
      };
    });

    // Update in courses list directly too for simple display
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const progObj = userProgress[courseId];
        const nextReadCount = progObj?.lessonsRead?.includes(lessonId)
          ? (progObj?.lessonsRead?.length || 0)
          : (progObj?.lessonsRead?.length || 0) + 1;
        const total = c.lessons.length;
        const isQuizCompleted = progObj?.quizCompleted || false;
        
        const lessonsProgress = Math.round((nextReadCount / total) * 50);
        const quizProgress = isQuizCompleted ? 50 : 0;
        return { ...c, progress: Math.min(100, lessonsProgress + quizProgress) };
      }
      return c;
    }));
  };

  const completeCourseQuiz = (courseId) => {
    setUserProgress(prev => {
      const courseProg = prev[courseId] || { lessonsRead: [], progressPercent: 0, quizCompleted: false };
      const course = courses.find(c => c.id === courseId);
      const totalLessons = course ? course.lessons.length : 1;
      const lessonsProgress = Math.round((courseProg.lessonsRead.length / totalLessons) * 50);
      const progressPercent = Math.min(100, lessonsProgress + 50);

      return {
        ...prev,
        [courseId]: {
          ...courseProg,
          quizCompleted: true,
          progressPercent
        }
      };
    });

    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const progObj = userProgress[courseId];
        const readCount = progObj?.lessonsRead?.length || 0;
        const total = c.lessons.length;
        const lessonsProgress = Math.round((readCount / total) * 50);
        return { ...c, progress: Math.min(100, lessonsProgress + 50) };
      }
      return c;
    }));
  };

  const resetAllProgress = () => {
    setUserProgress({});
    const resetCourses = INITIAL_COURSES.map(c => ({ ...c, progress: 0 }));
    setCourses(resetCourses);
    localStorage.removeItem('saveplus_user_course_progress');
    localStorage.setItem('saveplus_courses', JSON.stringify(resetCourses));
  };

  const resetCourseProgress = (courseId) => {
    setUserProgress(prev => {
      const nextProg = { ...prev };
      delete nextProg[courseId];
      return nextProg;
    });
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, progress: 0 } : c));
  };

  return (
    <CourseContext.Provider value={{
      courses,
      userProgress,
      addCourse,
      updateCourse,
      deleteCourse,
      recordLessonRead,
      completeCourseQuiz,
      setCourses,
      setUserProgress,
      resetAllProgress,
      resetCourseProgress
    }}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  return useContext(CourseContext);
}
