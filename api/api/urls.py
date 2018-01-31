"""api URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url, include

urlpatterns = [
    url(r'^api/publications/', include('publications.urls', namespace='publications')),
    url(r'^api/journals/', include('journals.urls', namespace='journals')),
    url(r'^api/authors/', include('authors.urls', namespace='authors')),
    url(r'^api/search/', include('search.urls', namespace='search')),
]
