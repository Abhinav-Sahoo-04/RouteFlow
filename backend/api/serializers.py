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
    is_stop = serializers.ReadOnlyField()
    class Meta:
        model = Route
        fields = [
            "id",
            "name",
            "latitude",
            "longitude",
            "order",
            "is_stop",
        ]



class BusSerializer(serializers.ModelSerializer):
    route = RouteSerializer(many=True, read_only=True)
    class Meta:
        model = Bus
        fields = "__all__"

class BusesSerializer(serializers.ModelSerializer):
    class Meta:
        model=Bus
        fields="__all__"
