-- Insert sample seeker users
INSERT INTO users (id, email, password_hash, role, is_active, email_verified, gdpr_consent)
VALUES 
  ('seeker-001', 'ravi.kumar@example.com', '$2a$10$dummy-hash', 'seeker', 1, 1, 1),
  ('seeker-002', 'priya.sharma@example.com', '$2a$10$dummy-hash', 'seeker', 1, 1, 1),
  ('seeker-003', 'amit.patel@example.com', '$2a$10$dummy-hash', 'seeker', 1, 1, 1),
  ('seeker-004', 'sneha.reddy@example.com', '$2a$10$dummy-hash', 'seeker', 1, 1, 1),
  ('seeker-005', 'vikram.singh@example.com', '$2a$10$dummy-hash', 'seeker', 1, 1, 1),
  ('seeker-006', 'ananya.iyer@example.com', '$2a$10$dummy-hash', 'seeker', 1, 1, 1);

-- Insert sample seeker profiles
INSERT INTO seeker_profiles (id, user_id, full_name, headline, bio, phone, location, work_history, education, skills, preferences, profile_complete)
VALUES 
  (
    'profile-001',
    'seeker-001',
    'Ravi Kumar',
    'Senior React Developer | 6+ Years Experience',
    'Passionate frontend developer with expertise in building scalable web applications. I love creating intuitive user experiences and mentoring junior developers. Currently looking for exciting opportunities in product-based companies.',
    '+91 9876543210',
    'Bangalore, Karnataka',
    '[{"company":"TechCorp India","title":"Senior Frontend Developer","location":"Bangalore","startDate":"2021-03-01","current":true,"description":"Leading a team of 5 developers building enterprise SaaS applications using React and TypeScript."},{"company":"StartupXYZ","title":"Frontend Developer","location":"Bangalore","startDate":"2018-06-01","endDate":"2021-02-28","description":"Built responsive web applications and implemented design systems."}]',
    '[{"institution":"IIT Madras","degree":"B.Tech","field":"Computer Science","startDate":"2014-07-01","endDate":"2018-05-01"}]',
    '["React.js","TypeScript","JavaScript","Redux","GraphQL","Node.js","Tailwind CSS","Jest","Git","AWS"]',
    '{"desiredRoles":["Senior Frontend Developer","Tech Lead","Principal Engineer"],"desiredLocations":["Bangalore","Remote"],"locationType":["hybrid","remote"],"jobTypes":["full-time"],"willingToRelocate":false}',
    1
  ),
  (
    'profile-002',
    'seeker-002',
    'Priya Sharma',
    'Full Stack Developer | MERN Stack Expert',
    'Full stack developer with 4 years of experience in building end-to-end web applications. Proficient in both frontend and backend technologies with a keen interest in system design and architecture.',
    '+91 9876543211',
    'Chennai, Tamil Nadu',
    '[{"company":"Infosys","title":"Senior Software Engineer","location":"Chennai","startDate":"2022-01-01","current":true,"description":"Developing full-stack applications using MERN stack for global clients."},{"company":"Cognizant","title":"Software Engineer","location":"Chennai","startDate":"2020-07-01","endDate":"2021-12-31","description":"Worked on enterprise applications using React and Node.js."}]',
    '[{"institution":"Anna University","degree":"B.E.","field":"Information Technology","startDate":"2016-07-01","endDate":"2020-05-01"}]',
    '["React.js","Node.js","MongoDB","Express.js","TypeScript","PostgreSQL","Docker","Redis","Microservices","AWS"]',
    '{"desiredRoles":["Full Stack Developer","Backend Developer","Software Architect"],"desiredLocations":["Chennai","Bangalore","Remote"],"locationType":["onsite","hybrid"],"jobTypes":["full-time"],"willingToRelocate":true}',
    1
  ),
  (
    'profile-003',
    'seeker-003',
    'Amit Patel',
    '.NET Developer | Azure Certified | 7 Years Experience',
    'Experienced .NET developer specializing in enterprise software development. Azure certified professional with expertise in building scalable microservices and cloud-native applications.',
    '+91 9876543212',
    'Hyderabad, Telangana',
    '[{"company":"Microsoft India","title":"Senior Software Engineer","location":"Hyderabad","startDate":"2020-04-01","current":true,"description":"Building Azure services and developer tools using .NET Core."},{"company":"Wipro","title":"Software Engineer","location":"Hyderabad","startDate":"2017-06-01","endDate":"2020-03-31","description":"Developed enterprise applications for banking clients."}]',
    '[{"institution":"BITS Pilani","degree":"M.Tech","field":"Software Engineering","startDate":"2015-07-01","endDate":"2017-05-01"},{"institution":"VIT Vellore","degree":"B.Tech","field":"Computer Science","startDate":"2011-07-01","endDate":"2015-05-01"}]',
    '[".NET Core","C#","Azure","SQL Server","Entity Framework","Microservices","Docker","Kubernetes","REST APIs","CI/CD"]',
    '{"desiredRoles":["Senior .NET Developer","Solution Architect","Engineering Manager"],"desiredLocations":["Hyderabad","Bangalore","Remote"],"locationType":["hybrid","remote"],"jobTypes":["full-time"],"willingToRelocate":false}',
    1
  ),
  (
    'profile-004',
    'seeker-004',
    'Sneha Reddy',
    'Product Manager | Ex-Amazon | B2B SaaS Expert',
    'Product Manager with 5+ years of experience in building B2B SaaS products. Previously worked at Amazon Web Services. Passionate about customer-centric product development and data-driven decision making.',
    '+91 9876543213',
    'Bangalore, Karnataka',
    '[{"company":"Freshworks","title":"Senior Product Manager","location":"Bangalore","startDate":"2022-06-01","current":true,"description":"Leading product strategy for customer success platform."},{"company":"Amazon Web Services","title":"Product Manager","location":"Bangalore","startDate":"2019-08-01","endDate":"2022-05-31","description":"Managed AWS Lambda serverless computing product."}]',
    '[{"institution":"IIM Bangalore","degree":"MBA","field":"Product Management","startDate":"2017-07-01","endDate":"2019-05-01"},{"institution":"NIT Trichy","degree":"B.Tech","field":"Electronics","startDate":"2012-07-01","endDate":"2016-05-01"}]',
    '["Product Strategy","Roadmap Planning","Agile","Scrum","Data Analytics","SQL","A/B Testing","User Research","Stakeholder Management","PRDs"]',
    '{"desiredRoles":["Senior Product Manager","Director of Product","Head of Product"],"desiredLocations":["Bangalore","Remote"],"locationType":["hybrid","remote"],"jobTypes":["full-time"],"willingToRelocate":false}',
    1
  ),
  (
    'profile-005',
    'seeker-005',
    'Vikram Singh',
    'DevOps Engineer | AWS & Kubernetes Expert | SRE',
    'DevOps engineer with 5 years of experience in building and managing cloud infrastructure. Expert in containerization, CI/CD pipelines, and site reliability engineering.',
    '+91 9876543214',
    'Pune, Maharashtra',
    '[{"company":"Atlassian","title":"Senior DevOps Engineer","location":"Pune","startDate":"2021-09-01","current":true,"description":"Managing Kubernetes clusters and CI/CD infrastructure for Jira Cloud."},{"company":"ThoughtWorks","title":"DevOps Consultant","location":"Pune","startDate":"2019-04-01","endDate":"2021-08-31","description":"Helped enterprises adopt DevOps practices and cloud-native architecture."}]',
    '[{"institution":"Pune University","degree":"M.Sc","field":"Computer Science","startDate":"2017-07-01","endDate":"2019-05-01"}]',
    '["AWS","Kubernetes","Docker","Terraform","Jenkins","GitHub Actions","Python","Linux","Prometheus","Grafana","ArgoCD","Helm"]',
    '{"desiredRoles":["Senior DevOps Engineer","SRE","Platform Engineer"],"desiredLocations":["Pune","Bangalore","Remote"],"locationType":["remote","hybrid"],"jobTypes":["full-time"],"willingToRelocate":true}',
    1
  ),
  (
    'profile-006',
    'seeker-006',
    'Ananya Iyer',
    'UX/UI Designer | Design Systems | 4 Years Experience',
    'Creative UX/UI designer with a passion for creating beautiful and functional digital experiences. Experienced in building design systems and leading design projects from research to implementation.',
    '+91 9876543215',
    'Mumbai, Maharashtra',
    '[{"company":"Swiggy","title":"Senior Product Designer","location":"Bangalore","startDate":"2022-03-01","current":true,"description":"Leading design for Swiggy Instamart. Building and maintaining design system."},{"company":"Ola","title":"Product Designer","location":"Bangalore","startDate":"2020-06-01","endDate":"2022-02-28","description":"Designed rider and driver experiences for Ola Electric."}]',
    '[{"institution":"NID Ahmedabad","degree":"M.Des","field":"Interaction Design","startDate":"2018-07-01","endDate":"2020-05-01"},{"institution":"St. Xaviers College","degree":"B.A.","field":"Fine Arts","startDate":"2014-07-01","endDate":"2018-05-01"}]',
    '["Figma","Sketch","User Research","Prototyping","Design Systems","Usability Testing","Information Architecture","Wireframing","Adobe XD","Framer"]',
    '{"desiredRoles":["Senior UX Designer","Design Lead","Head of Design"],"desiredLocations":["Mumbai","Bangalore","Remote"],"locationType":["hybrid","remote"],"jobTypes":["full-time"],"willingToRelocate":true}',
    1
  );

