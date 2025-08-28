#!/usr/bin/env python3
import re
import mysql.connector
import sys
import os
from datetime import datetime

# Localhost connection when running on server
mysql_config = {
    'host': 'localhost',
    'port': 3306,
    'user': 'u883018350_admin',
    'password': 'Gh0stredux2025!!!',
    'database': 'u883018350_prescribers_pd'
}

def populate_data(sql_file):
    print(f"🚀 Starting migration at {datetime.now()}")
    
    if not os.path.exists(sql_file):
        print(f"❌ Error: {sql_file} not found!")
        print("📁 Current directory:", os.getcwd())
        print("📄 Available files:", os.listdir('.'))
        return
        
    print(f"📊 File size: {os.path.getsize(sql_file) / 1024 / 1024:.1f} MB")
    
    try:
        conn = mysql.connector.connect(**mysql_config)
        cursor = conn.cursor()
        print("✅ Connected to MySQL")
        
        # Test connection and show current state
        cursor.execute("SELECT DATABASE()")
        db_name = cursor.fetchone()[0]
        print(f"📍 Database: {db_name}")
        
        # Show current row counts
        tables = ['us_zipcodes', 'npi_prescriptions', 'npi_details', 'npi_addresses_usps']
        print("\n📊 Current row counts:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count:,}")
        
        print("\n🔄 Starting data import...")
        
        with open(sql_file, 'r', encoding='utf-8') as f:
            current_table = None
            in_copy_mode = False
            row_count = 0
            
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                
                if line.startswith('COPY public.'):
                    match = re.match(r'COPY public\.(\w+)', line)
                    if match:
                        current_table = match.group(1)
                        in_copy_mode = True
                        row_count = 0
                        print(f"\n📥 Processing {current_table}...")
                    continue
                
                if line == '\\.' and in_copy_mode:
                    in_copy_mode = False
                    conn.commit()
                    print(f"✅ Completed {current_table}: {row_count:,} rows")
                    continue
                
                if in_copy_mode and current_table and line:
                    try:
                        if current_table == 'us_zipcodes':
                            insert_zipcode(cursor, line)
                            row_count += 1
                        elif current_table == 'npi_prescriptions':
                            insert_prescription(cursor, line)
                            row_count += 1
                        elif current_table == 'npi_details':
                            insert_npi_details(cursor, line)
                            row_count += 1
                        elif current_table == 'npi_addresses_usps':
                            insert_npi_address(cursor, line)
                            row_count += 1
                            
                        if row_count % 10000 == 0:
                            print(f"  📊 {row_count:,} rows processed...")
                            conn.commit()
                            
                    except Exception as e:
                        if row_count < 5:  # Show first few errors
                            print(f"⚠️  Row {row_count}: {e}")
                        continue
        
        # Final summary
        print(f"\n🎉 Migration completed at {datetime.now()}")
        print("📊 Final row counts:")
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"  {table}: {count:,}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Database error: {e}")

def clean_value(value):
    if value == '\\N' or value is None:
        return None
    return value

def insert_zipcode(cursor, line):
    parts = line.split('\t')
    if len(parts) < 17:
        return
    
    geo_point = clean_value(parts[16])
    latitude = longitude = None
    
    if geo_point:
        try:
            lat_str, lng_str = geo_point.split(', ')
            latitude = float(lat_str.strip())
            longitude = float(lng_str.strip())
        except (ValueError, IndexError):
            pass
    
    sql = """
    INSERT IGNORE INTO us_zipcodes 
    (zip_code, official_usps_city_name, official_usps_state_code, 
     official_state_name, population, latitude, longitude)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    cursor.execute(sql, (
        clean_value(parts[0])[:5],
        clean_value(parts[1]),
        clean_value(parts[2]),
        clean_value(parts[3]),
        float(parts[6]) if parts[6] != '\\N' else None,
        latitude,
        longitude
    ))

def insert_prescription(cursor, line):
    parts = line.split('\t')
    if len(parts) < 6:
        return
    
    sql = """
    INSERT IGNORE INTO npi_prescriptions 
    (prescription_id, npi, drug_name, generic_name, total_claim_count, state)
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    cursor.execute(sql, (
        int(parts[0]) if parts[0] != '\\N' else None,
        int(parts[1]) if parts[1] != '\\N' else None,
        clean_value(parts[2]),
        clean_value(parts[3]),
        int(parts[4]) if parts[4] != '\\N' else None,
        clean_value(parts[5])
    ))

def insert_npi_details(cursor, line):
    parts = line.split('\t')
    if len(parts) < 15:
        return
    
    sql = """
    INSERT IGNORE INTO npi_details 
    (npi, provider_first_name, provider_last_name_legal_name, 
     provider_credential_text, healthcare_provider_taxonomy_1_classification)
    VALUES (%s, %s, %s, %s, %s)
    """
    
    cursor.execute(sql, (
        int(parts[0]) if parts[0] != '\\N' else None,
        clean_value(parts[1]),
        clean_value(parts[2]),
        clean_value(parts[7]) if len(parts) > 7 else None,
        clean_value(parts[10]) if len(parts) > 10 else None
    ))

def insert_npi_address(cursor, line):
    parts = line.split('\t')
    if len(parts) < 7:
        return
    
    sql = """
    INSERT IGNORE INTO npi_addresses_usps 
    (npi, usps_street_address, usps_secondary_address, usps_city, 
     usps_state_abbr, usps_zip5, usps_zip4)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    cursor.execute(sql, (
        int(parts[0]) if parts[0] != '\\N' else None,
        clean_value(parts[2]) if len(parts) > 2 else None,
        clean_value(parts[3]) if len(parts) > 3 else None,
        clean_value(parts[4]) if len(parts) > 4 else None,
        clean_value(parts[5]) if len(parts) > 5 else None,
        clean_value(parts[6]) if len(parts) > 6 else None,
        clean_value(parts[7]) if len(parts) > 7 else None
    ))

if __name__ == "__main__":
    sql_file = 'rx_backup_processed.sql'
    populate_data(sql_file)
