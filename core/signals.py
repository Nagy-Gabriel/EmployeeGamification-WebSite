from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Task, UserQuest, TeamMembership, Quest, Notification, AbsenceRequest, UserProfile, InternalReport

User = get_user_model()

@receiver(post_save, sender=Task)
def notify_task_assigned(sender, instance, created, **kwargs):
    if created:
        user = instance.assigned_to
        msg = f"You have a new task: {instance.title}"
        Notification.objects.create(user=user, message=msg, link=f"/tasks/{instance.id}/")

        html_content = render_to_string("emails/task_assigned.html", {
            "user": user,
            "message": msg,
            "link": f"/tasks/{instance.id}/",
        })

        email = EmailMultiAlternatives(
            subject="New Task Assigned",
            body=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()


@receiver(post_save, sender=UserQuest)
def notify_quest_completed(sender, instance, created, **kwargs):
    if not created and instance.status == 'completed':
        user = instance.user
        msg = f"Quest complete: {instance.quest.title}!"
        Notification.objects.create(user=user, message=msg, link=f"/quests/{instance.quest.id}/")

        html = render_to_string("emails/quest_completed.html", {
            "user": user,
            "message": msg,
            "quest": instance.quest,
        })

        email = EmailMultiAlternatives(
            subject="Quest Completed",
            body=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html, "text/html")
        email.send()


@receiver(post_save, sender=TeamMembership)
def notify_team_added(sender, instance, created, **kwargs):
    if created:
        user = instance.user
        msg = f"You've been added to team: {instance.team.name}"
        Notification.objects.create(user=user, message=msg, link=f"/teams/{instance.team.id}/")

        html = render_to_string("emails/added_to_team.html", {
            "user": user,
            "team": instance.team,
            "message": msg,
        })

        email = EmailMultiAlternatives(
            subject="Added to Team",
            body=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html, "text/html")
        email.send()


@receiver(post_save, sender=Quest)
def notify_new_quest(sender, instance, created, **kwargs):
    if created:
        for user in User.objects.filter(userprofile__role__in=['admin','manager', 'employee']):
            msg = f"New quest published: {instance.title}"
            Notification.objects.create(user=user, message=msg, link=f"/quests/{instance.id}/")

            html = render_to_string("emails/new_quest.html", {
                "user": user,
                "quest": instance,
                "message": msg,
            })

            email = EmailMultiAlternatives(
                subject="New Quest Created",
                body=msg,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email.attach_alternative(html, "text/html")
            email.send()


@receiver(post_save, sender=UserProfile)
def notify_level_up(sender, instance, **kwargs):
    try:
        previous = UserProfile.objects.get(pk=instance.pk)
    except UserProfile.DoesNotExist:
        return

    old_level = (previous.xp or 0) // 100 + 1
    new_level = (instance.xp or 0) // 100 + 1

    if new_level > old_level:
        user = instance.user
        msg = f"🎉 Congrats! You've leveled up to level {new_level}!"
        Notification.objects.create(user=user, message=msg, link="/profile/")

        html = render_to_string("emails/level_up.html", {
            "user": user,
            "new_level": new_level,
            "message": msg,
        })

        email = EmailMultiAlternatives(
            subject="Level Up!",
            body=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        email.attach_alternative(html, "text/html")
        email.send()



@receiver(post_save, sender=InternalReport)
def notify_admin_new_report(sender, instance, created, **kwargs):
    if not created:
        return

    subject = f"📩 New Internal Report: {instance.title}"
    context = {
        "report": instance,
        "sender": instance.sender.username,
        "title": instance.title,
        "message": instance.message,
        "category": instance.report_type.capitalize(),
    }

    html_content = render_to_string("emails/new_report.html", context)

    admins = User.objects.filter(userprofile__role='admin')

    for admin in admins:
        email = EmailMultiAlternatives(
            subject=subject,
            body=instance.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[admin.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()