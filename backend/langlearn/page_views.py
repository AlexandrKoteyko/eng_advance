from django.shortcuts import render
from django.views import View


class HomeView(View):
    def get(self, request):
        return render(request, 'home.html')


class LoginPageView(View):
    def get(self, request):
        return render(request, 'login.html')


class RegisterPageView(View):
    def get(self, request):
        return render(request, 'register.html')


class AccountPageView(View):
    def get(self, request):
        return render(request, 'account.html')