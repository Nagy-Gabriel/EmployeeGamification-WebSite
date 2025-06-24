from django.contrib import admin
from .models import UserProfile
from .models import Task, InternalReport, Quiz, QuizQuestion


admin.site.register(UserProfile)
admin.site.register(Task)
admin.site.register(InternalReport)
admin.site.register(QuizQuestion)
admin.site.register(Quiz)