import random
from locust import HttpUser, task, between

TOTAL_URLS = 500

class RedirectUser(HttpUser):
    wait_time = between(0.1, 0.3)

    @task
    def redirect(self):
        code = f"load{random.randrange(TOTAL_URLS)}"

        with self.client.get(
            f"/{code}",
            allow_redirects=False,
            name="/redirect",
            catch_response=True,
        ) as response:
            if response.status_code in (301, 302, 307, 308):
                response.success()
            else:
                response.failure(
                    f"Expected redirect, received {response.status_code}"
                )