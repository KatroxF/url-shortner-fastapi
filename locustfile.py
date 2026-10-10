import random
from locust import HttpUser, task, between

TOTAL = 500_000


class RedirectUser(HttpUser):
    wait_time = between(0.1, 0.3)

    @task
    def redirect(self):
        code = f"load{random.randint(0, TOTAL - 1)}"
        self.client.get(f"/{code}", allow_redirects=False, name="/redirect")