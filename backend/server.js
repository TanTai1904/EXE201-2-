import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  sequelize, 
  User, 
  Watchlist, 
  Portfolio, 
  Goal, 
  Course, 
  CourseProgress, 
  PaymentRequest, 
  Notification 
} from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'saveplus_jwt_secret_key_2026';

app.use(cors());
app.use(express.json());

// Helper to generate unique IDs
const genId = (prefix = 'R') => prefix + Date.now() + Math.floor(Math.random() * 1000);

// --- AUTH MIDDLEWARE ---
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa bởi admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối. Chỉ dành cho Admin.' });
  }
};

const isStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Quyền truy cập bị từ chối. Dành cho Admin hoặc Staff.' });
  }
};

// --- AUTH ROUTERS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, idNumber, dob, gender, address, idIssueDate } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin.' });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại trên hệ thống.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = genId('U');
    
    const newUser = await User.create({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      subscription: 'Free',
      status: idNumber ? 'Pending KYC' : 'Active', // Set to Pending KYC if ID provided, else Active
      idNumber: idNumber || null,
      dob: dob || null,
      gender: gender || null,
      address: address || null,
      idIssueDate: idIssueDate || null,
      balance: 100000000,
      xp: 150,
      streak: 3
    });

    // Seed initial notifications
    await Notification.create({
      id: genId('N'),
      userId: userId,
      title: 'Chào mừng thành viên mới! 🎉',
      message: 'Chào mừng bạn đến với SAVE+. Hãy hoàn thành bảng khảo sát onboarding để nhận gợi ý lộ trình phù hợp!',
      read: false,
      time: 'Vừa xong'
    });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        subscription: newUser.subscription,
        status: newUser.status,
        idNumber: newUser.idNumber,
        dob: newUser.dob,
        gender: newUser.gender,
        address: newUser.address,
        idIssueDate: newUser.idIssueDate,
        balance: newUser.balance,
        xp: newUser.xp,
        streak: newUser.streak
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đăng ký tài khoản.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ email và mật khẩu.' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Tài khoản không tồn tại.' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ message: 'Tài khoản này đã bị khóa.' });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác.' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        status: user.status,
        idNumber: user.idNumber,
        balance: user.balance,
        xp: user.xp,
        streak: user.streak,
        riskProfile: user.riskProfile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đăng nhập.' });
  }
});

// Get profile & detailed state
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Fetch associated data
    const watchlists = await Watchlist.findAll({ where: { userId: user.id } });
    const portfolios = await Portfolio.findAll({ where: { userId: user.id } });
    const goals = await Goal.findAll({ where: { userId: user.id } });
    const notifications = await Notification.findAll({ 
      where: { userId: user.id }, 
      order: [['createdAt', 'DESC']]
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscription: user.subscription,
        status: user.status,
        idNumber: user.idNumber,
        dob: user.dob,
        gender: user.gender,
        address: user.address,
        idIssueDate: user.idIssueDate,
        balance: user.balance,
        xp: user.xp,
        streak: user.streak,
        riskProfile: user.riskProfile,
        onboardingAnswers: user.onboardingAnswers ? JSON.parse(user.onboardingAnswers) : null
      },
      watchlist: watchlists.map(w => w.symbol),
      portfolio: portfolios.map(p => ({ symbol: p.symbol, shares: p.shares, buyPrice: p.buyPrice })),
      goals: goals.map(g => ({
        id: g.id,
        name: g.name,
        target: g.target,
        current: g.current,
        category: g.category,
        monthlyContribution: g.monthlyContribution
      })),
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
        time: n.time
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải hồ sơ người dùng.' });
  }
});

// Save Onboarding Answers
app.post('/api/users/onboarding', authenticateToken, async (req, res) => {
  const { answers } = req.body;
  if (!answers) {
    return res.status(400).json({ message: 'Thiếu kết quả khảo sát.' });
  }

  try {
    let profile = 'Balanced';
    if (answers.riskTolerance === 'Conservative' || answers.experience === 'Chưa có kinh nghiệm') {
      profile = 'Conservative';
    } else if (answers.riskTolerance === 'Aggressive' && answers.knowledge === 'Nâng cao') {
      profile = 'Aggressive';
    }

    req.user.onboardingAnswers = JSON.stringify(answers);
    req.user.riskProfile = profile;
    await req.user.save();

    res.json({
      riskProfile: profile,
      onboardingAnswers: answers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lưu khảo sát onboarding.' });
  }
});

// Update Balance
app.put('/api/financials/balance', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (amount === undefined) {
    return res.status(400).json({ message: 'Thiếu số dư mới.' });
  }

  try {
    req.user.balance = parseFloat(amount);
    await req.user.save();
    res.json({ balance: req.user.balance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật số dư.' });
  }
});

// Add XP
app.post('/api/users/xp', authenticateToken, async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ message: 'Thiếu số lượng XP.' });

  try {
    req.user.xp = req.user.xp + parseInt(amount);
    await req.user.save();
    res.json({ xp: req.user.xp });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cộng XP.' });
  }
});

