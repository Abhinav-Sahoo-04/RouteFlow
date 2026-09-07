from django.contrib import admin
from .models  import Student,Management,Driver,Bus,Route
# Register your models here.
class StudentAdmin(admin.ModelAdmin):
    list_display=('name','username','rollNo','branch',"semester",'email',"is_active")
    list_editable=("is_active",)
    search_fields=('rollNo','name','email','branch','semester')
admin.site.register(Student,StudentAdmin)
admin.site.register(Management)
admin.site.register(Driver)
admin.site.register(Bus)
admin.site.register(Route)
