import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
  // Job-specific structured data
  jobPosting?: {
    title: string;
    description: string;
    company: string;
    location: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    employmentType?: string;
    datePosted: string;
    validThrough?: string;
  };
  // Organization structured data
  organization?: {
    name: string;
    description: string;
    logo?: string;
    industry?: string;
    foundedYear?: number;
  };
}

const SITE_NAME = 'JobPortal';
const DEFAULT_DESCRIPTION = 'Find your dream job or hire top talent. Browse thousands of job listings from leading companies across India.';
const DEFAULT_IMAGE = '/og-image.png';
const BASE_URL = 'https://job-portal.www5.workers.dev';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  noIndex = false,
  jobPosting,
  organization,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Find Your Dream Career`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const imageToUse = image || DEFAULT_IMAGE;
  const fullImage = imageToUse.startsWith('http') ? imageToUse : `${BASE_URL}${imageToUse}`;

  const defaultKeywords = [
    'jobs',
    'careers',
    'employment',
    'hiring',
    'job search',
    'job portal',
    'India jobs',
    'Bangalore jobs',
    'Chennai jobs',
    'tech jobs',
    'IT jobs',
  ];

  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  // Generate JobPosting structured data
  const jobPostingSchema = jobPosting
    ? {
        '@context': 'https://schema.org/',
        '@type': 'JobPosting',
        title: jobPosting.title,
        description: jobPosting.description,
        datePosted: jobPosting.datePosted,
        validThrough: jobPosting.validThrough,
        employmentType: jobPosting.employmentType?.toUpperCase().replace('-', '_'),
        hiringOrganization: {
          '@type': 'Organization',
          name: jobPosting.company,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: jobPosting.location,
            addressCountry: 'IN',
          },
        },
        ...(jobPosting.salaryMin &&
          jobPosting.salaryMax && {
            baseSalary: {
              '@type': 'MonetaryAmount',
              currency: jobPosting.currency || 'INR',
              value: {
                '@type': 'QuantitativeValue',
                minValue: jobPosting.salaryMin,
                maxValue: jobPosting.salaryMax,
                unitText: 'YEAR',
              },
            },
          }),
      }
    : null;

  // Generate Organization structured data
  const organizationSchema = organization
    ? {
        '@context': 'https://schema.org/',
        '@type': 'Organization',
        name: organization.name,
        description: organization.description,
        ...(organization.logo && { logo: organization.logo }),
        ...(organization.foundedYear && { foundingDate: organization.foundedYear.toString() }),
        ...(organization.industry && { industry: organization.industry }),
      }
    : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <link rel="canonical" href={fullUrl} />

      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Article-specific */}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Structured Data */}
      {jobPostingSchema && (
        <script type="application/ld+json">{JSON.stringify(jobPostingSchema)}</script>
      )}
      {organizationSchema && (
        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      )}

      {/* Website structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: BASE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${BASE_URL}/jobs?query={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        })}
      </script>
    </Helmet>
  );
}

export default SEO;