// Trigger Streak
app.post('/api/users/streak', authenticateToken, async (req, res) => {
  try {
    req.user.streak = req.user.streak + 1;
    await req.user.save();
    res.json({ streak: req.user.streak });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tăng streak.' });
  }
});

// Watchlist Toggle
app.post('/api/financials/watchlist', authenticateToken, async (req, res) => {
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ message: 'Thiếu mã cổ phiếu.' });

  try {
    const existing = await Watchlist.findOne({
      where: { userId: req.user.id, symbol }
    });

    if (existing) {
      await existing.destroy();
    } else {
      await Watchlist.create({ userId: req.user.id, symbol });
    }

    const currentList = await Watchlist.findAll({ where: { userId: req.user.id } });
    res.json({ watchlist: currentList.map(w => w.symbol) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đồng bộ danh mục theo dõi.' });
  }
});

// Portfolio Bulk Update (Simulation Sync)
app.put('/api/financials/portfolio', authenticateToken, async (req, res) => {
  const { portfolio } = req.body; // Array of { symbol, shares, buyPrice }
  if (!portfolio || !Array.isArray(portfolio)) {
    return res.status(400).json({ message: 'Dữ liệu danh mục đầu tư không hợp lệ.' });
  }

  try {
    // Transaction-like delete and recreate for simplicity
    await Portfolio.destroy({ where: { userId: req.user.id } });
    
    const creations = portfolio.map(item => ({
      userId: req.user.id,
      symbol: item.symbol,
      shares: parseFloat(item.shares),
      buyPrice: parseFloat(item.buyPrice)
    }));

    await Portfolio.bulkCreate(creations);
    
    res.json({ portfolio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đồng bộ danh mục đầu tư.' });
  }
});

// --- GOAL ROUTERS ---

// Get goals
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const list = await Goal.findAll({ where: { userId: req.user.id } });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi lấy danh sách mục tiêu.' });
  }
});

// Create goal
app.post('/api/goals', authenticateToken, async (req, res) => {
  const { name, target, category, monthlyContribution } = req.body;
  if (!name || !target || !category) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin mục tiêu.' });
  }

  try {
    const goalId = 'G' + Math.floor(Math.random() * 1000);
    const newGoal = await Goal.create({
      id: goalId,
      userId: req.user.id,
      name,
      target: parseFloat(target),
      current: 0,
      category,
      monthlyContribution: monthlyContribution ? parseFloat(monthlyContribution) : 0
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tạo mục tiêu mới.' });
  }
});

// Contribute to goal
app.post('/api/goals/:id/contribute', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: 'Số tiền đóng góp phải lớn hơn 0.' });
  }

  try {
    const goal = await Goal.findOne({ where: { id, userId: req.user.id } });
    if (!goal) {
      return res.status(404).json({ message: 'Mục tiêu không tồn tại.' });
    }

    const contribution = parseFloat(amount);
    if (req.user.balance < contribution) {
      return res.status(400).json({ message: 'Số dư tài khoản không đủ để thực hiện đóng góp.' });
    }

    // Update balance & goal current
    req.user.balance = req.user.balance - contribution;
    await req.user.save();

    goal.current = Math.min(goal.target, goal.current + contribution);
    await goal.save();

    res.json({
      goal,
      balance: req.user.balance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đóng góp mục tiêu.' });
  }
});

// --- COURSE ROUTERS ---

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const list = await Course.findAll({ order: [['id', 'ASC']] });
    
    // Map list to parse JSON stringified arrays
    const formatted = list.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      thumbnail: c.thumbnail,
      duration: c.duration,
      level: c.level,
      difficulty: c.difficulty,
      timeEstimated: c.timeEstimated,
      tags: c.tags ? JSON.parse(c.tags) : [],
      description: c.description,
      lessons: c.lessons ? JSON.parse(c.lessons) : [],
      quizzes: c.quizzes ? JSON.parse(c.quizzes) : []
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải danh sách khóa học.' });
  }
});

// Get user progress
app.get('/api/courses/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await CourseProgress.findAll({ where: { userId: req.user.id } });
    const formatted = {};
    progress.forEach(p => {
      formatted[p.courseId] = {
        lessonsRead: p.lessonsRead ? JSON.parse(p.lessonsRead) : [],
        quizCompleted: p.quizCompleted,
        progressPercent: p.progressPercent
      };
    });
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải tiến độ học tập.' });
  }
});

