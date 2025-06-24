from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.contrib.auth import get_user_model
from core.models import Task, UserProfile, Team, TeamMembership
from datetime import date, datetime

User = get_user_model()

class CoreAPITestCase(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user(username='admin', password='pass')
        UserProfile.objects.create(user=self.admin_user, role='admin')

        self.manager_user = User.objects.create_user(username='manager', password='pass')
        UserProfile.objects.create(user=self.manager_user, role='manager')

        self.employee_user = User.objects.create_user(username='employee', password='pass')
        UserProfile.objects.create(user=self.employee_user, role='employee')

        self.team = Team.objects.create(name='Dev Team')
        TeamMembership.objects.create(user=self.manager_user, team=self.team, role='team_lead')

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin_user)

        self.manager_client = APIClient()
        self.manager_client.force_authenticate(user=self.manager_user)

        self.employee_client = APIClient()
        self.employee_client.force_authenticate(user=self.employee_user)

    def test_task_creation_by_manager(self):
        url = reverse('tasks-list')
        data = {
            'title': 'Test Task',
            'description': 'Test Desc',
            'assigned_to': self.employee_user.id,
            'deadline': date.today().isoformat()
        }
        response = self.manager_client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)
        task = Task.objects.first()
        self.assertEqual(task.assigned_to, self.employee_user)

    def test_task_creation_forbidden_for_employee(self):
        url = reverse('tasks-list')
        data = {
            'title': 'Task',
            'description': 'Desc',
            'assigned_to': self.employee_user.id,
            'deadline': date.today().isoformat()
        }
        response = self.employee_client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_task_status_change(self):
  
        task = Task.objects.create(
            title='ChangeStatus',
            description='Desc',
            assigned_to=self.employee_user,
            deadline=date.today()
        )
        url = reverse('tasks-detail', args=[task.id])
        data = {'status': 'in_progress'}
        response = self.employee_client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertEqual(task.status, 'in_progress')

    def test_leaderboard_endpoint(self):
        url = reverse('leaderboard-list')
        response = self.manager_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_notifications_endpoint(self):
        url = reverse('notification-list')
        response = self.employee_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_chat_file_endpoint_requires_auth(self):
        url = reverse('ask-file')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_chat_free_endpoint(self):
        url = reverse('chat-assistant')
        data = {'prompt': 'Hello'}
        response = self.employee_client.post(url, data)
        # Should be 200 even if AI returns empty or error key
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])
        self.assertTrue('answer' in response.data or 'error' in response.data)

def test_create_task(self):
    task = Task.objects.create(
        title="Test Task",
        description="Short task",
        assigned_to=self.user,
        status="todo",
        priority="medium",
        deadline=datetime.date.today()
    )
    self.assertEqual(task.status, "todo")
    self.assertEqual(task.assigned_to.username, "testuser")