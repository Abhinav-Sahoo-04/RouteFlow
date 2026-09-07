from rest_framework import serializers
from .models import Student,Management,Bus,Route

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model=Student
        fields="__all__"

class ManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model=Management
        fields="__all__"

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = "__all__"


class BusSerializer(serializers.ModelSerializer):
    route = RouteSerializer(many=True, read_only=True)
    class Meta:
        model = Bus
        fields = "__all__"