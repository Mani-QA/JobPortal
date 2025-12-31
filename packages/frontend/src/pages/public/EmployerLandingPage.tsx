import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  Target, 
  Zap, 
  Shield, 
  BarChart3, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Building2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SEO } from '@/components/SEO';
import { useAuthStore } from '@/stores/authStore';

export default function EmployerLandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const isEmployer = user?.role === 'employer';

  const features = [
    {
      icon: Target,
      title: 'Targeted Reach',
      description: 'Reach qualified candidates actively looking for opportunities in your industry.',
    },
    {
      icon: Users,
      title: 'Talent Pool Access',
      description: 'Browse our extensive database of pre-screened candidates with verified skills.',
    },
    {
      icon: Zap,
      title: 'Fast Hiring',
      description: 'Streamlined application process helps you fill positions 2x faster.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track job performance, application rates, and optimize your listings.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Messaging',
      description: 'Communicate directly with candidates through our built-in messaging system.',
    },
    {
      icon: Shield,
      title: 'Quality Applicants',
      description: 'Smart filters and AI matching ensure you see the most relevant candidates first.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Active Job Seekers' },
    { value: '2.5K+', label: 'Partner Companies' },
    { value: '15K+', label: 'Successful Hires' },
    { value: '48hrs', label: 'Avg. Time to First Application' },
  ];

  const testimonials = [
    {
      quote: "We filled 5 engineering positions in just 2 weeks. The quality of candidates was exceptional.",
      author: "Sarah Chen",
      role: "CTO",
      company: "TechFlow Inc.",
    },
    {
      quote: "The platform's analytics helped us understand what attracts top talent to our listings.",
      author: "Michael Rodriguez",
      role: "HR Director",
      company: "InnovateCorp",
    },
    {
      quote: "Finally a job portal that understands what employers need. Highly recommended!",
      author: "Emily Watson",
      role: "Talent Acquisition Lead",
      company: "GrowthLabs",
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Create Account',
      description: 'Sign up as an employer and complete your company profile.',
    },
    {
      step: '02',
      title: 'Post Jobs',
      description: 'Create detailed job listings with our easy-to-use job builder.',
    },
    {
      step: '03',
      title: 'Review Applicants',
      description: 'Browse applications, filter candidates, and track your hiring pipeline.',
    },
    {
      step: '04',
      title: 'Hire Talent',
      description: 'Connect with candidates, schedule interviews, and make great hires.',
    },
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title="For Employers - Hire Top Talent | JobPortal"
        description="Find and hire the best candidates for your team. Post jobs, browse our talent pool, and streamline your hiring process with JobPortal's employer tools."
        keywords={['hiring', 'recruitment', 'employer', 'post jobs', 'talent acquisition', 'HR']}
        url="/for-employers"
      />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-teal-400 font-medium">For Employers</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
                Hire the 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400"> best talent </span>
                for your team
              </h1>
              
              <p className="text-xl text-navy-300 mb-8 max-w-xl">
                Access thousands of qualified candidates, streamline your hiring process, and build your dream team with JobPortal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated && isEmployer ? (
                  <Link to="/employer">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Briefcase className="w-5 h-5" />
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register?role=employer">
                      <Button size="lg" className="w-full sm:w-auto">
                        Start Hiring Today
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    <Link to="/profiles">
                      <Button variant="outline" size="lg" className="w-full sm:w-auto">
                        Browse Talent
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="glass-card p-6 text-center"
                >
                  <div className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-navy-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-navy-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Everything you need to hire smarter
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto">
              Powerful tools designed to streamline your recruitment process and help you find the perfect candidates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:border-teal-500/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-navy-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto">
              Get started in minutes and find your next great hire in days, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-teal-500/50 to-transparent" />
                )}
                
                <div className="text-center relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-navy-950 font-display font-bold text-xl mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-navy-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-navy-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Trusted by leading companies
            </h2>
            <p className="text-lg text-navy-300 max-w-2xl mx-auto">
              See what other employers are saying about JobPortal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-navy-300 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-navy-950 font-bold text-sm">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-white font-medium">{testimonial.author}</div>
                      <div className="text-navy-400 text-sm">{testimonial.role}, {testimonial.company}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-emerald-500/10" />
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to build your dream team?
              </h2>
              <p className="text-lg text-navy-300 mb-8 max-w-xl mx-auto">
                Join thousands of employers who are already finding top talent on JobPortal.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isAuthenticated && isEmployer ? (
                  <Link to="/employer/jobs/new">
                    <Button size="lg">
                      <Briefcase className="w-5 h-5" />
                      Post a Job Now
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/register?role=employer">
                      <Button size="lg">
                        Create Employer Account
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                    {isAuthenticated && (
                      <Link to="/login">
                        <Button variant="outline" size="lg">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-navy-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                  Free to get started
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-500" />
                  Post in under 5 minutes
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-teal-500" />
                  Secure & trusted platform
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

