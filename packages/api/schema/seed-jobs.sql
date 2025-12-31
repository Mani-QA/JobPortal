-- Seed data for Zod Technologies jobs
-- Run with: npx wrangler d1 execute job-portal-db --file=./schema/seed-jobs.sql

-- Create employer user for Zod Technologies
INSERT OR IGNORE INTO users (id, email, password_hash, role, is_active, email_verified, gdpr_consent)
VALUES (
    'emp-zod-tech-001',
    'hr@zodtechnologies.com',
    '$2a$10$dummy.hash.for.seeding.purposes.only',
    'employer',
    1,
    1,
    1
);

-- Create employer profile for Zod Technologies
INSERT OR IGNORE INTO employer_profiles (
    id, user_id, company_name, description, logo_url, industry, company_size, founded_year, contact_details, verified
) VALUES (
    'profile-zod-tech-001',
    'emp-zod-tech-001',
    'Zod Technologies',
    'Zod Technologies is a leading software product company specializing in enterprise solutions, cloud-native applications, and digital transformation services. We are passionate about building innovative products that solve real-world problems. Our team of 500+ engineers works on cutting-edge technologies across our offices in Bangalore and Chennai. We believe in fostering a culture of continuous learning, collaboration, and work-life balance.',
    NULL,
    'Technology',
    '201-500',
    2015,
    '{"email": "careers@zodtechnologies.com", "phone": "+91-80-4567-8900", "website": "https://zodtechnologies.com", "linkedin": "https://linkedin.com/company/zodtechnologies"}',
    1
);

