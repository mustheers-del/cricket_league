"""
Database module - SQLite database initialization and queries
Handles all database operations for the Cricket League Management System
"""

import sqlite3
import os
from itertools import combinations

DATABASE = 'cricket_league.db'

# ==================== DATABASE INITIALIZATION ====================

def get_connection():
    """Get database connection"""
    conn = sqlite3.connect(
        DATABASE,
        timeout=30,
        check_same_thread=False
    )

    conn.row_factory = sqlite3.Row

    # Fix SQLite locking issue
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=30000;")

    return conn

def init_db():
    """Initialize database with required tables"""
    conn = get_connection()
    cursor = conn.cursor()

    
    # Create tables if they don't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS leagues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            league_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            FOREIGN KEY(league_id) REFERENCES leagues(id),
            UNIQUE(league_id, name)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fixtures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            league_id INTEGER NOT NULL,
            team1_id INTEGER NOT NULL,
            team2_id INTEGER NOT NULL,
            fixture_date TEXT,
            FOREIGN KEY(league_id) REFERENCES leagues(id),
            FOREIGN KEY(team1_id) REFERENCES teams(id),
            FOREIGN KEY(team2_id) REFERENCES teams(id)
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS match_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fixture_id INTEGER NOT NULL UNIQUE,
            team1_runs INTEGER NOT NULL,
            team1_wickets INTEGER NOT NULL,
            team1_overs REAL NOT NULL,
            team2_runs INTEGER NOT NULL,
            team2_wickets INTEGER NOT NULL,
            team2_overs REAL NOT NULL,
            result_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(fixture_id) REFERENCES fixtures(id)
        )
    ''')
    
    conn.commit()
    conn.close()

# ==================== LEAGUE OPERATIONS ====================

def create_league(league_name, teams):
    """Create a new league with teams and generate fixtures"""

    conn = get_connection()
    cursor = conn.cursor()

    try:

        # Create league
        cursor.execute(
            'INSERT INTO leagues (name) VALUES (?)',
            (league_name,)
        )

        league_id = cursor.lastrowid


        # Add teams
        team_ids = []

        for team_name in teams:

            cursor.execute(
                'INSERT INTO teams (league_id, name) VALUES (?, ?)',
                (league_id, team_name)
            )

            team_ids.append(cursor.lastrowid)



        # Generate fixtures using SAME connection

        fixtures = list(combinations(team_ids,2))

        for team1_id, team2_id in fixtures:

            cursor.execute(
                '''
                INSERT INTO fixtures
                (league_id, team1_id, team2_id)
                VALUES (?, ?, ?)
                ''',
                (
                    league_id,
                    team1_id,
                    team2_id
                )
            )


        conn.commit()

        return league_id


    except sqlite3.IntegrityError as e:

        conn.rollback()

        raise Exception(
            f"League already exists: {str(e)}"
        )


    finally:

        conn.close()

def get_league():
    """Get current league"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM leagues ORDER BY id DESC LIMIT 1')
    league = cursor.fetchone()
    conn.close()
    
    return dict(league) if league else None

# ==================== TEAM OPERATIONS ====================

def get_teams():
    """Get all teams in current league"""
    league = get_league()
    if not league:
        return []
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, name FROM teams WHERE league_id = ? ORDER BY name',
                  (league['id'],))
    teams = cursor.fetchall()
    conn.close()
    
    return [dict(team) for team in teams]

# ==================== FIXTURE OPERATIONS ====================

def generate_fixtures(league_id, team_ids):
    """Generate round-robin fixtures"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Generate all combinations (round-robin)
    fixtures = list(combinations(team_ids, 2))
    
    for team1_id, team2_id in fixtures:
        cursor.execute('''
            INSERT INTO fixtures (league_id, team1_id, team2_id)
            VALUES (?, ?, ?)
        ''', (league_id, team1_id, team2_id))
    
    conn.commit()
    conn.close()

def get_fixtures():
    """Get all fixtures with team names and results"""
    league = get_league()
    if not league:
        return []
    
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT 
            f.id,
            f.team1_id,
            f.team2_id,
            t1.name as team1_name,
            t2.name as team2_name,
            mr.id as result_id,
            mr.team1_runs,
            mr.team1_wickets,
            mr.team1_overs,
            mr.team2_runs,
            mr.team2_wickets,
            mr.team2_overs,
            mr.result_date
        FROM fixtures f
        JOIN teams t1 ON f.team1_id = t1.id
        JOIN teams t2 ON f.team2_id = t2.id
        LEFT JOIN match_results mr ON f.id = mr.fixture_id
        WHERE f.league_id = ?
        ORDER BY f.id
    ''', (league['id'],))
    
    fixtures = cursor.fetchall()
    conn.close()
    
    return [dict(fixture) for fixture in fixtures]

# ==================== MATCH RESULT OPERATIONS ====================

def add_match_result(fixture_id, team1_runs, team1_wickets, team1_overs,
                     team2_runs, team2_wickets, team2_overs):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        # Check existing result
        cursor.execute(
            "SELECT id FROM match_results WHERE fixture_id=?",
            (fixture_id,)
        )

        existing = cursor.fetchone()


        if existing:

            cursor.execute("""
                UPDATE match_results
                SET 
                    team1_runs=?,
                    team1_wickets=?,
                    team1_overs=?,
                    team2_runs=?,
                    team2_wickets=?,
                    team2_overs=?,
                    result_date=CURRENT_TIMESTAMP
                WHERE fixture_id=?
            """,
            (
                team1_runs,
                team1_wickets,
                team1_overs,
                team2_runs,
                team2_wickets,
                team2_overs,
                fixture_id
            ))

        else:

            cursor.execute("""
                INSERT INTO match_results
                (
                    fixture_id,
                    team1_runs,
                    team1_wickets,
                    team1_overs,
                    team2_runs,
                    team2_wickets,
                    team2_overs
                )
                VALUES(?,?,?,?,?,?,?)
            """,
            (
                fixture_id,
                team1_runs,
                team1_wickets,
                team1_overs,
                team2_runs,
                team2_wickets,
                team2_overs
            ))


        conn.commit()


    except Exception as e:
        conn.rollback()
        print("ADD RESULT ERROR:",e)
        raise e


    finally:
        conn.close()
