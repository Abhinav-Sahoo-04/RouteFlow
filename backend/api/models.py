from django.db import models


SEM = (
    (1, "1st SEM"),
    (2, "2nd SEM"),
    (3, "3rd SEM"),
    (4, "4th SEM"),
    (5, "5th SEM"),
    (6, "6th SEM"),
    (7, "7th SEM"),
    (8, "8th SEM"),
)


class Route(models.Model):
    name = models.CharField(max_length=100)
    latitude = models.CharField(max_length=100)
    longitude = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Bus(models.Model):
    busNo = models.CharField(max_length=10, unique=True)
    RegcNo = models.CharField(max_length=20, unique=True)

    route = models.ManyToManyField(
        Route,
       
        blank=True,
        null=True
    )

    def __str__(self):
        return self.busNo


class Student(models.Model):
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    branch = models.CharField(max_length=50)
    semester = models.IntegerField(
        choices=SEM,
        default=1
    )
    rollNo = models.CharField(max_length=30, unique=True)
    email = models.EmailField(max_length=50)

    busNo = models.ForeignKey(
        Bus,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.username


class Management(models.Model):
    mid = models.CharField(max_length=20, unique=True)
    is_active=models.BooleanField(default=False)
    is_admin=models.BooleanField(default=False)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.username


class Driver(models.Model):
    mid = models.ForeignKey(
        Management,
        on_delete=models.CASCADE
    )

    busNo = models.OneToOneField(
        Bus,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    name = models.CharField(max_length=100)
    phoneNo = models.CharField(max_length=20)
    licenseNo = models.CharField(max_length=20, unique=True)
    curLoc = models.CharField(max_length=100)

    def __str__(self):
        return self.name