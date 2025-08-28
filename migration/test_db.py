import mysql.connector
try:
    conn = mysql.connector.connect(
        host='localhost',
        user='u883018350_admin', 
        password='Gh0stredux2025!!!',
        database='u883018350_prescribers_pd'
    )
    print("✅ Database connection successful")
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM us_zipcodes")
    count = cursor.fetchone()[0]
    print(f"Current ZIP codes: {count}")
    conn.close()
except Exception as e:
    print(f"❌ Error: {e}")
