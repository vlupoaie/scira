from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'(?P<journal_id>.+)', views.publications_by_journal, name='publications_by_journal'),
]
