from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'(?P<publication_id>.+)', views.publication_by_id, name='publication_by_id'),
]
