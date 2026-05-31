from flask import Flask, jsonify, request
from datetime import datetime, timedelta
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 프론트(다른 출처)에서 API 호출 허용

subjects = [
    {"id": 1, "name": "Work"}, {"id":2, "name":"Study"}, {"id":3, "name":"Exercise"}
]
sessions = []

@app.route('/')
def home():
    return 'Hello Focus Timer!'

@app.route('/subjects')
def get_subjects():
    return jsonify(subjects)

@app.route('/subjects', methods=['POST'])
def create_subject():
    data = request.get_json()
    name = data["name"]
    new_id = max([s["id"] for s in subjects], default=0) + 1
    new_subject = {"id": new_id, "name":name}
    subjects.append(new_subject)
    return jsonify(new_subject)

@app.route('/subjects/<int:id>', methods=['DELETE'])
def delete_subject(id):
    global subjects
    subjects = [s for s in subjects if s["id"] != id]
    return jsonify({"success":True})

@app.route('/sessions',methods=['POST'])
def create_session():
    data = request.get_json()
    subject_id=data["subject_id"]
    duration = data["duration"]
    new_id = max([s["id"] for s in sessions], default=0) + 1
    created_at = datetime.now().isoformat()
    subject = next((s for s in subjects if s["id"] == subject_id), None)
    subject_name = subject["name"]
    new_session = {
        "id":new_id, 
        "subject_id":subject_id, 
        "duration":duration,
        "created_at":created_at,
        "subject_name":subject_name
        }
    sessions.append(new_session)
    return jsonify(new_session)

@app.route('/sessions')
def get_sessions():
    result = sessions
    subject_id=request.args.get('subject_id')
    if subject_id:
        result = [s for s in sessions if s["subject_id"] == int(subject_id)]
    now = datetime.now()
    range_param = request.args.get('range')
    if range_param == 'week':
        cutoff = now - timedelta(days=7)
        result = [s for s in result if datetime.fromisoformat(s["created_at"]) >= cutoff]
    elif range_param == 'month':
        cutoff = now - timedelta(days=30)
        result = [s for s in result if datetime.fromisoformat(s["created_at"]) >= cutoff]
    return jsonify(result)

@app.route('/sessions/<int:id>', methods=['DELETE'])
def delete_session(id):
    global sessions
    sessions = [s for s in sessions if s["id"] != id]
    return jsonify({"success":True})

@app.route('/stats')
def get_stats():
    total_hours = round(sum([s["duration"] for s in sessions]) /60, 1)
    now = datetime.now()
    cutoff = now - timedelta(days=7)
    sessions_this_week = len([s for s in sessions if datetime.fromisoformat(s["created_at"]) >= cutoff])
    subName_totals = {}
    for s in sessions:
        name = s["subject_name"]
        subName_totals[name] = subName_totals.get(name,0) + s["duration"]
    by_subject = [{"name": name, "minutes": minutes} for name, minutes in subName_totals.items()]
    by_weekday={}
    for s in sessions:
        dt = datetime.fromisoformat(s["created_at"])
        weekday = dt.strftime("%a")
        by_weekday[weekday] = by_weekday.get(weekday, 0) + s["duration"]
    session_dates = set(datetime.fromisoformat(s["created_at"]).date() for s in sessions)
    streak = 0
    day = datetime.now().date()        
    while day in session_dates:      
        streak += 1               
        day = day - timedelta(days=1)  

    return jsonify({
        "streak": streak,
        "total_hours": total_hours,
        "sessions_this_week": sessions_this_week,
        "by_subject": by_subject,
        "by_weekday": by_weekday
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)