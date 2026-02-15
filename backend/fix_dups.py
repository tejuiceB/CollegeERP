import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import BRANCH, YEAR, SEMESTER
from django.db.models import Count

def cleanup(model, fields, name):
    print(f"Cleaning {name}...")
    dups = model.objects.values(*fields).annotate(count=Count('pk')).filter(count__gt=1)
    for d in dups:
        print(f"  Fixing {d}")
        filter_kwargs = {f: d[f] for f in fields}
        records = model.objects.filter(**filter_kwargs).order_by('pk')
        for r in records[1:]:
            print(f"    Deleting ID {r.pk}")
            r.delete()
    print(f"Done cleaning {name}")

if __name__ == '__main__':
    cleanup(BRANCH, ['PROGRAM', 'CODE'], 'BRANCH')
    cleanup(YEAR, ['BRANCH', 'YEAR'], 'YEAR')
    cleanup(SEMESTER, ['YEAR', 'SEMESTER'], 'SEMESTER')
