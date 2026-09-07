from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Student,Management,Bus
from .serializers import StudentSerializer,ManagementSerializer,BusSerializer
from datetime import datetime
import hashlib

def generate_unique_id(text):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")

    value = text + timestamp

    unique_id = hashlib.sha256(value.encode()).hexdigest()[:12]

    return unique_id.upper()
     

class LoginViewset(viewsets.ViewSet):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        student = get_object_or_404(Student, username=username)

        if student.password == password:
            return Response({
                "success": True,
                "message": "Login Successful"
            })

        return Response({
            "success": False,
            "message": "Invalid Password"
        }, status=401)
    
    def list(self,request):
        queryset=Student.objects.all()
        serializer=StudentSerializer(queryset,many=True)
        return Response(serializer.data)
    def retrieve(self,request,pk=None):
        student=get_object_or_404(Student,username=pk)
        return Response({
            "username": student.username,
            "password": student.password
        })
    

class LoginManageViewset(viewsets.ViewSet):
    def post(self, request):
        mid=request.data.get("mid")
        username = request.data.get("username")
        password = request.data.get("password")
    
        management = get_object_or_404(Management, mid=mid)
    
        if management.password == password:
            return Response({
                "success": True,
                "message": "Login Successful"
            })
    
        return Response({
            "success": False,
            "message": "Invalid Password"
        }, status=401)
        
    def list(self,request):
        queryset=Management.objects.all()
        serializer=ManagementSerializer(queryset,many=True)
        return Response(serializer.data)
    def retrieve(self,request,pk=None):
        management=get_object_or_404(Management,username=pk)
        return Response({
            "username": management.username,
            "password": management.password
        })



class  RegisterViewset(viewsets.ViewSet):
    def post(self, request):
        name=request.data.get("name")
        branch = request.data.get("branch")
        rollNo = request.data.get("rollNo")
        email = request.data.get("email")
        sem = request.data.get("semester")
        username=name+rollNo[-2:]
        password=rollNo+name[0]
        student=Student.objects.create(name=name,branch=branch,rollNo=rollNo,email=email,semester=sem,username=username,password=password)
        student.save()
        
        return Response({
            "success": True,
            "message": "Pending"
        })
    def list(self,request):
            queryset=Student.objects.all()
            serializer=StudentSerializer(queryset,many=True)
            return Response(serializer.data)


class ManagementRegisterViewset(viewsets.ViewSet):
    def list(self,request):
                queryset=Management.objects.all()
                serializer=ManagementSerializer(queryset,many=True)
                return Response(serializer.data)
    def post(self, request):
            username=request.data.get("username")
            password=request.data.get("password")
            email=request.data.get("email")
            mid=generate_unique_id(username)
            print(username,mid,password,email) 
            management_count=Management.objects.all().count()
            management=Management.objects.create(mid=mid,username=username,password=password)
            if management_count==0:
                 management.is_admin=True
                 management.is_active=True
            management.save()      
            return Response({
                "success": True,
                "message": "Pending"
            })

class RoutesViewset(viewsets.ViewSet):
     def list(self,request):
        queryset=Bus.objects.all()
        serializer=BusSerializer(queryset,many=True)
        return Response(serializer.data)