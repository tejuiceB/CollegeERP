import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

with connection.cursor() as cursor:
    cursor.execute('DELETE FROM "ADMIN"."YEARS" WHERE "YEAR_ID" IN (6, 8, 4, 5)')
    print(f"Deleted {cursor.rowcount} rows from ADMIN.YEARS")
    
    # Generic cleanup for any remaining overlaps in BRANCHES
    cursor.execute("""
        DELETE FROM "ADMIN"."BRANCHES"
        WHERE "BRANCH_ID" NOT IN (
            SELECT MIN("BRANCH_ID")
            FROM "ADMIN"."BRANCHES"
            GROUP BY "PROGRAM_ID", "CODE"
        )
    """)
    print(f"Deleted {cursor.rowcount} rows from ADMIN.BRANCHES")

    # Generic cleanup for any remaining overlaps in YEARS
    cursor.execute("""
        DELETE FROM "ADMIN"."YEARS" 
        WHERE "YEAR_ID" NOT IN (
            SELECT MIN("YEAR_ID") 
            FROM "ADMIN"."YEARS" 
            GROUP BY "BRANCH_ID", "YEAR"
        )
    """)
    print(f"Deleted {cursor.rowcount} rows from ADMIN.YEARS")

