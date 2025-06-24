# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from core.views import badges_points
from .views import (
    api_home,
    register_user,
    secure_login,
    get_profile,
    get_employees,
    TaskViewSet,
    TaskFileUploadViewSet, QuizViewSet, generate_python_quiz, submit_quiz,
    BadgeViewSet, QuestViewSet, UserQuestViewSet, profile, LeaderboardViewSet, NotificationViewSet, ask_file, chat_assistant, AbsenceRequestViewSet, JoinRequestViewSet, InternalReportViewSet, QuizQuestionViewSet
)




router = DefaultRouter()
router.register(r'tasks',        TaskViewSet,           basename='tasks')
router.register(r'task-files',   TaskFileUploadViewSet, basename='taskfiles')
router.register(r'badges',   BadgeViewSet,   basename='badge')
router.register(r'quests',   QuestViewSet,   basename='quest')
router.register(r'user-quests', UserQuestViewSet, basename='userquest')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'absences', AbsenceRequestViewSet, basename='absences')
router.register(r'join-requests', JoinRequestViewSet, basename='joinrequest')
router.register(r'internal-reports', InternalReportViewSet, basename='reports')
router.register(r'quiz-questions', QuizQuestionViewSet, basename='quizquestion')
router.register(r'quizzes', QuizViewSet, basename='quiz')

urlpatterns = [

    # user management
    path('register/',          register_user,          name='register'),
    path('login/',             secure_login,           name='secure_login'),
    path('token/refresh/',     TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/',           get_profile,            name='profile'),
    path('employees/',         get_employees,          name='get_employees'),
    path('quizzes/generate/', generate_python_quiz, name='generate_python_quiz'),
    path('profile/', profile, name='profile'),
    path('badges-points/', badges_points, name='badges-points'),
    path('', include(router.urls)),
    path("ask-file/", ask_file, name="ask-file"),   # Q&A pe fișiere
    path("chat/",    chat_assistant, name="chat-assistant"),
    path('',                   api_home,               name='api_home'),
    path('quizzes/<int:quiz_id>/submit/', submit_quiz, name='submit_quiz'),

]
