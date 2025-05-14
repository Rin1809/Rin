import React from 'react';
import './styles/PersonalCard.css';

interface PersonalCardProps {
  style?: React.CSSProperties;
  name: string;
  section: 'about' | 'all'; // To control what's displayed
}

const PersonalCard: React.FC<PersonalCardProps> = ({ style, name, section }) => {
  const containerClassName = section === 'about' ? 'personal-card-about-view' : 'personal-card-container';

  if (section === 'about') {
    return (
      <div className={containerClassName} style={style}>
        <h2 className="about-section-title">Giới Thiệu</h2>
        <p className="bio-text">
          Chào bạn! Mình là {name}, một người đam mê công nghệ với nhiều năm kinh nghiệm trong việc phát triển các giải pháp phần mềm sáng tạo và quản trị hạ tầng hệ thống vững chắc.
          Niềm yêu thích của mình là không ngừng khám phá những công nghệ tiên tiến, từ đó xây dựng nên các sản phẩm không chỉ giải quyết vấn đề hiệu quả mà còn mang lại trải nghiệm người dùng tối ưu.
          Mình tin tưởng mạnh mẽ vào tinh thần hợp tác, sức mạnh của cộng đồng mã nguồn mở, và luôn tìm kiếm cơ hội để đóng góp cũng như học hỏi từ những người cùng chí hướng.
        </p>
      </div>
    );
  }

  // Fallback for section === 'all' or other future sections
  return (
    <div className={containerClassName} style={style}>
      {/* Header can be re-added here if needed for 'all' view */}
      {/* Example:
      <div className="card-main-header">
         ... avatar, name, title for 'all' view
      </div>
      */}

      <div className="card-section">
        <h3 className="section-heading">Giới Thiệu</h3>
        <p className="bio-text">
          Chào bạn! Mình là {name}, một người đam mê công nghệ với kinh nghiệm trong phát triển phần mềm và quản trị hệ thống.
          Mình thích khám phá những công nghệ mới và xây dựng các giải pháp sáng tạo.
          Mình tin vào sức mạnh của mã nguồn mở và cộng đồng.
        </p>
      </div>

      <div className="card-section">
        <h3 className="section-heading">Kỹ Năng</h3>
        <ul className="skills-list">
          <li className="skill-tag">Python</li>
          <li className="skill-tag">JavaScript/TypeScript</li>
          <li className="skill-tag">React</li>
          <li className="skill-tag">Node.js</li>
          <li className="skill-tag">Docker</li>
          <li className="skill-tag">Linux</li>
          <li className="skill-tag">SQL/NoSQL</li>
          <li className="skill-tag">Git</li>
          <li className="skill-tag">Cloud (AWS/GCP cơ bản)</li>
        </ul>
      </div>

      <div className="card-section">
        <h3 className="section-heading">Liên Hệ</h3>
        <div className="contact-links">
          <a href="https://github.com/your-github-username" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://linkedin.com/in/your-linkedin-profile" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:your.email@example.com">Email</a>
        </div>
      </div>
    </div>
  );
};

export default PersonalCard;