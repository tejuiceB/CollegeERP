import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import BRANCH, YEAR, SEMESTER
from django.db.models import Count

def cleanup_dups(model, fields, name):
    print(f"Checking {name} for duplicates on fields {fields}...")
    dups = model.objects.values(*fields).annotate(count=Count('pk')).filter(count__gt=1)
    
    total_deleted = 0
    for dup in dups:
        filter_kwargs = {f: dup[f] for f in fields}
        records = model.objects.filter(**filter_kwargs).order_by('pk')
        
        print(f"  Found {len(records)} records for {filter_kwargs}. Keeping ID {records[0].pk}")
        for r in records[1:]:
            print(f"    Deleting ID {r.pk}")
            r.delete()
            total_deleted += 1
            
    print(f"  Total deleted in {name}: {total_deleted}")

if __name__ == '__main__':
    cleanup_dups(BRANCH, ['PROGRAM', 'CODE'], 'BRANCH')
    cleanup_dups(YEAR, ['BRANCH', 'YEAR'], 'YEAR')
    cleanup_dups(SEMESTER, ['YEAR', 'SEMESTER'], 'SEMESTER')
    print("Cleanup complete!")
