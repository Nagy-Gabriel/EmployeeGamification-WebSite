from django.db import models
from django.utils import timezone
from django.conf import settings

User = settings.AUTH_USER_MODEL


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # 🔐 Securitate personalizată
    salt = models.CharField(max_length=64, blank=True, null=True)
    password_hash = models.CharField(max_length=64, blank=True, null=True)

    points = models.IntegerField(default=0)
    xp     = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"


class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('in_verification', 'In Verification'),
        ('done', 'Done'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    deadline = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(default=timezone.now)
    rating = models.IntegerField(null=True, blank=True)
    feedback = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} → {self.assigned_to.username}"


class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    project_theme = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="managed_teams")
    team_lead = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="lead_teams")

    def __str__(self):
        return self.name

class TeamMembership(models.Model):
    ROLE_CHOICES = (
        ('employee', 'Employee'),
        ('team_lead', 'Team Lead'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="memberships")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'team')

class JoinRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

class RemoveRequest(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    user_to_remove = models.ForeignKey(User, on_delete=models.CASCADE, related_name='remove_requests')
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='removal_requests')
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)

class TeamHistory(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    
class TaskFile(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='task_files/')
    name = models.CharField(max_length=255, blank=True)  # <- acest câmp lipsea
    uploaded_at = models.DateTimeField(auto_now_add=True)
    extracted_text = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name or self.file.name
    

class Badge(models.Model):
    """
    Pentru viitor: obstacole de tip badge.
    """
    name        = models.CharField(max_length=50)
    icon        = models.CharField(max_length=100, help_text="URL sau nume iconă")   #DE PUS NEAPARAT
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Quest(models.Model):
    CATEGORY_CHOICES = [
        ('daily',   'Daily'),
        ('weekly',  'Weekly'),
        ('team',    'Team'),
        ('special', 'Special'),
    ]

    title         = models.CharField(max_length=100)
    description   = models.TextField()
    category      = models.CharField(max_length=10, choices=CATEGORY_CHOICES)
    xp_reward     = models.PositiveIntegerField(default=0)
    points_reward = models.PositiveIntegerField(default=0)
    badge_reward  = models.ForeignKey(
        Badge,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quests'
    )
    start_date    = models.DateField()
    due_date      = models.DateField()
    is_active     = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.category})"



class UserQuest(models.Model):
    STATUS_CHOICES = [
        ('pending',     'Pending'),
        ('in_progress', 'In Progress'),
        ('completed',   'Completed'),
        ('failed',      'Failed'),
    ]

    user     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_quests'
    )
    quest    = models.ForeignKey(
        Quest,
        on_delete=models.CASCADE,
        related_name='user_quests'
    )
    status   = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    progress = models.PositiveSmallIntegerField(default=0, help_text="0–5 steps completed")
    started_at   = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'quest')

    def __str__(self):
        return f"{self.user.username} – {self.quest.title} [{self.status}]"
    
class Notification(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message    = models.CharField(max_length=255)
    link       = models.CharField(max_length=255, blank=True)   # where in the UI they can click through
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notif for {self.user}: {self.message[:20]}"

class AbsenceRequest(models.Model):
    ABSENCE_TYPE_CHOICES = [
        ('VAC', 'Vacation'),
        ('SICK', 'Sick Leave'),
        ('PERS', 'Personal Leave'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('DENIED', 'Denied'),
    ]

    employee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='absence_requests'
    )
    absence_type = models.CharField(
        max_length=4,
        choices=ABSENCE_TYPE_CHOICES,
        default='VAC'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=8,
        choices=STATUS_CHOICES,
        default='PENDING'
    )
    manager_comment = models.TextField(blank=True, null=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)  # when manager approved/denied
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='absence_reviews'
    )

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.employee.username}: {self.get_absence_type_display()} ({self.start_date} → {self.end_date}) [{self.status}]"

class InternalReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('issue', 'Issue'),
        ('idea', 'Idea'),
        ('feedback', 'Feedback'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('resolved', 'Resolved'),
    ]

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_reports'
    )
    title = models.CharField(max_length=100)
    message = models.TextField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES, default='other')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    response = models.TextField(blank=True, null=True)
    responded_at = models.DateTimeField(blank=True, null=True)
    responded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='report_responses'
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Internal Report"
        verbose_name_plural = "Internal Reports"

    def __str__(self):
        return f"{self.title} ({self.sender.username})"
    
    
    
class Quiz(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    xp_reward = models.PositiveIntegerField(default=0)         
    points_reward = models.PositiveIntegerField(default=0)       
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, related_name='questions', on_delete=models.CASCADE)
    question_text = models.TextField()
    correct_answer = models.CharField(max_length=100)
    choices = models.JSONField(help_text="List of choices")

    def __str__(self):
        return self.question_text


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    passed = models.BooleanField(default=False)
    taken_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'quiz')
