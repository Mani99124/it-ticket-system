
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ShieldCheck,
  Ticket,
  Users,
  Zap,
  Github,
  Code2,
  Database,
  Mail
} from 'lucide-react'

const features = [
  {
    title: 'Role-Based Authentication',
    description:
      'Secure access for Admins, Agents, and Users with controlled workflows.',
    icon: ShieldCheck,
  },
  {
    title: 'Ticket Lifecycle Management',
    description:
      'Track tickets from creation to resolution with clear ownership.',
    icon: Ticket,
  },
  {
    title: 'Real-Time Collaboration',
    description:
      'Improve support efficiency with faster communication and updates.',
    icon: Users,
  },
]

const stack = [
  'React.js',
  'Spring Boot',
  'PostgreSQL',
  'Redis',
  'JWT',
]

export default function AboutPage() {
  return (
    <div className="about-page">

      {/* Hero */}

      <section className="about-hero card">

        <div className="about-hero-content">

          <span className="badge badge-open">
            IT Ticket Resolution System
          </span>

          <h1>
            Simplifying IT support with faster resolution and better tracking.
          </h1>

          <p>
            A full-stack ticket management platform designed to streamline
            support operations through role-based access, structured workflows,
            and modern responsive design.
          </p>

          <div className="about-actions">

            <Link to="/register" className="btn btn-primary">
              Get Started
              <ArrowRight size={16}/>
            </Link>

            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>

          </div>

        </div>

        <div className="about-hero-panel">

          <div className="about-icon">
            <Zap size={28}/>
          </div>

          <h2>Project Highlights</h2>

          <ul className="about-list">

            <li>
              <ShieldCheck size={18}/>
              Secure Authentication
            </li>

            <li>
              <Ticket size={18}/>
              Ticket Tracking
            </li>

            <li>
              <Users size={18}/>
              Dashboard Analytics
            </li>

          </ul>

        </div>

      </section>

      {/* Features */}

      <section className="about-grid">

        {features.map((item) => {

          const Icon = item.icon

          return (
            <div key={item.title} className="about-card card">

              <div className="about-card-icon">
                <Icon size={22}/>
              </div>

              <h3>{item.title}</h3>

              <p>{item.description}</p>

            </div>
          )
        })}

      </section>

      {/* Tech Stack */}

      <section className="card about-stack">

        <h2>
          <Code2 size={22}/>
          Tech Stack
        </h2>

        <div className="stack-tags">

          {stack.map((tech) => (
            <span key={tech} className="badge">
              {tech}
            </span>
          ))}

        </div>

      </section>

      {/* Developer */}

      <section className="card about-dev">

        <div>

          <h2>
            <Database size={22}/>
            Developed By
          </h2>

          <h3>Manikanth Etikyala</h3>

          <p>
            Full Stack Developer • Java • MERN • Backend Development
          </p>

          <div className="about-actions">

            <a
              href="https://portfolio-taupe-rho-95.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
                <ArrowRight size={16}/>
              Portfolio
              
            </a>

            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=manikanthetikyala174@gmail.com"
              className="btn btn-primary"
            >
              <Mail size={16}/>
              Contact
            </a>

          </div>

        </div>

      </section>

    </div>
  )
}