// Record Lesson Read
app.post('/api/courses/:id/lessons/:lessonId', authenticateToken, async (req, res) => {
  const { id: courseId, lessonId } = req.params;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại.' });
    }

    let progress = await CourseProgress.findOne({ where: { userId: req.user.id, courseId } });
    if (!progress) {
      progress = await CourseProgress.create({
        userId: req.user.id,
        courseId,
        lessonsRead: '[]',
        quizCompleted: false,
        progressPercent: 0
      });
    }

    const lessonsRead = JSON.parse(progress.lessonsRead);
    if (!lessonsRead.includes(lessonId)) {
      lessonsRead.push(lessonId);
    }
    progress.lessonsRead = JSON.stringify(lessonsRead);

    // Calculate progressPercent
    const totalLessons = JSON.parse(course.lessons).length;
    const lessonsProgress = Math.round((lessonsRead.length / totalLessons) * 50);
    const quizProgress = progress.quizCompleted ? 50 : 0;
    progress.progressPercent = Math.min(100, lessonsProgress + quizProgress);

    await progress.save();

    res.json({
      courseId,
      lessonsRead,
      quizCompleted: progress.quizCompleted,
      progressPercent: progress.progressPercent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật tiến trình bài học.' });
  }
});

// Complete Course Quiz
app.post('/api/courses/:id/quiz', authenticateToken, async (req, res) => {
  const { id: courseId } = req.params;

  try {
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Khóa học không tồn tại.' });
    }

    let progress = await CourseProgress.findOne({ where: { userId: req.user.id, courseId } });
    if (!progress) {
      progress = await CourseProgress.create({
        userId: req.user.id,
        courseId,
        lessonsRead: '[]',
        quizCompleted: false,
        progressPercent: 0
      });
    }

    progress.quizCompleted = true;

    // Calculate progressPercent
    const totalLessons = JSON.parse(course.lessons).length;
    const lessonsRead = JSON.parse(progress.lessonsRead);
    const lessonsProgress = Math.round((lessonsRead.length / totalLessons) * 50);
    progress.progressPercent = Math.min(100, lessonsProgress + 50);

    await progress.save();

    res.json({
      courseId,
      lessonsRead,
      quizCompleted: true,
      progressPercent: progress.progressPercent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi hoàn thành bài trắc nghiệm.' });
  }
});

// Reset progress for single course
app.post('/api/courses/:id/reset', authenticateToken, async (req, res) => {
  const { id: courseId } = req.params;
  try {
    await CourseProgress.destroy({ where: { userId: req.user.id, courseId } });
    res.json({ success: true, courseId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đặt lại tiến độ học.' });
  }
});

// Reset all progress
app.post('/api/courses/reset-all', authenticateToken, async (req, res) => {
  try {
    await CourseProgress.destroy({ where: { userId: req.user.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đặt lại toàn bộ tiến độ.' });
  }
});

// Admin add/edit/delete courses (Endpoints for staff and admin)
app.post('/api/courses/manage', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const newCourse = req.body;
  if (!newCourse.title || !newCourse.category) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc khóa học.' });
  }

  try {
    const listCount = await Course.count();
    const courseId = 'C' + (listCount + 1).toString().padStart(2, '0');
    
    const freshCourse = await Course.create({
      id: courseId,
      title: newCourse.title,
      category: newCourse.category,
      thumbnail: newCourse.thumbnail || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
      duration: newCourse.duration || '5 phút',
      level: newCourse.level || 'Cơ bản',
      difficulty: newCourse.difficulty || 'Dễ',
      timeEstimated: newCourse.timeEstimated || '5 phút',
      tags: JSON.stringify(newCourse.tags || []),
      description: newCourse.description || '',
      lessons: JSON.stringify(newCourse.lessons || []),
      quizzes: JSON.stringify(newCourse.quizzes || [])
    });

    res.status(201).json(freshCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi thêm khóa học.' });
  }
});

app.put('/api/courses/manage/:id', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  const updated = req.body;

  try {
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });

    if (updated.title) course.title = updated.title;
    if (updated.category) course.category = updated.category;
    if (updated.thumbnail) course.thumbnail = updated.thumbnail;
    if (updated.duration) course.duration = updated.duration;
    if (updated.level) course.level = updated.level;
    if (updated.difficulty) course.difficulty = updated.difficulty;
    if (updated.timeEstimated) course.timeEstimated = updated.timeEstimated;
    if (updated.description) course.description = updated.description;
    if (updated.tags) course.tags = JSON.stringify(updated.tags);
    if (updated.lessons) course.lessons = JSON.stringify(updated.lessons);
    if (updated.quizzes) course.quizzes = JSON.stringify(updated.quizzes);

    await course.save();
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi cập nhật khóa học.' });
  }
});

app.delete('/api/courses/manage/:id', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học.' });

    await course.destroy();
    res.json({ message: 'Xóa khóa học thành công.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi xóa khóa học.' });
  }
});

