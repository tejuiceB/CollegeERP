from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from django.core.mail import send_mail
from accounts.views import BaseModelViewSet
from django.conf import settings
import logging
from django.http import Http404
from django.utils import timezone
from django.db.models import Q
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from utils.id_generators import generate_student_id
from django.contrib.auth import get_user_model
from utils.id_generators import generate_password
from accounts.models import DESIGNATION
from rest_framework import viewsets
from .models import EVENT_TYPE_MASTER, EVENT_MASTER, COMMITTEE_MASTER
from .serializers import EventTypeMasterSerializer, EventMasterSerializer, CommitteeMasterSerializer

class EventTypeMasterViewSet(BaseModelViewSet):
    queryset = EVENT_TYPE_MASTER.objects.all()
    serializer_class = EventTypeMasterSerializer

class CommitteeMasterViewSet(BaseModelViewSet):
    queryset = COMMITTEE_MASTER.objects.all()
    serializer_class = CommitteeMasterSerializer

class EventMasterViewSet(BaseModelViewSet):
    queryset = EVENT_MASTER.objects.all()
    serializer_class = EventMasterSerializer


# Create your views here.
