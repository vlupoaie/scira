from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'(?P<author_id>.+)', views.publications_by_author, name='publications_by_author'),
]
