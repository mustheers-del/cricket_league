# 🏏 Cricket League Management System

A complete web-based cricket league management system built with Python Flask, SQLite, and responsive HTML/CSS/JavaScript. Manage tournaments, generate fixtures, enter match results, calculate statistics, and track standings with Net Run Rate (NRR) calculations.

## ✨ Features

### Core Functionality
- ✅ **League Creation** - Create a new league with exactly 5 teams
- ✅ **Auto Fixture Generation** - Round-robin fixtures (each team plays every other team once)
- ✅ **Match Result Entry** - Record runs, wickets, and overs for both teams
- ✅ **Live Points Table** - Automatic calculation of standings with NRR
- ✅ **Edit & Delete** - Update or delete match results with automatic recalculation
- ✅ **Tournament Reset** - Start fresh with a new tournament

### Statistics & Reporting
- 📊 **NRR Calculation** - Automatic Net Run Rate computation using the formula:
  - NRR = (Total Runs Scored ÷ Total Overs Faced) − (Total Runs Conceded ÷ Total Overs Bowled)
- 📋 **Detailed Stats** - Track Matches, Wins, Losses, Points, Runs For/Against
- 📈 **Export Options** - Download points table as Excel (.xlsx) or PDF
- 🎯 **Tournament Statistics** - Top scorers, best defense, most wins, best NRR

### User Interface
- 📱 **Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Modern Design** - Clean, professional interface with smooth animations
- ⚡ **Fast Performance** - Lightweight and optimized
- 🔄 **Real-time Updates** - Live score preview and instant calculations
- ♿ **Accessibility** - Semantic HTML and proper form labels

## 📋 Requirements

- Python 3.7+
- SQLite3 (included with Python)
- pip (Python package manager)

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
# Navigate to your desired directory
cd ~/projects

# If you have git, clone the repository
git clone <repository-url>

# Or manually create the folder structure
mkdir cricket_league
cd cricket_league
```

### Step 2: Create a Virtual Environment (Recommended)

```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
# Install all required packages
pip install -r requirements.txt
```

**Packages included:**
- `Flask` - Web framework
- `openpyxl` - Excel file generation
- `reportlab` - PDF generation
- `Jinja2` - Template engine
- `Werkzeug` - WSGI utilities

### Step 4: Create Project Structure

Make sure your project folder has this structure:

```
cricket_league/
├── app.py                 # Main Flask application
├── database.py            # Database initialization & operations
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── cricket_league.db     # SQLite database (auto-created)
├── templates/            # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── league_setup.html
│   ├── fixtures.html
│   ├── enter_result.html
│   ├── edit_result.html
│   └── points_table.html
└── static/              # CSS and JavaScript
    ├── css/
    │   └── style.css
    └── js/
        └── script.js
```

### Step 5: Run the Application

```bash
# Start the Flask development server
python app.py