-- Job 1: Frontend Developer (React.js) - Bangalore
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-frontend-001',
    'profile-zod-tech-001',
    'Frontend Developer (React.js)',
    'We are looking for a passionate Frontend Developer to join our product engineering team in Bangalore. You will be responsible for building responsive, performant web applications using React.js and modern frontend technologies. You will work closely with UX designers and backend engineers to deliver exceptional user experiences for our enterprise clients.',
    'hybrid',
    'Bangalore, Karnataka',
    '{"min": 800000, "max": 1800000, "currency": "INR", "period": "yearly"}',
    '["Develop and maintain responsive web applications using React.js, TypeScript, and modern CSS", "Collaborate with UX/UI designers to implement pixel-perfect designs", "Write clean, maintainable, and well-tested code with unit and integration tests", "Optimize applications for maximum speed and scalability", "Participate in code reviews and contribute to team best practices", "Work in an Agile environment with 2-week sprints", "Mentor junior developers and contribute to technical documentation"]',
    '["3+ years of professional experience in frontend development", "Strong proficiency in React.js, including hooks, context, and state management (Redux/Zustand)", "Excellent understanding of TypeScript and JavaScript ES6+", "Experience with CSS-in-JS solutions (Styled Components, Emotion) or Tailwind CSS", "Familiarity with RESTful APIs and GraphQL", "Understanding of web performance optimization techniques", "Experience with Git and collaborative development workflows", "Strong problem-solving skills and attention to detail"]',
    '["Experience with Next.js or other React frameworks", "Knowledge of testing frameworks like Jest, React Testing Library, or Cypress", "Familiarity with CI/CD pipelines", "Experience with design systems and component libraries", "Understanding of accessibility standards (WCAG)", "Contributions to open-source projects"]',
    '["React.js", "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "Redux", "REST APIs", "GraphQL", "Git", "Jest", "Webpack", "Vite"]',
    'mid',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 2: Backend Developer (.NET) - Chennai
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-backend-001',
    'profile-zod-tech-001',
    'Backend Developer (.NET)',
    'Join our backend engineering team in Chennai to build robust, scalable APIs and microservices using .NET Core. You will be working on our enterprise SaaS platform, handling high-volume transactions and complex business logic. This role offers the opportunity to work with modern cloud technologies on Azure.',
    'hybrid',
    'Chennai, Tamil Nadu',
    '{"min": 1000000, "max": 2200000, "currency": "INR", "period": "yearly"}',
    '["Design and develop RESTful APIs and microservices using .NET Core and C#", "Build and maintain SQL Server and PostgreSQL databases with Entity Framework Core", "Implement secure authentication and authorization using OAuth 2.0 and JWT", "Deploy and manage applications on Azure (App Services, Functions, AKS)", "Write comprehensive unit tests and integration tests", "Collaborate with frontend teams to define API contracts", "Participate in system design and architecture discussions", "Monitor application performance and troubleshoot production issues"]',
    '["4+ years of experience in backend development with .NET Core and C#", "Strong understanding of RESTful API design principles and best practices", "Experience with SQL Server or PostgreSQL and Entity Framework Core", "Knowledge of microservices architecture and design patterns", "Experience with Azure services (App Services, Azure Functions, Service Bus)", "Understanding of CI/CD practices with Azure DevOps or GitHub Actions", "Strong debugging and problem-solving skills", "Excellent communication and teamwork abilities"]',
    '["Experience with Docker and Kubernetes", "Knowledge of message queues (RabbitMQ, Azure Service Bus)", "Experience with Redis or other caching solutions", "Familiarity with event-driven architecture", "Understanding of Domain-Driven Design (DDD)", "Experience with gRPC or GraphQL", "Azure certifications"]',
    '[".NET Core", "C#", "ASP.NET Web API", "Entity Framework Core", "SQL Server", "PostgreSQL", "Azure", "Docker", "Kubernetes", "REST APIs", "Microservices", "Git", "Azure DevOps"]',
    'mid',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 3: Fullstack Developer - Bangalore
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-fullstack-001',
    'profile-zod-tech-001',
    'Fullstack Developer',
    'We are seeking a versatile Fullstack Developer to join our innovation lab in Bangalore. You will be responsible for end-to-end feature development, from database design to user interface implementation. This role is perfect for engineers who enjoy working across the entire technology stack and want to see their work impact users directly.',
    'onsite',
    'Bangalore, Karnataka',
    '{"min": 1200000, "max": 2500000, "currency": "INR", "period": "yearly"}',
    '["Develop full-stack features using React.js frontend and Node.js/Python backend", "Design and implement database schemas and optimize queries", "Build and consume RESTful APIs and GraphQL endpoints", "Collaborate with product managers to translate requirements into technical solutions", "Implement automated testing strategies across the stack", "Deploy applications to cloud platforms (AWS/GCP/Azure)", "Participate in on-call rotations and production support", "Contribute to technical architecture decisions"]',
    '["5+ years of professional software development experience", "Strong proficiency in React.js or Vue.js for frontend development", "Experience with Node.js (Express/Fastify) or Python (Django/FastAPI) for backend", "Solid understanding of relational databases (PostgreSQL, MySQL) and NoSQL (MongoDB)", "Experience with cloud platforms (AWS, GCP, or Azure)", "Knowledge of containerization with Docker", "Understanding of software architecture patterns and best practices", "Strong communication skills and ability to work in cross-functional teams"]',
    '["Experience with TypeScript on both frontend and backend", "Knowledge of Kubernetes and container orchestration", "Experience with event-driven architecture and message queues", "Familiarity with infrastructure as code (Terraform, Pulumi)", "Understanding of security best practices (OWASP)", "Experience leading technical initiatives or mentoring developers"]',
    '["React.js", "Node.js", "Python", "TypeScript", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "REST APIs", "GraphQL", "Git", "CI/CD"]',
    'senior',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 4: Agile Scrum Master - Chennai
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-scrum-001',
    'profile-zod-tech-001',
    'Agile Scrum Master',
    'We are looking for an experienced Scrum Master to guide our engineering teams in Chennai through agile practices. You will be responsible for facilitating scrum ceremonies, removing impediments, and fostering a culture of continuous improvement. The ideal candidate is passionate about agile methodologies and has a proven track record of improving team velocity and delivery predictability.',
    'hybrid',
    'Chennai, Tamil Nadu',
    '{"min": 1400000, "max": 2400000, "currency": "INR", "period": "yearly"}',
    '["Facilitate daily standups, sprint planning, retrospectives, and sprint reviews for 2-3 scrum teams", "Coach team members on agile principles, Scrum framework, and best practices", "Identify and remove impediments that block team progress", "Track and communicate team metrics (velocity, burndown, cycle time)", "Collaborate with Product Owners to ensure backlog refinement and prioritization", "Foster a culture of continuous improvement and experimentation", "Coordinate with other Scrum Masters for cross-team dependencies", "Mentor team members on self-organization and accountability"]',
    '["4+ years of experience as a Scrum Master or Agile Coach", "Certified Scrum Master (CSM) or Professional Scrum Master (PSM I/II)", "Deep understanding of Scrum, Kanban, and Scaled Agile frameworks (SAFe, LeSS)", "Experience working with software development teams", "Strong facilitation and conflict resolution skills", "Excellent communication and interpersonal abilities", "Experience with agile project management tools (Jira, Azure DevOps, Linear)", "Ability to coach at individual, team, and organizational levels"]',
    '["Experience with SAFe or LeSS at scale", "Technical background in software development", "Advanced certifications (PSM II, PSM III, SAFe SPC)", "Experience with DevOps and CI/CD practices", "Knowledge of lean principles and systems thinking", "Experience in distributed team environments"]',
    '["Scrum", "Kanban", "SAFe", "Jira", "Agile Coaching", "Facilitation", "Conflict Resolution", "Team Building", "Continuous Improvement", "Stakeholder Management"]',
    'senior',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 5: Business Analyst - Bangalore
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-ba-001',
    'profile-zod-tech-001',
    'Business Analyst',
    'Join our product team in Bangalore as a Business Analyst where you will bridge the gap between business needs and technical solutions. You will work closely with stakeholders to gather requirements, analyze processes, and define solutions that drive business value. This role is critical in ensuring our products meet customer needs and market demands.',
    'hybrid',
    'Bangalore, Karnataka',
    '{"min": 900000, "max": 1800000, "currency": "INR", "period": "yearly"}',
    '["Gather and document business requirements through stakeholder interviews and workshops", "Analyze current business processes and identify opportunities for improvement", "Create detailed functional specifications, user stories, and acceptance criteria", "Develop process flow diagrams, wireframes, and data models", "Collaborate with development teams during sprint planning and execution", "Conduct UAT coordination and support production deployments", "Present findings and recommendations to leadership teams", "Maintain requirements traceability and project documentation"]',
    '["3+ years of experience as a Business Analyst in IT/software projects", "Strong analytical and problem-solving skills", "Experience with requirements gathering techniques and documentation", "Proficiency in creating process flows, wireframes, and user stories", "Familiarity with Agile/Scrum methodologies", "Excellent written and verbal communication skills", "Experience with tools like Jira, Confluence, and diagramming tools (Lucidchart, Miro)", "Strong stakeholder management abilities"]',
    '["CBAP or CCBA certification", "Experience in SaaS or enterprise software products", "SQL knowledge for data analysis", "Experience with BI tools (Power BI, Tableau)", "Domain knowledge in finance, HR, or supply chain", "Experience with API documentation and integration projects"]',
    '["Requirements Analysis", "Business Process Modeling", "User Stories", "Stakeholder Management", "Jira", "Confluence", "SQL", "Wireframing", "Data Analysis", "Agile", "Documentation"]',
    'mid',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 6: Product Owner - Chennai
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-po-001',
    'profile-zod-tech-001',
    'Product Owner',
    'We are looking for a strategic Product Owner to join our Chennai office. You will own the product vision and roadmap for one of our key enterprise products. This role requires a blend of business acumen, customer empathy, and technical understanding to prioritize features that maximize value for our customers and the business.',
    'hybrid',
    'Chennai, Tamil Nadu',
    '{"min": 1800000, "max": 3200000, "currency": "INR", "period": "yearly"}',
    '["Define and communicate the product vision, strategy, and roadmap", "Manage and prioritize the product backlog based on customer value and business impact", "Write clear user stories with detailed acceptance criteria", "Collaborate with engineering teams during sprint planning and execution", "Conduct market research and competitive analysis", "Gather customer feedback through interviews, surveys, and data analysis", "Work with sales and marketing on go-to-market strategies", "Define success metrics and track product KPIs", "Make data-driven decisions on feature prioritization and trade-offs"]',
    '["5+ years of experience in product management or product ownership", "Strong understanding of Agile/Scrum methodologies", "Experience with B2B SaaS or enterprise software products", "Excellent stakeholder management and communication skills", "Data-driven mindset with experience in product analytics", "Ability to translate complex business requirements into clear user stories", "Strong understanding of UX principles and customer-centric design", "Experience with product management tools (Jira, Productboard, Aha!)"]',
    '["CSPO or PSPO certification", "Technical background or CS degree", "Experience with product-led growth strategies", "Domain expertise in enterprise software", "Experience with pricing and packaging strategies", "International product launch experience"]',
    '["Product Strategy", "Roadmap Planning", "Backlog Management", "User Stories", "Stakeholder Management", "Market Research", "Data Analysis", "Agile", "Jira", "Product Analytics", "Customer Research"]',
    'senior',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 7: Engineering Manager - Bangalore
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-em-001',
    'profile-zod-tech-001',
    'Engineering Manager',
    'We are seeking an experienced Engineering Manager to lead one of our product engineering teams in Bangalore. You will be responsible for building and mentoring a high-performing team of 8-12 engineers while ensuring technical excellence and on-time delivery. This role combines people management with technical leadership and strategic thinking.',
    'hybrid',
    'Bangalore, Karnataka',
    '{"min": 3000000, "max": 5000000, "currency": "INR", "period": "yearly"}',
    '["Lead, mentor, and grow a team of 8-12 software engineers", "Drive hiring, performance reviews, and career development for team members", "Collaborate with Product and Design to define technical roadmaps", "Ensure engineering best practices, code quality, and technical debt management", "Remove blockers and create an environment where engineers can do their best work", "Participate in architectural decisions and technical strategy", "Manage project timelines, resources, and delivery commitments", "Foster a culture of innovation, learning, and psychological safety", "Represent the team in cross-functional leadership meetings"]',
    '["8+ years of software engineering experience with 3+ years in engineering management", "Strong technical background with hands-on experience in modern web technologies", "Proven track record of building and scaling engineering teams", "Experience with Agile methodologies and delivery management", "Excellent communication and interpersonal skills", "Ability to balance technical leadership with people management", "Experience with performance management and career development", "Strong problem-solving and decision-making abilities"]',
    '["Experience managing distributed teams", "Background in system design and architecture", "Experience with cloud platforms (AWS, Azure, GCP)", "Track record of improving engineering processes and productivity", "Experience with organizational design and team topology", "MBA or management training"]',
    '["People Management", "Technical Leadership", "Agile", "Hiring", "Performance Management", "System Design", "Project Management", "Cross-functional Collaboration", "Strategic Planning", "Team Building"]',
    'lead',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 8: UX/UI Designer - Chennai
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-uxui-001',
    'profile-zod-tech-001',
    'UX/UI Designer',
    'Join our design team in Chennai to create intuitive, beautiful user experiences for our enterprise products. You will be involved in the entire design process from user research to high-fidelity prototypes. We are looking for a designer who is passionate about solving complex problems and advocating for users in a B2B context.',
    'hybrid',
    'Chennai, Tamil Nadu',
    '{"min": 800000, "max": 1600000, "currency": "INR", "period": "yearly"}',
    '["Conduct user research including interviews, surveys, and usability testing", "Create user personas, journey maps, and information architecture", "Design wireframes, prototypes, and high-fidelity mockups using Figma", "Develop and maintain a consistent design system and component library", "Collaborate closely with product managers and engineers", "Present designs to stakeholders and incorporate feedback", "Ensure designs meet accessibility standards (WCAG 2.1)", "Stay updated on design trends and best practices", "Advocate for user-centered design throughout the organization"]',
    '["3+ years of experience in UX/UI design for web applications", "Strong portfolio demonstrating end-to-end design process", "Proficiency in Figma and prototyping tools", "Experience with user research methodologies", "Understanding of design systems and component-based design", "Knowledge of accessibility standards and inclusive design", "Excellent visual design skills with attention to typography, color, and layout", "Strong communication and presentation skills", "Ability to work in an Agile environment"]',
    '["Experience with B2B or enterprise software design", "Knowledge of HTML, CSS, and frontend development basics", "Experience with motion design and micro-interactions", "Familiarity with analytics tools for measuring design impact", "Illustration or iconography skills", "Experience with design ops and workflow optimization"]',
    '["Figma", "User Research", "Wireframing", "Prototyping", "Design Systems", "Information Architecture", "Usability Testing", "Visual Design", "Accessibility", "Interaction Design"]',
    'mid',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Job 9: L1 Support Engineer - Bangalore
