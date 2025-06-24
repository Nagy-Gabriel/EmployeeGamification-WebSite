from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Task, UserProfile, Team, TeamMembership, JoinRequest, RemoveRequest, TeamHistory
from .serializers import RegisterSerializer, TaskSerializer, TeamSerializer, TeamMembershipSerializer, JoinRequestSerializer, RemoveRequestSerializer, TeamHistorySerializer, UserSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from .models import TaskFile, Task
from .serializers import TaskFileSerializer
from rest_framework.exceptions import ValidationError
import hashlib
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
from django.db.models import Q, Count
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Badge, Quest, UserQuest
from .serializers import BadgeSerializer, QuestSerializer, UserQuestSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import BasePermission
from .serializers import LeaderboardSerializer
from openai import OpenAI
from django.conf import settings
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import NotificationSerializer
from .models import Notification 
from openai import OpenAI
from pdfminer.high_level import extract_text as extract_pdf_text
from docx import Document
import sys
import traceback
from .models import AbsenceRequest
from .serializers import AbsenceRequestSerializer
from .models import InternalReport, Quiz, QuizAttempt
from .serializers import InternalReportSerializer, QuizSerializer, QuizQuestion, QuizQuestionSerializer
import json, re

openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

@api_view(['GET'])
def api_home(request):
    return Response({"message": "API is working!"})


@api_view(['POST'])
@permission_classes([AllowAny])  # public endpoint
def secure_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        profile = user.userprofile
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found."}, status=status.HTTP_404_NOT_FOUND)

    # Hash(password + salt)
    salted = (profile.salt + password).encode('utf-8')
    hash_value = hashlib.sha256(salted).hexdigest()

    if hash_value != profile.password_hash:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    return Response({
        "message": "Login successful",
        "user_id": user.id,
        "username": user.username,
        "role": profile.role,
        "access": access_token,
        "refresh": refresh_token,
    }, status=status.HTTP_200_OK)
    
    