# The application will be available at:
# http://localhost:5000
```

## 📖 Usage Guide

### 1. Create a League

- Navigate to the home page
- Click "Create Your Cricket League"
- Enter the league name (e.g., "Premier Cricket League 2024")
- Add 5 unique team names
- Click "Create League & Generate Fixtures"
- The system automatically generates 10 fixtures (round-robin: 5C2 = 10 matches)

### 2. View Fixtures

- Go to **Fixtures** section
- See all generated matches in card format
- Filter by: All | Pending | Completed
- Each card shows:
  - Team names
  - Match scores (if played)
  - Winner and margin (if completed)

### 3. Enter Match Results

- Navigate to **Enter Result**
- Select a match from the dropdown
- Enter for each team:
  - Runs scored
  - Wickets lost
  - Overs faced
- Live score preview updates as you type
- Click "Submit Result"

**Note:** Overs format example:
- `18.3` = 18 overs and 3 balls
- `20.0` = Full 20 overs
- Maximum balls per over = 5 (so 18.6 is invalid)

### 4. View Points Table

- Click **Points Table**
- See all teams ranked by:
  1. Points (highest first)
  2. Net Run Rate (NRR)
  3. Wins

**Columns:**
- **Rank** (🥇🥈🥉 for top 3)
- **Team** - Team name
- **M** - Matches played
- **W** - Wins (2 points each)
- **L** - Losses
- **Pts** - Total points
- **RF** - Runs For (scored)
- **RA** - Runs Against (conceded)
- **OF** - Overs Faced
- **OB** - Overs Bowled
- **NRR** - Net Run Rate

### 5. Edit Match Results

- Go to **Fixtures**
- Find a completed match
- Click the **Edit** button
- Update any field
- Click **Update Result** or **Delete Result**
- Points table recalculates automatically

### 6. Export Data

- Go to **Points Table**
- Click **Download Excel** to export as .xlsx
- Click **Download PDF** to export as PDF
- Open in Excel, Google Sheets, or PDF viewer

### 7. Reset Tournament

- Click **More ▼** in navigation
- Click **🔄 Reset Tournament**
- Confirm twice (safety check)
- All matches and results deleted, start fresh

## 📊 How NRR is Calculated

### Formula
```
NRR = (Runs Scored ÷ Overs Faced) − (Runs Conceded ÷ Overs Bowled)
```

### Example

**Team A vs Team B**

Team A: 162 runs in 19.2 overs
Team B: 155 runs in 20 overs

**Team A's NRR:**
- Run Rate For = 162 ÷ 19.33 = 8.38
- Run Rate Against = 155 ÷ 20 = 7.75
- NRR = 8.38 − 7.75 = **+0.63**

**Team B's NRR:**
- Run Rate For = 155 ÷ 20 = 7.75
- Run Rate Against = 162 ÷ 19.33 = 8.38
- NRR = 7.75 − 8.38 = **-0.63**

**Sorting Priority:**
1. Points (higher is better)
2. NRR (higher is better)
3. Wins (more is better)

## 🗄️ Database Schema

### Tables

**leagues**
- id (Primary Key)
- name (Unique)
- created_at (Timestamp)

**teams**
- id (Primary Key)
- league_id (Foreign Key → leagues.id)
- name

**fixtures**
- id (Primary Key)
- league_id (Foreign Key → leagues.id)
- team1_id (Foreign Key → teams.id)
- team2_id (Foreign Key → teams.id)

**match_results**
- id (Primary Key)
- fixture_id (Foreign Key → fixtures.id)
- team1_runs
- team1_wickets
- team1_overs
- team2_runs
- team2_wickets
- team2_overs
- result_date (Timestamp)

## 🔧 API Endpoints

### League Management
- `GET /` - Home/Dashboard
- `GET /api/league-info` - Get current league info (JSON)
- `POST /api/create-league` - Create new league

### Fixtures
- `GET /fixtures` - View all fixtures
- `GET /api/fixtures` - Get fixtures as JSON

### Match Results
- `GET /enter-result` - Enter result form
- `POST /api/add-result` - Submit match result
- `GET /edit-result/<match_id>` - Edit form
- `POST /api/update-result/<match_id>` - Update result
- `POST /api/delete-result/<match_id>` - Delete result

### Points Table
- `GET /points-table` - View standings
- `GET /api/points-table` - Get points table as JSON
- `GET /api/export-excel` - Download Excel file
- `GET /api/export-pdf` - Download PDF file

### Tournament
- `POST /api/reset-tournament` - Reset entire tournament

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in app.py (last line)
app.run(debug=True, port=5001)  # Use 5001 or another port
```

### Database Issues
```bash
# Delete the database and restart (creates new one)
rm cricket_league.db
python app.py
```

### Module Not Found Error
```bash
# Make sure virtual environment is activated and packages installed
pip install -r requirements.txt
```

### Excel/PDF Export Not Working
```bash
# Ensure dependencies are installed
pip install openpyxl reportlab --upgrade
```

## 📁 File Descriptions

| File | Purpose |
|------|---------|
| `app.py` | Flask application with all routes |
| `database.py` | SQLite operations and queries |
| `templates/base.html` | Base template with navigation |
| `templates/index.html` | Dashboard/home page |
| `templates/league_setup.html` | League creation form |
| `templates/fixtures.html` | Fixtures display |
| `templates/enter_result.html` | Match result entry form |
| `templates/edit_result.html` | Edit match result form |
| `templates/points_table.html` | Standings and statistics |
| `static/css/style.css` | All styling (responsive) |
| `static/js/script.js` | Client-side validation & interactions |

## 🎨 Customization

### Change Theme Colors

Edit `static/css/style.css`:
```css
:root {
    --primary-color: #0066cc;        /* Change this */
    --secondary-color: #366092;      /* And this */
    --success-color: #27ae60;
    --danger-color: #e74c3c;
    /* ... */
}
```

### Modify Point System

Edit `database.py` in the `get_points_table()` function:
```python
# Currently: 2 points for win, 0 for loss
points = wins * 2

# Change to (e.g., 3-1-0 system):
points = (wins * 3) + (draws * 1)
```

### Add More Teams

Change `5` to desired number in `templates/league_setup.html`:
```javascript
function initializeTeamFields() {
    for (let i = 0; i < 5; i++) {  // Change 5 here
        addTeamField();
    }
}
```

## 📝 License

This project is free to use and modify.

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements!

## 📞 Support

For issues or questions, check the troubleshooting section or review the code comments.

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Multiple concurrent leagues
- [ ] Team logos/avatars
- [ ] Match schedule calendar
- [ ] Player statistics
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Dark mode

---

**Developed with ❤️ using Python Flask**

**Happy Cricket Managing! 🏏**
