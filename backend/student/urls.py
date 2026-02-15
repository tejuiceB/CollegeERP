from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentMasterViewSet,StudentRollNumberDetailsViewSet, return_documents;

router = DefaultRouter()
router.register('student', StudentMasterViewSet, basename='student')  # Changed from '' to 'student'
# router.register('master/rollnumbers', views.StudentRollNumberDetailsViewSet, basename='rollnumbers')  # Added this line

from . import views
from .views import StudentMasterViewSet

router = DefaultRouter()
router.register('student', StudentMasterViewSet, basename='student')  # Changed from '' to 'student'
router.register(r'master/checklist', views.CheckListDocumentsViewSet, basename='checklist')
router.register(r'master/document-submission', views.StudentDocumentsViewSet, basename='student-documents')
router.register('master/rollnumbers', StudentRollNumberDetailsViewSet, basename='rollnumbers')  # Added this line


urlpatterns = [
    path('', include(router.urls)),  # Changed from 'student/' to ''
    path('return-documents/', return_documents, name='return-documents'),

   
]