# -----------------------------------
# ✅ Register User
# -----------------------------------
@api_view(['POST'])
@permission_classes([])  # ✅ Make sure it's public (no auth required)
def register_user(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile = user.userprofile
    return Response({
        'username': user.username,
        'email':    user.email,
        'role':     profile.role,
        'points':   profile.points,
        'xp':       profile.xp,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employees(request):
    employees = User.objects.filter(userprofile__role='employee')
    data = [
        {"id": user.id, "username": user.username}
        for user in employees
    ]
    return Response(data)

# -----------------------------------
# Task ViewSet with Role-Based Permissions
# -----------------------------------
class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role in ['admin', 'manager']:
            return Task.objects.all()
        return Task.objects.filter(assigned_to=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.userprofile.role in ['admin', 'manager']:
            serializer.save()
        else:
            raise PermissionDenied("You are not allowed to create tasks.")

    def perform_update(self, serializer):
        user = self.request.user
        task = self.get_object()
        status_before = task.status
        status_after = serializer.validated_data.get('status', status_before)

        if user.userprofile.role in ['admin', 'manager']:
            serializer.save()
            if status_before != 'done' and status_after == 'done':
                profile = task.assigned_to.userprofile
                profile.points += 10
                profile.save()
        elif user == task.assigned_to:
            if list(serializer.validated_data.keys()) == ['status'] and status_after in ['in_progress', 'in_verification']:
                serializer.save()
            else:
                raise PermissionDenied("Employees can only submit tasks for verification.")
        else:
            raise PermissionDenied("You are not allowed to update this task.")

    def perform_destroy(self, instance):
        user = self.request.user
        if user.userprofile.role in ['admin', 'manager']:
            instance.delete()
        else:
            raise PermissionDenied("Only managers or admins can delete tasks.")

# -----------------------------------
# Team Management Views
# -----------------------------------
class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if user.userprofile.role in ['admin', 'manager']:
            serializer.save(manager=user)
        else:
            raise permissions.PermissionDenied("You are not allowed to create a team.")

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'employee')

        if request.user != team.manager and request.user.userprofile.role != 'admin':
            return Response({"error": "Permission denied."}, status=403)

        user = User.objects.get(id=user_id)
        TeamMembership.objects.create(team=team, user=user, role=role)
        TeamHistory.objects.create(team=team, user=request.user, action=f"Added {user.username} to team")
        return Response({"message": "Member added."})

    @action(detail=True, methods=['post'])
    def request_join(self, request, pk=None):
        try:
            team = self.get_object()
            
            # șterge celelalte requesturi ne-pending ca să nu se repete
            JoinRequest.objects.filter(user=request.user, team=team).exclude(status='pending').delete()

            # verifică dacă există unul pending
            existing = JoinRequest.objects.filter(user=request.user, team=team, status='pending').exists()
            if existing:
                return Response({"error": "Already requested."}, status=400)

            JoinRequest.objects.create(
                user=request.user,
                team=team,
                message=request.data.get('message', '')
            )
            return Response({"message": "Join request sent."})
        
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        reason = request.data.get('reason', '')
        target = User.objects.get(id=user_id)

        if request.user.userprofile.role == 'manager':
            if team.manager != request.user:
                return Response({"error": "You can only request removals in your own team."}, status=403)

            RemoveRequest.objects.create(
            team=team,
            requested_by=request.user,
            user_to_remove=target,
            reason=reason
            )
            return Response({"message": "Request sent to admin for approval."})
            print(f"User: {request.user.username}, Role: {request.user.userprofile.role}")

        elif (request.user.userprofile.role == 'admin'):
            TeamMembership.objects.filter(user=target, team=team).delete()
            TeamHistory.objects.create(
                team=team,
                user=request.user,
                action=f"Removed {target.username} from team"
            )  
            return Response({"message": "Member removed."})

        else:
            return Response({"error": "Permission denied."}, status=403)


    @action(detail=False, methods=['get'])
    def my_team(self, request):
        user = request.user
        teams = TeamMembership.objects.filter(user=user).values_list('team', flat=True)
        return Response(TeamSerializer(Team.objects.filter(id__in=teams), many=True).data)
    @action(detail=True, methods=['get'], url_path='members')
    def get_members(self, request, pk=None):
        team = self.get_object()
        members = TeamMembership.objects.filter(team=team)
        serializer = TeamMembershipSerializer(members, many=True)
        return Response(serializer.data)
    @action(detail=False, methods=['get'], url_path='my_team_ids')
    def my_team_ids(self, request):
        teams = TeamMembership.objects.filter(user=request.user).values_list('team_id', flat=True)
        return Response(list(teams))
    
    @action(detail=True, methods=['post'])
    def transfer_member(self, request, pk=None):
        if request.user.userprofile.role != 'admin':
            return Response({'error': 'Only admins can move members.'}, status=403)

        old_team = self.get_object()
        user_id = request.data.get('user_id')
        new_team_id = request.data.get('new_team_id')

        try:
            member = User.objects.get(id=user_id)
            new_team = Team.objects.get(id=new_team_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
        except Team.DoesNotExist:
            return Response({'error': 'New team not found'}, status=404)

        # Check if member is in the current team
        if not TeamMembership.objects.filter(user=member, team=old_team).exists():
            return Response({'error': 'User is not part of this team'}, status=400)

        # Enforce max 5 members in new team
        if TeamMembership.objects.filter(team=new_team).count() >= 5:
            return Response({'error': 'New team has reached maximum number of members'}, status=400)

        # Prevent leaving the old team without a manager
        if TeamMembership.objects.filter(team=old_team, role='manager').count() == 1:
            if TeamMembership.objects.filter(user=member, team=old_team, role='manager').exists():
                return Response({'error': 'You must have at least one manager in the old team'}, status=400)

        # Remove from old team
        TeamMembership.objects.filter(user=member, team=old_team).delete()

        # Add to new team
        TeamMembership.objects.create(user=member, team=new_team, role='employee')

        # Save to history
        TeamHistory.objects.create(team=old_team, user=request.user, action=f"Moved {member.username} to {new_team.name}")

        return Response({'message': f'{member.username} moved to {new_team.name} successfully'})
    
    
    @action(detail=True, methods=['post'])
    def assign_team_lead(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')

        iteam = self.get_object()

        if request.user.userprofile.role not in ['admin', 'manager']:
             return Response({"error": "Permission denied."}, status=403)

    # Dacă e manager, verificam că e managerul acestei echipe
        if request.user.userprofile.role == 'manager' and team.manager != request.user:
            return Response({"error": "You are not the manager of this team."}, status=403)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)

        # Verifică dacă utilizatorul este membru în echipă
        if not TeamMembership.objects.filter(team=team, user=user).exists():
            return Response({"error": "User is not a member of this team."}, status=400)

        team.team_lead = user
        team.save()

        TeamHistory.objects.create(
            team=team,
            user=request.user,
            action=f"Assigned {user.username} as Team Lead"
        )

        return Response({"message": f"{user.username} is now the Team Lead."})
    
class JoinRequestViewSet(viewsets.ModelViewSet):
    queryset = JoinRequest.objects.all()
    serializer_class = JoinRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'admin':
            return JoinRequest.objects.filter(status='pending')
        return JoinRequest.objects.filter(user=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        req = self.get_object()
        req.status = 'approved'
        req.save()
        TeamMembership.objects.create(user=req.user, team=req.team)
        TeamHistory.objects.create(team=req.team, user=request.user, action=f"Approved join for {req.user.username}")
        return Response({"message": "Request approved."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status = 'rejected'
        req.save()
        return Response({"message": "Request rejected."})

class RemoveRequestViewSet(viewsets.ModelViewSet):
    queryset = RemoveRequest.objects.all()
    serializer_class = RemoveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.userprofile.role == 'admin':
            return RemoveRequest.objects.filter(status='pending')
        return RemoveRequest.objects.filter(requested_by=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        req = self.get_object()
        TeamMembership.objects.filter(user=req.user_to_remove, team=req.team).delete()
        req.status = 'approved'
        req.save()
        TeamHistory.objects.create(team=req.team, user=request.user, action=f"Approved removal of {req.user_to_remove.username}")
        return Response({"message": "Removal approved."})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        req = self.get_object()
        req.status = 'rejected'
        req.save()
        return Response({"message": "Removal rejected."})


    @action(detail=True, methods=['post'])
    def move_member(self, request, pk=None):
        source_team = self.get_object()
        target_team_id = request.data.get('target_team_id')
        user_id = request.data.get('user_id')

        if request.user.userprofile.role != 'admin':
            return Response({"error": "Only admins can move members."}, status=403)

        try:
            membership = TeamMembership.objects.get(user__id=user_id, team=source_team)
            target_team = Team.objects.get(id=target_team_id)

            # Verifică dacă utilizatorul este deja membru în echipa țintă
            if TeamMembership.objects.filter(user__id=user_id, team=target_team).exists():
                return Response({"error": "User already in target team."}, status=400)

            membership.team = target_team
            membership.save()

            TeamHistory.objects.create(
                team=target_team,
                user=request.user,
                action=f"Moved {membership.user.username} from team {source_team.name} to {target_team.name}"
            )

            return Response({"message": "Member moved successfully."})
        except TeamMembership.DoesNotExist:
            return Response({"error": "User is not a member of the source team."}, status=404)
        except Team.DoesNotExist:
            return Response({"error": "Target team not found."}, status=404)
        
        
class TaskFileUploadViewSet(viewsets.ModelViewSet):
    queryset = TaskFile.objects.all()
    serializer_class = TaskFileSerializer
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        task_id = self.request.data.get('task_id')
        name = self.request.data.get('name', '')

        if not task_id:
            raise ValidationError({'task_id': 'This field is required.'})
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise ValidationError({'task_id': 'Invalid task ID.'})
        instance = serializer.save(task=task, name=name)
        path = instance.file.path
        text = ""
        if path.lower().endswith(".pdf"):
           text = extract_pdf_text(path)
        elif path.lower().endswith(".docx"):
            doc = Document(path)
            text = "\n".join(p.text for p in doc.paragraphs)
        else:
            # alte formate plain text
            try:
                with open(path, encoding="utf-8") as f:
                    text = f.read()
            except:
                text = ""

        instance.extracted_text = text
        instance.save()

    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            return TaskFile.objects.filter(task__id=task_id)
        return TaskFile.objects.all()
    
    
class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]  # poți permite public GET

class IsManagerOrAdmin(BasePermission):
    """
    - Any authenticated user may LIST (GET) or CREATE (POST).
    - Only users with role 'manager' or 'admin' may UPDATE (PUT/PATCH) or DESTROY (DELETE).
    """
    def has_permission(self, request, view):
        # Allow any authenticated user to view (GET) or create (POST)
        if view.action in ['list', 'retrieve', 'create', 'start', 'complete']:
            return request.user and request.user.is_authenticated

        # For update/partial_update/destroy, only manager/admin
        if view.action in ['update', 'partial_update', 'destroy']:
            role = getattr(request.user.userprofile, 'role', None)
            return role in ['manager', 'admin']

        # Default: deny
        return False
    
class QuestViewSet(viewsets.ModelViewSet):
    queryset = Quest.objects.filter(is_active=True)
    serializer_class = QuestSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category']

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Înregistrează începutul unui Quest pentru user."""
        quest = self.get_object()
        uq, created = UserQuest.objects.get_or_create(
            user=request.user,
            quest=quest,
            defaults={'status':'in_progress', 'started_at': timezone.now()}
        )
        if not created:
            return Response({'detail':'Already started.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserQuestSerializer(uq)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        quest = self.get_object()
        try:
            uq = UserQuest.objects.get(user=request.user, quest=quest)
        except UserQuest.DoesNotExist:
            return Response({'detail': 'Not started yet.'}, status=400)

        if uq.status == 'completed':
            return Response({'detail': 'Already completed.'}, status=200)

        uq.status = 'completed'
        uq.progress = 5
        uq.completed_at = timezone.now()
        uq.save()

        profile = request.user.userprofile
        profile.xp += quest.xp_reward or 0
        profile.points += quest.points_reward or 0
        profile.save()

        return Response(UserQuestSerializer(uq).data, status=200)

class UserQuestViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        return UserQuest.objects.filter(user=self.request.user)
    serializer_class = UserQuestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['quest', 'status']    
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """
    Returnează datele curente ale utilizatorului: id, username, role, points, xp.
    """
    user = request.user
    profile = user.userprofile
    return Response({
        'id': user.id,
        'username': user.username,
        'email':    user.email,
        'role': profile.role,
        'points': profile.points,
        'xp': profile.xp,
    })
    
    
class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lista utilizatorilor ordonați descrescător după puncte,
    împreună cu numărul de task-uri finalizate și nivelul.
    """
    queryset = User.objects.annotate(
        completed_tasks=Count(
            'tasks',
            filter=Q(tasks__status='done')
        )
    ).order_by('-userprofile__points')
    serializer_class   = LeaderboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def badges_points(request):
    user    = request.user
    profile = user.userprofile

    # raw stats
    xp        = profile.xp or 0
    pts       = profile.points or 0

    # ← COUNT TASKS FROM Task MODEL WHERE status='done' AND assigned_to=user
    tasks_done = Task.objects.filter(
        assigned_to=user,
        status='done'
    ).count()

    # compute level & xp‐to‐next (same as before)
    level = min(xp // 100 + 1, 30)
    next_xp_threshold = min(level * 100, 3000)
    xp_to_next        = next_xp_threshold - xp

    # tasks → next threshold logic
    if tasks_done < 1:
        tasks_to_next = 1 - tasks_done
    elif tasks_done < 15:
        tasks_to_next = 15 - tasks_done
    elif tasks_done < 30:
        tasks_to_next = 30 - tasks_done
    elif tasks_done < 45:
        tasks_to_next = 45 - tasks_done
    else:
        tasks_to_next = 0

    # points → next threshold
    if pts < 1:
        points_to_next = 1 - pts
    elif pts < 5000:
        points_to_next = 5000 - pts
    elif pts < 10000:
        points_to_next = 10000 - pts
    elif pts < 20000:
        points_to_next = 20000 - pts
    else:
        points_to_next = 0

    # badge codes (same as before)
    if level >= 30:
        xp_badge = 'xp4'
    elif level >= 20:
        xp_badge = 'xp3'
    elif level >= 10:
        xp_badge = 'xp2'
    else:
        xp_badge = 'xp1'

    if tasks_done >= 45:
        task_badge = 'task4'
    elif tasks_done >= 30:
        task_badge = 'task3'
    elif tasks_done >= 15:
        task_badge = 'task2'
    elif tasks_done >= 1:
        task_badge = 'task1'
    else:
        task_badge = None

    if pts >= 20000:
        point_badge = 'point4'
    elif pts >= 10000:
        point_badge = 'point3'
    elif pts >= 5000:
        point_badge = 'point2'
    elif pts >= 1:
        point_badge = 'point1'
    else:
        point_badge = None

    return Response({
        'username':       user.username,
        'xp':             xp,
        'points':         pts,
        'tasks_done':     tasks_done,
        'level':          level,
        'xp_to_next':     xp_to_next,
        'tasks_to_next':  tasks_to_next,
        'points_to_next': points_to_next,
        'xp_badge':       xp_badge,
        'task_badge':     task_badge,
        'point_badge':    point_badge,
    })
    

    
    
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # only the current user’s notifications
        return self.request.user.notifications.all()

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['delete'], url_path='clear_read')
    def clear_read_notifications(self, request):

        # delete all read notifications for the logged-in user
        deleted_count, _ = Notification.objects.filter(
            user=request.user,
            is_read=True
        ).delete()

        return Response(
            {'deleted': deleted_count},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ask_file(request):
    try:
        file_id = request.data.get('file_id')
        question = request.data.get('question', '').strip()
        if not file_id or not question:
            return Response({'error': 'file_id and question are necessary'}, status=400)

        tf = TaskFile.objects.get(id=file_id)

        prompt = f"Document:\n{tf.extracted_text}\n\nQuestion {question}\nAnswer:"
        resp = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=3000,
        )
        return Response({'answer': resp.choices[0].message.content.strip()})

    except TaskFile.DoesNotExist:
        return Response({'error': 'File does not exist!'}, status=404)

    except Exception as e:
        # print full traceback în consolă
        traceback.print_exc(file=sys.stderr)
        # returnează eroarea în JSON
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_assistant(request):
    prompt = request.data.get('prompt','').strip()
    if not prompt:
        return Response({'error':'Send a prompt'}, status=400)

    # debug: verifică că cheia există
    if not settings.OPENAI_API_KEY:
        return Response({'error':'OPENAI_API_KEY is not set'}, status=500)

    try:
        resp = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role":"user","content": prompt}],
            temperature=0.7,
            max_tokens=3000,
        )
        return Response({'answer': resp.choices[0].message.content})
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        return Response(
            {'error': str(e)},
            status=500
        )
        

class AbsenceRequestViewSet(viewsets.ModelViewSet):
    """
    - GET    /api/absences/       : employees see their own; managers/admin see all.
    - POST   /api/absences/       : any authenticated user can create their own request.
    - GET    /api/absences/{id}/  : employees see their own; managers/admin see any.
    - PATCH  /api/absences/{id}/  : only manager/admin can approve/deny.
    - DELETE /api/absences/{id}/  : only manager/admin.
    """
    queryset = AbsenceRequest.objects.all()
    serializer_class = AbsenceRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsManagerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user.userprofile, 'role', None)
        if role in ['manager', 'admin']:
            return AbsenceRequest.objects.all()
        return AbsenceRequest.objects.filter(employee=user)

    def perform_create(self, serializer):
        # Automatically set employee=request.user
        serializer.save(employee=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        role = getattr(request.user.userprofile, 'role', None)
        if role not in ['manager', 'admin']:
            return Response(
                {"detail": "Only managers or admins can approve/deny."},
                status=status.HTTP_403_FORBIDDEN
            )

        instance = self.get_object()
        data = {}

        if 'status' in request.data:
            data['status'] = request.data['status']
            data['reviewed_at'] = timezone.now()
            data['reviewed_by'] = request.user 

        if 'manager_comment' in request.data:
            data['manager_comment'] = request.data['manager_comment']

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    
class InternalReportViewSet(viewsets.ModelViewSet):
    queryset = InternalReport.objects.all()
    serializer_class = InternalReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user.userprofile, 'role', None)

        if role in ['admin', 'manager']:
            return InternalReport.objects.all()
        return InternalReport.objects.filter(sender=user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        role = getattr(request.user.userprofile, 'role', None)

        if role not in ['admin', 'manager']:
            return Response({"error": "Only managers or admins can respond."}, status=403)

        if 'response' in request.data or request.data.get('status') == 'resolved':
            instance.response = request.data.get('response')
            instance.status = request.data.get('status', 'resolved')
            instance.responded_at = timezone.now()
            instance.responded_by = request.user
            instance.save()
            return Response(self.get_serializer(instance).data)

        return super().partial_update(request, *args, **kwargs)
    
class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(is_active=True)

    def perform_create(self, serializer):
        role = self.request.user.userprofile.role
        if role not in ['admin', 'manager']:
            raise PermissionDenied("Only admins/managers can create quizzes.")
        serializer.save()
        
class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        return serializer.save()

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.get(id=quiz_id, is_active=True)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=404)

    user_answers = request.data.get('answers', {})  # {question_id: answer}
    correct = 0
    total = quiz.questions.count()

    for q in quiz.questions.all():
        if str(q.id) in user_answers:
            if user_answers[str(q.id)] == q.correct_answer:
                correct += 1

    passed = (correct == total)  # perfect score
    attempt = QuizAttempt.objects.create(
        user=request.user,
        quiz=quiz,
        score=correct,
        total_questions=total,
        passed=passed
    )

    if passed:
        profile = request.user.userprofile
        profile.xp += 50
        profile.points += 100
        profile.save()

    return Response({
        "message": "Quiz submitted.",
        "score": correct,
        "total": total,
        "passed": passed
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_python_quiz(request):
    difficulty = request.data.get('difficulty', 'beginner')

    prompt = (
        f"Generate 10 multiple-choice quiz questions about Python ({difficulty} level). "
        f"Each must include: question_text, choices (list of 4 strings), correct_answer (must be in choices). "
        f"Return ONLY a JSON array of question objects."
    )

    try:
        completion = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=2000,
        )
        raw = completion.choices[0].message.content.strip()

        import re
        match = re.search(r'\[\s*{.*?}\s*\]', raw, re.DOTALL)
        if not match:
            return Response({'error': 'Failed to extract JSON array from OpenAI response'}, status=400)

        data = json.loads(match.group(0))  # this could raise JSONDecodeError

        # ✅ OPTIONAL: validate structure
        for q in data:
            if not all(k in q for k in ['question_text', 'choices', 'correct_answer']):
                return Response({'error': 'Invalid question format'}, status=400)

        # Create Quiz + Questions
        quiz = Quiz.objects.create(
            title="Python AI Quiz",
            description=f"Auto-generated quiz on Python ({difficulty})",
            xp_reward=50,
            points_reward=100
        )

        for q in data:
            QuizQuestion.objects.create(
                quiz=quiz,
                question_text=q['question_text'],
                choices=q['choices'],
                correct_answer=q['correct_answer']
            )

        return Response(QuizSerializer(quiz).data)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)