INSERT INTO jobs (
    id, employer_id, title, description, location_type, location, salary_range,
    responsibilities, requirements, nice_to_haves, skills,
    experience_level, job_type, deadline, status, application_count, view_count
) VALUES (
    'job-zod-l1support-001',
    'profile-zod-tech-001',
    'L1 Support Engineer',
    'We are hiring L1 Support Engineers for our Bangalore office to provide first-line technical support to our enterprise customers. You will be the first point of contact for customer issues, handling ticket triage, basic troubleshooting, and escalations. This role is ideal for someone starting their career in technical support with aspirations to grow into L2/L3 or other technical roles.',
    'onsite',
    'Bangalore, Karnataka',
    '{"min": 400000, "max": 700000, "currency": "INR", "period": "yearly"}',
    '["Respond to customer queries via email, chat, and phone in a timely manner", "Perform initial triage and categorization of support tickets", "Troubleshoot common issues using knowledge base and standard procedures", "Escalate complex issues to L2/L3 support with proper documentation", "Document solutions and contribute to the knowledge base", "Monitor system alerts and perform basic health checks", "Meet SLA targets for response and resolution times", "Participate in shift rotations including weekends if required", "Assist in creating and updating support documentation"]',
    '["0-2 years of experience in technical support or customer service", "Basic understanding of web technologies (HTTP, browsers, APIs)", "Good communication skills in English (written and verbal)", "Problem-solving mindset and attention to detail", "Ability to work in shifts (including rotational weekends)", "Basic knowledge of ticketing systems", "Eagerness to learn and grow in technical support", "Bachelor''s degree in IT, CS, or related field (or equivalent experience)"]',
    '["Experience with ITSM tools (ServiceNow, Zendesk, Freshdesk)", "Basic SQL knowledge for data lookup", "Familiarity with cloud platforms (AWS, Azure)", "ITIL Foundation certification", "Experience with remote desktop tools", "Knowledge of networking basics"]',
    '["Technical Support", "Troubleshooting", "Customer Service", "Ticketing Systems", "Communication", "SLA Management", "Documentation", "Basic Networking", "Problem Solving"]',
    'entry',
    'full-time',
    '2025-03-31',
    'active',
    0,
    0
);

-- Verify insertion
SELECT 'Inserted ' || COUNT(*) || ' jobs for Zod Technologies' as result FROM jobs WHERE employer_id = 'profile-zod-tech-001';