// --- PAYMENT UPGRADE ROUTERS ---

// Get requests (Users see their own, Admin/Staff see all)
app.get('/api/payments/requests', authenticateToken, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'admin' || req.user.role === 'staff') {
      requests = await PaymentRequest.findAll({ order: [['createdAt', 'DESC']] });
    } else {
      requests = await PaymentRequest.findAll({ 
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
      });
    }
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải danh sách thanh toán.' });
  }
});

// Submit request
app.post('/api/payments/requests', authenticateToken, async (req, res) => {
  const { targetTier, paymentCode, amount } = req.body;
  if (!targetTier || !paymentCode || !amount) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin thanh toán.' });
  }

  try {
    const requestId = genId('PAY');
    
    const request = await PaymentRequest.create({
      id: requestId,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      targetTier,
      paymentCode,
      amount: parseFloat(amount),
      status: 'Pending'
    });

    // Create user notification
    await Notification.create({
      id: genId('N'),
      userId: req.user.id,
      title: '⏳ Yêu cầu nâng cấp đang chờ xét duyệt',
      message: `Yêu cầu nâng cấp lên gói ${targetTier} (Mã TT: ${paymentCode}) đã được ghi nhận. Admin/Staff sẽ xác nhận trong thời gian sớm nhất!`,
      read: false,
      time: 'Vừa xong'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi gửi yêu cầu nâng cấp.' });
  }
});

// Admin/Staff Approve
app.put('/api/payments/requests/:id/approve', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const request = await PaymentRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Yêu cầu không tồn tại.' });
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý từ trước.' });
    }

    request.status = 'Approved';
    request.resolvedAt = new Date();
    await request.save();

    // Upgrade the target user
    const targetUser = await User.findByPk(request.userId);
    if (targetUser) {
      targetUser.subscription = request.targetTier;
      await targetUser.save();

      // Create notification for target user
      await Notification.create({
        id: genId('N'),
        userId: targetUser.id,
        title: '✅ Yêu cầu nâng cấp đã được DUYỆT!',
        message: `Tài khoản ${targetUser.email} đã được nâng cấp lên gói ${request.targetTier}. Khám phá ngay đặc quyền mới!`,
        read: false,
        time: 'Vừa xong'
      });
    }

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi duyệt nâng cấp gói.' });
  }
});

// Admin/Staff Reject
app.put('/api/payments/requests/:id/reject', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const request = await PaymentRequest.findByPk(id);
    if (!request) return res.status(404).json({ message: 'Yêu cầu không tồn tại.' });
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Yêu cầu này đã được xử lý từ trước.' });
    }

    request.status = 'Rejected';
    request.note = reason || '';
    request.resolvedAt = new Date();
    await request.save();

    // Notify the target user
    await Notification.create({
      id: genId('N'),
      userId: request.userId,
      title: '❌ Yêu cầu nâng cấp bị từ chối',
      message: `Yêu cầu nâng cấp lên gói ${request.targetTier} của ${request.userEmail} đã bị từ chối.${reason ? ` Lý do: ${reason}` : ''} Vui lòng liên hệ hỗ trợ.`,
      read: false,
      time: 'Vừa xong'
    });

    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi từ chối nâng cấp gói.' });
  }
});

// --- ADMIN USERS MANAGEMENTS ---

// Get all users
app.get('/api/admin/users', authenticateToken, isStaffOrAdmin, async (req, res) => {
  try {
    const list = await User.findAll({ 
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    // We can compute learning progress average for each user in db
    const progresses = await CourseProgress.findAll();
    const usersFormatted = list.map(u => {
      const uProgs = progresses.filter(p => p.userId === u.id);
      const totalProg = uProgs.reduce((acc, curr) => acc + curr.progressPercent, 0);
      const avgProgress = uProgs.length ? Math.round(totalProg / 11) : 0; // Out of 11 courses

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        subscription: u.subscription,
        status: u.status,
        idNumber: u.idNumber,
        dob: u.dob,
        gender: u.gender,
        address: u.address,
        idIssueDate: u.idIssueDate,
        riskProfile: u.riskProfile,
        learningProgress: Math.min(100, avgProgress)
      };
    });

    res.json(usersFormatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải danh sách người dùng.' });
  }
});

// Toggle block/unblock user
app.put('/api/admin/users/:id/block', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự khóa tài khoản của chính mình.' });
  }

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    target.status = target.status === 'Blocked' ? 'Active' : 'Blocked';
    await target.save();
    res.json({ id: target.id, status: target.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi thay đổi trạng thái khóa tài khoản.' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Không thể tự xóa chính mình.' });
  }

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    await target.destroy();
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi xóa người dùng.' });
  }
});

