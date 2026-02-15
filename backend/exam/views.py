from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from accounts.views import BaseModelViewSet

from .models import COLLEGE_EXAM_TYPE
from .serializers import CollegeExamTypeSerializer

class CollegeExamTypeViewSet(BaseModelViewSet): 
    """
    API endpoint that allows users to view or edit college exam types.
    """
    queryset = COLLEGE_EXAM_TYPE.objects.filter(IS_DELETED=False)  # Only show non-deleted records
    serializer_class = CollegeExamTypeSerializer
    permission_classes = [IsAuthenticated]

