from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'simple/?$', views.simple_search, name='simple_search'),
    url(r'advanced/?$', views.advanced_search, name='advanced_search'),
]