// Approve/Reject KYC
app.put('/api/admin/users/:id/kyc', authenticateToken, isStaffOrAdmin, async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    target.status = isApproved ? 'Active' : 'Rejected KYC';
    await target.save();

    await Notification.create({
      id: genId('N'),
      userId: target.id,
      title: isApproved ? '🎉 Hồ sơ KYC đã được chấp nhận!' : '❌ Hồ sơ KYC bị từ chối',
      message: isApproved 
        ? 'Tài khoản của bạn đã được xác minh danh tính thành công. Bây giờ bạn có thể trải nghiệm đầy đủ các chức năng!'
        : 'Hình ảnh CCCD/CMND không rõ ràng hoặc không hợp lệ. Vui lòng cập nhật lại hoặc liên hệ staff hỗ trợ.',
      read: false,
      time: 'Vừa xong'
    });

    res.json({ id: target.id, status: target.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi phê duyệt KYC.' });
  }
});

// Direct verify/upgrade subscription via Admin
app.put('/api/admin/users/:id/verify', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const target = await User.findByPk(id);
    if (!target) return res.status(404).json({ message: 'Người dùng không tồn tại.' });

    target.subscription = target.subscription === 'Free' ? 'Premium' : 'Mentor+';
    await target.save();
    res.json({ id: target.id, subscription: target.subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi nâng cấp nhanh người dùng.' });
  }
});

// --- NOTIFICATION ROUTERS ---

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const list = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tải thông báo.' });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Notification.findOne({ where: { id, userId: req.user.id } });
    if (item) {
      item.read = true;
      await item.save();
    }
    res.json({ success: true, id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đọc thông báo.' });
  }
});

