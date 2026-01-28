# 📊 Job Application Tracker

> A modern, production-ready web application to track, analyze, and manage your job applications efficiently.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

---

## ✨ Features

### Core Functionality
- ✅ **Full CRUD Operations** - Add, edit, and delete job applications
- ✅ **Advanced Search & Filters** - Search by company/role, filter by status, type, and location
- ✅ **Analytics Dashboard** - Visual insights with Chart.js (pie & line charts)
- ✅ **Data Persistence** - LocalStorage with graceful error handling
- ✅ **Form Validation** - Comprehensive input validation and sanitization

### Advanced Features
- 🌙 **Dark Mode** - Smooth theme switching with persistence
- 📥 **CSV Export** - Download your job data
- 📤 **CSV Import** - Import jobs from CSV files
- ↩️ **Undo Delete** - 5-second window to restore deleted jobs
- ⌨️ **Keyboard Shortcuts** - Power user features (Ctrl+N, Ctrl+K, Escape)
- 👋 **Onboarding** - First-time user guidance

### UI/UX Excellence
- 🎨 Modern, premium design with gradient headers
- 📱 Fully responsive (mobile, tablet, desktop)
- ✨ Smooth animations and transitions
- 🎯 Color-coded status badges
- ♿ WCAG-compliant accessibility

---

## 🚀 Quick Start

### Option 1: Direct File Open
```bash
# Simply open the HTML file in your browser
1. Navigate to the JobTracker folder
2. Double-click index.html
3. Start tracking your applications!
```

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
cd JobTracker
python -m http.server 8000
# Open http://localhost:8000

# Using Node.js
cd JobTracker
npx serve
# Open http://localhost:5000
```

### Option 3: VS Code Live Server
```bash
1. Install "Live Server" extension
2. Right-click index.html
3. Select "Open with Live Server"
```

---

## 📖 How to Use

### Adding a Job
1. Click the **"➕ Add Job"** button
2. Fill in the required fields:
   - Company Name
   - Role/Position
   - Job Type (Internship/Full-time/Contract)
   - Location (Remote/Onsite/Hybrid)
   - Application Date
   - Status (Applied/Interview/Offer/Rejected/Ghosted)
3. Optionally add job link and notes
4. Click **"Add Job"** to save

### Editing a Job
1. Click the **✏️ Edit** button on any job card
2. Modify the fields
3. Click **"Update Job"** to save changes

### Deleting a Job
1. Click the **🗑️ Delete** button on any job card
2. Confirm deletion
3. Click **"Undo"** in the toast notification within 5 seconds to restore

### Searching & Filtering
- **Search**: Type company or role name in the search box
- **Filter by Status**: Select from dropdown (Applied, Interview, Offer, etc.)
- **Filter by Job Type**: Select Internship, Full-time, or Contract
- **Filter by Location**: Select Remote, Onsite, or Hybrid
- **Sort**: Choose newest or oldest first

### Exporting Data
1. Click **"📥 Export CSV"** button
2. CSV file downloads automatically
3. Open in Excel, Google Sheets, or any CSV reader

### Importing Data
1. Click **"📤 Import CSV"** button
2. Select a CSV file with the correct format
3. Jobs are imported and added to your tracker

### Keyboard Shortcuts
- `Ctrl/Cmd + N` - Add new job
- `Ctrl/Cmd + K` - Focus search
- `Escape` - Close modals

---

## 🏗️ Technical Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure |
| **CSS3** | Modern styling with custom properties |
| **JavaScript (ES6+)** | Application logic |
| **Chart.js** | Data visualization |
| **LocalStorage API** | Client-side persistence |

### No Build Tools Required
This is a pure vanilla JavaScript application. No npm, webpack, or build process needed!

---

## 📁 Project Structure

```
JobTracker/
├── index.html          # Main HTML structure (300+ lines)
├── style.css           # Complete styling system (900+ lines)
├── script.js           # Full application logic (900+ lines)
└── README.md           # This file
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Indigo gradient (#6366f1 → #8b5cf6)
- **Status Colors**:
  - Applied: Blue (#3b82f6)
  - Interview: Purple (#8b5cf6)
  - Offer: Green (#10b981)
  - Rejected: Red (#ef4444)
  - Ghosted: Gray (#6b7280)

### Responsive Breakpoints
- Mobile: < 480px
- Tablet: 768px
- Desktop: 1024px+

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Add multiple jobs with different statuses
- [ ] Edit existing jobs
- [ ] Delete jobs and test undo
- [ ] Search by company/role
- [ ] Filter by status, type, location
- [ ] Sort by date
- [ ] Toggle dark mode
- [ ] Export to CSV
- [ ] Import from CSV
- [ ] Test on mobile device
- [ ] Test keyboard shortcuts
- [ ] Refresh page (data persists)

### Sample Test Data
```csv
Company,Role,Job Type,Location,Application Date,Status,Job Link,Notes
Google,Software Engineer,Full-time,Remote,2026-01-28,Applied,https://careers.google.com,Excited!
Microsoft,Frontend Developer,Full-time,Hybrid,2026-01-27,Interview,https://careers.microsoft.com,Second round
Amazon,Backend Engineer,Full-time,Onsite,2026-01-26,Applied,https://amazon.jobs,AWS team
```

---

## 💡 Code Highlights

### Modular Architecture
```javascript
// IIFE pattern to avoid global pollution
(function() {
    'use strict';
    
    // Storage Layer
    const Storage = { /* ... */ };
    
    // Application State
    const AppState = { /* ... */ };
    
    // CRUD Operations
    function addJob() { /* ... */ }
    function updateJob() { /* ... */ }
    function deleteJob() { /* ... */ }
    
    // Initialize
    init();
})();
```

### Key Features
- **Input Sanitization** - Prevents XSS attacks
- **Debounced Search** - Optimized performance
- **Error Handling** - Graceful degradation
- **Accessibility** - ARIA labels, keyboard navigation
- **Theme Persistence** - Remembers user preference

---

## 🎯 Use Cases

Perfect for:
- 📝 **Job Seekers** - Track applications during job search
- 🎓 **Students** - Manage internship applications
- 💼 **Career Changers** - Organize transition process
- 📊 **Recruiters** - Monitor candidate pipeline
- 🎨 **Portfolio Projects** - Showcase web development skills

---

## 🔒 Privacy & Security

- ✅ **100% Client-Side** - No data sent to servers
- ✅ **LocalStorage Only** - Data stays on your device
- ✅ **No Tracking** - No analytics or cookies
- ✅ **Input Sanitization** - XSS protection
- ✅ **URL Validation** - Safe link handling

---

## 🚀 Future Enhancements

Potential features for v2.0:
- [ ] Backend API integration
- [ ] User authentication
- [ ] Email reminders
- [ ] Interview prep notes
- [ ] Resume version tracking
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] PWA with offline support

---

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

Built with ❤️ as a production-ready, portfolio-worthy project.

**Tech Stack**: Vanilla HTML, CSS, JavaScript  
**Dependencies**: Chart.js (CDN)  
**Build Tools**: None required!

---

## 🙏 Acknowledgments

- **Chart.js** - Beautiful charts made easy
- **Modern CSS** - Custom properties and grid layout
- **ES6+** - Modern JavaScript features

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Try clearing browser cache
4. Use a modern browser (Chrome, Firefox, Edge, Safari)

---

## ⭐ Show Your Support

If you found this project helpful:
- ⭐ Star the repository
- 🍴 Fork for your own use
- 📢 Share with others
- 💼 Add to your portfolio

---

**Happy Job Hunting! 🎉**

*Remember: Every application is a step closer to your dream job!*
