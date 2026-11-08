from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("login",views.LoginViewset,basename="login")
router.register("manage",views.LoginManageViewset,basename="management")
router.register("register",views.RegisterViewset,basename="register")
router.register("managementRegister",views.ManagementRegisterViewset,basename="Managementregister")
router.register("route",views.RoutesViewset,basename="route")
router.register("buses",views.BusesViewset,basename="buses")
urlpatterns = [
   path('v1/',include(router.urls))
]
