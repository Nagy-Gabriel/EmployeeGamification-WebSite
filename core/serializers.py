from rest_framework import serializers
from .models import UserProfile, Task, Team, TeamMembership, JoinRequest, RemoveRequest, TeamHistory
from django.contrib.auth.models import User
from .models import TaskFile
from .models import UserProfile
import hashlib
import secrets
from .models import Badge, Quest, UserQuest, Notification, AbsenceRequest, InternalReport, Quiz, QuizQuestion, QuizAttempt


# ✅ Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role')
        raw_password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_unusable_password() 
        user.save()

       
        salt = secrets.token_hex(16) # 32 caractere
        salted = (salt + raw_password).encode('utf-8') #concatenare
        password_hash = hashlib.sha256(salted).hexdigest()  #SHA256

        UserProfile.objects.create(
            user=user,
            role=role,
            salt=salt,
            password_hash=password_hash
        )
        return user
    

class TaskSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = Task
        fields = '__all__'

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['assigned_to'] = {
            "id": instance.assigned_to.id,
            "username": instance.assigned_to.username
        }
        return rep

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

# Team serializer
class TeamSerializer(serializers.ModelSerializer):
    manager = UserSerializer(read_only=True)
    team_lead = UserSerializer(read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'description', 'project_theme', 'created_at', 'manager', 'team_lead']

# Team membership
class TeamMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = TeamMembership
        fields = ['id', 'user', 'team', 'role', 'joined_at']

# Join Request
class JoinRequestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = JoinRequest
        fields = ['id', 'user', 'team', 'message', 'status', 'requested_at']

# Remove Request
class RemoveRequestSerializer(serializers.ModelSerializer):
    user_to_remove = UserSerializer(read_only=True)
    requested_by = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = RemoveRequest
        fields = ['id', 'user_to_remove', 'requested_by', 'team', 'reason', 'status', 'requested_at']

# Team History
class TeamHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    team = TeamSerializer(read_only=True)

    class Meta:
        model = TeamHistory
        fields = ['id', 'team', 'user', 'action', 'timestamp']

class TaskFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskFile
        fields = ['id', 'task', 'file', 'name', 'uploaded_at']
        read_only_fields = ['uploaded_at', 'task']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'icon', 'description']


class QuestSerializer(serializers.ModelSerializer):
    badge_reward = BadgeSerializer(read_only=True)
    badge_reward_id = serializers.PrimaryKeyRelatedField(
        queryset=Badge.objects.all(), source='badge_reward', write_only=True, required=False
    )

    class Meta:
        model = Quest
        fields = [
            'id',
            'title',
            'description',
            'category',
            'xp_reward',
            'points_reward',
            'badge_reward',
            'badge_reward_id',
            'start_date',
            'due_date',
            'is_active',
        ]


class UserQuestSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True
    )
    quest = QuestSerializer(read_only=True)
    quest_id = serializers.PrimaryKeyRelatedField(
        queryset=Quest.objects.all(),
        source='quest',
        write_only=True
    )

    class Meta:
        model = UserQuest
        fields = [
            'id',
            'user', 'user_id',
            'quest', 'quest_id',
            'status',
            'progress',
            'started_at',
            'completed_at',
        ]
        read_only_fields = ['started_at', 'completed_at']
        
        
class LeaderboardSerializer(serializers.ModelSerializer):
    completed_tasks = serializers.IntegerField()
    points          = serializers.SerializerMethodField()
    level           = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['username', 'completed_tasks', 'level', 'points']

    def get_points(self, obj):
        try:
            return obj.userprofile.points or 0
        except UserProfile.DoesNotExist:
            return 0

    def get_level(self, obj):
        try:
            xp = obj.userprofile.xp or 0
        except UserProfile.DoesNotExist:
            xp = 0
        lvl = xp // 100 + 1
        return min(lvl, 30)
    
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id','message','link','is_read','created_at']
        
        
class AbsenceRequestSerializer(serializers.ModelSerializer):
    employee_username = serializers.ReadOnlyField(source='employee.username')
    reviewed_by_username = serializers.ReadOnlyField(source='reviewed_by.username')

    class Meta:
        model = AbsenceRequest
        fields = [
            'id',
            'employee',
            'employee_username',
            'absence_type',
            'start_date',
            'end_date',
            'reason',
            'status',
            'manager_comment',
            'requested_at',
            'reviewed_at',
            'reviewed_by',
            'reviewed_by_username',
        ]
        read_only_fields = [
            'id',
            'employee',  # ← mark as read-only so it’s auto-set in the view
            'employee_username',
            
            'requested_at',
            'reviewed_at',
            'reviewed_by',
            'reviewed_by_username',
        ]

    def validate(self, data):
        sd = data.get('start_date')
        ed = data.get('end_date')
        if sd and ed and ed < sd:
            raise serializers.ValidationError("End date cannot be earlier than start date.")
        return data



class InternalReportSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    responded_by_username = serializers.ReadOnlyField(source='responded_by.username')

    class Meta:
        model = InternalReport
        fields = [
            'id', 'sender', 'sender_username',
            'title', 'message', 'report_type',
            'status', 'response', 'responded_at', 'responded_by', 'responded_by_username',
            'created_at',
        ]
        read_only_fields = [
            'id', 'sender', 'sender_username',
            'status', 'response', 'responded_at',
            'responded_by', 'responded_by_username', 'created_at'
        ]

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'quiz', 'question_text', 'choices', 'correct_answer']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'is_active', 'questions']


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'quiz', 'score', 'total_questions', 'passed', 'taken_at']
        read_only_fields = ['user', 'score', 'total_questions', 'passed', 'taken_at']