# ==================== POINTS TABLE & STATISTICS ====================

def calculate_nrr(runs_for, overs_faced, runs_against, overs_bowled):
    """Calculate Net Run Rate"""
    if overs_faced == 0 or overs_bowled == 0:
        return 0.0
    
    run_rate_for = runs_for / overs_faced if overs_faced > 0 else 0
    run_rate_against = runs_against / overs_bowled if overs_bowled > 0 else 0
    nrr = run_rate_for - run_rate_against
    return round(nrr, 2)

def get_points_table():
    """Generate points table"""

    league = get_league()

    if not league:
        return []


    teams = get_teams()

    conn = get_connection()
    cursor = conn.cursor()


    points_table = []


    for team in teams:

        cursor.execute("""
            SELECT
                f.team1_id,
                f.team2_id,

                mr.team1_runs,
                mr.team2_runs,

                mr.team1_overs,
                mr.team2_overs

            FROM fixtures f

            JOIN match_results mr
            ON f.id = mr.fixture_id

            WHERE 
            f.league_id = ?
            AND
            (
                f.team1_id = ?
                OR
                f.team2_id = ?
            )

        """,
        (
            league['id'],
            team['id'],
            team['id']
        ))


        matches = cursor.fetchall()


        played = 0
        wins = 0
        losses = 0

        runs_for = 0
        runs_against = 0

        overs_for = 0
        overs_against = 0



        for match in matches:


            played += 1


            if match['team1_id'] == team['id']:

                team_runs = match['team1_runs']
                opponent_runs = match['team2_runs']

                team_overs = match['team1_overs']
                opponent_overs = match['team2_overs']


            else:

                team_runs = match['team2_runs']
                opponent_runs = match['team1_runs']

                team_overs = match['team2_overs']
                opponent_overs = match['team1_overs']



            runs_for += team_runs
            runs_against += opponent_runs

            overs_for += team_overs
            overs_against += opponent_overs



            if team_runs > opponent_runs:
                wins += 1
            else:
                losses += 1



        points = wins * 2


        nrr = calculate_nrr(
            runs_for,
            overs_for,
            runs_against,
            overs_against
        )


        points_table.append({

            "team_id": team['id'],
            "team_name": team['name'],

            "matches": played,
            "wins": wins,
            "losses": losses,

            "points": points,

            "runs_for": runs_for,
            "runs_against": runs_against,

            "overs_faced": overs_for,
            "overs_bowled": overs_against,

            "nrr": nrr
        })



    points_table.sort(
        key=lambda x: (
            -x['points'],
            -x['nrr'],
            -x['wins']
        )
    )


    for index, team in enumerate(points_table,1):
        team['rank'] = index



    conn.close()

    return points_table

# ==================== RESET OPERATIONS ====================

def reset_tournament():
    """Delete entire league and start fresh"""
    conn = get_connection()
    cursor = conn.cursor()
    
    league = get_league()
    if league:
        league_id = league['id']
        
        # Delete all match results for this league's fixtures
        cursor.execute('''
            DELETE FROM match_results 
            WHERE fixture_id IN (
                SELECT id FROM fixtures WHERE league_id = ?
            )
        ''', (league_id,))
        
        # Delete fixtures
        cursor.execute('DELETE FROM fixtures WHERE league_id = ?', (league_id,))
        
        # Delete teams
        cursor.execute('DELETE FROM teams WHERE league_id = ?', (league_id,))
        
        # Delete league
        cursor.execute('DELETE FROM leagues WHERE id = ?', (league_id,))
        
        conn.commit()
    
    conn.close()

def get_match_by_id(match_id):
    """Get match result by ID"""

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 
            mr.id,
            f.id AS fixture_id,
            f.team1_id,
            f.team2_id,
            t1.name AS team1_name,
            t2.name AS team2_name,

            mr.team1_runs,
            mr.team1_wickets,
            mr.team1_overs,

            mr.team2_runs,
            mr.team2_wickets,
            mr.team2_overs,

            mr.result_date

        FROM match_results mr

        JOIN fixtures f
        ON mr.fixture_id = f.id

        JOIN teams t1
        ON f.team1_id = t1.id

        JOIN teams t2
        ON f.team2_id = t2.id

        WHERE mr.id = ?

    """,(match_id,))


    match = cursor.fetchone()

    conn.close()

    return dict(match) if match else None



def update_match_result(match_id,
                         team1_runs,
                         team1_wickets,
                         team1_overs,
                         team2_runs,
                         team2_wickets,
                         team2_overs):

    """Update existing result"""

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute("""
        UPDATE match_results

        SET
        team1_runs=?,
        team1_wickets=?,
        team1_overs=?,

        team2_runs=?,
        team2_wickets=?,
        team2_overs=?,

        result_date=CURRENT_TIMESTAMP

        WHERE id=?

    """,
    (
        team1_runs,
        team1_wickets,
        team1_overs,

        team2_runs,
        team2_wickets,
        team2_overs,

        match_id
    ))


    conn.commit()
    conn.close()



def delete_match_result(match_id):

    """Delete match result"""

    conn = get_connection()
    cursor = conn.cursor()


    cursor.execute("""
        DELETE FROM match_results
        WHERE id=?
    """,(match_id,))


    conn.commit()
    conn.close()