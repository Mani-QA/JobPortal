-- Update job slugs to use full role names instead of abbreviations

-- Business Analyst
UPDATE jobs SET id = 'job-zod-business-analyst-001' WHERE id = 'job-zod-ba-001';

-- Product Owner
UPDATE jobs SET id = 'job-zod-product-owner-001' WHERE id = 'job-zod-po-001';

-- Engineering Manager
UPDATE jobs SET id = 'job-zod-engineering-manager-001' WHERE id = 'job-zod-em-001';

-- UX/UI Designer
UPDATE jobs SET id = 'job-zod-ux-ui-designer-001' WHERE id = 'job-zod-uxui-001';

-- Scrum Master (keeping agile prefix)
UPDATE jobs SET id = 'job-zod-agile-scrum-master-001' WHERE id = 'job-zod-scrum-001';

-- QA Automation Engineer
UPDATE jobs SET id = 'job-zod-qa-automation-engineer-001' WHERE id = 'job-zod-qa-001';

-- L1 Support Engineer
UPDATE jobs SET id = 'job-zod-l1-support-engineer-001' WHERE id = 'job-zod-l1support-001';

-- Frontend Developer - already descriptive, but let's standardize
UPDATE jobs SET id = 'job-zod-frontend-developer-001' WHERE id = 'job-zod-frontend-001';

-- Backend Developer - already descriptive, but let's standardize  
UPDATE jobs SET id = 'job-zod-backend-developer-001' WHERE id = 'job-zod-backend-001';

-- Fullstack Developer - already descriptive, but let's standardize
UPDATE jobs SET id = 'job-zod-fullstack-developer-001' WHERE id = 'job-zod-fullstack-001';