// --- SEED DATABASE ON START ---

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
    description: 'ETF & Chứng chỉ quỹ cho người mới bắt đầu. Tiết kiệm thời gian, đa dạng hóa tối đa.',
    tags: ['ETF', 'Cơ bản'],
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
        options: ['A. Ví điện tử', 'B. Quỹ đầu tư giao dịch trên sàn', 'C. Tiền điện tử', 'D. Tài khoản tiết kiệm'],
        answerIndex: 1,
        explanation: 'ETF (Exchange-Traded Fund) là quỹ đầu tư được giao dịch trên sàn chứng khoán tương tự như một mã cổ phiếu thông thường.'
      },
      {
        question: 'Ưu điểm lớn của ETF là gì?',
        options: ['A. Không có rủi ro', 'B. Đảm bảo lợi nhuận', 'C. Đa dạng hóa đầu tư', 'D. Giá luôn tăng'],
        answerIndex: 2,
        explanation: 'Ưu điểm lớn nhất của ETF là đa dạng hóa. Sở hữu chứng chỉ quỹ giúp phân bổ vốn vào hàng chục doanh nghiệp lớn cùng lúc.'
      },
      {
        question: 'ETF thường phù hợp với đối tượng nào?',
        options: ['A. Chỉ chuyên gia tài chính', 'B. Người mới bắt đầu đầu tư', 'C. Chỉ doanh nghiệp lớn', 'D. Người không muốn học tài chính'],
        answerIndex: 1,
        explanation: 'ETF rất thích hợp với người mới bắt đầu vì nó không yêu cầu quá nhiều kỹ năng phân tích báo cáo tài chính từng mã cổ phiếu đơn lẻ.'
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
    description: 'Khám phá sức mạnh của lãi kép và lý do tại sao bắt đầu tích lũy sớm tạo ra sự khác biệt khổng lồ.',
    tags: ['Lãi kép', 'Cơ bản'],
    lessons: [
      {
        id: 'L2.1',
        title: 'Sức mạnh của lãi kép',
        videoUrl: 'https://www.youtube.com/embed/_CbicTTCkjg',
        reading: 'Nội dung bài học:\nLãi kép là quá trình mà tiền lãi bạn kiếm được tiếp tục tạo ra thêm tiền lãi mới theo thời gian. Đây được xem là một trong những yếu tố quan trọng nhất trong đầu tư dài hạn.\n\nVí dụ:\nBạn đầu tư 1 triệu đồng với lợi nhuận 10%/năm.\n- Sau năm đầu tiên, bạn có 1.100.000 đồng.\n- Năm tiếp theo, lợi nhuận sẽ được tính trên 1.100.000 đồng chứ không còn là 1 triệu đồng ban đầu.'
      }
    ],
    quizzes: [
      {
        question: 'Lãi kép hoạt động như thế nào?',
        options: ['A. Chỉ tính lãi trên số tiền ban đầu', 'B. Lãi tiếp tục sinh ra thêm lãi mới', 'C. Không liên quan đến đầu tư', 'D. Chỉ áp dụng cho ngân hàng'],
        answerIndex: 1,
        explanation: 'Lãi kép sinh ra do lãi thu được của chu kỳ trước được gộp chung vào vốn để tiếp tục sinh lãi ở các chu kỳ sau.'
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
    description: 'Đa dạng hóa là chiến lược phân bổ tiền đầu tư vào nhiều loại tài sản khác nhau nhằm giảm rủi ro.',
    tags: ['Rủi ro', 'Đa dạng hóa'],
    lessons: [
      {
        id: 'L3.1',
        title: 'Đừng bỏ tất cả trứng vào một giỏ',
        videoUrl: 'https://www.youtube.com/embed/siR5Fbz1We8',
        reading: 'Nội dung bài học:\nĐa dạng hóa là chiến lược phân bổ tiền đầu tư vào nhiều loại tài sản khác nhau nhằm giảm rủi ro.'
      }
    ],
    quizzes: [
      {
        question: 'Mục tiêu chính của đa dạng hóa là gì?',
        options: ['A. Tăng rủi ro', 'B. Giảm rủi ro đầu tư', 'C. Tránh đóng thuế', 'D. Đầu tư nhanh hơn'],
        answerIndex: 1,
        explanation: 'Đa dạng hóa giúp giảm thiểu thiệt hại lớn khi một trong các kênh đầu tư riêng lẻ bị biến động bất lợi.'
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
    description: 'Cảm xúc ảnh hưởng lớn đến quyết định đầu tư. Học cách kiểm soát cảm xúc, FOMO và hoảng loạn.',
    tags: ['Tâm lý', 'Trung bình'],
    lessons: [
      {
        id: 'L4.1',
        title: 'Kiểm soát cảm xúc khi đầu tư',
        videoUrl: 'https://www.youtube.com/embed/gS-H1-t7KSA',
        reading: 'Nội dung bài học:\nCảm xúc là một trong những yếu tố ảnh hưởng lớn đến quyết định đầu tư.'
      }
    ],
    quizzes: [
      {
        question: 'FOMO trong đầu tư là gì?',
        options: ['A. Một loại cổ phiếu', 'B. Sợ bỏ lỡ cơ hội đầu tư', 'C. Một quỹ ETF', 'D. Một loại thuế'],
        answerIndex: 1,
        explanation: 'FOMO (Fear of Missing Out) là tâm lý sợ bỏ lỡ cơ hội kiếm lợi nhuận khi thấy đám đông đang hào hứng.'
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
    description: 'Lạm phát là hiện tượng giá hàng hóa tăng dần, làm giảm sức mua của tiền mặt theo thời gian.',
    tags: ['Lạm phát', 'Cơ bản'],
    lessons: [
      {
        id: 'L5.1',
        title: 'Tiền mất giá theo thời gian',
        videoUrl: 'https://www.youtube.com/embed/9QRF5xcm9jI',
        reading: 'Nội dung bài học:\nLạm phát là hiện tượng giá hàng hóa và dịch vụ tăng theo thời gian.'
      }
    ],
    quizzes: [
      {
        question: 'Lạm phát ảnh hưởng như thế nào đến tiền?',
        options: ['A. Tăng sức mua', 'B. Giảm sức mua theo thời gian', 'C. Không thay đổi gì', 'D. Tăng lương tự động'],
        answerIndex: 1,
        explanation: 'Lạm phát làm tăng mức giá chung của hàng hóa dịch vụ, khiến cùng một lượng tiền mua được ít đồ hơn.'
      }
    ]
  },
  {
    id: 'C06',
    title: 'Phần 6 (VIP): Phân tích Báo cáo Tài chính chuyên sâu',
    category: 'Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
    duration: '10 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '10 phút',
    description: 'Đọc hiểu báo cáo kết quả kinh doanh, bảng cân đối kế toán và phát hiện rủi ro doanh nghiệp.',
    tags: ['BCTC', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L6.1',
        title: 'Đọc hiểu 3 báo cáo tài chính cốt lõi',
        videoUrl: 'https://www.youtube.com/embed/d38W2P7f7J8',
        reading: 'Báo cáo tài chính là bức tranh toàn cảnh về sức khỏe của doanh nghiệp.'
      }
    ],
    quizzes: [
      {
        question: 'Báo cáo nào giúp nhận diện dòng tiền mặt thực tế của doanh nghiệp?',
        options: ['A. Bảng cân đối kế toán', 'B. Báo cáo lưu chuyển tiền tệ', 'C. Báo cáo kết quả hoạt động kinh doanh', 'D. Thuyết minh báo cáo tài chính'],
        answerIndex: 1,
        explanation: 'Báo cáo lưu chuyển tiền tệ là thước đo chính xác dòng tiền mặt thực tế ra vào doanh nghiệp.'
      }
    ]
  },
  {
    id: 'C07',
    title: 'Phần 7 (VIP): Định giá Cổ phiếu DCF & P/E',
    category: 'Valuation',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80',
    duration: '12 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '12 phút',
    description: 'Thực hành định giá giá trị nội tại doanh nghiệp theo mô hình chiết khấu dòng tiền DCF và so sánh P/E.',
    tags: ['Định giá', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L7.1',
        title: 'Phương pháp định giá dòng tiền chiết khấu (DCF)',
        videoUrl: 'https://www.youtube.com/embed/Y-QGv6f-L2M',
        reading: 'Định giá dòng tiền chiết khấu (Discounted Cash Flow) dựa trên nguyên tắc: một đồng tiền tương lai có giá trị thấp hơn hiện tại.'
      }
    ],
    quizzes: [
      {
        question: 'Nguyên lý cốt lõi của phương pháp DCF là gì?',
        options: ['A. Định giá dựa trên tài sản cố định', 'B. Chiết khấu dòng tiền tự do tương lai về giá trị hiện tại', 'C. So sánh giá cổ phiếu với đối thủ', 'D. Chỉ tính giá trị sổ sách'],
        answerIndex: 1,
        explanation: 'Phương pháp DCF tính giá trị nội tại của công ty bằng cách quy đổi toàn bộ lượng tiền tự do tương lai về hiện tại.'
      }
    ]
  },
  {
    id: 'C08',
    title: 'Phần 8 (VIP): Quản lý vốn & Phân bổ tài sản tích lũy',
    category: 'Wealth',
    thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    duration: '8 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '8 phút',
    description: 'Xây dựng danh mục đầu tư bền vững, tái cân bằng định kỳ và kiểm soát dòng vốn tích lũy.',
    tags: ['Quản lý vốn', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L8.1',
        title: 'Tái cân bằng danh mục tài sản định kỳ',
        videoUrl: 'https://www.youtube.com/embed/Z0p19G29mGg',
        reading: 'Tái cân bằng (Rebalancing) là hành động đưa tỷ trọng các lớp tài sản về mức thiết lập ban đầu.'
      }
    ],
    quizzes: [
      {
        question: 'Tại sao cần tái cân bằng danh mục đầu tư?',
        options: ['A. Để mua nhiều cổ phiếu hơn', 'B. Để duy trì mức độ rủi ro mong muốn ban đầu', 'C. Để tránh mất phí', 'D. Để đầu cơ ngắn hạn'],
        answerIndex: 1,
        explanation: 'Tái cân bằng giúp kiểm soát rủi ro danh mục, ngăn ngừa việc một loại tài sản tăng quá nóng chiếm quá nhiều tỷ trọng.'
      }
    ]
  },
  {
    id: 'C09',
    title: 'Phần 9 (VIP): Đầu tư Phái sinh & Phòng ngừa rủi ro',
    category: 'Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80',
    duration: '8 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '8 phút',
    description: 'Khái niệm hợp đồng tương lai và cơ chế bảo vệ danh mục đầu tư cơ sở.',
    tags: ['Phái sinh', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L9.1',
        title: 'Cơ chế hoạt động của Hợp đồng Tương lai',
        videoUrl: 'https://www.youtube.com/embed/P-hV9pW1s3g',
        reading: 'Hợp đồng tương lai (Futures Contract) cho phép giao dịch dựa trên kỳ vọng chỉ số VN30 tăng hoặc giảm.'
      }
    ],
    quizzes: [
      {
        question: 'Lợi thế của hợp đồng tương lai phái sinh là gì?',
        options: ['A. An toàn tuyệt đối', 'B. Giao dịch hai chiều (kiếm lời khi thị trường giảm)', 'C. Không yêu cầu ký quỹ', 'D. Phí giao dịch bằng 0'],
        answerIndex: 1,
        explanation: 'Phái sinh cho phép bạn thực hiện vị thế Short để kiếm lời khi dự đoán thị trường đi xuống.'
      }
    ]
  },
  {
    id: 'C10',
    title: 'Phần 10 (VIP): Tâm lý học hành vi trong đầu tư',
    category: 'Risk',
    thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80',
    duration: '7 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '7 phút',
    description: 'Nhận diện các thiên kiến tâm lý như FOMO, Loss Aversion và xây dựng kỷ luật vốn thép.',
    tags: ['Tâm lý', 'Nâng cao', 'VIP'],
    lessons: [
      {
        id: 'L10.1',
        title: 'Thiên kiến sợ thua lỗ (Loss Aversion)',
        videoUrl: 'https://www.youtube.com/embed/e_p7iXz6bSg',
        reading: 'Nghiên cứu tâm lý chỉ ra: Cảm giác đau đớn khi mất tiền lớn gấp đôi niềm vui khi kiếm được tiền tương đương.'
      }
    ],
    quizzes: [
      {
        question: 'Thiên kiến sợ thua lỗ thường dẫn đến hành vi sai lầm nào?',
        options: ['A. Cắt lỗ quá nhanh', 'B. Gồng lỗ quá lâu và chốt lời quá sớm', 'C. Chỉ mua trái phiếu', 'D. Đa dạng hóa quá mức'],
        answerIndex: 1,
        explanation: 'Sợ thua lỗ khiến nhà đầu tư gồng lỗ vô kỷ luật để tránh nhận mình sai, đồng thời bán chốt lời non vì sợ mất lợi nhuận hiện có.'
      }
    ]
  },
  {
    id: 'C11',
    title: 'Phần 11 (VIP): Chiến lược Quỹ mở và Quỹ chỉ số ETF',
    category: 'ETF',
    thumbnail: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=400&q=80',
    duration: '9 phút',
    level: 'Nâng cao',
    difficulty: 'Khó',
    timeEstimated: '9 phút',
    description: 'So sánh hiệu quả của việc mua tích lũy định kỳ (DCA) các rổ quỹ mở và chỉ số ETF Diamond/VN30.',
    tags: ['Quỹ mở', 'ETF', 'VIP'],
    lessons: [
      {
        id: 'L11.1',
        title: 'Phương pháp tích lũy DCA Quỹ chỉ số',
        videoUrl: 'https://www.youtube.com/embed/u1K2C6B_w2Q',
        reading: 'Chiến thuật trung bình hóa chi phí (DCA) bằng cách mua định kỳ hàng tuần hoặc hàng tháng một số tiền cố định.'
      }
    ],
    quizzes: [
      {
        question: 'Chiến lược DCA hiệu quả nhất khi kết hợp với loại tài sản nào?',
        options: ['A. Cổ phiếu đầu cơ', 'B. Quỹ chỉ số ETF đa dạng hóa cao', 'C. Tiết kiệm ngắn hạn', 'D. Tiền mặt không sinh lãi'],
        answerIndex: 1,
        explanation: 'DCA phát huy hiệu quả tốt nhất khi kết hợp với các tài sản có xu hướng tăng trưởng dài hạn.'
      }
    ]
  }
];


const seedDatabase = async () => {
  try {
    const courseCount = await Course.count();
    if (courseCount === 0) {
      console.log('Seeding initial courses...');
      const coursesToSeed = INITIAL_COURSES.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        thumbnail: c.thumbnail,
        duration: c.duration,
        level: c.level,
        difficulty: c.difficulty,
        timeEstimated: c.timeEstimated,
        tags: JSON.stringify(c.tags),
        description: c.description,
        lessons: JSON.stringify(c.lessons),
        quizzes: JSON.stringify(c.quizzes)
      }));
      await Course.bulkCreate(coursesToSeed);
      console.log('Courses seeded successfully!');
    }

    // Only seed system accounts (admin + staff). No mock users.
    const adminExists = await User.findOne({ where: { email: 'admin1@gmail.com' } });
    if (!adminExists) {
      console.log('Seeding system accounts (admin + staff)...');
      
      const adminPass = await bcrypt.hash('admin123', 10);
      const staffPass = await bcrypt.hash('staff123', 10);

      await User.bulkCreate([
        { id: 'A001', name: 'Admin Quản Trị', email: 'admin1@gmail.com', password: adminPass, role: 'admin', subscription: 'Mentor+', status: 'Active', balance: 0, xp: 0, streak: 0 },
        { id: 'S001', name: 'Nhân viên Duyệt', email: 'staff1@gmail.com', password: staffPass, role: 'staff', subscription: 'Mentor+', status: 'Active', balance: 0, xp: 0, streak: 0 }
      ]);

      console.log('System accounts seeded successfully!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};


// Sync database and start listening
sequelize.sync({ alter: true }).then(async () => {
  console.log('Database synchronized.');
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to synchronize database:', err);
});
