-- Add QA Automation Engineer job for Zod Technologies

INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-qa-001',
    'profile-zod-tech-001',
    'QA Automation Engineer',
    'We are looking for a skilled QA Automation Engineer to join our quality engineering team in Chennai. You will be responsible for designing and implementing automated testing frameworks using Playwright and Cucumber, ensuring our products meet the highest quality standards. This role involves close collaboration with developers, DevOps, and product teams to integrate testing into our CI/CD pipelines.',
    'hybrid',
    'Chennai, Tamil Nadu',
    '{"min": 900000, "max": 1800000, "currency": "INR", "period": "yearly"}',
    '["Design and develop automated test frameworks using Playwright and TypeScript", "Write BDD test scenarios using Cucumber/Gherkin syntax", "Integrate automated tests into CI/CD pipelines (GitHub Actions, Azure DevOps, Jenkins)", "Perform API testing using tools like Postman, REST Assured, or Playwright API testing", "Collaborate with developers to implement shift-left testing practices", "Analyze test results, identify flaky tests, and improve test reliability", "Create and maintain test documentation and coverage reports", "Participate in sprint planning and provide testing estimates", "Mentor junior QA engineers on automation best practices"]',
    '["3+ years of experience in QA automation engineering", "Strong proficiency in Playwright with TypeScript or JavaScript", "Experience with BDD frameworks like Cucumber, SpecFlow, or Behave", "Hands-on experience with CI/CD tools (GitHub Actions, Jenkins, Azure DevOps)", "Solid understanding of software testing methodologies and test design techniques", "Experience with API testing and REST services", "Knowledge of Git and version control workflows", "Strong analytical and debugging skills", "Excellent communication and collaboration abilities"]',
    '["Experience with performance testing tools (k6, JMeter, Gatling)", "Knowledge of Docker and containerized test environments", "Experience with visual regression testing (Percy, Applitools)", "ISTQB or similar QA certification", "Experience with mobile testing (Appium, Detox)", "Knowledge of security testing basics", "Experience with test management tools (TestRail, Zephyr)"]',
    '["Playwright", "Cucumber", "TypeScript", "JavaScript", "CI/CD", "GitHub Actions", "Jenkins", "API Testing", "BDD", "Test Automation", "Git", "Postman", "Azure DevOps"]',
    'mid',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

SELECT title, location FROM jobs WHERE id = 'job-zod-qa-001';

